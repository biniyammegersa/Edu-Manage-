import Footer from "@/components/landing-page-component/footer";
import Navbar from "@/components/landing-page-component/navbar";
import Link from "next/link";
import {
  FileText,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Proposal Management",
    description:
      "Create, edit, and track project proposals with clear status indicators from draft to approval.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Form groups, assign roles, and collaborate seamlessly with your project team members.",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Discussions",
    description:
      "Receive feedback from teachers and engage in threaded discussions for clarity.",
  },
  {
    icon: Sparkles,
    title: "AI Proposal Checker",
    description:
      "Get instant advisory feedback on your proposal quality before submission.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Secure workflows with distinct permissions for students, teachers, and administrators.",
  },
  {
    icon: Globe,
    title: "Public Showcase",
    description:
      "Share approved projects publicly and build your academic portfolio.",
  },
];

const stats = [
  { value: "2,500+", label: "Projects Completed" },
  { value: "150+", label: "Departments" },
  { value: "10,000+", label: "Students" },
  { value: "98%", label: "Approval Rate" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa] dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center px-4 pt-16 pb-10">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-sm font-medium mb-8">
            <Sparkles size={14} className="text-amber-500" />
            University Project Management Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight max-w-3xl">
            Streamline Your{" "}
            <span className="text-[#1a9e7a]">Academic Projects</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-gray-500 dark:text-gray-400 text-lg max-w-xl leading-relaxed">
            A comprehensive platform for managing university project proposals,
            reviews, and collaboration. From submission to approval, all in one
            place.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#1a9e7a] hover:bg-[#158a6a] text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 shadow-sm"
            >
              Get Started Free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold px-7 py-3.5 rounded-full border border-gray-200 dark:border-gray-800 transition-colors duration-200 shadow-sm"
            >
              Browse Public Projects
            </Link>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-t border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
          <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything You Need for{" "}
              <span className="text-[#1a9e7a]">Academic Excellence</span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              A complete toolkit designed to streamline the entire project
              lifecycle, from initial proposal to final showcase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#e8f7f3] dark:bg-[#1a9e7a]/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#1a9e7a]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
