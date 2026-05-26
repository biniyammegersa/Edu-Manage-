"use client";

import { useGetMentorGroupsQuery, GroupType } from "@/features/groupApi/groupApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Mail, GraduationCap } from "lucide-react";

function GroupCard({ group }: { group: GroupType }) {
  const creatorId =
    typeof group.createdBy === "object"
      ? (group.createdBy as { _id?: string })?._id
      : group.createdBy;

  return (
    <Card className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg truncate" title={group.name}>
            {group.name}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {group.members.length} {group.members.length === 1 ? "Member" : "Members"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="divide-y">
          {group.members.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-3 p-4 hover:bg-muted/5 transition-colors"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={member.imageUrl} alt={member.fullName} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                  {member.fullName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium leading-none truncate">
                    {member.fullName}
                  </p>
                  {member._id === creatorId && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase h-5 px-1.5 border-primary/20 text-primary bg-primary/5 shrink-0"
                    >
                      Creator
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3 shrink-0" />
                  {member.email}
                </p>
                {member.department && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    {member.department}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorAssignedGroups({ compact = false }: { compact?: boolean }) {
  const { data: groupsResponse, isLoading } = useGetMentorGroupsQuery();
  const groups = groupsResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-medium">No groups assigned yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            An administrator can assign you as a mentor to student groups from All Groups.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={
        compact
          ? "grid gap-4 md:grid-cols-1 lg:grid-cols-2"
          : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {groups.map((group) => (
        <GroupCard key={group._id} group={group} />
      ))}
    </div>
  );
}
