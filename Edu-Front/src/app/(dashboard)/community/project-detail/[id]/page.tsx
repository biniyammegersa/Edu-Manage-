import ProjectDetail from "@/components/project-detail-component/ProjectDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function CommunityProjectDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-[60vh]">
      <ProjectDetail id={params.id} />
    </div>
  );
}
