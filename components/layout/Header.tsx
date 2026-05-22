"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, Menu, Bell, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

function getInitials(name: string = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

const dashboardHref: Record<string, string> = {
  student:     "/student/dashboard",
  teacher:     "/teacher/dashboard",
  admin:       "/admin/dashboard",
  coordinator: "/coordinator/dashboard",
  examiner:    "/examiner/dashboard",
};

const settingsHref: Record<string, string> = {
  student:     "/student/dashboard/settings",
  teacher:     "/teacher/dashboard/settings",
  admin:       "/admin/settings",
  coordinator: "/coordinator/dashboard/settings",
  examiner:    "/examiner/dashboard/settings",
};

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">

        {/* Left: Logo & Menu Trigger */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-foreground">
                ASTU Project Hub
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                CSE & Software Engineering
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/projects"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600"
          >
            Public Projects
          </Link>
          <Link
            href="/guidelines"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600"
          >
            Guidelines
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Show nothing while hydrating */}
          {!isLoading && (
            <>
              {user ? (
                /* ── Signed-in state ── */
                <>
                  {/* Notification bell */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground hidden sm:flex"
                    onClick={() => router.push("/notifications")}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                  </Button>

                  <div className="h-6 w-px bg-border hidden sm:block" />

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted transition-colors outline-none">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex flex-col items-start leading-none">
                          <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {user.role}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-0.5">
                          <span className="font-semibold text-sm truncate">{user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(dashboardHref[user.role] ?? "/student/dashboard")}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push(settingsHref[user.role] ?? "/student/dashboard/settings")}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                /* ── Signed-out state ── */
                <>
                  <div className="h-6 w-px bg-border hidden sm:block" />
                  <Button variant="ghost" size="sm" asChild className="font-semibold">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 shadow-sm shadow-emerald-200"
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
