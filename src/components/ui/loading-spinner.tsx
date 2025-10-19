import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ text = "Loading...", fullScreen = false }: LoadingOverlayProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-background/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0"
      )}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
}

export function LoadingPage({ text = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">{text}</h2>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your data</p>
        </div>
      </div>
    </div>
  );
}
