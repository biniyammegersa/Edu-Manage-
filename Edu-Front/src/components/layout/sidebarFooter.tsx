import React from "react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/features/auth/authApi";
import { useAppDispatch, resetStore } from "@/lib/store";
import Cookies from "js-cookie";

const SidebarSetting = () => {
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Always clear the local session regardless of API result
    Cookies.remove("access_token");
    // Clear all cached RTK Query data
    dispatch(resetStore());
    // Attempt backend logout, but don't block the user from logging out
    logout().catch((error) => console.error("Backend logout failed:", error));
    router.push("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem className="hover:bg-muted p-2 rounded-lg">
        <Link href="/settings">
          <SidebarMenuButton tooltip="Settings" className="text-foreground">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem className="hover:bg-muted p-2 rounded-lg">
        <SidebarMenuButton 
          tooltip="Logout" 
          className="text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarSetting;
