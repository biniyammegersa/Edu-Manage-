import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetProjectFeedbackQuery } from "@/features/projectFeedbackApi/ProjectFeedbackApi";
import { usePublishProjectMutation } from "@/features/getProjectsApi/getProjectsApi";
import { ProjectFeedbackList } from "@/type/project-feedback";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe } from "lucide-react";

interface SharedProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  viewMode: "grid" | "list";
  role: "student" | "teacher" | "admin";
  projectStatus?: string;
}

const SharedProjectCard: React.FC<SharedProjectCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  date,
  viewMode,
  role,
  projectStatus,
}) => {
  const { data: feedback } = useGetProjectFeedbackQuery(id);
  const [publishProject, { isLoading: isPublishing }] = usePublishProjectMutation();
  const [publishedLocally, setPublishedLocally] = useState(false);

  const feedbacks = feedback as ProjectFeedbackList | undefined;
  const feedbackData = feedbacks?.feedback[feedbacks?.feedback.length - 1];

  const resolvedStatus = (
    publishedLocally ? "published" : projectStatus || feedbackData?.status || "pending"
  ).toLowerCase();

  const getStatusDisplay = () => {
    switch (resolvedStatus) {
      case "published":
        return { label: "Published", className: "bg-emerald-600 text-white" };
      case "approved":
        return { label: "Approved", className: "bg-green-500 text-white" };
      case "rejected":
        return { label: "Rejected", className: "bg-red-500 text-white" };
      case "need review":
      case "need_review":
      case "needs revision":
        return { label: "Need Review", className: "bg-amber-500 text-white" };
      default:
        return { label: "Pending", className: "bg-emerald-400 text-white" };
    }
  };

  const statusBadge = getStatusDisplay();
  const canPublish =
    role === "admin" && resolvedStatus === "approved" && !publishedLocally;

  const handlePublish = async () => {
    try {
      await publishProject(id).unwrap();
      setPublishedLocally(true);
      toast.success("Project published", {
        description: "The community can now view this project.",
      });
    } catch {
      toast.error("Failed to publish project", {
        description: "Please try again.",
      });
    }
  };

  const getFeedbackLink = () => {
    if (role === "student") {
      return feedbackData && feedbackData.status !== "pending"
        ? `/project/viewfeedback/${id}`
        : `/home/project-detail/${id}`;
    } else if (role === "teacher" || role === "admin") {
      return feedbackData && feedbackData.status !== "pending"
        ? `/project/viewfeedback/${id}`
        : `/project/submitfeedback/${id}`;
    }
    return "#";
  };

  const getButtonText = () => {
    if (role === "student") {
      return feedbackData && feedbackData.status !== "pending"
        ? "View Feedback"
        : "View Project";
    } else if (role === "teacher" || role === "admin") {
      return feedbackData && feedbackData.status !== "pending"
        ? "View Feedback"
        : "Give Feedback";
    }
    return "View";
  };

  const actions = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {canPublish && (
        <Button
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={handlePublish}
          disabled={isPublishing}
        >
          <Globe className="h-3.5 w-3.5" />
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      )}
      <Link
        href={getFeedbackLink()}
        className="inline-flex items-center text-xs rounded-md text-primary"
      >
        {getButtonText()}
      </Link>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800">
        <div className="relative w-48 h-48 flex-shrink-0">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
          <span
            className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-semibold rounded-full shadow-md ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="w-96">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 truncate">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
              {description}
            </p>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(date).toLocaleDateString()}
            </span>
            {actions}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800">
      <div className="relative h-48 w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <span
          className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-semibold rounded-full shadow-md ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 truncate">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 min-h-[2.5rem] overflow-hidden">
          {description}
        </p>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(date).toLocaleDateString()}
          </span>
          {actions}
        </div>
      </div>
    </div>
  );
};
export default SharedProjectCard;
