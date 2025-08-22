import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);

export async function generateInsight(
	title: string,
	link: string,
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const prompt = `Resuma a seguinte notícia em português em até 3 frases, e explique por que ela é relevante para tecnologia, startups ou investimentos:

Título: ${title}
Link: ${link}

Resposta:`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const content = response.text().trim();

		if (!content) {
			throw new Error("Failed to generate insight");
		}

		return content;
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
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

		const result = await model.generateContent(systemPrompt);
		const response = await result.response;
		const content = response.text().trim();

		if (!content) {
			throw new Error("Failed to generate response");
		}

		return content;
	} catch (error) {
		console.error("Error generating chat response:", error);
		return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
	}
}
