"use client";

import React from 'react';
import { MentorDashboard } from "@/components/mentor-component/MentorDashboard";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetTeachersQuery } from '@/features/usersApi/usersApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Trash2 } from "lucide-react";
import { useDeleteUserMutation } from "@/features/usersApi/usersApi";
import { Button } from "@/components/ui/button";

export default function MentorPage() {
  const { data: userResponse, isLoading: isLoadingUser } = useGetUserQuery();
  const { data: mentors, isLoading: isLoadingMentors } = useGetTeachersQuery();
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

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const userRole = userResponse?.data?.role;

  // If user is teacher, show the dashboard
  if (userRole === "teacher") {
    return <MentorDashboard />;
  }

  // If user is admin (or others who can see this route), show the list
  if (isLoadingMentors) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Mentors</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Mentors Directory</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all {mentors?.length || 0} registered mentors
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {mentors?.map((mentor) => (
                <div key={mentor._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={mentor.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-medium">
                        {mentor.fullName?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{mentor.fullName}</p>
                      <p className="text-sm text-muted-foreground">{mentor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mentor.department && (
                      <div className="hidden md:block">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {mentor.department}
                        </span>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteUser(mentor._id, mentor.fullName)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {(!mentors || mentors.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10 mt-2">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No mentors found</h3>
              <p className="text-sm text-muted-foreground mt-1">There are no mentors registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
