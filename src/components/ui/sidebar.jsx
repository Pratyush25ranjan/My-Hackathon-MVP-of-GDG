import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [open] = useState(true);
  return (
    <SidebarContext.Provider value={{ open }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children }) {
  return <aside className="w-64 border-r bg-card">{children}</aside>;
}

export function SidebarInset({ children }) {
  return <main className="flex-1">{children}</main>;
}

export function SidebarHeader({ children }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function SidebarContent({ children }) {
  return <div className="p-2">{children}</div>;
}

export function SidebarFooter({ children }) {
  return <div className="p-2 border-t">{children}</div>;
}

export function SidebarMenu({ children }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, isActive }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted ${
        isActive ? "bg-muted font-medium" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function SidebarGroup({ children }) {
  return <div className="mt-4">{children}</div>;
}

export function SidebarGroupLabel({ children }) {
  return (
    <div className="px-3 text-xs font-semibold uppercase text-muted-foreground">
      {children}
    </div>
  );
}
