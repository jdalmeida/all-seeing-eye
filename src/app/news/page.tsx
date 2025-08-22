"use client";

import { Navbar } from "@/app/_components/navbar";
import { api } from "@/trpc/react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";

interface NewsItem {
	id: string;
	title: string;
	link: string;
	source: string;
	publishedAt: Date;
	createdAt: Date;
	insights: {
		id: number;
		content: string;
		createdAt: Date;
	}[];
}

export default function NewsPage() {
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);

	// Use tRPC query to fetch news
	const {
		data: newsData,
		isLoading: loading,
		error,
		refetch,
	} = api.news.getAll.useQuery({
		limit,
		offset,
	});

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Extract news data
	const news = newsData?.success ? newsData.data : [];
	const pagination = newsData?.pagination;

	if (loading) {
		return (
			<div className="min-h-screen bg-terminal">
				<Navbar />
				<main className="container mx-auto px-4 py-8">
					<div className="text-center text-text-secondary">
						<div>&gt; Carregando notícias...</div>
					</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-terminal">
				<Navbar />
				<main className="container mx-auto px-4 py-8">
					<div className="text-center text-error">
						<div>&gt; ERRO: {error?.message || "Erro desconhecido"}</div>
						<SignedIn>
							<div className="mt-4">
								<button
									onClick={() => refetch()}
									type="button"
									className="hover:glow-on-hover border border-primary bg-primary px-4 py-2 font-bold text-black transition-all hover:bg-primary-hover"
								>
									Tentar Novamente
								</button>
							</div>
						</SignedIn>
						<SignedOut>
							<div className="mt-4">
								<SignInButton mode="modal">
									<button type="button" className="hover:glow-on-hover border border-primary bg-primary px-4 py-2 font-bold text-black transition-all hover:bg-primary-hover">
										Fazer Login
									</button>
								</SignInButton>
							</div>
						</SignedOut>
						<div className="mt-4 rounded border border-error bg-surface p-4 text-left text-sm">
							<div>&gt; Informações de Depuração:</div>
							<div>&gt; Hora: {new Date().toLocaleString()}</div>
							<div>&gt; Erro: {error?.message}</div>
							<div>&gt; Navegador: {navigator.userAgent}</div>
							<div>&gt; URL: {window.location.href}</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-terminal">
			<Navbar />
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h1 className="neon-glow mb-2 font-bold text-3xl text-neon">
								[NEWS TERMINAL]
							</h1>
							<p className="text-sm text-text-secondary">
								&gt; Monitoramento de notícias em tempo real
							</p>
						</div>
						<button
							onClick={() => refetch()}
							type="button"
							className="hover:glow-on-hover border border-primary bg-primary px-4 py-2 font-bold text-black transition-all hover:bg-primary-hover"
						>
							Atualizar
						</button>
					</div>

					{/* Pagination Controls */}
					<div className="mb-4 flex items-center gap-4">
						<div className="flex items-center gap-2">
							<label htmlFor="limit" className="text-sm text-text-secondary">
								Items por página:
							</label>
							<select
								id="limit"
								value={limit}
								onChange={(e) => setLimit(Number(e.target.value))}
								className="rounded border border-primary bg-surface px-2 py-1 text-sm"
							>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</div>

						<div className="flex gap-2">
							<button
								onClick={() => setOffset(Math.max(0, offset - limit))}
								disabled={offset === 0}
								type="button"
								className="rounded border border-primary bg-surface px-3 py-1 text-sm disabled:opacity-50"
							>
								Anterior
							</button>
							<span className="px-3 py-1 text-sm text-text-secondary">
								Página {Math.floor(offset / limit) + 1}
							</span>
							<button
								onClick={() => setOffset(offset + limit)}
								disabled={!pagination?.hasMore}
								type="button"
								className="rounded border border-primary bg-surface px-3 py-1 text-sm disabled:opacity-50"
							>
								Próxima
							</button>
						</div>
					</div>
				</div>

				{news.length === 0 ? (
					<div className="text-center text-text-muted">
						<div>&gt; Nenhuma notícia encontrada</div>
						<div>&gt; O sistema ainda está coletando dados...</div>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{news.map((item) => (
							<div
								key={item.id}
								className="hover:glow-on-hover rounded border border-primary bg-surface p-4 transition-all"
							>
								{/* Header with source and date */}
								<div className="mb-3 flex items-start justify-between">
									<span className="rounded bg-black/20 px-2 py-1 text-info text-xs">
										{item.source}
									</span>
									<span className="text-text-muted text-xs">
										{formatDate(item.publishedAt)}
									</span>
								</div>

								{/* Title and link */}
								<h2 className="mb-2 font-bold text-lg text-primary leading-tight">
									<a
										href={item.link}
										target="_blank"
										rel="noopener noreferrer"
										className="transition-colors hover:text-primary-hover"
									>
										{item.title}
									</a>
								</h2>

								{/* Insights */}
								{item.insights.length > 0 ? (
									<div className="space-y-2">
										{item.insights.map((insight) => (
											<div
												key={insight.id}
												className="rounded border-primary border-l-2 bg-black/10 p-2 text-sm text-text-secondary"
											>
												{insight.content}
											</div>
										))}
									</div>
								) : (
									<div className="text-text-muted text-xs italic">
										&gt; Processando insights...
									</div>
								)}
							</div>
						))}
					</div>
				)}

				{/* Footer info */}
				<div className="mt-12 text-center text-text-muted text-xs">
					<div>&gt; Mostrando {news.length} notícias</div>
					<div>
						&gt; Limite: {limit} | Offset: {offset}
					</div>
					<div>&gt; Sistema atualizado automaticamente a cada 30 minutos</div>
				</div>
			</main>
		</div>
	);
}
