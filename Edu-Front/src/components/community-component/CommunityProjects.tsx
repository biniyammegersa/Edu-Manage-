"use client";

import { useMemo, useState } from "react";
import { Search, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/posted-projects/project-card";
import { useGetAllProjectsQuery } from "@/features/getProjectsApi/getProjectsApi";
import { Project } from "@/type/project";

export default function CommunityProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError } = useGetAllProjectsQuery();

  const publishedProjects = useMemo(() => {
    const all = (data?.projects as Project[]) || [];
    return all.filter((project) => project?.status === "published");
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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Community Projects</h1>
        </div>
        <p className="text-muted-foreground">
          Browse published student projects from across the platform.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, or tag..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 rounded-xl border border-dashed">
          <p className="text-muted-foreground">Could not load projects. Please try again later.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
          <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No published projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "No projects match your search."
              : "Check back when admins publish approved projects."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} detailBasePath="/community/project-detail" />
          ))}
        </div>
      )}
    </div>
  );
}
