"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderGit2, CheckCircle, Clock } from "lucide-react";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetStudentsQuery, useGetTeachersQuery } from "@/features/usersApi/usersApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateUserDialog } from "./CreateUserDialog";
import { Project } from "@/type/project";

export function AdminDashboard() {
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAllProjectsQuery();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: teachersData, isLoading: isLoadingTeachers } = useGetTeachersQuery();
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Students Directory</CardTitle>
            <CreateUserDialog role="student" title="Add Student" />
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="text-sm text-muted-foreground">Loading students...</div>
            ) : studentsData && studentsData.length > 0 ? (
              <div className="space-y-6">
                {studentsData.map((student) => (
                  <div key={student._id} className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={student.imageUrl} />
                        <AvatarFallback>{student.fullName?.charAt(0) || "S"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground hidden md:block">
                      {student.department || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No students found.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mentors" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Mentors Directory</CardTitle>
            <CreateUserDialog role="teacher" title="Add Mentor" />
          </CardHeader>
          <CardContent>
            {isLoadingTeachers ? (
              <div className="text-sm text-muted-foreground">Loading mentors...</div>
            ) : teachersData && teachersData.length > 0 ? (
              <div className="space-y-6">
                {teachersData.map((teacher) => (
                  <div key={teacher._id} className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={teacher.imageUrl} />
                        <AvatarFallback>{teacher.fullName?.charAt(0) || "T"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{teacher.fullName}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground hidden md:block">
                      {teacher.department || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No mentors found.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}
