"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(src)/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Presentation,
  Code,
  Download,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
// Fallback toast hook: used when '@/hooks/use-toast' is not available in this environment.
// This keeps the component working during development; replace with your app's toast hook.
const useToast = () => {
  const toast = (opts: { title?: string; description?: string; variant?: string }) => {
    // Non-invasive fallback: log to console and show a simple alert for destructive variants.
    // Adjust to integrate with your real toast system (e.g., react-hot-toast, shadcn/ui, etc.).
    console.group("Toast");
    if (opts.title) console.log("Title:", opts.title);
    if (opts.description) console.log("Description:", opts.description);
    if (opts.variant) console.log("Variant:", opts.variant);
    console.groupEnd();
    if (opts.variant === "destructive") {
      // show a small window alert to make destructive feedback visible in dev
      // (avoid in production)
      try {
        // eslint-disable-next-line no-alert
        alert((opts.title ? opts.title + "\n" : "") + (opts.description ?? ""));
      } catch {}
    }
  };
  return { toast };
};

// --- Types ---
interface Documentation {
  id: string;
  projectId: string;
  projectTitle: string;
  teamName: string;
  teamLeader: string;
  documentType: "final_report" | "proposal_report" | "presentation" | "code_link";
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  reviewComment?: string;
  submittedBy: string;
  submittedAt: string;
  reviewedAt?: string;
}

// --- Mock Data ---
const mockDocumentation: Documentation[] = [
  {
    id: "1",
    projectId: "p1",
    projectTitle: "AI-Powered Student Attendance System",
    teamName: "Team Alpha",
    teamLeader: "Abebe Kebede",
    documentType: "final_report",
    fileName: "Final_Report_Team_Alpha.pdf",
    fileUrl: "#",
    status: "pending",
    submittedBy: "Abebe Kebede",
    submittedAt: "2024-01-15",
  },
  {
    id: "2",
    projectId: "p1",
    projectTitle: "AI-Powered Student Attendance System",
    teamName: "Team Alpha",
    teamLeader: "Abebe Kebede",
    documentType: "presentation",
    fileName: "Final_Presentation.pptx",
    fileUrl: "#",
    status: "pending",
    submittedBy: "Tigist Haile",
    submittedAt: "2024-01-15",
  },
  {
    id: "3",
    projectId: "p2",
    projectTitle: "Smart Campus Navigation App",
    teamName: "Team Beta",
    teamLeader: "Dawit Mengistu",
    documentType: "code_link",
    fileName: "GitHub Repository",
    fileUrl: "https://github.com/team-beta/campus-nav",
    status: "pending",
    submittedBy: "Dawit Mengistu",
    submittedAt: "2024-01-14",
  },
  {
    id: "4",
    projectId: "p3",
    projectTitle: "Library Management System",
    teamName: "Team Gamma",
    teamLeader: "Meron Tadesse",
    documentType: "final_report",
    fileName: "LMS_Final_Report.pdf",
    fileUrl: "#",
    status: "approved",
    submittedBy: "Meron Tadesse",
    submittedAt: "2024-01-10",
    reviewComment: "Excellent work. Well documented and comprehensive.",
    reviewedAt: "2024-01-12",
  },
  {
    id: "5",
    projectId: "p4",
    projectTitle: "E-Learning Platform",
    teamName: "Team Delta",
    teamLeader: "Yonas Bekele",
    documentType: "presentation",
    fileName: "E-Learning_Presentation.pptx",
    fileUrl: "#",
    status: "rejected",
    submittedBy: "Yonas Bekele",
    submittedAt: "2024-01-08",
    reviewComment: "Missing key sections on implementation methodology. Please resubmit with detailed architecture diagrams.",
    reviewedAt: "2024-01-09",
  },
];

// --- Helper Functions ---
const getDocTypeIcon = (type: Documentation["documentType"]) => {
  switch (type) {
    case "final_report":
    case "proposal_report":
      return FileText;
    case "presentation":
      return Presentation;
    case "code_link":
      return Code;
    default:
      return FileText;
  }
};

const getDocTypeLabel = (type: Documentation["documentType"]) => {
  switch (type) {
    case "final_report":
      return "Final Report";
    case "proposal_report":
      return "Proposal Report";
    case "presentation":
      return "Presentation";
    case "code_link":
      return "Code Repository";
    default:
      return type;
  }
};

const getStatusBadge = (status: Documentation["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return null;
  }
};

export default function DocumentationReviewPage() {
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();

  const pendingDocs = mockDocumentation.filter(d => d.status === "pending");
  const reviewedDocs = mockDocumentation.filter(d => d.status !== "pending");

  const handleReviewClick = (doc: Documentation, action: "approve" | "reject") => {
    setSelectedDoc(doc);
    setReviewAction(action);
    setReviewComment("");
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedDoc || !reviewAction) return;

    if (reviewAction === "reject" && !reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: reviewAction === "approve" ? "Documentation Approved" : "Documentation Rejected",
      description: `${getDocTypeLabel(selectedDoc.documentType)} for ${selectedDoc.projectTitle} has been ${reviewAction}d.`,
      variant: reviewAction === "approve" ? "default" : "destructive",
    });

    setIsReviewDialogOpen(false);
    setSelectedDoc(null);
    setReviewComment("");
    setReviewAction(null);
  };

  const DocumentCard = ({ doc }: { doc: Documentation }) => {
    const Icon = getDocTypeIcon(doc.documentType);
    
    return (
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold leading-tight">{doc.projectTitle}</CardTitle>
                <CardDescription className="text-xs">{doc.teamName} • {getDocTypeLabel(doc.documentType)}</CardDescription>
              </div>
            </div>
            <div className="shrink-0">
               {getStatusBadge(doc.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* File Info Box */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{doc.fileName}</span>
              </div>
              {doc.documentType === "code_link" ? (
                <Button variant="outline" size="sm" asChild className="h-7 text-xs shrink-0">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Open
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Meta Data */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {doc.submittedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {doc.submittedAt}
            </span>
          </div>

          {/* Spacer to push actions to bottom */}
          <div className="flex-1"></div>

          {doc.reviewComment && (
            <div className="rounded-lg border p-3 bg-muted/50 text-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Review Comment:</p>
              <p>{doc.reviewComment}</p>
            </div>
          )}

          {doc.status === "pending" && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button 
                variant="outline"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" 
                onClick={() => handleReviewClick(doc, "approve")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleReviewClick(doc, "reject")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Documentation Review</h1>
          <p className="text-muted-foreground">
            Review and approve final project documentation submitted by students
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-amber-50/50 border-amber-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Review
              </CardDescription>
              <CardTitle className="text-3xl text-amber-900">{pendingDocs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-emerald-50/50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approved
              </CardDescription>
              <CardTitle className="text-3xl text-emerald-900">
                {mockDocumentation.filter(d => d.status === "approved").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-red-50/50 border-red-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Rejected
              </CardDescription>
              <CardTitle className="text-3xl text-red-900">
                {mockDocumentation.filter(d => d.status === "rejected").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="pending">
              Pending ({pendingDocs.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reviewedDocs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingDocs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    There are no documentation submissions pending your review at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pendingDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {reviewedDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {reviewAction === "approve" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {reviewAction === "approve" ? "Approve" : "Reject"} Documentation
              </DialogTitle>
              <DialogDescription>
                {selectedDoc && (
                  <span className="block mt-1">
                    {getDocTypeLabel(selectedDoc.documentType)} for <span className="font-semibold text-foreground">{selectedDoc.projectTitle}</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {reviewAction === "reject" ? "Reason for Rejection (Required)" : "Comments (Optional)"}
                </label>
                <Textarea
                  placeholder={
                    reviewAction === "reject"
                      ? "Please explain what changes are needed..."
                      : "Add any feedback for the students..."
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className={reviewAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}
                onClick={handleSubmitReview}
              >
                Confirm {reviewAction === "approve" ? "Approval" : "Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}