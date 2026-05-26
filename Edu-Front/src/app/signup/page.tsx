import SignupPage from "@/components/auth-component/signup";
import Link from "next/link";
import { Sparkles, BookOpen, Users, ShieldCheck } from "lucide-react";
import Navbar from "@/components/landing-page-component/navbar";
import Footer from "@/components/landing-page-component/footer";

export const metadata = {
  title: "Sign Up | EduManage",
  description:
    "Create your EduManage account — your university project management platform.",
};

const highlights = [
  {
    icon: BookOpen,
    title: "Proposal Management",
    desc: "Track every stage of your project from draft to approval.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Work seamlessly with your group and mentor in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Secure workflows tailored for students, mentors & admins.",
  },
];

export default function SignupRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa] dark:bg-gray-950 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 md:py-20 px-4 md:px-6">
        {/* Container Card */}
        <div className="max-w-5xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[600px] transition-all duration-300">
          
          {/* ── Left panel – branding ── */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-gradient-to-br from-[#0f766e] via-[#1a9e7a] to-[#34d399] p-12 text-white relative overflow-hidden">
            {/* decorative circles */}
            <span className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <span className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">EduManage</span>
            </Link>

            {/* Headline */}
            <div className="z-10 space-y-6 my-auto py-8">
              <h1 className="text-3xl font-extrabold leading-tight">
                Start Your Academic Journey{" "}
                <span className="text-emerald-200 font-black">Today</span>
              </h1>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Join thousands of students and mentors managing their university
                projects on one collaborative platform.
              </p>

              <ul className="space-y-4 pt-4">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex-shrink-0 flex items-center justify-center backdrop-blur-sm mt-0.5">
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{title}</p>
                      <p className="text-emerald-100/90 text-[11px] leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer quote */}
            <p className="text-emerald-200/70 text-[11px] z-10">
              © {new Date().getFullYear()} EduManage — Built for academic excellence.
            </p>
          </div>

          {/* ── Right panel – form ── */}
          <div className="lg:col-span-7 flex items-center justify-center p-8 md:p-12">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <Link
                href="/"
                className="lg:hidden flex items-center justify-center gap-2 mb-8"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1a9e7a] flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  EduManage
                </span>
              </Link>

              {/* Form Section */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Create your account 🚀
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Get started for free — no credit card required.
                  </p>
                </div>

                {/* Signup form component */}
                <SignupPage />
              </div>

              {/* Back link */}
              <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
                <Link href="/" className="hover:text-[#1a9e7a] transition-colors duration-200">
                  ← Back to home
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
