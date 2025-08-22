"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { EyeIcon } from "lucide-react";

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 border-b border-terminal p-4 bg-surface">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="flex items-center text-2xl font-bold text-neon neon-glow">
            <EyeIcon className="w-6 h-6 mr-2" />
            All-Seeing Eye
          </h1>
          <Link
            href="/"
            className="text-text-secondary hover:text-primary glow-on-hover px-3 py-1 rounded"
          >
            [Home]
          </Link>
          <Link
            href="/news"
            className="text-text-secondary hover:text-primary glow-on-hover px-3 py-1 rounded"
          >
            [News]
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-text-muted text-sm">
            Sistema de Insights v1.0
          </span>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 border border-terminal",
                userButtonPopoverCard: "bg-surface border border-terminal",
                userButtonPopoverActionButton:
                  "text-text-primary hover:bg-gray-800",
                userButtonPopoverActionButtonText: "text-text-primary",
                userButtonPopoverFooter: "border-t border-terminal",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
