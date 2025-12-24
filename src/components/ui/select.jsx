export function Select({ value, onValueChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children, disabled }) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}
