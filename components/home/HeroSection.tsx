import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none" />
      
      <div className="container relative mx-auto px-4 text-center">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700 inline-flex items-center gap-2 rounded-full border bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>University Project Management Platform</span>
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8">
          Streamline Your <br />
          <span className="text-gradient text-primary">Academic Projects</span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          A comprehensive platform for managing university project proposals, reviews, and collaboration. 
          From submission to approval, all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-10 h-14 text-base" asChild>
    <Link href="/signup">
      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
    </Link>
  </Button>
  
  <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-border text-base bg-white" asChild>
    <Link href="/projects">Browse Public Projects</Link>
  </Button>
</div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-16">
          {[
            { v: "2,500+", l: "Projects Completed" },
            { v: "150+", l: "Departments" },
            { v: "10,000+", l: "Students" },
            { v: "98%", l: "Approval Rate" },
          ].map((s) => (
            <div key={s.l} className="space-y-1">
              <div className="text-3xl font-bold">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}