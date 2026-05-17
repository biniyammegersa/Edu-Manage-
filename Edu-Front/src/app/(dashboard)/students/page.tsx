"use client";

import React from 'react';
import { useGetStudentsQuery } from '@/features/usersApi/usersApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Trash2 } from "lucide-react";
import { useDeleteUserMutation } from "@/features/usersApi/usersApi";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  const { data: students, isLoading } = useGetStudentsQuery();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Students</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Students Directory</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all {students?.length || 0} registered students
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {students?.map((student) => (
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
          {(!students || students.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/10 mt-2">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No students found</h3>
              <p className="text-sm text-muted-foreground mt-1">There are no students registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}