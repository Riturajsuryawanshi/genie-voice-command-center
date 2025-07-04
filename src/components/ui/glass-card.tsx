
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md",
          "before:absolute before:inset-0 before:rounded-xl before:border before:border-white/20 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50",
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {children || (
            <div className="space-y-4">
              <div className="h-4 w-32 rounded bg-white/30"></div>
              <div className="h-3 w-48 rounded bg-white/20"></div>
              <div className="h-3 w-40 rounded bg-white/20"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
