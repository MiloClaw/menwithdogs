import { supabase } from '@/integrations/supabase/client';

/**
 * SIGNAL BATCHER - Batched Signal Collection for User Intelligence
 *
 * This module provides batched signal collection to reduce database writes
 * while capturing user behavior for the intelligence layer.
 *
 * SIGNAL NAMING CONVENTION (ARCHITECTURAL LOCK)
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
 *   save_place      - Place added to favorites (audit trail)
 *   save_event      - Event added to favorites (audit trail)
 *   explicit_preference - User explicitly set a preference
 *
 * STRONG NEGATIVE SIGNALS (negative weight -0.5):
 *   unsave_place    - Place removed from favorites (audit trail)
 *   unsave_event    - Event removed from favorites (audit trail)
 *
 * AFFINITY COMPUTATION NOTE:
 * Favorites affect affinity via CURRENT-STATE JOINS to favorites tables
 * (couple_favorites, event_favorites), not via signal decay.
 *
 * The save and unsave signals in user_signals are retained for:
 *   - Audit trail (when was a place saved or unsaved)
 *   - Analytics (save patterns over time)
 *   - Future ML training data
 *
 * Negation is handled by unsave signals and current-state joins,
 * not by time-based decay.
 *
 * FUTURE RESERVED:
 *   dismiss - User dismisses suggestion (negative, lighter)
 *   not_for_me - Explicit negative feedback (strong negative)
 *
 * Do NOT create signals that:
 *   - Encode interpretation (e.g., likes_cafes)
 *   - Aggregate behavior (e.g., active_user)
 *   - Reference other users (e.g., similar_to)
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
 * Performance impact: approximately 80 percent reduction in RPC calls
 */
class SignalBatcher {
  private queue: QueuedSignal[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL = 5000;
  private readonly MAX_QUEUE_SIZE = 20;
  private isFlushing = false;

  constructor() {
    this.setupUnloadHandler();
  }

  enqueue(signal: Omit<QueuedSignal, 'timestamp'>): void {
    // Dev-mode logging for signal verification
    if (import.meta.env.DEV) {
      console.log('[Signal]', signal.signal_type, signal.signal_key, signal.signal_value);
    }

    this.queue.push({
      ...signal,
      timestamp: new Date().toISOString(),
    });

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
      return;
    }

    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

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
      const signalsJson = JSON.parse(JSON.stringify(signals));
      const { error } = await supabase.rpc('record_signals_batch', {
        _signals: signalsJson
      });

      if (error) {
        console.error('Failed to flush signals:', error);
        const spaceAvailable = this.MAX_QUEUE_SIZE - this.queue.length;
        if (spaceAvailable > 0) {
          this.queue = [...signals.slice(0, spaceAvailable), ...this.queue];
        }
      }
    } catch (error) {
      console.error('Signal batch flush error:', error);
      const spaceAvailable = this.MAX_QUEUE_SIZE - this.queue.length;
      if (spaceAvailable > 0) {
        this.queue = [...signals.slice(0, spaceAvailable), ...this.queue];
      }
    } finally {
      this.isFlushing = false;
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  async forceFlush(): Promise<void> {
    await this.flush();
  }

  private setupUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.queue.length > 0) {
          this.flushWithBeacon();
        }
      });

      window.addEventListener('beforeunload', () => {
        if (this.queue.length > 0) {
          this.flushWithBeacon();
        }
      });
    }
  }

  private flushWithBeacon(): void {
    if (this.queue.length === 0) return;

    // Note: navigator.sendBeacon cannot include auth headers
    // Instead, use the Supabase client for async flush (may not complete before unload)
    // This is acceptable - we prioritize security over 100% signal capture on page exit
    try {
      const signalsToFlush = [...this.queue];
      this.queue = [];
      
      // Fire and forget - may not complete on page unload but is authenticated
      const signalsJson = JSON.parse(JSON.stringify(signalsToFlush));
      supabase.rpc('record_signals_batch', {
        _signals: signalsJson
      }).then(({ error }) => {
        if (error) {
          // Re-queue on failure if still mounted
          if (typeof window !== 'undefined' && document.visibilityState !== 'hidden') {
            const spaceAvailable = this.MAX_QUEUE_SIZE - this.queue.length;
            if (spaceAvailable > 0) {
              this.queue = [...signalsToFlush.slice(0, spaceAvailable), ...this.queue];
            }
          }
          console.warn('Signal flush on unload failed:', error);
        }
      });
    } catch (error) {
      console.warn('Signal beacon flush failed:', error);
    }
  }
}

export const signalBatcher = new SignalBatcher();

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
