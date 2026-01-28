export function Textarea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-white/20 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}