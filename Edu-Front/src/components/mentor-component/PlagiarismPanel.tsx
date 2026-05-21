"use client";

import React, { useState } from "react";
import { useAnalyzeChapterPlagiarismMutation } from "@/features/docApi/docApi";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart2,
} from "lucide-react";

interface LatestVersion {
  versionNumber?: number;
  fileName?: string;
  status?: string;
  templateValidation?: {
    presentSections?: string[];
    missingSections?: string[];
    warnings?: string[];
  };
  aiAcademicReport?: {
    completenessScore?: number;
    writingQuality?: string;
    strengths?: string[];
    weakExplanations?: string[];
    missingCriteria?: string[];
  };
}

interface Props {
  title: string;
  chapterType: string;
  chapterNumber: number;
  latestVersion?: LatestVersion;
}

const riskColor = (risk: string) => {
  if (risk === "Low") return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  if (risk === "Medium") return "text-amber-600 bg-amber-500/10 border-amber-500/20";
  return "text-rose-600 bg-rose-500/10 border-rose-500/20";
};

const riskIcon = (risk: string) => {
  if (risk === "Low") return <ShieldCheck className="w-4 h-4" />;
  if (risk === "Medium") return <ShieldAlert className="w-4 h-4" />;
  return <ShieldX className="w-4 h-4" />;
};

const getExpectedSections = (chapterType: string): string => {
  const map: Record<string, string> = {
    "Introduction": "Background, Problem Statement, Objectives, Scope, Significance, Definition of Terms",
    "Existing System and Literature Review": "Literature Review, Current System Analysis, Identified Gaps, Related Works",
    "Proposed System": "System Overview, Functional Requirements, Non-Functional Requirements, Feasibility Study",
    "System Design": "Architecture Design, Database Design, UI/UX Design, Data Flow Diagrams, ERD",
    "Implementation": "Development Environment, Code Implementation, Module Descriptions, Screenshots",
    "System Testing": "Test Plan, Test Cases, Test Results, Bug Reports, UAT",
    "Conclusion and Recommendation": "Summary, Conclusions, Recommendations, Future Work, Limitations",
  };
  return map[chapterType] || "Introduction, Body, Analysis, Conclusion";
};

export default function PlagiarismPanel({ title, chapterType, chapterNumber, latestVersion }: Props) {
  const [analyze, { isLoading }] = useAnalyzeChapterPlagiarismMutation();
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (i: number) =>
    setExpandedSections((prev) => ({ ...prev, [i]: !prev[i] }));

  const handleRun = async () => {
    setError("");
    setReport(null);
    try {
      const tv = latestVersion?.templateValidation;
      const ai = latestVersion?.aiAcademicReport;

      const proposalData: Record<string, string> = {
        "Chapter Number": String(chapterNumber),
        "Chapter Type": chapterType,
        "Chapter Title": title,
        "Submission File": latestVersion?.fileName || "Not provided",
        "Version": latestVersion?.versionNumber ? `v${latestVersion.versionNumber}` : "1",
        "Review Status": latestVersion?.status || "Under_Review",
        "Detected Headings / Present Sections":
          tv?.presentSections?.length
            ? tv.presentSections.join(", ")
            : "No headings detected",
        "Missing Required Sections":
          tv?.missingSections?.length
            ? tv.missingSections.join(", ")
            : "None — all expected headings found",
        "Template Warnings":
          tv?.warnings?.filter((w) => !w.toLowerCase().includes("mock")).join("; ") ||
          "No structural warnings",
        "Completeness Score":
          ai?.completenessScore != null ? `${ai.completenessScore}/100` : "Not yet evaluated",
        "Writing Quality": ai?.writingQuality || "Not yet evaluated",
        "Academic Strengths":
          ai?.strengths?.length ? ai.strengths.join("; ") : "Not yet evaluated",
        "Weak Explanations Identified":
          ai?.weakExplanations?.length ? ai.weakExplanations.join("; ") : "None",
        "Missing Academic Criteria":
          ai?.missingCriteria?.length ? ai.missingCriteria.join("; ") : "None",
        "Chapter Purpose and Expected Academic Content":
          `Chapter ${chapterNumber} of a software engineering graduation project. ` +
          `This chapter covers "${chapterType}". ` +
          `Expected sections for this chapter type include: ${getExpectedSections(chapterType)}`,
      };

      const res = await analyze({ title, proposalData }).unwrap();
      if (res?.success && res?.data) {
        setReport(res.data);
      } else {
        setError("Analysis returned no data. Please try again.");
      }
    } catch (e: any) {
      setError(e?.data?.error || e?.message || "Failed to run analysis.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + trigger */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI Plagiarism &amp; Originality Scan
        </h4>
        <button
          onClick={handleRun}
          disabled={isLoading}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-1.5 px-3 rounded-lg text-[11px] transition-all duration-200 shadow-sm"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning...</>
          ) : (
            <><ShieldCheck className="w-3.5 h-3.5" /> Run Scan</>
          )}
        </button>
      </div>

      {error && (
        <div className="text-[11px] text-rose-500 font-semibold bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Score cards row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/10 border rounded-xl p-3 flex flex-col items-center gap-1">
              <BarChart2 className="w-4 h-4 text-primary mb-0.5" />
              <div className="text-lg font-extrabold text-foreground">{report.originalityScore}%</div>
              <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Originality</div>
            </div>
            <div className={`border rounded-xl p-3 flex flex-col items-center gap-1 ${riskColor(report.overallRisk)}`}>
              {riskIcon(report.overallRisk)}
              <div className="text-sm font-extrabold">{report.overallRisk}</div>
              <div className="text-[9px] uppercase font-bold tracking-wider opacity-70">Risk Level</div>
            </div>
            <div className="bg-muted/10 border rounded-xl p-3 flex flex-col items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary mb-0.5" />
              <div className="text-lg font-extrabold text-foreground">{report.confidence}%</div>
              <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Confidence</div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/10 border rounded-xl p-3 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground block mb-1">Summary</span>
            {report.summary}
          </div>

          {/* Section-by-section analysis */}
          {report.sectionAnalysis?.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Section Analysis</div>
              {report.sectionAnalysis.map((s: any, i: number) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${riskColor(s.risk)}`}>
                        {s.risk}
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">{s.section}</span>
                    </div>
                    {expandedSections[i]
                      ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  {expandedSections[i] && (
                    <div className="px-3 pb-3 pt-2 space-y-2 bg-background">
                      {s.issues?.length > 0 && (
                        <div>
                          <div className="text-[9px] font-bold text-rose-500 uppercase mb-1">Issues</div>
                          {s.issues.map((issue: string, j: number) => (
                            <div key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                              <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                      {s.feedback?.length > 0 && (
                        <div>
                          <div className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Feedback</div>
                          {s.feedback.map((fb: string, j: number) => (
                            <div key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                              {fb}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Major Concerns */}
          {report.majorConcerns?.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 space-y-1.5">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Major Concerns
              </div>
              {report.majorConcerns.map((c: string, i: number) => (
                <div key={i} className="text-[11px] text-rose-600 flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations?.length > 0 && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1.5">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommendations
              </div>
              {report.recommendations.map((r: string, i: number) => (
                <div key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
