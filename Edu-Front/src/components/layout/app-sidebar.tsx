"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarProfile from "./SidebarProfile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  House,
  PersonStanding,
  Puzzle,
  TrainTrack,
  ShieldAlert,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarSetting from "./sidebarFooter";
import { useGetUserQuery } from "@/features/profileApi/profileApi";

interface MenuItem {
  title: string;
  url: string;
  items: Array<{ title: string; url: string }>;
  icon: React.ReactNode;
}

// This is sample data.
const menuItems: MenuItem[] = [
  {
    title: "Home",
    url: "/home",
    items: [],
    icon: <House />,
  },
  {
    title: "Proposal",
    url: "/proposal",
    icon: <TrainTrack />,
    items: [
      {
        title: "Approved",
        url: `/proposal/approved`,
      },
      {
        title: "Rejected",
        url: `/proposal/rejected`,
      },
    ],
  },
  {
    title: "Project",
    url: "/project",
    icon: <Puzzle />,
    items: [],
  },
  {
    title: "Students",
    url: "/students",
    icon: <PersonStanding />,
    items: [],
  },
  {
    title: "Admin",
    url: "/admin",
    icon: <ShieldAlert />,
    items: [],
  },
  {
    title: "Mentor",
    url: "/mentor",
    icon: <BookOpen />,
    items: [],
  },
  {
    title: "My Group",
    url: "/group",
    icon: <Users />,
    items: [
      { title: "Members", url: "/group" },
      { title: "Group Chat", url: "/group?tab=chat" },
    ],
  },
  {
    title: "All Groups",
    url: "/all-groups",
    icon: <Users />,
    items: [],
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: <FileText />,
    items: [],
  },
  {
    title: "Review Board",
    url: "/mentor/reviews",
    icon: <BookOpen />,
    items: [],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: user } = useGetUserQuery();
  const userRole = user?.data?.role;

  const filteredMenuItems = menuItems.filter((item) => {
    const isAdminOnly = item.title === "Admin" || item.title === "Students" || item.title === "All Groups";
    
    if ((userRole === "student" || userRole === "teacher") && isAdminOnly) {
      return false;
    }
    
    // Hide 'Admin' link when logged in as admin (use 'Home' instead)
    if (item.title === "Admin" && userRole === "admin") {
      return false;
    }

    // Hide 'Mentor' link when logged in as mentor/teacher (use 'Home' instead)
    if (item.title === "Mentor" && (userRole === "teacher" || userRole === "student")) {
      return false;
    }

    if (item.title === "My Group" && userRole !== "student") {
      return false;
    }

    if (item.title === "Documentation" && userRole !== "student") {
      return false;
    }

    if (item.title === "Review Board" && userRole !== "teacher") {
      return false;
    }
    return true;
  });

  return (
    <Sidebar {...props}>
      <SidebarHeader className="bg-background border-b p-4">
        <SidebarProfile />
      </SidebarHeader>
      <SidebarContent className="bg-background text-foreground px-2 pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Platform</SidebarGroupLabel>
          <SidebarMenu>
            {filteredMenuItems.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem
                  className={`hover:bg-muted p-2 rounded-lg ${
                    pathname === item.url
                      ? "bg-primary/30 text-primary font-semibold"
                      : "text-foreground"
                  }`}
                >
                  <Link href={item.url}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon}
                        <span>{item.title}</span>
                        {item.items?.length > 0 && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </Link>
                  {item.items?.length > 0 && (
                    <CollapsibleContent className="p-0">
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            className={`p-1 hover:bg-muted rounded w-full ${
                              pathname === subItem.url
                                ? "bg-primary/30 text-primary font-semibold"
                                : "text-foreground font-normal"
                            }`}
                          >
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url} className="block">
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-background border-t p-4">
        <SidebarSetting />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
