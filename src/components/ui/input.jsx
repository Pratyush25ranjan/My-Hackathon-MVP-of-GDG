export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
    />
  );
}