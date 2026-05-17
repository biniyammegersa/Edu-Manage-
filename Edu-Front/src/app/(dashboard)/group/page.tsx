"use client";

import React, { useState } from "react";
import { useGetMyGroupQuery, useCreateGroupMutation } from "@/features/groupApi/groupApi";
import { useGetStudentsWithoutGroupQuery } from "@/features/usersApi/usersApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function GroupPage() {
  const { data: myGroup, isLoading: isGroupLoading, refetch } = useGetMyGroupQuery();
  const { data: currentUser } = useGetUserQuery();
  const { data: studentsWithoutGroup, isLoading: isStudentsLoading } = useGetStudentsWithoutGroupQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState("");

  if (isGroupLoading || isStudentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const groupData = myGroup?.data;

  // If already in a group, display it
  if (groupData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Group</h1>
        <Card>
          <CardHeader>
            <CardTitle>{groupData.name}</CardTitle>
            <CardDescription>
              {groupData.members.length} Members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupData.members.map((member) => (
                <div key={member._id} className="flex items-center space-x-4 rounded-md border p-4 relative">
                  {member._id === groupData.createdBy && (
                    <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                      Creator
                    </div>
                  )}
                  <Avatar>
                    <AvatarImage src={member.imageUrl} alt={member.fullName} />
                    <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{member.fullName}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise, show Create Group form
  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    setError("");
    
    // Validate members
    const totalMembers = selectedMembers.length + 1; // +1 for the current user
    if (totalMembers < 3 || totalMembers > 5) {
      setError(`You must select between 2 and 4 other students to form a group of 3-5. You currently have selected ${selectedMembers.length}.`);
      return;
    }

    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      const response = await createGroup({
        name: groupName,
        members: selectedMembers,
      }).unwrap();
      
      if (response.success) {
        refetch();
      }
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create group. Please try again.");
    }
  };

  // Filter out the current user from the selectable list just in case
  const selectableStudents = (studentsWithoutGroup || []).filter(
    (student) => student._id !== currentUser?.data?._id
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create a Group</h1>
      <p className="text-muted-foreground">
        Form a group with 2 to 4 other students (total 3-5 members). You can only be part of one group.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="groupName" className="text-sm font-medium leading-none">
              Group Name
            </label>
            <Input
              id="groupName"
              placeholder="Enter an awesome name for your group..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none">
              Select Members (Select {Math.max(0, 2 - selectedMembers.length)} to {4 - selectedMembers.length} more)
            </h3>
            
            {selectableStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available students found without a group.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selectableStudents.map((student) => (
                  <div key={student._id} className="flex items-center space-x-4 rounded-md border p-4">
                    <Checkbox
                      id={`student-${student._id}`}
                      checked={selectedMembers.includes(student._id)}
                      onCheckedChange={() => handleToggleMember(student._id)}
                    />
                    <label
                      htmlFor={`student-${student._id}`}
                      className="flex flex-1 items-center space-x-4 cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={student.imageUrl} alt={student.fullName} />
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">{student.department || student.email}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button 
            onClick={handleCreateGroup} 
            disabled={isCreating}
            className="w-full sm:w-auto"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
