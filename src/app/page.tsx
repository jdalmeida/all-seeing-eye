import { HackerGlobeCanvas } from "@/app/_components/hacker-globe";
import { KeyboardNavigation } from "@/app/_components/keyboard-navigation";
import { MatrixRainCanvas } from "@/app/_components/matrix-rain";
import { Navbar } from "@/app/_components/navbar";
import { RightSidebar } from "@/app/_components/right-sidebar";
import { HydrateClient } from "@/trpc/server";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
	return (
		<HydrateClient>
			<div className="relative min-h-screen bg-terminal">
				{/* Navegação por teclado global */}
				<KeyboardNavigation />

				{/* Matrix Rain Background */}
				<MatrixRainCanvas />

				<SignedIn>
					<Navbar />
					<main className="relative h-screen overflow-hidden">
						{/* Globo à esquerda (metade visível) */}
						<div className="absolute inset-y-0 left-0 z-0 w-1/2 overflow-hidden">
							<div className="-left-1/2 relative h-full w-[200%]">
								<HackerGlobeCanvas />
							</div>
						</div>

						{/* Painel de dados minimalista à direita */}
						<div className="absolute top-12 right-0 z-10 h-full w-1/2 p-6">
							<div className="h-full border-primary/30 border-l pl-6">
								<div className="mb-6 text-sm text-text-muted">
									<div>&gt; ALL-SEEING EYE v2.0</div>
									<div>&gt; Desktop Seguro</div>
									<div>&gt; Status: Online</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="rounded border border-primary/40 bg-black/40 p-4">
										<div className="text-text-secondary text-xs">Sessão</div>
										<div className="font-bold text-lg text-neon">Ativa</div>
									</div>
									<div className="rounded border border-primary/40 bg-black/40 p-4">
										<div className="text-text-secondary text-xs">
											Notificações
										</div>
										<div className="font-bold text-lg text-neon">0</div>
									</div>
									<div className="rounded border border-primary/40 bg-black/40 p-4">
										<div className="text-text-secondary text-xs">Build</div>
										<div className="font-bold text-lg text-neon">
											{new Date().getFullYear()}.01
										</div>
									</div>
									<div className="rounded border border-primary/40 bg-black/40 p-4">
										<div className="text-text-secondary text-xs">Dicas</div>
										<div className="text-neon text-sm">
											Alt+T Terminal, Alt+C Crypto
										</div>
									</div>
								</div>
							</div>
						</div>
					</main>
				</SignedIn>

				<SignedOut>
					<main className="relative flex h-screen items-center justify-center overflow-hidden px-4">
						{/* Globo à esquerda (metade visível) */}
						<div className="absolute inset-y-0 left-0 z-0 w-1/2 overflow-hidden">
							<div className="-left-1/2 relative h-full w-[200%]">
								<HackerGlobeCanvas />
							</div>
						</div>

						{/* Overlay de login minimalista */}
						<div className="relative z-10 ml-auto w-1/2 pr-6">
							<div className="mb-8">
								<h1 className="neon-glow mb-2 font-bold text-4xl text-neon">
									[ALL-SEEING EYE]
								</h1>
								<p className="text-sm text-text-secondary">
									Sistema de Vigilância Inteligente
								</p>
							</div>

							<SignInButton mode="modal">
								<button
									type="button"
									className="hover:glow-on-hover border border-primary bg-primary px-6 py-2 font-bold text-black transition-all hover:bg-primary-hover"
								>
									[ACESSAR]
								</button>
							</SignInButton>

							<div className="mt-8 text-text-muted text-xs">
								<div>
									&gt; Terminal v2.0 - Build {new Date().getFullYear()}.01
								</div>
								<div>&gt; Sistema Seguro e Operacional</div>
								<div>&gt; CLI disponível após login</div>
							</div>
						</div>

						{/* Matrix Rain Background */}
						<MatrixRainCanvas />
					</main>
				</SignedOut>

				{/* Right Sidebar - disponível para todos os usuários */}
				<RightSidebar defaultMode="terminal" />
			</div>
		</HydrateClient>
	);
}
