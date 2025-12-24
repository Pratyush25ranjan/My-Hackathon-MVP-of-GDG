// src/components/ui/alert.jsx

export function Alert({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-card text-foreground",
    destructive:
      "border-destructive/50 text-destructive dark:border-destructive",
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children }) {
  return (
    <h5 className="mb-1 font-medium leading-none tracking-tight">
      {children}
    </h5>
  );
}

export function AlertDescription({ children }) {
  return (
    <div className="text-sm text-muted-foreground">
      {children}
    </div>
  );
}
