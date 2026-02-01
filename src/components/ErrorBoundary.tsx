import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import BrandLockup from "@/components/BrandLockup";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <header className="p-4 md:p-6 border-b border-border/50">
            <a href="/" onClick={(e) => { e.preventDefault(); this.handleGoHome(); }}>
              <BrandLockup size="sm" showSubtitle={false} />
            </a>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="text-center max-w-md space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  We hit an unexpected error. Try refreshing the page, or head back to explore the directory.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="default"
                  onClick={this.handleReload}
                  className="min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="min-h-[44px]"
                >
                  Back to Home
                </Button>
              </div>

              {/* Error details (dev only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-8 text-left p-4 bg-muted rounded-lg">
                  <summary className="text-xs font-mono text-muted-foreground cursor-pointer">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 text-xs font-mono text-destructive overflow-auto max-h-40">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
