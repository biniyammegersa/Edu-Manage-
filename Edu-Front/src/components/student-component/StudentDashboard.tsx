"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, CheckCircle, Clock, FileText, Plus, MessageSquare } from "lucide-react";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { Project } from "@/type/project";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function StudentDashboard() {
  const { data: userResponse, isLoading: isLoadingUser } = useGetUserQuery();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAllProjectsQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();

  const currentUser = userResponse?.data;
  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];

  // Filter proposals for the current student
  const myProposals = proposals.filter((p) => p.student?._id === currentUser?._id);

  // Find projects where the student is a team member
  const myProjects = projects.filter((p) =>
    p.teamMembers?.some(member => member.name === currentUser?.fullName) ||
    p.likes?.includes(currentUser?._id || "")
  );

  // Helper to dynamically resolve status (backwards compatible)
  const getProposalStatus = (p: any) => {
    const last = p.feedbackList?.length - 1;
    const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
    // Standardize to Capitalized
    if (resolved.toLowerCase() === "approved") return "Approved";
    if (resolved.toLowerCase() === "rejected") return "Rejected";
    if (resolved.toLowerCase() === "pending") return "Pending";
    if (resolved.toLowerCase() === "needs revision" || resolved.toLowerCase() === "needs_revision") return "Needs Revision";
    return resolved;
  };

  // Sort and check latest proposal status
  const sortedProposals = [...myProposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latestProposal = sortedProposals[0];
  const latestStatus = latestProposal ? getProposalStatus(latestProposal) : null;
  const canSubmit = !latestProposal || latestStatus === "Rejected" || latestStatus === "Needs Revision";

  const pendingProposals = myProposals.filter((p) => getProposalStatus(p) === "Pending").length;
  const approvedProposals = myProposals.filter((p) => getProposalStatus(p) === "Approved").length;

  const stats = [
    {
      title: "My Proposals",
      value: isLoadingProposals ? "..." : myProposals.length.toString(),
      icon: FileText,
      description: "Total submissions",
    },
    {
      title: "Pending Reviews",
      value: isLoadingProposals ? "..." : pendingProposals.toString(),
      icon: Clock,
      description: "Awaiting feedback",
    },
    {
      title: "Approved Proposals",
      value: isLoadingProposals ? "..." : approvedProposals.toString(),
      icon: CheckCircle,
      description: "Ready to start",
    },
    {
      title: "My Projects",
      value: isLoadingProjects ? "..." : myProjects.length.toString(),
      icon: FolderGit2,
      description: "Active projects",
    },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.fullName}! Track your progress here.
          </p>
        </div>
        {canSubmit && (
          <div className="flex items-center space-x-2">
            <Link href="/proposal/submit">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Submit New Proposal
              </Button>
            </Link>
          </div>
        )}
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
        {/* Recent Proposals */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Recent Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProposals.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No proposals submitted yet.
                </div>
              ) : (
                myProposals.slice(0, 5).map((proposal) => (
                  <div key={proposal._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{proposal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getProposalStatus(proposal) === 'Approved' ? 'bg-green-100 text-green-800' :
                          getProposalStatus(proposal) === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {getProposalStatus(proposal)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {myProposals.length > 0 && (
                <Link href="/proposal">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Proposals
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedProposals > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Project Ready!</h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    You have an approved proposal. You can now start working on your project and submit it.
                  </p>
                  <Link href="/project/submit">
                    <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700 text-white border-none">
                      Create Project
                    </Button>
                  </Link>
                </div>
              )}

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-semibold">Browse Projects</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Explore projects posted by other students for inspiration.
                </p>
                <Link href="/home">
                  <Button variant="outline" size="sm" className="mt-3">
                    Go to Gallery
                  </Button>
                </Link>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-semibold">Need Help?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact your mentor or check project guidelines.
                </p>
                <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto">
                  View Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
