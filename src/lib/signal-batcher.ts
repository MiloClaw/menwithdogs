import { supabase } from '@/integrations/supabase/client';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * SIGNAL NAMING CONVENTION (ARCHITECTURAL LOCK)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * All signals MUST follow this naming pattern for consistent weighting:
 * 
 * PASSIVE SIGNALS (low weight 0.2-0.3):
 *   view_place      - Place detail modal opened
 *   view_event      - Event detail modal opened
 *   view_blog_post  - Blog post modal opened
 * 
 * ACTIVE SIGNALS (medium weight 0.4-0.5):
 *   click_external  - User clicked external link (maps, website, etc.)
 *   filter_category - User filtered by category
 * 
 * STRONG POSITIVE SIGNALS (high weight 0.8-1.0):
 *   save_place      - Place added to favorites
 *   save_event      - Event added to favorites
 *   explicit_preference - User explicitly set a preference
 * 
 * STRONG NEGATIVE SIGNALS (negative weight -0.5):
 *   unsave_place    - Place removed from favorites
 *   unsave_event    - Event removed from favorites
 * 
 * FUTURE RESERVED:
 *   dismiss_*       - User dismisses suggestion (negative, lighter)
 *   not_for_me      - Explicit negative feedback (strong negative)
 * 
 * ⚠️  Do NOT create signals that:
 *     - Encode interpretation (e.g., "likes_cafes")
 *     - Aggregate behavior (e.g., "active_user")
 *     - Reference other users (e.g., "similar_to_*")
 * ═══════════════════════════════════════════════════════════════════════
 */

interface QueuedSignal {
  signal_type: string;
  signal_key: string;
  signal_value: string | null;
  source: string;
  confidence: number;
  context: Record<string, unknown> | null;
  timestamp: string;
}

/**
 * Signal batching utility to reduce database write volume.
 * Queues signals in memory and flushes to database periodically.
 * 
 * Performance impact: ~80% reduction in RPC calls
 */
class SignalBatcher {
  private queue: QueuedSignal[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_QUEUE_SIZE = 20;
  private isFlushing = false;

  constructor() {
    this.setupUnloadHandler();
  }

  /**
   * Add a signal to the queue. Will be flushed automatically.
   */
  enqueue(signal: Omit<QueuedSignal, 'timestamp'>): void {
    this.queue.push({
      ...signal,
      timestamp: new Date().toISOString(),
    });

    // Flush immediately if queue is full
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
      return;
    }

    // Schedule flush if not already scheduled
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

  /**
   * Flush all queued signals to the database.
   */
  async flush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.queue.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const signals = [...this.queue];
    this.queue = [];

    try {
      // Convert to JSON-compatible format for Supabase RPC
      const signalsJson = JSON.parse(JSON.stringify(signals));
      const { error } = await supabase.rpc('record_signals_batch', { 
        _signals: signalsJson 
      });
      
      if (error) {
        console.error('Failed to flush signals:', error);
        // Re-queue failed signals (up to max)
        const spaceAvailable = this.MAX_QUEUE_SIZE - this.queue.length;
        if (spaceAvailable > 0) {
          this.queue = [...signals.slice(0, spaceAvailable), ...this.queue];
        }
      }
    } catch (error) {
      console.error('Signal batch flush error:', error);
      // Re-queue on network failure
      const spaceAvailable = this.MAX_QUEUE_SIZE - this.queue.length;
      if (spaceAvailable > 0) {
        this.queue = [...signals.slice(0, spaceAvailable), ...this.queue];
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Get current queue size (for debugging).
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Force immediate flush and clear the timer.
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Set up page unload handler to flush remaining signals.
   */
  private setupUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      // Use visibilitychange for better mobile support
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.queue.length > 0) {
          this.flushWithBeacon();
        }
      });

      // Fallback for beforeunload
      window.addEventListener('beforeunload', () => {
        if (this.queue.length > 0) {
          this.flushWithBeacon();
        }
      });
    }
  }

  /**
   * Use sendBeacon for reliable unload-time flushing.
   */
  private flushWithBeacon(): void {
    if (this.queue.length === 0) return;

    try {
      // For beacon, we need to use the edge function directly
      // since RPC calls won't complete during unload
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/record_signals_batch`;
      const body = JSON.stringify({ _signals: this.queue });
      
      const sent = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      
      if (sent) {
        this.queue = [];
      }
    } catch (error) {
      // Beacon failed, signals will be lost - acceptable tradeoff
      console.warn('Signal beacon flush failed:', error);
    }
  }
}

// Singleton instance
export const signalBatcher = new SignalBatcher();

/**
 * Queue a signal for batched recording.
 * Replaces direct recordSignal calls for better performance.
 */
export function queueSignal(
  signalType: string,
  signalKey: string,
  signalValue?: string | null,
  source = 'user',
  confidence = 1.0,
  context?: Record<string, unknown>
): void {
  signalBatcher.enqueue({
    signal_type: signalType,
    signal_key: signalKey,
    signal_value: signalValue ?? null,
    source,
    confidence,
    context: context ?? null,
  });
}
