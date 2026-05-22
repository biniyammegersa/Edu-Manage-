"use client";

import Link from "next/link";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Users,
  Calendar,
  FileText,
  XCircle
} from "lucide-react";

// Mock Data
const mockProposals = [
  {
    id: "1",
    title: "AI-Powered Student Performance Analytics",
    students: ["John Doe", "Jane Smith", "Mike Johnson"],
    status: "pending_review",
    submittedAt: "2024-01-15",
    department: "Computer Science",
    abstract: "An AI system to predict and improve student academic performance.",
  },
  {
    id: "2",
    title: "Blockchain-Based Certificate Verification",
    students: ["Alice Brown", "Bob Wilson"],
    status: "revision_submitted",
    submittedAt: "2024-01-14",
    department: "Computer Science",
    abstract: "Secure and tamper-proof academic certificate verification system.",
  },
  {
    id: "3",
    title: "Smart Campus IoT Integration",
    students: ["Emily Davis"],
    status: "pending_review",
    submittedAt: "2024-01-13",
    department: "Electrical Engineering",
    abstract: "IoT-based smart campus management for energy efficiency.",
  },
  {
    id: "4",
    title: "E-Learning Platform Enhancement",
    students: ["Chris Lee", "David Park"],
    status: "approved",
    submittedAt: "2024-01-10",
    department: "Information Technology",
    abstract: "Enhanced e-learning platform with interactive features.",
  },
  {
    id: "5",
    title: "University Resource Management System",
    students: ["Sarah Kim"],
    status: "rejected",
    submittedAt: "2024-01-08",
    department: "Computer Science",
    abstract: "Comprehensive resource management for university facilities.",
  },
];

// Config for colors and icons
const statusConfig = {
  pending_review: { 
    label: "Pending Review", 
    colorClass: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100", 
    icon: Clock 
  },
  revision_submitted: { 
    label: "Revision Submitted", 
    colorClass: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100", 
    icon: AlertTriangle 
  },
  approved: { 
    label: "Approved", 
    colorClass: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100", 
    icon: CheckCircle2 
  },
  rejected: { 
    label: "Rejected", 
    colorClass: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100", 
    icon: XCircle 
  },
};

export default function AssignedProposalsPage() {
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Assigned Proposals</h1>
          <p className="text-muted-foreground">
            Review and provide feedback on student proposals
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or student..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="revision_submitted">Revision Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="ee">Electrical Engineering</SelectItem>
                <SelectItem value="it">Information Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proposals List Grid */}
        <div className="grid grid-cols-1 gap-4">
          {mockProposals.map((proposal) => {
            const status = statusConfig[proposal.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={proposal.id} className="hover:shadow-md transition-all hover:border-primary/20 group">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    {/* Title and Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`${status.colorClass} border gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {proposal.department}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {proposal.title}
                      </CardTitle>
                    </div>

                    {/* Avatars */}
                    <div className="flex -space-x-2 shrink-0">
                      {proposal.students.slice(0, 3).map((student, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-background ring-1 ring-gray-100">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                            {student.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {proposal.students.length > 3 && (
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                          +{proposal.students.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {proposal.abstract}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {proposal.students.join(", ")}
                      </span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted: {proposal.submittedAt}
                      </span>
                    </div>

                    <Button asChild size="sm" className="gap-2 sm:w-auto w-full">
                      <Link href={`/teacher/proposals/${proposal.id}/review`}>
                        <FileText className="h-4 w-4" />
                        Review Proposal
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}