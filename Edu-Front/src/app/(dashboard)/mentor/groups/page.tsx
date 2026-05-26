"use client";

import { MentorAssignedGroups } from "@/components/mentor-component/MentorAssignedGroups";
import { Users } from "lucide-react";

export default function MentorGroupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          My Assigned Groups
        </h1>
        <p className="text-muted-foreground mt-1">
          Student groups you mentor, including all members in each group.
        </p>
      </div>
      <MentorAssignedGroups />
    </div>
  );
}
