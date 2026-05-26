import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/baseQuery";
import Cookies from "js-cookie";
import { PROJECT_ROUTES } from "@/config/api.config";
import { Projects, Project } from "@/type/project";

interface LikeProjectRequest {
  projectId: string;
  userId: string;
}

export const getProjectsApi = createApi({
  reducerPath: "getProjectsApi",
  baseQuery,
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    // Get all PUBLISHED projects (authenticated)
    getAllProjects: builder.query<Projects, void>({
      query: () => ({
        url: PROJECT_ROUTES.BASE,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Project"],
    }),
    // Public published projects — no login required
    getPublicProjects: builder.query<Projects, void>({
      query: () => ({
        url: PROJECT_ROUTES.PUBLIC,
        method: "GET",
      }),
      providesTags: ["Project"],
    }),
    // Get all projects for mentor (pending, approved, published)
    getMentorProjects: builder.query<{ success: boolean; projects: Project[] }, void>({
      query: () => ({
        url: `${PROJECT_ROUTES.BASE}/mentor/my-projects`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Project"],
    }),
    // Get all projects for admin (pending, approved, published)
    getAdminProjects: builder.query<{ success: boolean; projects: Project[] }, void>({
      query: () => ({
        url: `${PROJECT_ROUTES.BASE}/admin/all`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Project"],
    }),
    // Get APPROVED projects waiting for admin to publish (admin only)
    getApprovedProjects: builder.query<{ success: boolean; projects: Project[] }, void>({
      query: () => ({
        url: `${PROJECT_ROUTES.BASE}/admin/approved`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Project"],
    }),
    getProjectById: builder.query<{ project: Project }, string>({
      query: (id) => ({
        url: `${PROJECT_ROUTES.BASE}/${id}`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Project"],
    }),
    // Admin: publish a project
    publishProject: builder.mutation<{ success: boolean; project: Project }, string>({
      query: (projectId) => ({
        url: `${PROJECT_ROUTES.BASE}/${projectId}/publish`,
        method: "PUT",
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["Project"],
    }),
    // Like a project
    likeProject: builder.mutation<Project, LikeProjectRequest>({
      query: ({ projectId, userId }) => ({
        url: `${PROJECT_ROUTES.BASE}/${projectId}/like`,
        method: "POST",
        body: { userId },
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["Project"],
    }),
    //increamentView
    incrementView: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `${PROJECT_ROUTES.BASE}/${projectId}/view`,
        method: "POST",
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

export const {
  useGetAllProjectsQuery,
  useGetPublicProjectsQuery,
  useGetMentorProjectsQuery,
  useGetAdminProjectsQuery,
  useGetApprovedProjectsQuery,
  useGetProjectByIdQuery,
  usePublishProjectMutation,
  useLikeProjectMutation,
  useIncrementViewMutation
} = getProjectsApi;
