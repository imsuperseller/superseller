// Simple Rollbar-like error tracking service
export const RollbarService = {
  error: (error: Error, context?: Record<string, unknown>) => {
    console.error('Rollbar Error:', error.message, context);
  },

  warning: (message: string, context?: Record<string, unknown>) => {
    console.warn('Rollbar Warning:', message, context);
  },

  info: (message: string, context?: Record<string, unknown>) => {
    console.log('Rollbar Info:', message, context);
  },

  trackUser: (
    userId: string,
    action: string,
    context?: Record<string, unknown>
  ) => {
    console.log('User Action:', { userId, action, ...context });
  },

  trackAgentRun: (
    agentId: string,
    runId: string,
    status: string,
    context?: Record<string, unknown>
  ) => {
    console.log('Agent Run:', { agentId, runId, status, ...context });
  },

  trackWebhook: (
    webhookType: string,
    status: string,
    context?: Record<string, unknown>
  ) => {
    console.log('Webhook:', { webhookType, status, ...context });
  },

  trackApiError: (
    error: Error,
    endpoint: string,
    method: string,
    userId?: string,
    orgId?: string
  ) => {
    console.error('API Error:', {
      error: error.message,
      endpoint,
      method,
      userId,
      orgId,
    });
  },
};

// Middleware for Next.js API routes
export function withRollbar(handler: Function) {
  return async (req: unknown, res: unknown) => {
    try {
      // Set request context
      // RollbarService.setOrganization(req.headers['x-org-id'] || 'unknown'); // This line is removed as per the new_code

      // Call the handler
      return await handler(req, res);
    } catch (error) {
      // Log the error with request context
      RollbarService.trackApiError(
        error as Error,
        req.url,
        req.method,
        req.session?.user?.id,
        req.headers['x-org-id']
      );

      // Re-throw the error
      throw error;
    }
  };
}

// React error boundary hook
export function useRollbarErrorBoundary() {
  return {
    onError: (error: Error, errorInfo: unknown) => {
      RollbarService.error(error, {
        errorInfo,
        componentStack: errorInfo.componentStack,
      });
    },
  };
}

// Export the main rollbar instance
// This line is removed as per the new_code
// export default rollbar;
