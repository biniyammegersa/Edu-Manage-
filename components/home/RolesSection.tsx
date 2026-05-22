import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, BookOpen, Settings2, Eye, ArrowRight } from "lucide-react";

const roles = [
  { icon: GraduationCap, title: "Students", desc: "Create proposals, collaborate with team members, and track your project.", color: "bg-emerald-50 text-emerald-600", features: ["Submit proposals", "Group management", "AI Checker"] },
  { icon: BookOpen, title: "Teachers", desc: "Review assigned proposals, provide feedback, and guide students.", color: "bg-blue-50 text-blue-600", features: ["Review proposals", "Approve/Reject", "Threaded chats"] },
  { icon: Settings2, title: "Administrators", desc: "Manage users, departments, and oversee the entire platform.", color: "bg-amber-50 text-amber-600", features: ["User management", "Setup depts", "Assignments"] },
  { icon: Eye, title: "Public Viewers", desc: "Explore approved public projects and academic community archives.", color: "bg-teal-50 text-teal-600", features: ["Browse projects", "Search & filter", "Rate projects"] }
];

export function RolesSection() {
  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl font-bold mb-4">Designed for Every Role</h2>
        <p className="text-center text-muted-foreground mb-16">Tailored experiences for students, teachers, and admins.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((r) => (
            <Card key={r.title} className="shadow-sm border-none bg-white">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  <r.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{r.title}</CardTitle>
                <CardDescription className="text-base">{r.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-3">
                  {r.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="rounded-full bg-primary h-12 px-8" asChild>
            <Link href="/signup">Join the Platform <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}