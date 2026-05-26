"use client";
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "./theme-toggler";
import { Notifications } from "./notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useLogoutMutation } from "@/features/auth/authApi";
import { useAppDispatch, resetStore } from "@/lib/store";
import Cookies from 'js-cookie';

const Header = () => {
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const { data: user, isLoading } = useGetUserQuery();

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Always clear the local session regardless of API result
    Cookies.remove('access_token');
    // Clear all cached RTK Query data
    dispatch(resetStore());
    // Attempt backend logout, but don't block the user from logging out
    logout().catch((error) => console.error('Backend logout failed:', error));
    router.push('/');
  };
  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger className="-ml-1" />

      <div className="flex items-center gap-4">
        <Notifications />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={user?.data?.imageUrl} alt="dawit getachew" />
                <AvatarFallback>{user?.data?.fullName[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.data?.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.data?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="text-foreground">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-foreground">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground" onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
