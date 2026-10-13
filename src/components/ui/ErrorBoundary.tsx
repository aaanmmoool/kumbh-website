import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; onError?: (error: unknown) => void; children: ReactNode }
type State = { failed: boolean }

/** Keeps an optional enhancement (like the WebGL scene) from taking the page down with it. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
