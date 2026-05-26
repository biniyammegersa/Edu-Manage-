"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeProjects from "@/components/home-component/HomeProjects";
import { AdminDashboard } from "@/components/admin-component/AdminDashboard";
import { MentorDashboard } from "@/components/mentor-component/MentorDashboard";
import { StudentDashboard } from "@/components/student-component/StudentDashboard";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { data: userResponse, isLoading } = useGetUserQuery();

  const role = userResponse?.data?.role;

  useEffect(() => {
    if (!isLoading && role === "community") {
      router.replace("/community");
    }
  }, [isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === "community") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
