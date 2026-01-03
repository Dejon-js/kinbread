"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Settings, LogOut, Link as LinkIcon } from "lucide-react";
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

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="text-lg font-bold">
          Capacity Gate
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
  );
}
