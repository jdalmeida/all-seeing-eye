import "@/styles/globals.css";

import { initNewsPipeline } from "@/lib/init";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";

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
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: "rgb(0, 255, 135)",
					colorBackground: "#0d0d0d",
					colorText: "white",
				},
			}}
		>
			<html lang="pt-BR">
				<body className="h-screen overflow-y-auto bg-terminal">
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
