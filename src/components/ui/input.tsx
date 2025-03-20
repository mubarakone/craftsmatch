import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Interface for Input component props. 
 * Extends HTMLInputElement attributes to allow usage of standard HTML input properties.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // This is added to satisfy the ESLint no-empty-interface rule
  // It doesn't affect the component usage
  _isCustomInput?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, _isCustomInput, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input }; 