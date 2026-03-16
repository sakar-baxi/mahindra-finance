"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import StepError from "./steps/StepError";
import { trackEvent } from "@/lib/analytics";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class StepErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    trackEvent("step_error", { message: error.message, componentStack: info.componentStack?.slice(0, 200) });
  }

  render() {
    if (this.state.hasError) {
      return (
        <StepError
          title="Something went wrong"
          message="We encountered an unexpected error. Please try again or go back to start."
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}
