"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/type/project";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type PublicProjectCardProps = {
  project: Project;
  isLoggedIn: boolean;
  detailPath?: string;
};

export default function PublicProjectCard({
  project,
  isLoggedIn,
  detailPath,
}: PublicProjectCardProps) {
  const cardBody = (
    <>
      <div className="bg-gray-200 dark:bg-gray-700 h-[200px] relative overflow-hidden rounded-t-lg">
        <Image
          src={project?.coverImage || "/placeholder-project.jpg"}
          alt={project?.title || "Project cover"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-600 text-white shadow">
          Published
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 dark:text-gray-100 line-clamp-1">
          {project?.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {project?.elevatorPitch || project?.projectDescription}
        </p>
        {isLoggedIn && detailPath ? (
          <Link
            href={`${detailPath}/${project._id}`}
            className="text-sm font-medium text-[#1a9e7a] hover:text-[#158a6a] hover:underline"
          >
            View project details →
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              Log in to view full details
            </span>
            <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow">
      {cardBody}
    </div>
  );
}
