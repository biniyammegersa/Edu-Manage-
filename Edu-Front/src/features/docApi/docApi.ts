import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/baseQuery";
import Cookies from "js-cookie";
import { DOCUMENTATION_ROUTES } from "@/config/api.config";

export const docApi = createApi({
  reducerPath: "docApi",
  baseQuery,
  tagTypes: ["ChapterSubmission", "SubmissionDetails", "PendingReviews", "Feedback"],
  endpoints: (builder) => ({
    // Student: Fetch submissions checklist matrix
    getMySubmissions: builder.query<any, void>({
      query: () => ({
        url: DOCUMENTATION_ROUTES.MY_SUBMISSIONS,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["ChapterSubmission"],
    }),

    // Student/Advisor: Fetch detailed submission info
    getSubmissionDetails: builder.query<any, string>({
      query: (id) => ({
        url: DOCUMENTATION_ROUTES.DETAILS(id),
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: (result, error, id) => [{ type: "SubmissionDetails", id }],
    }),

    // Student: Submit or revise a chapter
    submitChapter: builder.mutation<any, FormData>({
      query: (data) => ({
        url: DOCUMENTATION_ROUTES.SUBMIT,
        method: "POST",
        body: data,
        token: Cookies.get("access_token"),
        formData: true,
      }),
      invalidatesTags: ["ChapterSubmission", "PendingReviews"],
    }),

    // Advisor: Fetch pending student reviews
    getPendingReviews: builder.query<any, void>({
      query: () => ({
        url: DOCUMENTATION_ROUTES.PENDING,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["PendingReviews"],
    }),

    // Advisor: Submit verdict & comments
    submitReview: builder.mutation<any, { submissionId: string; verdict: string; generalFeedback: string; versionNumber: number; sectionComments?: Array<{ sectionName: string; commentText: string; severity: string }> }>({
      query: ({ submissionId, ...body }) => ({
        url: DOCUMENTATION_ROUTES.REVIEW(submissionId),
        method: "POST",
        body,
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: (result, error, { submissionId }) => [
        "ChapterSubmission",
        "PendingReviews",
        { type: "SubmissionDetails", id: submissionId },
        { type: "Feedback", id: submissionId }
      ],
    }),

    // Retrieve feedback for a submission
    getSubmissionFeedback: builder.query<any, string>({
      query: (submissionId) => ({
        url: DOCUMENTATION_ROUTES.FEEDBACK(submissionId),
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: (result, error, id) => [{ type: "Feedback", id }],
    }),
  }),
});

export const {
  useGetMySubmissionsQuery,
  useGetSubmissionDetailsQuery,
  useSubmitChapterMutation,
  useGetPendingReviewsQuery,
  useSubmitReviewMutation,
  useGetSubmissionFeedbackQuery,
} = docApi;
