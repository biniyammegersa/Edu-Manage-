"use client";

import React, { useState } from "react";
import PlagiarismPanel from "@/components/mentor-component/PlagiarismPanel";
import { 
  useGetPendingReviewsQuery, 
  useSubmitReviewMutation,
  useGetSubmissionDetailsQuery
} from "@/features/docApi/docApi";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  Plus, 
  Trash2,
  AlertCircle,
  Users
} from "lucide-react";

interface SectionComment {
  sectionName: string;
  commentText: string;
  severity: "Minor" | "Major" | "Critical";
}

export default function AdvisorReviewsPage() {
  const { data: pendingRes, isLoading: isPendingLoading, refetch } = useGetPendingReviewsQuery();
  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();

  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  
  // Fetch details of active submission
  const { data: detailsRes, isLoading: isDetailsLoading } = useGetSubmissionDetailsQuery(
    activeSubmissionId || "",
    { skip: !activeSubmissionId }
  );

  // Verdict state
  const [verdict, setVerdict] = useState<"Approved" | "Revisions_Requested" | "Rejected">("Approved");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [sectionComments, setSectionComments] = useState<SectionComment[]>([]);
  const [newSecName, setNewSecName] = useState("");
  const [newSecComment, setNewSecComment] = useState("");
  const [newSecSeverity, setNewSecSeverity] = useState<"Minor" | "Major" | "Critical">("Minor");
  
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const pendingList = pendingRes?.data || [];
  const activeSub = detailsRes?.data;
  const latestVersion = activeSub?.versions?.[activeSub.versions.length - 1];

  const handleAddComment = () => {
    if (!newSecName.trim() || !newSecComment.trim()) return;
    setSectionComments([
      ...sectionComments,
      {
        sectionName: newSecName,
        commentText: newSecComment,
        severity: newSecSeverity
      }
    ]);
    setNewSecName("");
    setNewSecComment("");
    setNewSecSeverity("Minor");
  };

  const handleRemoveComment = (idx: number) => {
    setSectionComments(sectionComments.filter((_, i) => i !== idx));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionId || !latestVersion) return;
    if (!generalFeedback.trim()) {
      setSubmitError("Please write some general feedback first.");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");

    try {
      const res = await submitReview({
        submissionId: activeSubmissionId,
        verdict,
        generalFeedback,
        versionNumber: latestVersion.versionNumber,
        sectionComments
      }).unwrap();

      if (res.success) {
        setSubmitSuccess("Review verdict and comments posted successfully!");
        setGeneralFeedback("");
        setSectionComments([]);
        setActiveSubmissionId(null);
        refetch();
      } else {
        setSubmitError(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      setSubmitError(err.data?.message || err.message || "An error occurred during submission.");
    }
  };

  return (
    <div className="flex-grow space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-semibold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4" /> Advisor Review Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Chapter Submission Review Board
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Perform in-depth, split-screen reviews of software project documentation drafts with structured academic checklists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUMN 1: Pending Queue (left sidebar) */}
        <div className="xl:col-span-4 bg-card border rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pending Submission Queue
          </h2>

          {isPendingLoading ? (
            <div className="text-sm text-muted-foreground italic py-6">Loading pending queue...</div>
          ) : pendingList.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-8 text-center bg-muted/10 border border-dashed rounded-xl">
              No pending chapters waiting for your review.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((sub: any) => {
                const isSelected = activeSubmissionId === sub._id;
                return (
                  <button
                    key={sub._id}
                    onClick={() => {
                      setActiveSubmissionId(sub._id);
                      setSubmitError("");
                      setSubmitSuccess("");
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border flex items-start justify-between gap-2 ${
                      isSelected 
                        ? "bg-primary/5 border-primary/40 shadow-sm" 
                        : "bg-muted/10 border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Chapter {sub.chapterNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" /> {sub.group?.name}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{sub.title}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{sub.project?.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 2 & 3: Split-Screen View (active item details) */}
        <div className="xl:col-span-8">
          {isDetailsLoading ? (
            <div className="bg-card border rounded-2xl p-10 text-center text-muted-foreground italic">
              Loading chapter details...
            </div>
          ) : !activeSub ? (
            <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground italic flex flex-col items-center justify-center min-h-[300px] shadow-sm">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-bold text-foreground text-base">No Active Submission Selected</h3>
              <p className="text-muted-foreground text-xs mt-2 max-w-sm">
                Select a pending student submission from the queue on the left to start your academic validation and grading.
              </p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT HALF: Document Reader / Overview */}
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-[650px] overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b pb-3">
                  <FileText className="w-4.5 h-4.5 text-primary" /> Document Reader
                </h3>

                {/* Document content — scrolls independently */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">
                  <div className="bg-muted/10 border p-4 rounded-xl space-y-1">
                    <div className="text-[10px] text-primary font-semibold uppercase">Chapter Title</div>
                    <div className="text-sm font-bold text-foreground leading-snug">{activeSub.title}</div>
                    <div className="text-xs text-muted-foreground">File: {latestVersion?.fileName}</div>
                  </div>

                  {/* Present/Missing headings analysis from Mammoth parser */}
                  {latestVersion?.templateValidation && (
                    <div className="space-y-4 bg-muted/5 border p-5 rounded-xl">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Structure Audit Checklist
                      </h4>
                      <div className="space-y-2.5">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Present headings matched:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {latestVersion.templateValidation.presentSections?.map((s: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-[9px] font-bold uppercase">{s}</span>
                            ))}
                            {latestVersion.templateValidation.presentSections?.length === 0 && <span className="text-muted-foreground">None</span>}
                          </div>
                        </div>
                        {latestVersion.templateValidation.missingSections?.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-rose-500">Missing university template headings:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {latestVersion.templateValidation.missingSections?.map((s: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/5 text-rose-500 border border-rose-500/10 text-[9px] font-bold uppercase">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Raw Extract Text Viewer */}
                  <div className="bg-muted/10 border rounded-xl p-4">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase border-b pb-2 mb-3">Extracted Content Preview</div>
                    <div className="text-xs text-foreground/90 font-mono leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {latestVersion?.templateValidation?.warnings?.[0]?.includes("mock text") 
                        ? "CHAPTER ONE: INTRODUCTION\nBackground: Senior year thesis management remains largely unautomated...\nProblem Statement: Managing proposal revisions causes coordination overhead...\nAim and Objectives: To develop a production-ready submission engine...\nMethodology: Using standard Agile development cycles..."
                        : latestVersion?.fileUrl ? `[Content Extracted Successfully]\nThis is a mock DOCX preview containing full section checks for Chapter ${activeSub.chapterNumber}.` : "No text content preview available."}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT HALF: Grading & Feedback Panel */}
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-[650px] overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b pb-3">
                  <Sparkles className="w-4.5 h-4.5 text-primary" /> Feedback Grading Board
                </h3>

                <form onSubmit={handleReviewSubmit} className="flex-grow overflow-y-auto space-y-6 pr-2">
                  
                  {/* Verdict Selectors */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">VERDICT STATUS</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerdict("Approved")}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
                          verdict === "Approved" 
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600" 
                            : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerdict("Revisions_Requested")}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
                          verdict === "Revisions_Requested" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-600" 
                            : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" /> Revise
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerdict("Rejected")}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
                          verdict === "Rejected" 
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-600" 
                            : "bg-muted/10 border-border text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>

                  {/* General Review Comments */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">GENERAL REVIEW SUMMARY</label>
                    <textarea
                      required
                      value={generalFeedback}
                      onChange={(e) => setGeneralFeedback(e.target.value)}
                      placeholder="Write your general feedback, suggestions, or required revisions regarding this chapter submission..."
                      rows={4}
                      className="w-full bg-background border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  {/* Add Structured Section Critique */}
                  <div className="border-t pt-4">
                    <label className="block text-xs font-semibold text-muted-foreground mb-3">STRUCTURED SECTION CRITIQUE</label>
                    
                    {/* Add form */}
                    <div className="space-y-2 border p-3 rounded-xl bg-muted/10 mb-4">
                      <input 
                        type="text"
                        value={newSecName}
                        onChange={(e) => setNewSecName(e.target.value)}
                        placeholder="Section Name (e.g. Scope, Objectives)"
                        className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      />
                      <input 
                        type="text"
                        value={newSecComment}
                        onChange={(e) => setNewSecComment(e.target.value)}
                        placeholder="Critique Comment"
                        className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      />
                      <div className="flex gap-2 justify-between items-center mt-1">
                        <select
                          value={newSecSeverity}
                          onChange={(e: any) => setNewSecSeverity(e.target.value)}
                          className="bg-background border rounded-lg px-3 py-1 text-xs text-muted-foreground"
                        >
                          <option value="Minor">Minor</option>
                          <option value="Major">Major</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddComment}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add critique
                        </button>
                      </div>
                    </div>

                    {/* Comment list checklist */}
                    {sectionComments.length > 0 && (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {sectionComments.map((c, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-2 bg-muted/20 border p-2.5 rounded-xl text-[11px]">
                            <div className="space-y-0.5">
                              <div className="font-bold text-foreground">
                                {c.sectionName}{" "}
                                <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                  c.severity === "Critical" 
                                    ? "bg-rose-500/10 text-rose-600" 
                                    : c.severity === "Major" 
                                    ? "bg-amber-500/10 text-amber-600" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {c.severity}
                                </span>
                              </div>
                              <div className="text-muted-foreground">{c.commentText}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveComment(idx)}
                              className="text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Submit */}
                  <div className="border-t pt-4 mt-auto">
                    {submitError && <p className="text-xs text-rose-500 font-semibold mb-2">{submitError}</p>}
                    {submitSuccess && <p className="text-xs text-emerald-500 font-semibold mb-2">{submitSuccess}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Submitting Review..." : "Submit Review Verdict"}
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* ── AI Plagiarism & Originality Analyzer (standalone, independently scrollable) ── */}
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
              {/* Sticky header row */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-card sticky top-0 z-10">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Plagiarism &amp; Originality Analyzer
                </h3>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Chapter {activeSub.chapterNumber} · {activeSub.chapterType || "Chapter"}</span>
              </div>
              {/* Scrollable results body */}
              <div className="overflow-y-auto max-h-[420px] px-6 py-4">
                <PlagiarismPanel
                  title={activeSub.title}
                  chapterType={activeSub.chapterType || "Chapter"}
                  chapterNumber={activeSub.chapterNumber}
                  latestVersion={latestVersion}
                />
              </div>
            </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
