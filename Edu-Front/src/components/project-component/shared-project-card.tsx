import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetProjectFeedbackQuery } from "@/features/projectFeedbackApi/ProjectFeedbackApi";
import { ProjectFeedback, ProjectFeedbackList } from "@/type/project-feedback";

interface SharedProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  viewMode: "grid" | "list";
  role: "student" | "teacher" | "admin";
  status?: boolean;
}

const SharedProjectCard: React.FC<SharedProjectCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  date,
  viewMode,
  role,
  status,
}) => {
  const { data: feedback } = useGetProjectFeedbackQuery(id);
  const feedbacks = feedback as ProjectFeedbackList | undefined;
  const feedbackData = feedbacks?.feedback[feedbacks?.feedback.length - 1];

  const getStatusDisplay = () => {
    const rawStatus = feedbackData?.status || (status ? "approved" : "pending");
    switch (rawStatus.toLowerCase()) {
      case "approved":
        return { label: "Approved", className: "bg-green-500 text-white" };
      case "rejected":
        return { label: "Rejected", className: "bg-red-500 text-white" };
      case "need review":
      case "need_review":
      case "needs revision":
        return { label: "Need Review", className: "bg-amber-500 text-white" };
      default:
        return { label: "Pending", className: "bg-blue-500 text-white" };
    }
  };

  const statusBadge = getStatusDisplay();

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

  if (viewMode === "list") {
    return (
      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800">
        <div className="relative w-48 h-48 flex-shrink-0">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
          <span className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-semibold rounded-full shadow-md ${statusBadge.className}`}>
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

            <Link
              href={getFeedbackLink()}
              className="inline-flex items-center text-xs rounded-md text-primary"            >
              {getButtonText()}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid mode (default)
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800">
      <div className="relative h-48 w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <span className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-semibold rounded-full shadow-md ${statusBadge.className}`}>
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

          <Link
            href={getFeedbackLink()}
            className="inline-flex items-center text-xs rounded-md text-primary"
          >
            {getButtonText()}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SharedProjectCard;
