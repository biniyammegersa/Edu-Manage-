import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileText,
  Users,
  MessageSquare,
  Shield,
  Sparkles,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Proposal Management",
    description: "Create, edit, and track project proposals with clear status indicators from draft to approval.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Form groups, assign roles, and collaborate seamlessly with your project team members.",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Discussions",
    description: "Receive feedback from teachers and engage in threaded discussions for clarity.",
  },
  {
    icon: Sparkles,
    title: "AI Proposal Checker",
    description: "Get instant advisory feedback on your proposal quality before submission.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure workflows with distinct permissions for students, teachers, and administrators.",
  },
  {
    icon: Globe,
    title: "Public Showcase",
    description: "Share approved projects publicly and build your academic portfolio.",
  },
];

// IMPORTANT: Ensure the "export" keyword is present here
export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for
            <br />
            <span className="text-primary">Academic Excellence</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit designed to streamline the entire project lifecycle, 
            from initial proposal to final showcase.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="elevated" 
              className="animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: "both"
              }}
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}