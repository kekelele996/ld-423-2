import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('图表或页面渲染异常', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page">
          <div className="error-box">
            <strong>页面渲染失败</strong>
            <span>{this.state.error.message}</span>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
