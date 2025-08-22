"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, ExternalLink } from "lucide-react";
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface NewsInsightModalProps {
  newsItem: NewsItem;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsInsightModal({ newsItem, isOpen, onClose }: NewsInsightModalProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

          try {
        // Chamar API route para evitar problemas com variáveis de ambiente do lado cliente
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputMessage,
            context: {
              news: [{
                title: newsItem.title,
                source: newsItem.source,
                publishedAt: newsItem.publishedAt.toISOString(),
                insights: newsItem.insights
              }],
              type: 'news-modal'
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get chat response');
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-terminal border border-primary rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary">
          <div>
            <h2 className="text-xl font-bold text-neon neon-glow">
              [NEWS TERMINAL - {newsItem.source}]
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {newsItem.title.length > 60
                ? newsItem.title.substring(0, 60) + "..."
                : newsItem.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary">
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === "insights"
                ? "bg-primary text-black"
                : "text-text-secondary hover:bg-primary/10"
            }`}
          >
            [INSIGHTS]
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === "chat"
                ? "bg-primary text-black"
                : "text-text-secondary hover:bg-primary/10"
            }`}
          >
            [CHATBOT]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "insights" && (
            <div className="h-full p-6 overflow-y-auto">
              {/* News Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-neon neon-glow">
                    [DETALHES DA NOTÍCIA]
                  </h3>
                  <a
                    href={newsItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-black font-bold rounded hover:bg-primary-hover transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    VER ORIGINAL
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="bg-surface border border-primary rounded p-4">
                    <div className="text-sm text-text-secondary mb-2">[TÍTULO]</div>
                    <div className="text-primary font-bold">{newsItem.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface border border-primary rounded p-4">
                      <div className="text-sm text-text-secondary mb-2">[FONTE]</div>
                      <div className="text-info font-bold">{newsItem.source}</div>
                    </div>
                    <div className="bg-surface border border-primary rounded p-4">
                      <div className="text-sm text-text-secondary mb-2">[DATA]</div>
                      <div className="text-text-primary font-bold">
                        {formatDate(newsItem.publishedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-lg font-bold text-neon neon-glow mb-4">
                  [INSIGHTS GERADOS]
                </h3>

                {newsItem.insights.length > 0 ? (
                  <div className="space-y-4">
                    {newsItem.insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="bg-surface border border-primary rounded p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-text-secondary">
                            GERADO EM: {formatDate(insight.createdAt)}
                          </span>
                          <span className="text-xs text-info bg-black/20 px-2 py-1 rounded">
                            IA-ANALYSIS
                          </span>
                        </div>
                        <div className="text-text-primary leading-relaxed">
                          {insight.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface border border-error rounded p-4 text-center">
                    <div className="text-error mb-2">[SEM INSIGHTS]</div>
                    <div className="text-sm text-text-secondary">
                      O sistema ainda está processando esta notícia para gerar insights personalizados.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-text-secondary mt-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div className="mb-2">[CHATBOT ATIVO]</div>
                    <div className="text-sm">
                      Faça perguntas sobre esta notícia. Posso ajudar com resumos, análises e contexto.
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-black"
                          : "bg-surface border border-primary"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-text-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                    <div className="bg-surface border border-primary rounded-lg p-3">
                      <div className="text-sm text-text-secondary">
                        Processando sua mensagem...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-primary">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-surface border border-primary rounded px-3 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
