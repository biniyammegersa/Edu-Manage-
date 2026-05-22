import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-12 md:p-24 text-center text-white">
        {/* Sublte Grid on the CTA */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <br /> Project Workflow?
          </h2>
          <p className="opacity-80 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Join thousands of students and educators already using Project Hub.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="xl"
              className="rounded-full bg-white text-primary hover:bg-white/90 h-14 px-10 font-bold"
              asChild
            >
              <Link href="/signup">
                Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="
    rounded-full
    border-white
    text-white
    bg-transparent
    hover:bg-white/10
    hover:text-white
    h-14
    px-10
    font-semibold
  "
              asChild
            >
              <Link href="/projects">View Public Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
