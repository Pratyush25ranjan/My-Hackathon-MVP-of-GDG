export default function DashboardLayout({
  title,
  sidebarItems,
  activeTab,
  setActiveTab,
  children,

  onLogout,     // used by Admin pages
  headerRight,  // used by Student page
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white">

      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-wide">
          {title}
        </h1>

        {/* RIGHT SIDE (Student OR Admin) */}
        <div className="flex items-center gap-3">
          {headerRight ? (
            headerRight
          ) : (
            onLogout && (
              <button
                onClick={onLogout}
                className="
                  text-green-400
                  font-medium
                  transition-all duration-300
                  hover:text-green-300
                  hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.9)]
                "
              >
                Logout
              </button>
            )
          )}
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto mt-6 gap-6 px-4">

        {/* SIDEBAR */}
        <aside className="w-64 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-2 space-y-1">
          {sidebarItems.map((item) => {
            const active = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`
                  w-full flex items-center px-4 py-2 rounded-lg text-left transition
                  ${
                    active
                      ? "bg-white/10 border-l-4 border-green-400 text-white"
                      : "text-gray-300 hover:bg-white/5"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 space-y-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
