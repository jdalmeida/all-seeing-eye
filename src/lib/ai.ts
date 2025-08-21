import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/env';

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);

export async function generateInsight(title: string, link: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Resuma a seguinte notícia em português em até 3 frases, e explique por que ela é relevante para tecnologia, startups ou investimentos:

Título: ${title}
Link: ${link}

Resposta:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    if (!content) {
      throw new Error('Failed to generate insight');
    }

    return content;
  } catch (error) {
    console.error('Error generating insight:', error);
    return `Erro ao gerar insight para: ${title}. Tente novamente mais tarde.`;
  }
}
