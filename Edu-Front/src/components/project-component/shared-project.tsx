'use client'
import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Calendar, Grid, List, Search } from "lucide-react";
import { Button } from "../ui/button";
import SharedProjectCard from "./shared-project-card";
import {
  useGetAdminProjectsQuery,
  useGetAllProjectsQuery,
  useGetMentorProjectsQuery,
} from "@/features/getProjectsApi/getProjectsApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Project } from "@/type/project";
import { profileType } from "@/type/profile";

const SharedProject = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: userData } = useGetUserQuery();
  const user = userData?.data as profileType;
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const { data: projectsData, isLoading: isLoadingPublic } = useGetAllProjectsQuery(undefined, {
    skip: isAdmin || isTeacher,
  });
  const { data: adminProjectsData, isLoading: isLoadingAdmin } = useGetAdminProjectsQuery(undefined, {
    skip: !isAdmin,
  });
  const { data: mentorProjectsData, isLoading: isLoadingMentor } = useGetMentorProjectsQuery(undefined, {
    skip: !isTeacher,
  });

  const isLoading = isAdmin ? isLoadingAdmin : isTeacher ? isLoadingMentor : isLoadingPublic;
  const allProjects = (
    (isAdmin
      ? adminProjectsData?.projects
      : isTeacher
        ? mentorProjectsData?.projects
        : projectsData?.projects) as Project[]
  ) || [];

  const filteredProjects = useMemo(() => {
    let list = allProjects.filter((project) => {
      if (!user?._id) return false;

      if (user.role === "student") {
        return (
          (project.group && user.group && project.group === user.group) ||
          project.teamMembers?.some((member) => member.id === user._id)
        );
      }

      if (user.role === "teacher") {
        return true;
      }

      return true;
    });

    if ((isAdmin || isTeacher) && statusFilter !== "all") {
      list = list.filter(
        (p) => (p.status || "pending").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return list;
  }, [allProjects, user, isAdmin, isTeacher, statusFilter]);

  return (
    <div>
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.role === "student"
              ? "My Projects"
              : user?.role === "admin"
                ? "All Platform Projects"
                : "Assigned Projects"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "student"
              ? "Projects you are working on"
              : user?.role === "admin"
                ? "Review pending projects and publish approved ones for the community"
                : "Projects assigned to you for review or teaching"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search my projects..."
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {isAdmin || isTeacher ? (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="teaching">Teaching</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="relative">
            <Input type="date" className="w-[180px] pl-10" />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {user?.role === "student"
                ? "You are not part of any projects yet."
                : user?.role === "admin"
                  ? "No projects match this filter."
                  : "No projects assigned to you yet."}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredProjects.map((project) => (
              <SharedProjectCard
                key={project._id}
                id={project._id}
                title={project.title}
                description={project.projectDescription}
                imageUrl={project.coverImage || "/placeholder-project.jpg"}
                date={project.createdAt}
                viewMode={viewMode}
                role={(user?.role || "student") as "student" | "teacher" | "admin"}
                projectStatus={project.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedProject;
