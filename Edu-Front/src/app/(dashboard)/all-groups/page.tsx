"use client";

import React, { useState } from 'react';
import { useGetAllGroupsQuery, useAssignMentorMutation } from '@/features/groupApi/groupApi';
import { useGetTeachersQuery } from '@/features/usersApi/usersApi';
import { useGetUserQuery } from '@/features/profileApi/profileApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, UserPlus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AllGroupsPage() {
  const { data: currentUser } = useGetUserQuery();
  const { data: groupsResponse, isLoading: isLoadingGroups } = useGetAllGroupsQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const [assignMentor, { isLoading: isAssigning }] = useAssignMentorMutation();
  const [selectedMentor, setSelectedMentor] = useState<{ [groupId: string]: string }>({});

  const isAdmin = currentUser?.data?.role === 'admin';

  const handleAssignMentor = async (groupId: string) => {
    const mentorId = selectedMentor[groupId];
    if (!mentorId) {
      toast.error("Please select a mentor first");
      return;
    }

    try {
      await assignMentor({ groupId, mentorId }).unwrap();
      toast.success("Mentor assigned successfully");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to assign mentor");
    }
  };

  if (isLoadingGroups) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const groups = groupsResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Student Groups</h1>
      </div>
      
      {groups.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No groups yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              There are currently no student groups registered on the platform.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <Card key={group._id} className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl truncate" title={group.name}>{group.name}</CardTitle>
                  <Badge variant="secondary">{group.members.length} Members</Badge>
                </div>
                <CardDescription className="text-xs pt-1 flex justify-between items-center">
                  <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y">
                  {group.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3 p-4 hover:bg-muted/5 transition-colors">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={member.imageUrl} alt={member.fullName} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs">
                          {member.fullName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium leading-none truncate pr-2">
                            {member.fullName}
                          </p>
                          {member._id === (typeof group.createdBy === 'object' ? (group.createdBy as any)._id : group.createdBy) && (
                            <Badge variant="outline" className="text-[8px] uppercase h-4 px-1 border-primary/20 text-primary bg-primary/5">
                              Creator
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              {/* Mentor Section */}
              <div className="p-4 border-t bg-muted/10 space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <UserPlus className="h-3 w-3" /> Assigned Mentor
                  </p>
                  {group.mentor ? (
                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-primary/10">
                      <Avatar className="h-7 w-7 border-2 border-primary/10">
                        <AvatarImage src={group.mentor.imageUrl} />
                        <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                          {group.mentor.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{group.mentor.fullName}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{group.mentor.email}</p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    </div>
                  ) : (
                    <div className="p-2 border border-dashed rounded-md text-center">
                      <p className="text-xs text-muted-foreground italic">No mentor assigned yet</p>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <Select 
                      onValueChange={(val) => setSelectedMentor({ ...selectedMentor, [group._id]: val })}
                      defaultValue={group.mentor?._id}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Select Mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher._id} value={teacher._id} className="text-xs">
                            {teacher.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      className="h-8 px-2 text-xs" 
                      onClick={() => handleAssignMentor(group._id)}
                      disabled={isAssigning || !selectedMentor[group._id]}
                    >
                      {group.mentor ? "Change" : "Assign"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
