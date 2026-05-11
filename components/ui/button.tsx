import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:opacity-50 cursor-pointer";
    const variants: Record<string, string> = {
      default: "bg-primary text-foreground hover:bg-primary-hover",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-surface",
    };
    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
