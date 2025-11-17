import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Fix khi app crash
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Ứng dụng gặp lỗi khi tải</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12, borderRadius: 6 }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
