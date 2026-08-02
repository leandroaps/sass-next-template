import { type ComponentProps } from "react";
import { type FieldError } from "react-hook-form";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {label}
        {children}
      </label>
      {error ? <FormMessage>{error.message}</FormMessage> : null}
    </div>
  );
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-red-600 dark:text-red-400">{children}</p>;
}

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`h-10 rounded-md border border-black/10 bg-transparent px-3 text-sm outline-none focus:border-black/30 dark:border-white/20 dark:focus:border-white/40 ${props.className ?? ""}`}
    />
  );
}
