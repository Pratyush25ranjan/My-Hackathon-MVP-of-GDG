export default function DarkCard({
  children,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        rounded-2xl
        bg-zinc-900/90
        backdrop-blur-md
        border border-green-400/30
        p-6
        text-white

        transition-all duration-300
        hover:border-green-400
        hover:shadow-[0_0_40px_rgba(34,197,94,0.55)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
