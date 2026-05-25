"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FolderGit2,
  Clock,
  Trash2,
  UserPlus,
  GraduationCap,
  ArrowRight,
  Search,
  Globe,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useGetAdminProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetStudentsQuery, useGetTeachersQuery, useDeleteUserMutation } from "@/features/usersApi/usersApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { useGetAllGroupsQuery } from "@/features/groupApi/groupApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Project } from "@/type/project";
import { profileType } from "@/type/profile";

function getProposalStatus(p: { feedbackList?: { status?: string }[]; status?: string }) {
  const last = (p.feedbackList?.length ?? 0) - 1;
  const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
  const lower = resolved.toLowerCase();
  if (lower === "approved") return "Approved";
  if (lower === "rejected") return "Rejected";
  return "Pending";
}

function normalizeProjectStatus(status?: string) {
  return (status || "pending").toLowerCase();
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  accent?: string;
}) {
  const content = (
    <Card className={`transition-shadow hover:shadow-md ${href ? "cursor-pointer" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${accent || "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function StatusBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} <span className="text-[10px]">({pct}%)</span>
        </span>
      </div>
      <Progress value={pct} className="h-2" indicatorClassName={colorClass} />
    </div>
  );
}

function UserRow({
  user,
  onDelete,
  isDeleting,
  fallbackClass,
}: {
  user: profileType;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
  fallbackClass: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <Avatar className="h-10 w-10 border shrink-0">
          <AvatarImage src={user.imageUrl} className="object-cover" />
          <AvatarFallback className={fallbackClass}>
            {user.fullName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.fullName}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {user.department && (
          <Badge variant="secondary" className="hidden md:inline-flex text-xs">
            {user.department}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(user._id, user.fullName)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data: userResponse } = useGetUserQuery();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAdminProjectsQuery();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: teachersData, isLoading: isLoadingTeachers } = useGetTeachersQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();
  const { data: groupsResponse, isLoading: isLoadingGroups } = useGetAllGroupsQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [studentSearch, setStudentSearch] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId).unwrap();
      } catch {
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];
  const groups = groupsResponse?.data || [];
  const students = studentsData || [];
  const teachers = teachersData || [];

  const projectCounts = useMemo(() => {
    const pending = projects.filter((p) => normalizeProjectStatus(p.status) === "pending").length;
    const approved = projects.filter((p) => normalizeProjectStatus(p.status) === "approved").length;
    const published = projects.filter((p) => normalizeProjectStatus(p.status) === "published").length;
    return { pending, approved, published, total: projects.length };
  }, [projects]);

  const proposalCounts = useMemo(() => {
    const pending = proposals.filter((p) => getProposalStatus(p) === "Pending").length;
    const approved = proposals.filter((p) => getProposalStatus(p) === "Approved").length;
    const rejected = proposals.filter((p) => getProposalStatus(p) === "Rejected").length;
    return { pending, approved, rejected, total: proposals.length };
  }, [proposals]);

  const groupsWithoutMentor = groups.filter((g) => !g.mentor).length;

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const filteredTeachers = useMemo(() => {
    const q = mentorSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.fullName?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.department?.toLowerCase().includes(q)
    );
  }, [teachers, mentorSearch]);

  const recentActivity = useMemo(() => {
    const proposalItems = proposals.map((p) => ({
      id: `p-${p._id}`,
      type: "proposal" as const,
      title: p.title || "Untitled proposal",
      subtitle: p.student?.fullName || "Student",
      status: getProposalStatus(p),
      date: new Date(p.createdAt),
    }));
    const projectItems = projects.map((p) => ({
      id: `proj-${p._id}`,
      type: "project" as const,
      title: p.title || "Untitled project",
      subtitle: typeof p.group === "object" && p.group !== null ? (p.group as { name?: string }).name || "Group" : "Project",
      status: normalizeProjectStatus(p.status),
      date: new Date(p.updatedAt || p.createdAt),
    }));
    return [...proposalItems, ...projectItems]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [proposals, projects]);

  const isLoadingOverview =
    isLoadingProjects || isLoadingStudents || isLoadingTeachers || isLoadingProposals || isLoadingGroups;

  const adminName = userResponse?.data?.fullName?.split(" ")[0] || "Admin";

  const quickActions = [
    {
      title: "Projects",
      description: "Review, approve & publish",
      href: "/project",
      icon: FolderGit2,
    },
    {
      title: "All Groups",
      description: "Assign mentors to teams",
      href: "/all-groups",
      icon: Users,
    },
    {
      title: "Proposals",
      description: "View all submissions",
      href: "/proposal",
      icon: FileText,
    },
    {
      title: "Students",
      description: "Manage student accounts",
      href: "/students",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {adminName}. Here&apos;s what needs your attention today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreateUserDialog role="student" title="Add Student" />
          <CreateUserDialog role="teacher" title="Add Mentor" />
        </div>
      </div>

      {groupsWithoutMentor > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {groupsWithoutMentor} group{groupsWithoutMentor !== 1 ? "s" : ""} without a mentor
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Assign mentors from{" "}
              <Link href="/all-groups" className="text-primary font-medium hover:underline">
                All Groups
              </Link>{" "}
              so students can receive feedback.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">
            Students {students.length > 0 && `(${students.length})`}
          </TabsTrigger>
          <TabsTrigger value="mentors">
            Mentors {teachers.length > 0 && `(${teachers.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Students"
              value={isLoadingStudents ? "…" : students.length.toString()}
              description="Registered accounts"
              icon={GraduationCap}
              href="/students"
              accent="bg-blue-500/10 text-blue-600"
            />
            <StatCard
              title="Mentors"
              value={isLoadingTeachers ? "…" : teachers.length.toString()}
              description="Active teachers"
              icon={UserPlus}
              accent="bg-emerald-500/10 text-emerald-600"
            />
            <StatCard
              title="Groups"
              value={isLoadingGroups ? "…" : groups.length.toString()}
              description={groupsWithoutMentor ? `${groupsWithoutMentor} unassigned` : "All assigned"}
              icon={Users}
              href="/all-groups"
              accent="bg-violet-500/10 text-violet-600"
            />
            <StatCard
              title="Projects"
              value={isLoadingProjects ? "…" : projectCounts.total.toString()}
              description={`${projectCounts.pending} pending review`}
              icon={FolderGit2}
              href="/project"
            />
            <StatCard
              title="Ready to Publish"
              value={isLoadingProjects ? "…" : projectCounts.approved.toString()}
              description="Approved, not live yet"
              icon={Globe}
              href="/project"
              accent="bg-amber-500/10 text-amber-600"
            />
            <StatCard
              title="Proposals"
              value={isLoadingProposals ? "…" : proposalCounts.pending.toString()}
              description="Awaiting mentor review"
              icon={Clock}
              href="/proposal"
              accent="bg-orange-500/10 text-orange-600"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Platform snapshot</CardTitle>
                <CardDescription>Distribution across projects and proposals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project pipeline
                  </p>
                  <StatusBar
                    label="Pending review"
                    count={projectCounts.pending}
                    total={projectCounts.total}
                    colorClass="bg-amber-500"
                  />
                  <StatusBar
                    label="Approved (unpublished)"
                    count={projectCounts.approved}
                    total={projectCounts.total}
                    colorClass="bg-emerald-500"
                  />
                  <StatusBar
                    label="Published"
                    count={projectCounts.published}
                    total={projectCounts.total}
                    colorClass="bg-primary"
                  />
                </div>
                <div className="space-y-4 pt-2 border-t">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Proposal outcomes
                  </p>
                  <StatusBar
                    label="Pending"
                    count={proposalCounts.pending}
                    total={proposalCounts.total}
                    colorClass="bg-amber-500"
                  />
                  <StatusBar
                    label="Approved"
                    count={proposalCounts.approved}
                    total={proposalCounts.total}
                    colorClass="bg-emerald-500"
                  />
                  <StatusBar
                    label="Rejected"
                    count={proposalCounts.rejected}
                    total={proposalCounts.total}
                    colorClass="bg-rose-500"
                  />
                </div>
                <Link href="/project">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    Manage projects <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent activity</CardTitle>
                  <CardDescription>Latest proposals and project updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOverview ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/30"
                        >
                          <div
                            className={`p-1.5 rounded-md shrink-0 ${
                              item.type === "proposal" ? "bg-blue-500/10" : "bg-emerald-500/10"
                            }`}
                          >
                            {item.type === "proposal" ? (
                              <FileText className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FolderGit2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] capitalize"
                          >
                            {item.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
                            {item.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Students</h3>
              <p className="text-sm text-muted-foreground">
                {filteredStudents.length} of {students.length} shown
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students…"
                  className="pl-9"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <CreateUserDialog role="student" title="Add Student" />
            </div>
          </div>

          {isLoadingStudents ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="divide-y max-h-[480px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <UserRow
                    key={student._id}
                    user={student}
                    onDelete={handleDeleteUser}
                    isDeleting={isDeleting}
                    fallbackClass="bg-primary/10 text-primary font-medium"
                  />
                ))}
              </div>
            </Card>
          ) : (
            <EmptyUsers message={studentSearch ? "No students match your search." : "No students registered yet."} />
          )}
        </TabsContent>

        <TabsContent value="mentors" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Mentors</h3>
              <p className="text-sm text-muted-foreground">
                {filteredTeachers.length} of {teachers.length} shown
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors…"
                  className="pl-9"
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                />
              </div>
              <CreateUserDialog role="teacher" title="Add Mentor" />
            </div>
          </div>

          {isLoadingTeachers ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredTeachers.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="divide-y max-h-[480px] overflow-y-auto">
                {filteredTeachers.map((teacher) => (
                  <UserRow
                    key={teacher._id}
                    user={teacher}
                    onDelete={handleDeleteUser}
                    isDeleting={isDeleting}
                    fallbackClass="bg-emerald-500/10 text-emerald-600 font-medium"
                  />
                ))}
              </div>
            </Card>
          ) : (
            <EmptyUsers message={mentorSearch ? "No mentors match your search." : "No mentors registered yet."} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyUsers({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10">
      <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
