// src/components/ui/avatar.jsx

export function Avatar({ children, className = "" }) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
    />
  );
}

export function AvatarFallback({ children }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
      {children}
    </div>
  );
}
