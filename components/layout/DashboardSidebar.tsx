'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  Settings,
  MessageSquare,
  UserCog,
  Building2,
  Globe,
  GraduationCap,
  X,
  CheckCircle,
  Bell,
  LogOut,
  CalendarCheck,
  FolderGit2,
  Layers,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'student' | 'teacher' | 'admin' | 'coordinator' | 'examiner';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = {
  student: [
    { name: 'Dashboard',     href: '/student/dashboard',                icon: LayoutDashboard },
    { name: 'My Proposals',  href: '/student/dashboard/proposals',      icon: FileText },
    { name: 'My Projects',   href: '/student/dashboard/projects',       icon: FolderGit2 },
    { name: 'Group Members', href: '/student/dashboard/group',          icon: Users },
    { name: 'Discussions',   href: '/student/dashboard/discussions',    icon: MessageSquare },
    { name: 'Documents',     href: '/student/dashboard/documentation',  icon: Upload },
    { name: 'Notifications', href: '/notifications',                    icon: Bell },
    { name: 'Settings',      href: '/student/dashboard/settings',       icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard',          href: '/teacher/dashboard',                        icon: LayoutDashboard },
    { name: 'Assigned Proposals', href: '/teacher/dashboard/assigned-proposals',     icon: FileText },
    { name: 'Stage Reviews',      href: '/teacher/dashboard/stage-reviews',          icon: ClipboardCheck },
    { name: 'Teams & Requests',   href: '/teacher/dashboard/teams',                  icon: Users },
    { name: 'Reviews',            href: '/teacher/dashboard/documentation-review',   icon: CheckCircle },
    { name: 'Notifications',      href: '/notifications',                            icon: Bell },
    { name: 'Settings',           href: '/teacher/dashboard/settings',               icon: Settings },
  ],
  admin: [
    { name: 'Dashboard',      href: '/admin/dashboard',       icon: LayoutDashboard },
    { name: 'Proposals',      href: '/admin/proposals',       icon: FileText },
    { name: 'Projects',       href: '/admin/projects',        icon: FolderGit2 },
    { name: 'Project Groups', href: '/admin/groups',          icon: Layers },
    { name: 'Stage Reviews',  href: '/admin/stage-reviews',   icon: ClipboardCheck },
    { name: 'Assign Advisors',href: '/admin/assignments',     icon: UserCog },
    { name: 'Teams Overview', href: '/admin/teams',           icon: Users },
    { name: 'Defense Sessions',href: '/admin/defense',        icon: CalendarCheck },
    { name: 'Advisors',       href: '/admin/advisors',        icon: GraduationCap },
    { name: 'Departments',    href: '/admin/departments',     icon: Building2 },
    { name: 'Notifications',  href: '/notifications',         icon: Bell },
    { name: 'Settings',       href: '/admin/settings',        icon: Settings },
  ],
  coordinator: [
    { name: 'Dashboard',      href: '/coordinator/dashboard',          icon: LayoutDashboard },
    { name: 'Dept. Projects', href: '/coordinator/dashboard/projects', icon: FileText },
    { name: 'Dept. Teams',    href: '/coordinator/dashboard/teams',    icon: Users },
    { name: 'Notifications',  href: '/notifications',                  icon: Bell },
    { name: 'Settings',       href: '/coordinator/dashboard/settings', icon: Settings },
  ],
  examiner: [
    { name: 'Dashboard',       href: '/examiner/dashboard',                   icon: LayoutDashboard },
    { name: 'Defense Sessions',href: '/examiner/dashboard/defense-sessions',  icon: CheckCircle },
    { name: 'Notifications',   href: '/notifications',                        icon: Bell },
    { name: 'Settings',        href: '/examiner/dashboard/settings',          icon: Settings },
  ],
};

const roleBadgeColors: Record<UserRole, string> = {
  student:     'bg-blue-100 text-blue-700',
  teacher:     'bg-emerald-100 text-emerald-700',
  admin:       'bg-purple-100 text-purple-700',
  coordinator: 'bg-orange-100 text-orange-700',
  examiner:    'bg-rose-100 text-rose-700',
};

function getInitials(name: string = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// Dashboard root paths for exact-match detection
const dashboardRoots = [
  '/student/dashboard',
  '/teacher/dashboard',
  '/admin/dashboard',
  '/coordinator/dashboard',
  '/examiner/dashboard',
];

export function DashboardSidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = navigationItems[role] ?? navigationItems.student;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0 shadow-lg lg:shadow-none flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b p-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">Project Hub</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge className={cn('mt-1 text-[10px] px-1.5 py-0 border-0 font-medium capitalize', roleBadgeColors[role])}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (!dashboardRoots.includes(item.href) && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 h-auto text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => router.push('/')}
          >
            <Globe className="h-5 w-5 shrink-0" />
            View Public Site
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 h-auto text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
