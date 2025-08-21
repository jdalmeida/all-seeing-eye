'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/app/_components/navbar';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  createdAt: string;
  insights: {
    id: string;
    content: string;
    createdAt: string;
  }[];
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <div>&gt; ERRO: {error}</div>
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
            <h1 className="text-3xl font-bold text-neon neon-glow mb-2">
              [NEWS TERMINAL]
            </h1>
            <p className="text-text-secondary text-sm">
              &gt; Monitoramento de notícias em tempo real
            </p>
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
            <div>&gt; Total de notícias: {news.length}</div>
            <div>&gt; Sistema atualizado automaticamente a cada 30 minutos</div>
          </div>
        </main>
      </div>
  );
}
