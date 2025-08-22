"use client";

import { UserButton } from "@clerk/nextjs";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

export function Navbar() {
	return (
		<nav className="absolute top-0 right-0 left-0 border-terminal border-b bg-surface p-4">
			<div className="container mx-auto flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<h1 className="neon-glow flex items-center font-bold text-2xl text-neon">
						<EyeIcon className="mr-2 h-6 w-6" />
						All-Seeing Eye
					</h1>
					<Link
						href="/"
						className="glow-on-hover rounded px-3 py-1 text-text-secondary hover:text-primary"
					>
						[Home]
					</Link>
					<Link
						href="/news"
						className="glow-on-hover rounded px-3 py-1 text-text-secondary hover:text-primary"
					>
						[News]
					</Link>
				</div>

				<div className="flex items-center space-x-4">
					<span className="text-sm text-text-muted">
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
