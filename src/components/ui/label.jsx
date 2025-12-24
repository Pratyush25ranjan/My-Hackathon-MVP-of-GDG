export function Label({ children, ...props }) {
  return (
    <label {...props} className="text-sm font-medium">
      {children}
    </label>
  );
}
