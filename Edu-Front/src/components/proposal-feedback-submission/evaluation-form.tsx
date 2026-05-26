"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateFeedbackMutation } from "@/features/proposalFeedbackApi/proposalFeedbackApi";
import { useScanPlagiarismMutation } from "@/features/proposalsApi/proposalsApi";
import {
  feedbackFormSchema,
  type FeedbackFormData,
  type FeedbackSection,
} from "@/lib/validations/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import StarRating from "./star-rating";
import { toast } from "sonner";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { SubmissionResponse } from "@/type/proposal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Play, 
  FileText, 
  Check, 
  CheckCircle2
} from "lucide-react";

const DEFAULT_SECTIONS = [
  {
    title: "Research Methodology",
    rating: 0,
    strengths: "",
    areasForImprovement: "",
    comments: "",
  },
  {
    title: "Literature Review",
    rating: 0,
    strengths: "",
    areasForImprovement: "",
    comments: "",
  },
  {
    title: "Technical Implementation",
    rating: 0,
    strengths: "",
    areasForImprovement: "",
    comments: "",
  },
  {
    title: "Innovation & Impact",
    rating: 0,
    strengths: "",
    areasForImprovement: "",
    comments: "",
  },
];

interface EvaluationFormProps {
  proposalId: string;
}

const EvaluationForm = ({ proposalId }: EvaluationFormProps) => {
  const [status, setStatus] = useState<string>("");
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();
  const [scanPlagiarism, { isLoading: isScanning }] = useScanPlagiarismMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  const { data } = useGetProposalsQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  const proposals = data as SubmissionResponse;
  const proposal = proposals?.data?.find(
    (proposal) => proposal._id === proposalId
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      proposalId,
      projectTitle: "AI in Healthcare",
      sections: DEFAULT_SECTIONS,
      attachments: [],
    },
  });

  const sections = watch("sections");

  const handleRatingChange = (index: number, rating: number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], rating };
    setValue("sections", newSections);
  };

  const handleSectionChange = (
    index: number,
    field: keyof FeedbackSection,
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setValue("sections", newSections);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    const files =
      (event as React.ChangeEvent<HTMLInputElement>).target?.files ||
      (event as React.DragEvent<HTMLDivElement>).dataTransfer?.files;

    if (files) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      const newFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error("Invalid file type", {
            description: `File "${file.name}" has an unsupported type.`,
          });
          return false;
        }
        if (file.size > maxSize) {
          toast.error("File too large", {
            description: `File "${file.name}" exceeds the maximum size of 10MB.`,
          });
          return false;
        }
        return true;
      });

      setAttachedFiles((prevFiles) => [...prevFiles, ...newFiles]);

      const mockAttachments = newFiles.map((file) => ({
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        downloadLink: `https://storage.example.com/feedback/${file.name}`,
      }));

      setValue("attachments", [
        ...(watch("attachments") || []),
        ...mockAttachments,
      ]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event);
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
    setValue(
      "attachments",
      (watch("attachments") || []).filter(
        (att: { fileName: string }) => att.fileName !== fileName
      )
    );
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      await createFeedback({
        ...data,
        status,
        attachments: data.attachments || [],
      }).unwrap();
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit feedback", {
        description: "Please try again.",
      });
    }
  };

  const handleScanClick = async () => {
    try {
      await scanPlagiarism(proposalId).unwrap();
      toast.success("AI Plagiarism and Originality Scan completed!");
    } catch (err: any) {
      toast.error("Failed to run AI scan", {
        description: err?.data?.message || err?.message || "Please try again later."
      });
    }
  };

  const report = proposal?.plagiarismReport;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 px-4 lg:items-start">
      {/* LEFT COLUMN: Evaluation Feedback Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <CardTitle className="text-lg font-bold">{proposal?.title || "Project Proposal"}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1">
                  <span>Proposal ID: <strong className="text-foreground">{watch("proposalId")}</strong></span>
                  <span>•</span>
                  <span>
                    {proposal?.createdAt
                      ? new Date(proposal.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-[200px]">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Needs Revision">Needs Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted-foreground">
              <span>Submitter: <strong className="text-foreground">{proposal?.student?.fullName}</strong></span>
              <span>Department: <strong className="text-foreground">{proposal?.student?.department}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-bold">Evaluation Sections</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {sections.map((section: FeedbackSection, index: number) => (
              <div key={section.title} className="mb-8 last:mb-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{section.title}</h3>
                  <StarRating
                    rating={section.rating}
                    onRatingChange={(rating) => handleRatingChange(index, rating)}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Strengths</Label>
                    <Textarea
                      value={section.strengths}
                      onChange={(e) =>
                        handleSectionChange(index, "strengths", e.target.value)
                      }
                      className="resize-none mt-1.5"
                    />
                    {errors.sections?.[index]?.strengths && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.sections[index]?.strengths?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Areas for Improvement</Label>
                    <Textarea
                      value={section.areasForImprovement}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "areasForImprovement",
                          e.target.value
                        )
                      }
                      className="resize-none mt-1.5"
                    />
                    {errors.sections?.[index]?.areasForImprovement && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.sections[index]?.areasForImprovement?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comments</Label>
                    <Textarea
                      value={section.comments}
                      onChange={(e) =>
                        handleSectionChange(index, "comments", e.target.value)
                      }
                      className="resize-none mt-1.5"
                    />
                    {errors.sections?.[index]?.comments && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.sections[index]?.comments?.message}
                      </p>
                    )}
                  </div>
                </div>
                {index < sections.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Attach Files */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-bold">Attach Feedback Documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/10"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.doc,.docx"
              />
              {attachedFiles.length === 0 ? (
                <>
                  <p className="text-primary mb-1 font-semibold text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </>
              ) : (
                <div className="mt-2 text-left w-full">
                  <p className="text-sm font-medium mb-3">Attached Files:</p>
                  <ul className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="text-sm flex justify-between items-center bg-background border p-2.5 rounded-lg shadow-xs"
                      >
                        <span className="truncate max-w-[250px] font-medium text-foreground">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(file.name);
                          }}
                          className="ml-2 text-rose-500 hover:text-rose-700 text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm font-bold text-muted-foreground">
              Overall Score:{" "}
              <span className="text-foreground">
                {(
                  sections.reduce(
                    (acc: number, section: FeedbackSection) => acc + section.rating,
                    0
                  ) / sections.length
                ).toFixed(1)}{" "}
                / 5
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs font-semibold"
                onClick={() => {
                  toast.success("Draft saved", {
                    description: "Your feedback has been saved as a draft.",
                  });
                }}
              >
                Save as Draft
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground">
                {isLoading ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* RIGHT COLUMN: whole originality panel scrolls here, not the page */}
      <div className="lg:col-span-5 animate-fade-in lg:sticky lg:top-6 lg:self-start w-full max-h-[calc(100vh-11rem)] overflow-y-auto overscroll-contain rounded-2xl">
        <Card className="border border-border shadow-md bg-card/70 backdrop-blur-md relative rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-24 h-24 text-primary animate-pulse" />
          </div>
          <CardHeader className="border-b pb-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                <CardTitle className="text-base font-extrabold tracking-tight">AI Originality Analyzer</CardTitle>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20 uppercase tracking-wide">
                Gemini Scan
              </span>
            </div>
          </CardHeader>

          {isScanning ? (
            <CardContent className="py-20 text-center flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-foreground animate-pulse">AI Originality Check in Progress...</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Extracting proposal text, performing section originality analysis, and computing risk profiles. This takes a few seconds...
                </p>
              </div>
              <div className="w-full max-w-[220px] h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-600 rounded-full animate-pulse" style={{ width: "100%" }} />
              </div>
            </CardContent>
          ) : report ? (
            <>
              {/* Originality Score and Risk Pill */}
              <div className="p-5 bg-gradient-to-br from-purple-500/[0.01] to-emerald-500/[0.01] border-b">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-1.5 flex-grow">
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Originality Rating</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-emerald-600 tracking-tighter">
                        {report.originalityScore}%
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">unique content</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                          report.originalityScore > 75 
                            ? "from-emerald-500 to-teal-500" 
                            : report.originalityScore > 50 
                            ? "from-amber-500 to-orange-500" 
                            : "from-rose-500 to-red-500"
                        }`}
                        style={{ width: `${report.originalityScore}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 flex flex-col items-center p-3 bg-background border rounded-2xl shadow-xs min-w-[110px]">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Overall Risk</span>
                    <span className={`text-xs font-black mt-1 px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      report.overallRisk === "Low" 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                        : report.overallRisk === "Medium" 
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                    }`}>
                      {report.overallRisk === "Low" && <ShieldCheck className="w-3.5 h-3.5" />}
                      {report.overallRisk === "Medium" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {report.overallRisk === "High" && <ShieldAlert className="w-3.5 h-3.5" />}
                      {report.overallRisk}
                    </span>
                    <span className="text-[8px] text-muted-foreground font-semibold mt-1 uppercase tracking-wide">Conf: {report.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Plagiarism Report Content Body */}
              <div className="p-5 space-y-5 pr-2">
                {/* Summary */}
                <div className="space-y-1.5 bg-muted/20 border p-4 rounded-2xl shadow-xs">
                  <h4 className="text-[10px] font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-purple-600" /> Executive Summary
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {report.summary}
                  </p>
                </div>

                {/* Section Review */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Section-by-Section Review
                  </h4>
                  <div className="space-y-3">
                    {report.sectionAnalysis?.map((sec: any, idx: number) => (
                      <div key={idx} className="border rounded-2xl p-4 space-y-2 bg-background shadow-xs hover:shadow-sm transition-all border-border/80">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-foreground">{sec.section}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            sec.risk === "Low" 
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                              : sec.risk === "Medium" 
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}>
                            {sec.risk} Risk
                          </span>
                        </div>
                        
                        {sec.issues?.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider">Issues Identified</div>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                              {sec.issues.map((issue: string, iIndex: number) => (
                                <li key={iIndex} className="text-[11px] text-muted-foreground leading-normal pl-0.5">
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {sec.feedback?.length > 0 && (
                          <div className="space-y-1 border-t pt-2 mt-2">
                            <div className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">Advisor Recommendations</div>
                            <ul className="space-y-1 pl-0.5">
                              {sec.feedback.map((feed: string, fIndex: number) => (
                                <li key={fIndex} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-normal">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{feed}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overarching Concerns */}
                {report.majorConcerns?.length > 0 && (
                  <div className="space-y-2 bg-rose-500/[0.02] border border-rose-500/20 p-4 rounded-2xl shadow-xs">
                    <h4 className="text-[10px] font-black text-rose-600 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5" /> Overarching Concerns
                    </h4>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {report.majorConcerns.map((concern: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted-foreground leading-relaxed font-medium font-semibold">
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Overarching Recommendations */}
                {report.recommendations?.length > 0 && (
                  <div className="space-y-2 bg-emerald-500/[0.02] border border-emerald-500/20 p-4 rounded-2xl shadow-xs">
                    <h4 className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Advisor Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted-foreground pl-0.5 flex items-start gap-1.5 leading-relaxed font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recalculate Scan */}
              <CardFooter className="border-t pt-4 flex gap-3 bg-muted/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 hover:bg-muted text-xs font-bold rounded-xl transition-all border-border shadow-xs" 
                  onClick={handleScanClick}
                  disabled={isScanning}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  Re-scan Proposal
                </Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="py-24 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center shadow-inner animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-xs mx-auto">
                <h4 className="font-extrabold text-sm text-foreground">AI Originality Scan Ready</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No plagiarism or originality report is available for this proposal yet. You can trigger the scan on-demand.
                </p>
              </div>
              <Button 
                type="button"
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 animate-bounce"
                onClick={handleScanClick}
                disabled={isScanning}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run AI Plagiarism Analysis
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EvaluationForm;
