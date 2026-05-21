"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, CheckCircle, Clock, FileText, ArrowRight, MessageSquare } from "lucide-react";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Project } from "@/type/project";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MentorDashboard() {
  const { data: userResponse, isLoading: isLoadingUser } = useGetUserQuery();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAllProjectsQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();

  const currentUser = userResponse?.data;
  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];
  
  // Filter for the current mentor
  const myProjects = projects.filter((p) => p.reviewedByTeacherId === currentUser?._id);
  const myProposals = proposals.filter((p) => p.teacher?._id === currentUser?._id);

  // Helper to dynamically resolve status (backwards compatible)
  const getProposalStatus = (p: any) => {
    const last = p.feedbackList?.length - 1;
    const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
    // Standardize to Capitalized
    if (resolved.toLowerCase() === "approved") return "Approved";
    if (resolved.toLowerCase() === "rejected") return "Rejected";
    if (resolved.toLowerCase() === "pending") return "Pending";
    return resolved;
  };

  const pendingProposals = myProposals.filter((p) => getProposalStatus(p) === "Pending").length;
  const approvedProposals = myProposals.filter((p) => getProposalStatus(p) === "Approved").length;

  const stats = [
    {
      title: "My Assigned Projects",
      value: isLoadingProjects ? "..." : myProjects.length.toString(),
      icon: FolderGit2,
      description: "Active student projects",
    },
    {
      title: "Total Proposals",
      value: isLoadingProposals ? "..." : myProposals.length.toString(),
      icon: FileText,
      description: "Proposals assigned to you",
    },
    {
      title: "Pending Reviews",
      value: isLoadingProposals ? "..." : pendingProposals.toString(),
      icon: Clock,
      description: "Awaiting your feedback",
    },
    {
      title: "Approved Proposals",
      value: isLoadingProposals ? "..." : approvedProposals.toString(),
      icon: CheckCircle,
      description: "Ready for development",
    },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Assigned Projects */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Student Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProjects.length === 0 ? (
                <div className="text-sm text-muted-foreground">No projects assigned yet.</div>
              ) : (
                myProjects.map((project) => (
                  <div key={project._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.teamMembers?.length || 0} Members
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/project/submitfeedback/${project._id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Comment
                        </Button>
                      </Link>
                      <Link href={`/project/submitfeedback/${project._id}`}>
                        <Button size="sm">
                          Review <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Assigned Proposals */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Proposal Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProposals.length === 0 ? (
                <div className="text-sm text-muted-foreground">No proposals assigned yet.</div>
              ) : (
                myProposals.map((proposal) => (
                  <div key={proposal._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{proposal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Student: {proposal.student?.fullName || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProposalStatus(proposal) === 'Approved' ? 'bg-green-100 text-green-800' : getProposalStatus(proposal) === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {getProposalStatus(proposal)}
                      </span>
                      <Link href={`/proposal/submitfeedback/${proposal._id}`}>
                        <Button size="sm" variant="secondary">
                          Review Proposal
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
