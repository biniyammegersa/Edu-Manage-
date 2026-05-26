"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, CheckCircle, Clock, FileText, ArrowRight, MessageSquare, BookOpen, Users } from "lucide-react";
import { useGetMentorGroupsQuery } from "@/features/groupApi/groupApi";
import { MentorAssignedGroups } from "@/components/mentor-component/MentorAssignedGroups";
import { useGetPendingReviewsQuery, useGetMentorDocumentationHistoryQuery } from "@/features/docApi/docApi";
import { useGetMentorProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Project } from "@/type/project";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const normalizeProjectStatus = (status?: string) => (status || "pending").toLowerCase();

const getProjectStatusLabel = (status?: string) => {
  const normalized = normalizeProjectStatus(status);
  if (normalized === "approved") return "Approved";
  if (normalized === "published") return "Published";
  return "Pending";
};

const getProjectStatusClass = (status?: string) => {
  const normalized = normalizeProjectStatus(status);
  if (normalized === "approved") return "bg-green-100 text-green-800";
  if (normalized === "published") return "bg-emerald-100 text-emerald-800";
  return "bg-yellow-100 text-yellow-800";
};

function ProjectList({
  projects,
  isLoading,
  emptyMessage,
}: {
  projects: Project[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectRow key={project._id} project={project} />
      ))}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{project.title}</p>
        <p className="text-xs text-muted-foreground">
          {project.teamMembers?.length || 0} Members
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProjectStatusClass(project.status)}`}>
          {getProjectStatusLabel(project.status)}
        </span>
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
  );
}

export function MentorDashboard() {
  const { data: userResponse } = useGetUserQuery();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetMentorProjectsQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();
  const { data: pendingDocsResponse } = useGetPendingReviewsQuery();
  const { data: docHistoryResponse } = useGetMentorDocumentationHistoryQuery();
  const { data: mentorGroupsResponse, isLoading: isLoadingGroups } = useGetMentorGroupsQuery();

  const currentUser = userResponse?.data;
  const myProjects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];
  const myProposals = proposals.filter((p) => p.teacher?._id === currentUser?._id);

  const pendingDocCount = pendingDocsResponse?.data?.length ?? 0;
  const reviewedDocCount = docHistoryResponse?.data?.length ?? 0;

  const getProposalStatus = (p: any) => {
    const last = p.feedbackList?.length - 1;
    const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
    if (resolved.toLowerCase() === "approved") return "Approved";
    if (resolved.toLowerCase() === "rejected") return "Rejected";
    if (resolved.toLowerCase() === "pending") return "Pending";
    return resolved;
  };

  const pendingProjects = myProjects.filter((p) => normalizeProjectStatus(p.status) === "pending");
  const approvedProjects = myProjects.filter((p) =>
    ["approved", "published"].includes(normalizeProjectStatus(p.status))
  );

  const pendingProposals = myProposals.filter((p) => getProposalStatus(p) === "Pending").length;
  const approvedProposals = myProposals.filter((p) => getProposalStatus(p) === "Approved").length;
  const assignedGroups = mentorGroupsResponse?.data || [];
  const totalGroupMembers = assignedGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0);

  const stats = [
    {
      title: "Assigned Groups",
      value: isLoadingGroups ? "..." : assignedGroups.length.toString(),
      icon: Users,
      description: `${totalGroupMembers} students total`,
    },
    {
      title: "Pending Projects",
      value: isLoadingProjects ? "..." : pendingProjects.length.toString(),
      icon: Clock,
      description: "Awaiting your review",
    },
    {
      title: "Approved Projects",
      value: isLoadingProjects ? "..." : approvedProjects.length.toString(),
      icon: CheckCircle,
      description: "Reviewed and approved",
    },
    {
      title: "Pending Proposals",
      value: isLoadingProposals ? "..." : pendingProposals.toString(),
      icon: FileText,
      description: "Proposal reviews needed",
    },
    {
      title: "Approved Proposals",
      value: isLoadingProposals ? "..." : approvedProposals.toString(),
      icon: FolderGit2,
      description: "Ready for development",
    },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assigned Groups & Members
          </CardTitle>
          <Link href="/mentor/groups">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <MentorAssignedGroups compact />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Documentation Reviews
          </CardTitle>
          <Link href="/mentor/reviews">
            <Button size="sm">Open Review Board</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold text-amber-600">{pendingDocCount}</span>
              <p className="text-muted-foreground text-xs mt-1">Pending chapters</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-600">{reviewedDocCount}</span>
              <p className="text-muted-foreground text-xs mt-1">Reviewed (history)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Submissions you have reviewed stay in the History tab on the Review Board so you can read your feedback anytime.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Pending Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectList
              projects={pendingProjects}
              isLoading={isLoadingProjects}
              emptyMessage="No pending projects to review."
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Approved Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectList
              projects={approvedProjects}
              isLoading={isLoadingProjects}
              emptyMessage="No approved projects yet."
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Proposal Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProposals.length === 0 ? (
                <div className="text-sm text-muted-foreground">No proposals assigned yet.</div>
              ) : (
                myProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{proposal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Student: {proposal.student?.fullName || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          getProposalStatus(proposal) === "Approved"
                            ? "bg-green-100 text-green-800"
                            : getProposalStatus(proposal) === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
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
