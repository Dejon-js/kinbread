"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Settings, LogOut, Link as LinkIcon, Menu, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Baker } from "@/types";
import { CopyLinkButton } from "./copy-link-button";

interface DashboardNavProps {
  baker: Baker;
}

export function DashboardNav({ baker }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dates",
      icon: Calendar,
      active: pathname === "/dashboard" || pathname.startsWith("/dashboard/windows"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "w-64 border-r bg-card min-h-screen flex flex-col transition-transform duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-lg font-bold" onClick={closeMenu}>
            Kinbread
          </Link>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {baker.business_name}
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Your public link:</span>
          </div>
          <CopyLinkButton slug={baker.slug} />

          <form action={signOut}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
