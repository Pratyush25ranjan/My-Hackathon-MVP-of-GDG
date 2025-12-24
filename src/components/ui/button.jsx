export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border hover:bg-muted",
    ghost: "hover:bg-muted",
  };

  const sizes = {
    md: "h-10 px-4",
    sm: "h-8 px-3",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
