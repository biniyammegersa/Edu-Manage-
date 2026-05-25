"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Globe, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetPublicProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { Project } from "@/type/project";
import PublicProjectCard from "./PublicProjectCard";
import Cookies from "js-cookie";

function getDetailPathForUser(): string {
  try {
    const token = Cookies.get("access_token");
    if (!token) return "/project-detail";
    const role = JSON.parse(atob(token.split(".")[1])).role;
    if (role === "community") return "/community/project-detail";
    if (role === "student" || role === "teacher" || role === "admin") {
      return "/home/project-detail";
    }
  } catch {
    /* use default */
  }
  return "/project-detail";
}

export default function PublicProjectsBrowse() {
  const [searchQuery, setSearchQuery] = useState("");
  const isLoggedIn = !!Cookies.get("access_token");
  const { data, isLoading, isError } = useGetPublicProjectsQuery();

  const publishedProjects = useMemo(() => {
    const all = (data?.projects as Project[]) || [];
    return all.filter((p) => p?.status === "published");
  }, [data]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return publishedProjects;
    return publishedProjects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.elevatorPitch?.toLowerCase().includes(q) ||
        p.projectDescription?.toLowerCase().includes(q) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [publishedProjects, searchQuery]);

  const detailPath = isLoggedIn ? getDetailPathForUser() : undefined;

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="h-7 w-7 text-[#1a9e7a]" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Public Projects
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl">
            Explore published student projects from Edu-Manage.{" "}
            {!isLoggedIn && "Sign in to open full project details, discussions, and more."}
          </p>
        </div>
        {!isLoggedIn && (
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-[#1a9e7a] hover:bg-[#158a6a] text-white font-semibold px-6 py-2.5 rounded-full transition-colors shrink-0"
          >
            Log in for full access
          </Link>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a9e7a]" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-muted-foreground">Unable to load projects. Please try again later.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
          <Globe className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No published projects yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {searchQuery ? "Try a different search term." : "Check back soon for new showcases."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <PublicProjectCard
              key={project._id}
              project={project}
              isLoggedIn={isLoggedIn}
              detailPath={detailPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
