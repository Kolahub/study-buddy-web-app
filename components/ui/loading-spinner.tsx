import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({
  isLoading,
  children,
  text = "Loading...",
}: {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

export function LoadingButton({
  isLoading,
  children,
  disabled,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading: boolean;
}) {
  return (
    <button
      className={cn("relative flex items-center justify-center", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" className="absolute left-4" />}
      <span className={isLoading ? "opacity-0" : ""}>{children}</span>
      {isLoading && <span className="absolute">Loading...</span>}
    </button>
  );
}
