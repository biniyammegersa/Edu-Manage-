import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/baseQuery";
import Cookies from "js-cookie";

export interface GroupType {
  _id: string;
  name: string;
  members: Array<{
    _id: string;
    fullName: string;
    email: string;
    department?: string;
    imageUrl?: string;
    role: string;
  }>;
  mentor?: {
    _id: string;
    fullName: string;
    email: string;
    department?: string;
    imageUrl?: string;
    role: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery,
  tagTypes: ["Group"],
  endpoints: (builder) => ({
    getMyGroup: builder.query<{ success: boolean; data: GroupType }, void>({
      query: () => ({
        url: "/api/groups/my-group",
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Group"],
    }),
    createGroup: builder.mutation<{ success: boolean; data: GroupType; message?: string }, { name: string; members: string[] }>({
      query: (data) => ({
        url: "/api/groups",
        method: "POST",
        body: data,
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["Group"],
    }),
    getAllGroups: builder.query<{ success: boolean; data: GroupType[] }, void>({
      query: () => ({
        url: "/api/groups/all",
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["Group"],
    }),
    assignMentor: builder.mutation<{ success: boolean; message: string }, { groupId: string; mentorId: string }>({
      query: (data) => ({
        url: "/api/groups/assign-mentor",
        method: "POST",
        body: data,
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["Group"],
    }),
  }),
});

export const {
  useGetMyGroupQuery,
  useCreateGroupMutation,
  useGetAllGroupsQuery,
  useAssignMentorMutation,
} = groupApi;
