import React from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  variant?: "default" | "destructive";
  onDismiss?: () => void;
}

export function ErrorMessage({
  message,
  className,
  variant = "default",
  onDismiss,
}: ErrorMessageProps) {
  if (!message) return null;

  const variantClasses = {
    default: "bg-muted/50 text-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div
      className={cn(
        "rounded-md p-4 flex items-start gap-3",
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-full hover:bg-background/50 p-1"
          aria-label="Dismiss error"
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function ApiErrorMessage({
  error,
  className,
  onRetry,
  onDismiss,
}: {
  error: Error | null;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  if (!error) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <ErrorMessage
        message={error.message || "An error occurred"}
        variant="destructive"
        onDismiss={onDismiss}
      />
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
