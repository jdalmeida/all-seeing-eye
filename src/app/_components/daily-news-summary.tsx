"use client";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

interface NewsSummary {
	id: string;
	title: string;
	source: string;
	publishedAt: Date;
	insights: {
		id: number;
		content: string;
		createdAt: Date;
	}[];
}

export function DailyNewsSummary() {
	const [todayNews, setTodayNews] = useState<NewsSummary[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [lastUpdate, setLastUpdate] = useState(new Date());

	// Buscar notícias do dia
	const { data: newsData, isLoading } = api.news.getAll.useQuery({
		limit: 20,
		offset: 0,
	});

	// Atualizar automaticamente a cada 5 minutos
	useEffect(() => {
		const interval = setInterval(
			() => {
				setLastUpdate(new Date());
			},
			5 * 60 * 1000,
		); // 5 minutos

		return () => clearInterval(interval);
	}, []);

	// Filtrar notícias do dia atual
	useEffect(() => {
		if (newsData?.success && newsData.data) {
			const today = new Date();
			const todayStart = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
			);
			const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

			const filteredNews = newsData.data.filter((news) => {
				const newsDate = new Date(news.publishedAt);
				return newsDate >= todayStart && newsDate < todayEnd;
			});

			// Ordenar por data de publicação (mais recentes primeiro)
			const sortedNews = filteredNews.sort(
				(a, b) =>
					new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
			);

			setTodayNews(sortedNews.slice(0, 5)); // Limitar a 5 notícias principais
		}
	}, [newsData]);

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getSourceIcon = (source: string) => {
		const sourceLower = source.toLowerCase();
		if (sourceLower.includes("globo") || sourceLower.includes("g1"))
			return "🌐";
		if (sourceLower.includes("uol")) return "📰";
		if (sourceLower.includes("estadão")) return "📊";
		if (sourceLower.includes("folha")) return "📄";
		if (sourceLower.includes("cnn")) return "📺";
		if (sourceLower.includes("bbc")) return "🌍";
		return "📡";
	};

	const isRecentNews = (date: Date) => {
		const now = new Date();
		const newsDate = new Date(date);
		const diffInMinutes = (now.getTime() - newsDate.getTime()) / (1000 * 60);
		return diffInMinutes <= 30; // Notícias dos últimos 30 minutos
	};

	if (isLoading) {
		return (
			<div className="rounded border border-primary/40 bg-black/60 p-4 backdrop-blur-sm">
				<div className="mb-2 text-text-secondary text-xs">📊 RESUMO DIÁRIO</div>
				<div className="text-sm text-text-muted">Carregando notícias...</div>
			</div>
		);
	}

	if (todayNews.length === 0) {
		return (
			<div className="rounded border border-primary/40 bg-black/60 p-4 backdrop-blur-sm">
				<div className="mb-2 text-text-secondary text-xs">📊 RESUMO DIÁRIO</div>
				<div className="text-sm text-text-muted">Nenhuma notícia hoje</div>
				<div className="mt-1 text-text-muted text-xs">
					As notícias aparecerão aqui automaticamente
				</div>
			</div>
		);
	}

	return (
		<div className="rounded border border-primary/40 bg-black/60 p-4 backdrop-blur-sm">
			{/* Cabeçalho */}
			<div className="mb-3 flex items-center justify-between">
				<div className="text-text-secondary text-xs">📊 RESUMO DIÁRIO</div>
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="text-text-muted text-xs transition-colors hover:text-primary"
				>
					{isExpanded ? "[-]" : "[+]"}
				</button>
			</div>

			{/* Estatísticas rápidas */}
			<div className="mb-3 grid grid-cols-2 gap-2 text-xs">
				<div className="text-text-muted">
					<span className="text-primary">{todayNews.length}</span> notícias
				</div>
				<div className="text-text-muted">
					<span className="text-primary">
						{todayNews.filter((n) => n.insights.length > 0).length}
					</span>{" "}
					com insights
				</div>
			</div>

			{/* Lista de notícias */}
			<div className="space-y-2">
				{todayNews
					.slice(0, isExpanded ? todayNews.length : 3)
					.map((news, index) => (
						<div
							key={news.id}
							className="border-primary/30 border-l-2 bg-black/30 p-2 text-xs"
						>
							<div className="flex items-start gap-2">
								<span className="text-lg text-primary">
									{getSourceIcon(news.source)}
								</span>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<div className="line-clamp-2 flex-1 font-medium text-text-primary">
											{news.title}
										</div>
										{isRecentNews(news.publishedAt) && (
											<span className="animate-pulse font-bold text-red-500 text-xs">
												● AO VIVO
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-text-muted">
										<span className="text-xs">{news.source}</span>
										<span className="text-xs">•</span>
										<span className="text-xs">
											{formatTime(news.publishedAt)}
										</span>
										{news.insights.length > 0 && (
											<>
												<span className="text-xs">•</span>
												<span className="text-primary text-xs">
													💡 {news.insights.length} insight
													{news.insights.length > 1 ? "s" : ""}
												</span>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
			</div>

			{/* Indicador de mais notícias */}
			{todayNews.length > 3 && !isExpanded && (
				<div className="mt-2 text-center">
					<button
						type="button"
						onClick={() => setIsExpanded(true)}
						className="text-text-muted text-xs transition-colors hover:text-primary"
					>
						... e mais {todayNews.length - 3} notícias
					</button>
				</div>
			)}

			{/* Footer com timestamp */}
			<div className="mt-3 border-primary/20 border-t pt-2 text-center text-text-muted text-xs">
				Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
			</div>
		</div>
	);
}
