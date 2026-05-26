import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/baseQuery";
import Cookies from "js-cookie";
import { profileType } from "@/type/profile";
import { USER_ROUTES } from "@/config/api.config";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get all users with optional filtering
    getUsers: builder.query<profileType[], void>({
      query: (params) => ({
        url: USER_ROUTES.PROFILE,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      providesTags: ["User"],
    }),
    // Get students only
    getStudents: builder.query<profileType[], void>({
      query: () => ({
        url: `${USER_ROUTES.PROFILE}?role=student`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : response?.data || [];
      },
      providesTags: ["User"],
    }),
    // Get teachers only
    getTeachers: builder.query<profileType[], void>({
      query: () => ({
        url: `${USER_ROUTES.PROFILE}?role=teacher`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : response?.data || [];
      },
      providesTags: ["User"],
    }),
    // Get students without a group
    getStudentsWithoutGroup: builder.query<profileType[], void>({
      query: () => ({
        url: `${USER_ROUTES.PROFILE}?role=student&hasGroup=false`,
        method: "GET",
        token: Cookies.get("access_token"),
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : response?.data || [];
      },
      providesTags: ["User"],
    }),
    // Delete user
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `${USER_ROUTES.PROFILE}/${id}`,
        method: "DELETE",
        token: Cookies.get("access_token"),
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useGetStudentsWithoutGroupQuery,
  useDeleteUserMutation,
} = usersApi;
