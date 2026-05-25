"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderGit2, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useGetAdminProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetStudentsQuery, useGetTeachersQuery, useDeleteUserMutation } from "@/features/usersApi/usersApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateUserDialog } from "./CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Project } from "@/type/project";

export function AdminDashboard() {
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAdminProjectsQuery();
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: teachersData, isLoading: isLoadingTeachers } = useGetTeachersQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();
  
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // Helper to dynamically resolve status (backwards compatible)
  const getProposalStatus = (p: any) => {
    const last = p.feedbackList?.length - 1;
    const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
    // Standardize to Capitalized
    if (resolved.toLowerCase() === "approved") return "Approved";
    if (resolved.toLowerCase() === "rejected") return "Rejected";
    if (resolved.toLowerCase() === "pending") return "Pending";
    return resolved;
  };

  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];
  
  const totalStudents = studentsData?.length || 0;
  const totalProjects = projects.length;
  const pendingProjects = projects.filter((p) => (p.status || "pending") === "pending").length;
  const readyToPublish = projects.filter((p) => p.status === "approved").length;
  const approvedProposals = proposals.filter((p) => getProposalStatus(p) === "Approved").length;
  const pendingReviews = proposals.filter((p) => getProposalStatus(p) === "Pending").length;

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
      description: `${pendingProjects} pending · ${readyToPublish} ready to publish`,
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
      action: `Proposal ${getProposalStatus(p)}`,
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

      <TabsContent value="students" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Students Directory</h3>
            <p className="text-sm text-muted-foreground">Manage and view all {totalStudents} registered students</p>
          </div>
          <CreateUserDialog role="student" title="Add Student" />
        </div>
        
        {isLoadingStudents ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : studentsData && studentsData.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {studentsData.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={student.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {student.fullName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {student.department && (
                      <div className="hidden md:block">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {student.department}
                        </span>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteUser(student._id, student.fullName)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No students found</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no students registered yet.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="mentors" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Mentors Directory</h3>
            <p className="text-sm text-muted-foreground">Manage and view all {teachersData?.length || 0} registered mentors</p>
          </div>
          <CreateUserDialog role="teacher" title="Add Mentor" />
        </div>
        
        {isLoadingTeachers ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : teachersData && teachersData.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {teachersData.map((teacher) => (
                <div key={teacher._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={teacher.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-medium">
                        {teacher.fullName?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{teacher.fullName}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {teacher.department && (
                      <div className="hidden md:block">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {teacher.department}
                        </span>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteUser(teacher._id, teacher.fullName)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No mentors found</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no mentors registered yet.</p>
          </div>
        )}
      </TabsContent>
      </Tabs>
    </div>
  );
}
