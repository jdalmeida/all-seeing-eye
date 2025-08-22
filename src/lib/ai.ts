import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);

// Interface para padronizar as respostas dos diferentes provedores
interface AIResponse {
	content: string;
	provider: "gemini" | "azure";
}

// Função para gerar resposta usando Gemini
async function generateWithGemini(prompt: string): Promise<AIResponse> {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const content = response.text().trim();

		if (!content) {
			throw new Error("Failed to generate content with Gemini");
		}

		return { content, provider: "gemini" as const };
	} catch (error) {
		console.error("Error with Gemini:", error);
		throw error;
	}
}

// Função para gerar resposta usando Azure AI Foundry
async function generateWithAzure(prompt: string): Promise<AIResponse> {
	try {
		if (
			!env.AZURE_AI_ENDPOINT ||
			!env.AZURE_AI_API_KEY ||
			!env.AZURE_AI_DEPLOYMENT_NAME
		) {
			throw new Error("Azure AI configuration not available");
		}

		const response = await fetch(
			`${env.AZURE_AI_ENDPOINT}/openai/deployments/${env.AZURE_AI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"api-key": env.AZURE_AI_API_KEY,
				},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content:
								"Você é um assistente de IA especializado em análise de notícias e tecnologia. Responda sempre em português brasileiro.",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 1000,
					temperature: 0.7,
					top_p: 0.95,
					frequency_penalty: 0,
					presence_penalty: 0,
					stop: null,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`Azure AI request failed: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content?.trim();

		if (!content) {
			throw new Error("Failed to generate content with Azure AI");
		}

		return { content, provider: "azure" as const };
	} catch (error) {
		console.error("Error with Azure AI:", error);
		throw error;
	}
}

// Função principal com fallback
async function generateWithFallback(prompt: string): Promise<AIResponse> {
	try {
		// Primeiro tenta com Gemini
		return await generateWithGemini(prompt);
	} catch (error) {
		console.log("Gemini failed, trying Azure AI as fallback...");
		try {
			// Se Gemini falhar, tenta com Azure AI
			return await generateWithAzure(prompt);
		} catch (azureError) {
			console.error("Both AI providers failed:", {
				gemini: error,
				azure: azureError,
			});
			throw new Error("Todos os provedores de IA falharam");
		}
	}
}

export async function generateInsight(
	title: string,
	link: string,
): Promise<string> {
	try {
		const prompt = `Resuma a seguinte notícia em português em até 3 frases, e explique por que ela é relevante para tecnologia, startups ou investimentos:

Título: ${title}
Link: ${link}

Resposta:`;

		const result = await generateWithFallback(prompt);
		console.log(`Insight gerado usando: ${result.provider}`);
		return result.content;
	} catch (error) {
		console.error("Error generating insight:", error);
		return `Erro ao gerar insight para: ${title}. Tente novamente mais tarde.`;
	}
}

export async function generateChatResponse(
	message: string,
	context?: {
		news?: Array<{
			title: string;
			source: string;
			publishedAt: string;
			insights?: Array<{ content: string }>;
		}>;
		type: "news-modal" | "terminal-cli";
	},
): Promise<string> {
	try {
		let systemPrompt = "";

		if (context?.type === "news-modal" && context.news) {
			// Contexto específico para o modal de notícias
			const newsContext = context.news
				.map(
					(news, index) => `
Notícia ${index + 1}:
- Título: ${news.title}
- Fonte: ${news.source}
- Data: ${new Date(news.publishedAt).toLocaleDateString("pt-BR")}
- Insights: ${news.insights?.map((i) => i.content).join("; ") || "Nenhum disponível"}
      `,
				)
				.join("\n");

			systemPrompt = `Você é um assistente especializado em análise de notícias e tecnologia. Você está conversando sobre notícias específicas no contexto do sistema ALL-SEEING EYE.

Contexto das notícias disponíveis:
${newsContext}

Instruções:
- Responda sempre em português brasileiro
- Seja informativo e preciso
- Foque em aspectos tecnológicos e de impacto das notícias
- Mantenha um tom profissional mas acessível
- Se não souber algo específico, diga claramente
- Use dados contextuais das notícias quando relevante

Mensagem do usuário: ${message}`;
		} else if (context?.type === "terminal-cli" && context.news) {
			// Contexto para o terminal CLI
			const newsSummary = context.news
				.map(
					(news, index) => `
[${index + 1}] ${news.title.substring(0, 50)}${news.title.length > 50 ? "..." : ""} - ${news.source}`,
				)
				.join("\n");

			systemPrompt = `Você é o assistente de IA do sistema ALL-SEEING EYE, respondendo através de um terminal CLI.

Contexto do sistema:
- Sistema de monitoramento de notícias em tempo real
- Foco em tecnologia, startups e investimentos
- Interface de linha de comando estilo terminal

Notícias disponíveis no sistema:
${newsSummary}

Total de notícias: ${context.news.length}

Instruções para respostas:
- Mantenha o formato de resposta adequado para terminal (texto simples)
- Seja conciso mas informativo
- Use português brasileiro
- Inclua dados específicos quando perguntado
- Formate listas e informações de forma clara para terminal
- Evite formatação markdown complexa

Comando do usuário: ${message}`;
		} else {
			// Contexto genérico
			systemPrompt = `Você é o assistente de IA do sistema ALL-SEEING EYE, um sistema de monitoramento de notícias focado em tecnologia e inovação.

Responda à seguinte mensagem de forma útil e informativa: ${message}`;
		}

		const result = await generateWithFallback(systemPrompt);
		console.log(`Resposta de chat gerada usando: ${result.provider}`);
		return result.content;
	} catch (error) {
		console.error("Error generating chat response:", error);
		return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
	}
}
