import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "defaultValue"> {
  value: number | undefined;
  defaultValue?: number;
  minValue?: number;
  onChange: (value: number) => void;
  className?: string;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, minValue = 0, value, onChange, ...props }, ref) => {
    // Handle changes, ensuring we always provide a valid number
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Empty string becomes minValue
      if (inputValue === "") {
        onChange(minValue);
        return;
      }
      
      const numberValue = Number(inputValue);
      // NaN or invalid input becomes minValue
      if (isNaN(numberValue)) {
        onChange(minValue);
        return;
      }
      
      onChange(numberValue);
    };

    // Ensure value is never undefined or null for the underlying input
    // This prevents the React warning about switching from uncontrolled to controlled
    const inputValue = (value === undefined || value === null) ? "" : value.toString();    return (
      <Input
        type="number"
        min={minValue}
        className={cn(className)}
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

NumericInput.displayName = "NumericInput";

export { NumericInput };
