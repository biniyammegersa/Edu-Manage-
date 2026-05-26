import Footer from "@/components/landing-page-component/footer";
import Navbar from "@/components/landing-page-component/navbar";
import PublicProjectsBrowse from "@/components/landing-page-component/PublicProjectsBrowse";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa] dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <PublicProjectsBrowse />
      </main>
      <Footer />
    </div>
  );
}
