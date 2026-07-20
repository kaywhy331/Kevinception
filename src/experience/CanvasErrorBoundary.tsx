'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  onError: (error: Error) => void;
};

type State = { failed: boolean };

export class CanvasErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
