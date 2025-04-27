import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TooltipWrapperProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  infoIcon?: boolean;
}

export function TooltipWrapper({
  content,
  children,
  className = "",
  side = "top",
  infoIcon = false,
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            {children}
            {infoIcon && (
              <Info className="ml-1.5 h-4 w-4 text-muted-foreground hover:text-primary" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-center">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
