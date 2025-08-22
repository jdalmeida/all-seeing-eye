"use client";

import { useState } from "react";
import { Navbar } from "@/app/_components/navbar";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "@/trpc/react";

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
                  className="px-4 py-2 bg-primary text-black font-bold border border-primary hover:bg-primary-hover hover:glow-on-hover transition-all"
                >
                  Tentar Novamente
                </button>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="mt-4">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-primary text-black font-bold border border-primary hover:bg-primary-hover hover:glow-on-hover transition-all">
                    Fazer Login
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
            <div className="mt-4 p-4 bg-surface border border-error rounded text-left text-sm">
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neon neon-glow mb-2">
                [NEWS TERMINAL]
              </h1>
              <p className="text-text-secondary text-sm">
                &gt; Monitoramento de notícias em tempo real
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-black font-bold border border-primary hover:bg-primary-hover hover:glow-on-hover transition-all"
            >
              Atualizar
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-text-secondary">
                Items por página:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-surface border border-primary rounded px-2 py-1 text-sm"
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
                className="px-3 py-1 bg-surface border border-primary rounded disabled:opacity-50 text-sm"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-text-secondary">
                Página {Math.floor(offset / limit) + 1}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={!pagination?.hasMore}
                className="px-3 py-1 bg-surface border border-primary rounded disabled:opacity-50 text-sm"
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
                className="bg-surface border border-primary rounded p-4 hover:glow-on-hover transition-all"
              >
                {/* Header with source and date */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-info bg-black/20 px-2 py-1 rounded">
                    {item.source}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDate(item.publishedAt)}
                  </span>
                </div>

                {/* Title and link */}
                <h2 className="text-lg font-bold text-primary mb-2 leading-tight">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-hover transition-colors"
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
                        className="text-sm text-text-secondary bg-black/10 p-2 rounded border-l-2 border-primary"
                      >
                        {insight.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted italic">
                    &gt; Processando insights...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-text-muted">
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
