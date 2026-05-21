'use client';

import { Upload, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useGetUserQuery } from "@/features/profileApi/profileApi";
import { useSubmitProposalMutation } from "@/features/proposalSubmitApi/proposalSubmitApi";
import { useGetTeachersQuery } from "@/features/usersApi/usersApi";
import { useGetProposalsQuery } from "@/features/proposalsApi/proposalsApi";
import { useGetMyGroupQuery } from "@/features/groupApi/groupApi";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const proposalSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  document: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 10MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only PDF and DOC files are allowed"
    )
    .optional(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

const ProposalSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentUser, isLoading: isLoadingUser } = useGetUserQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const [submitProposal] = useSubmitProposalMutation();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useGetProposalsQuery();
  const { data: groupResponse, isLoading: isLoadingGroup } = useGetMyGroupQuery();
  const group = groupResponse?.data;

  const proposals = proposalsResponse?.data || [];
  const myProposals = proposals.filter((p) => p.student?._id === currentUser?.data?._id);

  const getProposalStatus = (p: any) => {
    const last = p.feedbackList?.length - 1;
    const resolved = p.feedbackList?.[last]?.status || p.status || "Pending";
    if (resolved.toLowerCase() === "approved") return "Approved";
    if (resolved.toLowerCase() === "rejected") return "Rejected";
    if (resolved.toLowerCase() === "pending") return "Pending";
    if (resolved.toLowerCase() === "needs revision" || resolved.toLowerCase() === "needs_revision") return "Needs Revision";
    return resolved;
  };

  const sortedProposals = [...myProposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latestProposal = sortedProposals[0];
  const latestStatus = latestProposal ? getProposalStatus(latestProposal) : null;
  const canSubmit = !latestProposal || latestStatus === "Rejected" || latestStatus === "Needs Revision";

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async (data: ProposalFormValues) => {
    if (!currentUser?.data?._id || !data.document) {
      toast.error("Missing required information", {
        description: "Please make sure you're logged in and have selected a document.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await submitProposal({
        studentId: currentUser.data._id,
        title: data.title,
        proposalFile: data.document,
      }).unwrap();
      
      toast.success("Proposal submitted successfully!", {
        description: "Your proposal has been sent for review.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit proposal", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("document", file);
    }
  };

  if (isLoadingUser || isLoadingProposals || isLoadingGroup) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!currentUser?.data?.group) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center space-y-4 my-10 transition-all duration-300">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Required</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Project proposals must be submitted on behalf of a <strong>project group</strong>. You are currently not registered in any group.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Please register or join a group first to proceed.
        </p>
        <div className="pt-2">
          <Link href="/group">
            <Button className="w-full bg-[#1a9e7a] hover:bg-[#158a6a] text-white">
              Go to Group Panel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (groupResponse && !group?.mentor) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center space-y-4 my-10 transition-all duration-300">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mentor Assignment Pending</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Your project group <strong>"{group?.name}"</strong> does not have an assigned mentor yet.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Please contact the administrator or your coordinator to assign a mentor to your group before submitting your proposal.
        </p>
        <div className="pt-2">
          <Link href="/home">
            <Button className="w-full bg-[#1a9e7a] hover:bg-[#158a6a] text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center space-y-4 my-10 transition-all duration-300">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submission Closed</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          You already have an active proposal that is currently <strong className="text-[#1a9e7a]">{latestStatus}</strong>.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {latestStatus === "Approved"
            ? "Since your proposal has been approved, please proceed to create your project from the student dashboard."
            : "You can submit another proposal once your mentor provides feedback and either rejects it or marks it as Needs Revision."}
        </p>
        <div className="pt-2">
          <Link href="/home">
            <Button className="w-full bg-[#1a9e7a] hover:bg-[#158a6a] text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
                Submit Project Proposal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Share your project idea with our team for review
              </p>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="font-medium text-gray-700 dark:text-gray-300">Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project title" 
                      {...field} 
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mb-8">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Proposal Document
              </h3>
              <FormField
                control={form.control}
                name="document"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-center mb-2">
                          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="document-upload"
                          onChange={handleFileChange}
                          {...field}
                        />
                        <label
                          htmlFor="document-upload"
                          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Drop your file here, or{" "}
                          <span className="text-blue-600 dark:text-blue-400">click to browse</span>
                        </label>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          PDF, DOC up to 10MB
                        </p>
                        {value && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Selected file: {(value as File).name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </section>
        </form>
      </Form>
    </div>
  );
};

export default ProposalSubmission;
