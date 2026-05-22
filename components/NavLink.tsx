"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">, LinkProps {
  activeClassName?: string;
  exact?: boolean;
}

/**
 * Next.js equivalent of React Router's NavLink.
 * It automatically applies activeClassName when the current route matches the href.
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, exact = false, ...props }, ref) => {
    const pathname = usePathname();

    const isActive = useMemo(() => {
      const pathString = href.toString();
      
      if (exact) {
        return pathname === pathString;
      }
      
      // Matches the base path (e.g., /dashboard matches /dashboard/settings)
      // but prevents '/' from matching everything
      if (pathString === "/") {
        return pathname === "/";
      }

      return pathname.startsWith(pathString);
    }, [pathname, href, exact]);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        // Aria-current is a web standard for active navigation items
        aria-current={isActive ? "page" : undefined}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };