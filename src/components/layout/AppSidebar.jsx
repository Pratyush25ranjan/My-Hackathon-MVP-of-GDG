import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  LogOut,
  Newspaper,
  ShieldCheck,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "../ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

import { currentUser, communities } from "../../data/data";

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-primary p-2">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-xl font-bold">
            CampusConnect
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/feed"}>
              <Link to="/feed">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
             
              isActive={pathname.startsWith("/announcements")}
            >
              <Link to="#">
                <Newspaper />
                <span>Announcements</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              
              isActive={pathname.startsWith("/messages")}
            >
              <Link to="#">
                <MessageSquare />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Communities</SidebarGroupLabel>
          <SidebarMenu>
            {communities.map((community) => (
              <SidebarMenuItem key={community.id}>
                <SidebarMenuButton
              
                  isActive={pathname === `/community/${community.id}`}
                >
                  <Link to="#">
                    <span className="h-4 w-4 text-xs">#</span>
                    <span>{community.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarImage
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              data-ai-hint={currentUser.avatarHint}
            />
            <AvatarFallback>
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-medium">{currentUser.name}</span>
              {currentUser.isVerified && (
                <ShieldCheck className="h-4 w-4 text-chart-2" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {currentUser.department}
            </span>
          </div>

          <Button variant="ghost" size="icon" className="ml-auto" >
            <Link to="/">
              <LogOut />
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
