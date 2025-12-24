export function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}
