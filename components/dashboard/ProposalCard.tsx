"use client"; // Remove this if you don't need interactivity or if parent is already a client component

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link"; // Changed from react-router-dom

type ProposalStatus = 
  | "draft" 
  | "submitted" 
  | "under_review" 
  | "review" 
  | "revision_requested" 
  | "approved" 
  | "rejected";

interface ProposalCardProps {
  id: string;
  title: string;
  description?: string;
  status: ProposalStatus;
  date?: string;
  lastUpdated?: string;
  teamSize?: number;
  department?: string;
  supervisor?: string;
  feedback?: number;
}

const statusConfig: Record<ProposalStatus, { 
  label: string; 
  variant: "destructive" | "default" | "secondary" | "outline"
}> = {
  draft: { label: "Draft", variant: "default" },
  submitted: { label: "Submitted", variant: "secondary" },
  under_review: { label: "Under Review", variant: "outline" },
  review: { label: "Under Review", variant: "outline" },
  revision_requested: { label: "Revision Requested", variant: "destructive" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function ProposalCard({
  id,
  title,
  description,
  status,
  date,
  lastUpdated,
  teamSize = 1,
  department,
  supervisor,
  feedback,
}: ProposalCardProps) {
  const { label, variant } = statusConfig[status];
  const displayDate = date || lastUpdated;

  return (
    <Card variant="elevated" className="group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/*  - Assuming your Badge variant logic supports these custom strings */}
              <Badge variant={variant}>{label}</Badge>
              {department && (
                <span className="text-xs text-muted-foreground">{department}</span>
              )}
            </div>
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          {teamSize > 0 && (
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(teamSize, 3) }).map((_, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-muted text-xs">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamSize > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{teamSize - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        {supervisor && (
          <p className="text-sm text-muted-foreground">
            Supervisor: {supervisor}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {displayDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {displayDate}
              </span>
            )}
            {teamSize > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {teamSize} members
              </span>
            )}
            {feedback && feedback > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {feedback} feedback
              </span>
            )}
          </div>
          
          {/* Next.js Link uses 'href' instead of 'to' */}
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <Link href={`/student/dashboard/proposals/${id}`}>
              View
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}