import { Component } from 'react';

export default class RouteErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error('Admin page failed to render:', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="route-error" role="alert">
        <span>Something interrupted this page.</span>
        <h2>This section could not load.</h2>
        <p>{this.state.error.message || 'A display error occurred.'}</p>
        <button onClick={() => window.location.reload()}>Reload this section</button>
      </section>
    );
  }
}
