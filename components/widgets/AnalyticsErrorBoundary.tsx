'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AnalyticsErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AnalyticsErrorBoundary]', error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-2">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Không thể tải phần này
            </p>
            <p className="text-xs text-muted-foreground">
              {this.state.error?.message || 'Đã xảy ra lỗi khi hiển thị biểu đồ'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs text-primary underline mt-2"
            >
              Thử lại
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
