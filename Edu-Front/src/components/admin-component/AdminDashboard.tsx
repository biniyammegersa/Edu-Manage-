"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderGit2, CheckCircle, Clock } from "lucide-react";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetStudentsQuery } from "@/features/usersApi/usersApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Project } from "@/type/project";

export function AdminDashboard() {
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAllProjectsQuery();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();

  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];
  
  const totalStudents = studentsData?.length || 0;
  const totalProjects = projects.length;
  const approvedProposals = proposals.filter((p) => p.status === "Approved").length;
  const pendingReviews = proposals.filter((p) => p.status === "Pending").length;

  const stats = [
    {
      title: "Total Students",
      value: isLoadingStudents ? "..." : totalStudents.toString(),
      icon: Users,
      description: "Registered students",
    },
    {
      title: "Total Projects",
      value: isLoadingProjects ? "..." : totalProjects.toString(),
      icon: FolderGit2,
      description: "Platform projects",
    },
    {
      title: "Approved Proposals",
      value: isLoadingProposals ? "..." : approvedProposals.toString(),
      icon: CheckCircle,
      description: "All time",
    },
    {
      title: "Pending Reviews",
      value: isLoadingProposals ? "..." : pendingReviews.toString(),
      icon: Clock,
      description: "Requires attention",
    },
  ];

  // Generate recent activity from proposals (sorting safely without mutating)
  const recentActivity = [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      action: `Proposal ${p.status}`,
      user: p.student?.fullName || "Student",
      time: new Date(p.createdAt).toLocaleDateString(),
    }));

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[350px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
              Chart Placeholder (Recharts could be added here)
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
