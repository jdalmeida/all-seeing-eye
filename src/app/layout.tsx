import "@/styles/globals.css";

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import { initNewsPipeline } from "@/lib/init";

export const metadata: Metadata = {
	title: "All-Seeing Eye - Sistema de Insights",
	description: "Sistema de insights com autenticação e interface hacker",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	// Initialize news pipeline on server startup
	initNewsPipeline();

	return (
		<ClerkProvider>
			<html lang="pt-BR">
				<body className="bg-terminal h-screen overflow-hidden">
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
