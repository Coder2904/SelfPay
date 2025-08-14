import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={getErrorContainerStyles()}>
          <Text style={getErrorTitleStyles()}>Something went wrong</Text>
          <Text style={getErrorMessageStyles()}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>

          <TouchableOpacity
            style={getRetryButtonStyles()}
            onPress={this.handleRetry}
          >
            <Text style={getRetryButtonTextStyles()}>Try Again</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.errorInfo && (
            <View style={getDebugContainerStyles()}>
              <Text style={getDebugTitleStyles()}>Debug Info:</Text>
              <Text style={getDebugTextStyles()}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const getErrorContainerStyles = (): ViewStyle => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  backgroundColor: "#FFFFFF",
});

const getErrorTitleStyles = (): TextStyle => ({
  fontSize: 20,
  fontWeight: "600",
  color: "#EF4444",
  marginBottom: 8,
  textAlign: "center",
});

const getErrorMessageStyles = (): TextStyle => ({
  fontSize: 16,
  color: "#6B7280",
  textAlign: "center",
  marginBottom: 20,
  lineHeight: 24,
});

const getRetryButtonStyles = (): ViewStyle => ({
  backgroundColor: "#3B82F6",
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  marginBottom: 20,
});

const getRetryButtonTextStyles = (): TextStyle => ({
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
});

const getDebugContainerStyles = (): ViewStyle => ({
  backgroundColor: "#F3F4F6",
  padding: 16,
  borderRadius: 8,
  width: "100%",
  maxHeight: 200,
});

const getDebugTitleStyles = (): TextStyle => ({
  fontSize: 14,
  fontWeight: "600",
  color: "#374151",
  marginBottom: 8,
});

const getDebugTextStyles = (): TextStyle => ({
  fontSize: 12,
  color: "#6B7280",
  fontFamily: "monospace",
});

export {};
