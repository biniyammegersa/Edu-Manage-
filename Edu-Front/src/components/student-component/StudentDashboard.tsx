"use client";

import { useMemo, type ComponentType } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FolderGit2,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  Users,
  BookOpen,
  AlertCircle,
  PenLine,
  Rocket,
} from "lucide-react";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { useGetMyGroupQuery } from "@/features/groupApi/groupApi";
import { useGetDocumentationReadinessQuery } from "@/features/docApi/docApi";
import { Project } from "@/type/project";
import { Button } from "@/components/ui/button";

const DOC_TOTAL = 7;

function getProposalStatus(p: { feedbackList?: { status?: string }[]; status?: string }) {
  const last = (p.feedbackList?.length ?? 0) - 1;
  const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
  const lower = resolved.toLowerCase();
  if (lower === "approved") return "Approved";
  if (lower === "rejected") return "Rejected";
  if (lower === "needs revision" || lower === "needs_revision") return "Needs Revision";
  return "Pending";
}

function statusBadgeClass(status: string) {
  if (status === "Approved") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (status === "Rejected") return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
  if (status === "Needs Revision") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  accent?: string;
}) {
  const content = (
    <Card className={`transition-shadow hover:shadow-md ${href ? "cursor-pointer" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${accent || "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

type JourneyStep = {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming" | "blocked";
  detail: string;
  href?: string;
};

function JourneyStepRow({ step, index }: { step: JourneyStep; index: number }) {
  const icon =
    step.status === "complete" ? (
      <CheckCircle className="h-5 w-5 text-emerald-600" />
    ) : step.status === "current" ? (
      <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
    ) : (
      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
    );

  const row = (
    <div
      className={`flex gap-4 p-4 rounded-xl border transition-colors ${
        step.status === "current" ? "border-primary/40 bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex flex-col items-center shrink-0">
        {icon}
        {index < 3 && <div className="w-px flex-1 min-h-[24px] bg-border mt-2" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{step.label}</p>
          <Badge variant="outline" className="text-[10px] capitalize shrink-0">
            {step.status === "complete" ? "Done" : step.status === "current" ? "In progress" : step.status === "blocked" ? "Blocked" : "Next"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
        {step.href && step.status !== "upcoming" && (
          <span className="text-xs text-primary font-medium mt-2 inline-flex items-center gap-1">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (step.href) {
    return (
      <Link href={step.href} className="block hover:opacity-90">
        {row}
      </Link>
    );
  }
  return row;
}

export function StudentDashboard() {
  const { data: userResponse } = useGetUserQuery();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetAllProjectsQuery();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();
  const { data: groupResponse, isLoading: isLoadingGroup } = useGetMyGroupQuery();
  const { data: docReadiness, isLoading: isLoadingDocs } = useGetDocumentationReadinessQuery();

  const currentUser = userResponse?.data;
  const group = groupResponse?.data;
  const projects = (projectsData?.projects as Project[]) || [];
  const proposals = proposalsResponse?.data || [];

  const groupId = group?._id || currentUser?.group;
  const memberIds = group?.members?.map((m) => (typeof m === "object" ? m._id : m)) || [];

  const myProposals = useMemo(() => {
    return proposals.filter((p) => {
      const isSameGroup = p.group && groupId && p.group === groupId;
      const isGroupMember = p.student?._id && memberIds.includes(p.student._id);
      return isSameGroup || isGroupMember;
    });
  }, [proposals, groupId, memberIds]);

  const sortedProposals = useMemo(
    () =>
      [...myProposals].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [myProposals]
  );

  const latestProposal = sortedProposals[0];
  const latestStatus = latestProposal ? getProposalStatus(latestProposal) : null;
  const canSubmitProposal =
    !latestProposal || latestStatus === "Rejected" || latestStatus === "Needs Revision";

  const pendingProposals = myProposals.filter((p) => getProposalStatus(p) === "Pending").length;
  const approvedProposals = myProposals.filter((p) => getProposalStatus(p) === "Approved").length;

  const docApproved = docReadiness?.approvedCount ?? 0;
  const allDocsApproved = docReadiness?.eligible === true;
  const hasSubmittedProject = docReadiness?.hasSubmittedProject === true;
  const canCreateProject = approvedProposals > 0 && allDocsApproved && !hasSubmittedProject;

  const myPublishedProjects = useMemo(() => {
    return projects.filter((p) => {
      const pGroup = typeof p.group === "object" ? (p.group as { _id?: string })?._id : p.group;
      return groupId && pGroup === groupId;
    });
  }, [projects, groupId]);

  const firstName = currentUser?.fullName?.split(" ")[0] || "Student";
  const hasGroup = !!group?.name;
  const proposalDone = latestStatus === "Approved";

  const journeySteps: JourneyStep[] = useMemo(() => {
    const proposalCurrent =
      !!latestProposal && !proposalDone && latestStatus !== "Rejected";

    return [
      {
        id: "group",
        label: "Team & group",
        status: hasGroup ? "complete" : "current",
        detail: hasGroup
          ? `${group?.name} · ${group?.members?.length ?? 0} members`
          : "Create or join a group to start",
        href: "/group",
      },
      {
        id: "proposal",
        label: "Research proposal",
        status: proposalDone
          ? "complete"
          : canSubmitProposal && hasGroup
            ? "current"
            : proposalCurrent
              ? "current"
              : hasGroup
                ? "current"
                : "blocked",
        detail: !hasGroup
          ? "Requires a group first"
          : !latestProposal
            ? "Submit your proposal for mentor review"
            : `Latest: ${latestStatus}`,
        href: "/proposal",
      },
      {
        id: "documentation",
        label: "Documentation (7 chapters)",
        status: allDocsApproved
          ? "complete"
          : proposalDone
            ? "current"
            : "upcoming",
        detail: proposalDone
          ? `${docApproved}/${DOC_TOTAL} chapters approved`
          : "Unlocks after proposal approval",
        href: "/documentation",
      },
      {
        id: "project",
        label: "Final project",
        status: hasSubmittedProject
          ? "complete"
          : canCreateProject
            ? "current"
            : "upcoming",
        detail: hasSubmittedProject
          ? "Submitted — track status under Projects"
          : canCreateProject
            ? "Ready to submit your project"
            : allDocsApproved
              ? "Complete remaining requirements"
              : "After all docs are approved",
        href: hasSubmittedProject ? "/project" : canCreateProject ? "/project/submit" : "/project",
      },
    ];
  }, [
    hasGroup,
    group,
    latestProposal,
    latestStatus,
    canSubmitProposal,
    allDocsApproved,
    docApproved,
    hasSubmittedProject,
    canCreateProject,
    proposalDone,
  ]);

  const quickActions = [
    {
      title: "My Group",
      description: "Members & group chat",
      href: "/group",
      icon: Users,
      show: true,
    },
    {
      title: "Documentation",
      description: `${docApproved}/${DOC_TOTAL} chapters done`,
      href: "/documentation",
      icon: BookOpen,
      show: proposalDone || docApproved > 0,
    },
    {
      title: "Submit Proposal",
      description: canSubmitProposal ? "Start or resubmit" : "View proposals",
      href: canSubmitProposal ? "/proposal/submit" : "/proposal",
      icon: PenLine,
      show: true,
    },
    {
      title: "Browse Projects",
      description: "Community gallery",
      href: "/home",
      icon: FolderGit2,
      show: true,
    },
  ].filter((a) => a.show);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {firstName}. Track your proposal, documentation, and project progress.
          </p>
        </div>
        {canSubmitProposal && hasGroup && (
          <Link href="/proposal/submit">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {latestProposal ? "Resubmit Proposal" : "Submit Proposal"}
            </Button>
          </Link>
        )}
      </div>

      {canCreateProject && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <Rocket className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-emerald-900 dark:text-emerald-200">
              You&apos;re ready to submit your project
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proposal and all 7 documentation chapters are approved.
            </p>
          </div>
          <Link href="/project/submit">
            <Button size="sm" className="shrink-0 bg-emerald-600 hover:bg-emerald-700">
              Submit Project
            </Button>
          </Link>
        </div>
      )}

      {!hasGroup && !isLoadingGroup && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">No group yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <Link href="/group" className="text-primary font-medium hover:underline">
                Create or join a group
              </Link>{" "}
              before submitting a proposal.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Proposals"
          value={isLoadingProposals ? "…" : myProposals.length.toString()}
          description="Your group submissions"
          icon={FileText}
          href="/proposal"
        />
        <StatCard
          title="Awaiting Feedback"
          value={isLoadingProposals ? "…" : pendingProposals.toString()}
          description="Pending mentor review"
          icon={Clock}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Approved"
          value={isLoadingProposals ? "…" : approvedProposals.toString()}
          description="Proposal accepted"
          icon={CheckCircle}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Documentation"
          value={isLoadingDocs ? "…" : `${docApproved}/${DOC_TOTAL}`}
          description={allDocsApproved ? "All chapters approved" : "Chapters approved"}
          icon={BookOpen}
          href="/documentation"
          accent="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          title="Published Projects"
          value={isLoadingProjects ? "…" : myPublishedProjects.length.toString()}
          description={hasSubmittedProject ? "Group project live" : "On community feed"}
          icon={FolderGit2}
          href="/project"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Your journey</CardTitle>
            <CardDescription>From group setup to final project submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {journeySteps.map((step, i) => (
              <JourneyStepRow key={step.id} step={step} index={i} />
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-7 space-y-4">
          {proposalDone && !allDocsApproved && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold">Documentation in progress</p>
                    <Progress
                      value={Math.round((docApproved / DOC_TOTAL) * 100)}
                      className="h-2"
                      indicatorClassName="bg-amber-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      {docApproved} of {DOC_TOTAL} chapters mentor-approved
                      {docReadiness?.pending?.length
                        ? ` · Next: ${docReadiness.pending[0]}`
                        : ""}
                    </p>
                  </div>
                  <Link href="/documentation">
                    <Button size="sm" variant="outline" className="shrink-0 gap-1">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {hasGroup && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    {group?.name}
                  </CardTitle>
                  <CardDescription>
                    {group?.mentor
                      ? `Mentor: ${typeof group.mentor === "object" ? group.mentor.fullName : "Assigned"}`
                      : "No mentor assigned yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {group?.members?.map((member) => (
                      <div key={member._id} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {member.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate">{member.fullName}</span>
                        {member._id === currentUser?._id && (
                          <Badge variant="outline" className="text-[9px] ml-auto shrink-0">
                            You
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link href="/group">
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                      Open group page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className={hasGroup ? "" : "md:col-span-2"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent proposals</CardTitle>
                <CardDescription>Latest submissions from your group</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProposals ? (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : sortedProposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No proposals yet.{" "}
                    {hasGroup && canSubmitProposal && (
                      <Link href="/proposal/submit" className="text-primary hover:underline">
                        Submit one
                      </Link>
                    )}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedProposals.slice(0, 4).map((proposal) => {
                      const status = getProposalStatus(proposal);
                      return (
                        <Link
                          key={proposal._id}
                          href={`/proposal/viewfeedback/${proposal._id}`}
                          className="flex items-center justify-between gap-2 p-3 rounded-lg border hover:bg-muted/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{proposal.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(proposal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`shrink-0 text-[10px] ${statusBadgeClass(status)}`}>
                            {status}
                          </Badge>
                        </Link>
                      );
                    })}
                    <Link href="/proposal">
                      <Button variant="outline" size="sm" className="w-full mt-1 text-xs">
                        View all proposals
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
