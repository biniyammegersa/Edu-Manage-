"use client";

import React from "react";
import HomeProjects from "@/components/home-component/HomeProjects";
import { AdminDashboard } from "@/components/admin-component/AdminDashboard";
import { MentorDashboard } from "@/components/mentor-component/MentorDashboard";
import { StudentDashboard } from "@/components/student-component/StudentDashboard";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: userResponse, isLoading } = useGetUserQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const role = userResponse?.data?.role;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "teacher") {
    return <MentorDashboard />;
  }

  if (role === "student") {
    return <StudentDashboard />;
  }

  // Default fallback if no role matches or not logged in
  return <HomeProjects />;
}
