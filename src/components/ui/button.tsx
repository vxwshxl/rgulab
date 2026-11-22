import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "ledge inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide disabled:opacity-50 disabled:[box-shadow:none]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground [--ledge:var(--ds-accent-ledge)]",
        secondary: "border-2 border-border bg-elevated text-foreground [--ledge:var(--ds-border)]",
        hue: "bg-(--u) text-white",
        danger: "bg-danger text-(--ds-danger-fg) [--ledge:var(--ds-danger-ledge)]",
        gold: "bg-gold text-gold-fg [--ledge:var(--ds-gold-ledge)]",
        ghost: "text-secondary-fg [box-shadow:none] hover:bg-muted active:translate-y-0",
        locked: "bg-locked text-locked-fg [--ledge:var(--ds-locked-ledge)]",
      },
      size: {
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-5 text-sm",
        lg: "h-14 px-6 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
