import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Navbar } from "@/app/_components/navbar";
import { HackerGlobeCanvas } from "@/app/_components/hacker-globe";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
	return (
		<HydrateClient>
			<div className="min-h-screen bg-terminal relative">
				<SignedIn>
					<Navbar />
					<main className="relative h-screen overflow-hidden">
						{/* Globo hacker central */}
						<div className="absolute inset-0 z-0">
							<HackerGlobeCanvas />
						</div>

						{/* Overlay sutil com informações */}
						<div className="absolute top-20 left-4 z-10 text-text-muted text-sm">
							<div>&gt; ALL-SEEING EYE v1.0</div>
							<div>&gt; Sistema Operacional</div>
							<div>&gt; Monitoramento Ativo</div>
						</div>
					</main>
				</SignedIn>

				<SignedOut>
					<main className="relative h-screen overflow-hidden flex flex-col items-center justify-center px-4">
						{/* Globo hacker como plano de fundo */}
						<div className="absolute inset-0 z-0">
							<HackerGlobeCanvas />
						</div>

						{/* Overlay de login minimalista */}
						<div className="relative z-10 text-center">
							<div className="mb-8">
								<h1 className="text-4xl font-bold text-neon neon-glow mb-2">
									[ALL-SEEING EYE]
								</h1>
								<p className="text-text-secondary text-sm">
									Sistema de Vigilância Inteligente
								</p>
							</div>

							<SignInButton mode="modal">
								<button type="button" className="px-6 py-2 bg-primary text-black font-bold border border-primary hover:bg-primary-hover hover:glow-on-hover transition-all">
									[ACESSAR]
								</button>
							</SignInButton>

							<div className="mt-8 text-xs text-text-muted">
								<div>&gt; Terminal v1.0 - Build 2024.01</div>
								<div>&gt; Sistema Seguro e Operacional</div>
							</div>
						</div>
					</main>
				</SignedOut>
			</div>
		</HydrateClient>
	);
}
