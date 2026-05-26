"use client";

import React, { useState } from "react";
import { 
  useGetMySubmissionsQuery, 
  useSubmitChapterMutation 
} from "@/features/docApi/docApi";
import { useGetMyGroupQuery } from "@/features/groupApi/groupApi";
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  AlertTriangle, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  HelpCircle,
  Eye,
  AlertCircle,
  FileCheck2,
  ListTodo,
  Users
} from "lucide-react";

const CHAPTERS_METADATA = [
  { number: 1, title: "Introduction", type: "Introduction" },
  { number: 2, title: "Existing System and Literature Review", type: "Existing System and Literature Review" },
  { number: 3, title: "Proposed System", type: "Proposed System" },
  { number: 4, title: "System Design", type: "System Design" },
  { number: 5, title: "Implementation", type: "Implementation" },
  { number: 6, title: "System Testing", type: "System Testing" },
  { number: 7, title: "Conclusion and Recommendation", type: "Conclusion and Recommendation" }
];

export default function StudentDocumentationPage() {
  const { data: submissionsRes, isLoading, refetch } = useGetMySubmissionsQuery();
  const { data: myGroupRes } = useGetMyGroupQuery();
  const [submitChapter, { isLoading: isUploading }] = useSubmitChapterMutation();

  const [selectedChapter, setSelectedChapter] = useState<number | null>(1);
  const groupData = myGroupRes?.data;
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const submissions = submissionsRes?.data || [];

  // Create submission map for fast checking
  const subMap = React.useMemo(() => {
    const map: Record<number, any> = {};
    submissions.forEach((s: any) => {
      map[s.chapterNumber] = s;
    });
    return map;
  }, [submissions]);

  // Check sequence locking — each chapter requires the previous chapter to be Approved
  const isChapterUnlocked = (chapterNum: number) => {
    if (chapterNum === 1) return true;
    const prereqSub = subMap[chapterNum - 1];
    return prereqSub?.currentStatus === "Approved";
  };

  const getUnlockMessage = (chapterNum: number) => {
    if (chapterNum <= 1) return "";
    const prereq = chapterNum - 1;
    const prereqSub = subMap[prereq];
    if (!prereqSub) {
      return `Submit and get Chapter ${prereq} approved before you can upload Chapter ${chapterNum}.`;
    }
    if (prereqSub.currentStatus !== "Approved") {
      return `Chapter ${prereq} must be approved (currently: ${prereqSub.currentStatus.replace(/_/g, " ")}) before you can submit Chapter ${chapterNum}.`;
    }
    return "";
  };

  // Get status color tokens
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case "Under_Review":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5 animate-pulse" /> Under Review</span>;
      case "Revisions_Requested":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit"><AlertTriangle className="w-3.5 h-3.5" /> Revisions Requested</span>;
      case "Rejected":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit"><AlertCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1 w-fit">Pending Submission</span>;
    }
  };

  // Calculate percentages
  const approvedCount = submissions.filter((s: any) => s.currentStatus === "Approved").length;
  const progressPct = Math.round((approvedCount / 7) * 100);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadError("");
      setUploadSuccess("");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent, chapterNum: number) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (!customTitle.trim()) {
      setUploadError("Please provide a descriptive title for this submission.");
      return;
    }

    setUploadError("");
    setUploadSuccess("");

    const chMeta = CHAPTERS_METADATA.find(c => c.number === chapterNum);
    
    const formData = new FormData();
    formData.append("chapterNumber", chapterNum.toString());
    formData.append("chapterType", chMeta?.type || "");
    formData.append("title", customTitle);
    formData.append("file", uploadFile);

    try {
      const res = await submitChapter(formData).unwrap();
      if (res.success) {
        setUploadSuccess(`Chapter ${chapterNum} uploaded successfully! Background analysis triggered.`);
        setUploadFile(null);
        setCustomTitle("");
        refetch();
      } else {
        setUploadError(res.message || "Failed to submit chapter.");
      }
    } catch (err: any) {
      setUploadError(err.data?.message || err.message || "An error occurred during submission.");
    }
  };

  const activeSub = selectedChapter ? subMap[selectedChapter] : null;
  const activeMeta = selectedChapter ? CHAPTERS_METADATA.find(c => c.number === selectedChapter) : null;
  const isUnlocked = selectedChapter ? isChapterUnlocked(selectedChapter) : false;
  const latestVersion = activeSub?.versions?.[activeSub.versions.length - 1];

  return (
    <div className="flex-grow space-y-6">
      {/* Theme-Aware Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-semibold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4" /> Academic Workflow Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Documentation Submission Tracker
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Upload, validate, and track your final software project thesis through standard university templates.
          </p>
          {groupData ? (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Group Mode: Submitting on behalf of <strong className="font-extrabold">{groupData.name}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Individual Mode: No group registered</span>
            </div>
          )}
        </div>

        {/* Circular Radial Completion Card */}
        <div className="flex items-center gap-4 bg-card border p-4 rounded-xl w-fit shadow-sm">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" className="stroke-muted fill-none" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                className="stroke-primary fill-none transition-all duration-1000" 
                strokeWidth="4" 
                strokeDasharray={176} 
                strokeDashoffset={176 - (176 * progressPct) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-primary">{progressPct}%</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Approved Checklist</div>
            <div className="text-lg font-bold text-foreground">{approvedCount} of 7 Chapters</div>
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Vertical Timeline */}
        <div className="lg:col-span-5 bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Submission Roadmap
          </h2>
          
          <div className="space-y-4">
            {CHAPTERS_METADATA.map((ch) => {
              const sub = subMap[ch.number];
              const unlocked = isChapterUnlocked(ch.number);
              const isSelected = selectedChapter === ch.number;
              
              return (
                <button
                  key={ch.number}
                  onClick={() => unlocked && setSelectedChapter(ch.number)}
                  disabled={!unlocked}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 border flex items-center gap-4 ${
                    isSelected 
                      ? "bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(74,222,128,0.08)]" 
                      : "bg-muted/10 border-border hover:bg-muted/30 hover:border-border/80"
                  } ${!unlocked ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {/* Step status indicator */}
                  <div className="flex-shrink-0">
                    {sub?.currentStatus === "Approved" ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : sub?.currentStatus === "Under_Review" ? (
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                    ) : !unlocked ? (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center border">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-sm">
                        {ch.number}
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="text-xs text-muted-foreground font-semibold mb-0.5">Chapter {ch.number}</div>
                    <div className="font-bold text-sm text-foreground line-clamp-1">{ch.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Chapter Panel Actions / Submissions Viewer */}
        <div className="lg:col-span-7 space-y-6">
          {activeMeta && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Chapter {activeMeta.number}: {activeMeta.title}
                  </h2>
                  <p className="text-xs text-primary font-medium uppercase tracking-wider mt-1">{activeMeta.type}</p>
                </div>
                {activeSub ? getStatusBadge(activeSub.currentStatus) : getStatusBadge("")}
              </div>

              {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 border rounded-xl py-12">
                  <Lock className="w-12 h-12 text-muted-foreground mb-4 animate-bounce" />
                  <h3 className="font-bold text-foreground text-lg">Prerequisites Locked</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 text-sm leading-relaxed">
                    {selectedChapter
                      ? getUnlockMessage(selectedChapter)
                      : "You must obtain supervisor approval on the previous chapter before you can proceed."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Submission version info or Upload Box */}
                  {activeSub ? (
                    <div className="space-y-6">
                      {/* Version status banner */}
                      <div className="bg-muted/40 border p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <div className="text-sm font-bold text-foreground line-clamp-1">{activeSub.title}</div>
                            <div className="text-xs text-muted-foreground">Version {activeSub.versions?.length} • Submitted by {latestVersion?.submittedBy?.fullName || "Group Member"}</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          v{activeSub.versions?.length}
                        </span>
                      </div>

                      {/* Analysis Tabs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Section Checklist Audit */}
                        <div className="bg-muted/10 border p-5 rounded-xl">
                          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-emerald-500" /> Template Validation
                          </h3>
                          {latestVersion?.templateValidation ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs border-b pb-2">
                                <span className="text-muted-foreground font-semibold">Passed Checklist:</span>
                                <span className={latestVersion.templateValidation.passed ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                                  {latestVersion.templateValidation.passed ? "YES" : "NO"}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <div className="font-semibold text-foreground mb-1">Present Sections:</div>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {latestVersion.templateValidation.presentSections?.map((s: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-[10px] uppercase font-bold">{s}</span>
                                  ))}
                                  {latestVersion.templateValidation.presentSections?.length === 0 && <span className="text-slate-500">None detected</span>}
                                </div>
                              </div>
                              {latestVersion.templateValidation.missingSections?.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="font-semibold text-rose-500 mb-1">Missing Sections:</div>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {latestVersion.templateValidation.missingSections?.map((s: string, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/5 text-rose-500 border border-rose-500/10 text-[10px] uppercase font-bold">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">Analysis processing...</div>
                          )}
                        </div>

                        {/* Plagiarism Similarity Check */}
                        <div className="bg-muted/10 border p-5 rounded-xl">
                          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" /> Plagiarism Scan
                          </h3>
                          {latestVersion?.plagiarismReport ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-semibold">Similarity Score:</span>
                                <span className={`text-sm font-extrabold ${latestVersion.plagiarismReport.similarityScore > 25 ? "text-rose-500" : "text-emerald-500"}`}>
                                  {latestVersion.plagiarismReport.similarityScore}%
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${latestVersion.plagiarismReport.similarityScore > 25 ? "bg-rose-500" : "bg-emerald-500"}`} 
                                  style={{ width: `${latestVersion.plagiarismReport.similarityScore}%` }} 
                                />
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {latestVersion.plagiarismReport.similarityScore > 25 
                                  ? "🚨 Warning: High overlap detected! Review bibliography links and definitions to avoid panel penalties."
                                  : "✅ Safe: Local shingle overlap score complies fully with academic panel parameters."}
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">Processing overlap matchers...</div>
                          )}
                        </div>
                      </div>

                      {/* AI-Powered Review Feedback */}
                      {latestVersion?.aiAcademicReport ? (
                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4.5 h-4.5 text-primary" />
                            Gemini AI Academic Insights
                          </h3>
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-xl">
                              <span className="text-muted-foreground font-semibold">Completeness Evaluation:</span>
                              <span className="text-primary font-extrabold">{latestVersion.aiAcademicReport.completenessScore}/100</span>
                            </div>
                            <div>
                              <span className="font-semibold text-muted-foreground">Writing Style Quality: </span>
                              <span className="font-extrabold text-foreground">{latestVersion.aiAcademicReport.writingQuality}</span>
                            </div>
                            {latestVersion.aiAcademicReport.recommendations?.length > 0 && (
                              <div>
                                <div className="font-semibold text-foreground mb-1.5">Actionable Correction List:</div>
                                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground leading-relaxed">
                                  {latestVersion.aiAcademicReport.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/10 border p-5 rounded-xl text-xs text-muted-foreground italic flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin text-primary" /> AI review analysis in execution queue...
                        </div>
                      )}

                      {/* Allow Re-submission if Revisions requested or rejected */}
                      {(activeSub.currentStatus === "Revisions_Requested" || activeSub.currentStatus === "Rejected") && (
                        <div className="border-t pt-6">
                          <h3 className="text-sm font-bold text-foreground mb-1">Submit Revised Chapter Version</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            {groupData ? `This revision will update the shared Chapter ${activeMeta.number} document for ${groupData.name}.` : `This revision will update your Chapter ${activeMeta.number} document.`}
                          </p>
                          <form onSubmit={(e) => handleUploadSubmit(e, activeMeta.number)} className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-2">Descriptive Subtitle</label>
                              <input 
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="e.g., Chapter 1 draft revisions based on advisor reviews"
                                className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                              />
                            </div>
                            <div className="border-2 border-dashed border-border hover:border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative">
                              <input 
                                type="file" 
                                accept=".docx,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <UploadCloud className="w-8 h-8 text-primary mb-2" />
                              <span className="text-xs text-muted-foreground font-semibold text-center">
                                {uploadFile ? uploadFile.name : "Select revised DOCX or PDF file (max 15MB)"}
                              </span>
                            </div>
                            {uploadError && <p className="text-xs text-rose-500 font-semibold">{uploadError}</p>}
                            {uploadSuccess && <p className="text-xs text-emerald-500 font-semibold">{uploadSuccess}</p>}
                            <button
                              type="submit"
                              disabled={isUploading}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-2"
                            >
                              {isUploading ? "Uploading revised file..." : "Submit Revision"}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    // New upload form
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1">Upload Initial Draft Submission</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        {groupData ? `Your submission is synced instantly across all group members: ${groupData.members.map(m => m.fullName).join(", ")}.` : "Submit your initial draft document."}
                      </p>
                      <form onSubmit={(e) => handleUploadSubmit(e, activeMeta.number)} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-2">Descriptive Subtitle</label>
                          <input 
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="e.g., Initial submission draft for Chapter 1 review"
                            className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="border-2 border-dashed border-border hover:border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative">
                          <input 
                            type="file" 
                            accept=".docx,.pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <UploadCloud className="w-8 h-8 text-primary mb-2" />
                          <span className="text-xs text-muted-foreground font-semibold text-center">
                            {uploadFile ? uploadFile.name : "Select DOCX or PDF file (max 15MB)"}
                          </span>
                        </div>
                        {uploadError && <p className="text-xs text-rose-500 font-semibold">{uploadError}</p>}
                        {uploadSuccess && <p className="text-xs text-emerald-500 font-semibold">{uploadSuccess}</p>}
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-2"
                        >
                          {isUploading ? "Uploading file..." : `Submit to Panel on behalf of ${groupData?.name || "Group"}`}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
