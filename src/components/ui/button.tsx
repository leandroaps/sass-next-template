import { type ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground/40",
  secondary:
    "border border-black/10 hover:bg-black/[.03] dark:border-white/20 dark:hover:bg-white/[.06]",
  ghost: "hover:bg-black/[.03] dark:hover:bg-white/[.06]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
