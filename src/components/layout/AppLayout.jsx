import {
  SidebarProvider,
  SidebarInset,
} from "../ui/sidebar";

import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
