import { db } from "@/server/db";
import { alertEvents, alertRules, news } from "@/server/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import type { ParsedAlertRule } from "./types";
import { getCryptoChart } from "@/lib/crypto";

// Avalia regras ativas e gera eventos quando necessário
export async function evaluateAlertRules(): Promise<number> {
  const activeRules = await db.select().from(alertRules).where(eq(alertRules.active, true));
  let triggers = 0;

  for (const rule of activeRules) {
    try {
      const parsed = rule.params as ParsedAlertRule["params"] | undefined;
      if (rule.ruleType === "crypto" && parsed?.kind === "crypto_drop_percent") {
        const symbol = String(parsed.symbol).toLowerCase();
        const hours = Number(parsed.timeframeHours);
        // map simples id coingecko
        const symbolToId: Record<string, string> = { btc: "bitcoin", eth: "ethereum", sol: "solana", ada: "cardano", dot: "polkadot", link: "chainlink", bnb: "binancecoin" };
        const cryptoId = symbolToId[symbol] ?? symbol;
        const days = Math.max(1, Math.ceil(hours / 24));
        const chart = await getCryptoChart(cryptoId, days);
        if (!chart?.prices?.length) continue;
        const now = Date.now();
        const cutoffMs = now - hours * 60 * 60 * 1000;
        const recent = chart.prices.filter(([ts]) => ts >= cutoffMs);
        if (recent.length < 2) continue;
        const startPrice = recent[0][1];
        const endPrice = recent[recent.length - 1][1];
        const changePct = ((endPrice - startPrice) / startPrice) * 100;
        if (changePct <= -Number(parsed.percent)) {
          await db.insert(alertEvents).values({
            ruleId: Number(rule.id),
            context: `${symbol.toUpperCase()} ${hours}h`,
            message: `ALERTA: ${symbol.toUpperCase()} caiu ${changePct.toFixed(2)}% nas últimas ${hours}h (limite ${parsed.percent}%)`,
          });
          triggers++;
        }
      }

      if (rule.ruleType === "news" && parsed?.kind === "news_multi_source") {
        const keyword = String(parsed.keyword).toLowerCase();
        const since = new Date();
        since.setHours(0, 0, 0, 0);
        const rows = await db
          .select({ id: news.id, source: news.source, title: news.title })
          .from(news)
          .where(and(gte(news.publishedAt, since)))
          .orderBy(desc(news.publishedAt));
        const bySource = new Set<string>();
        for (const row of rows) {
          if (row.title.toLowerCase().includes(keyword)) {
            bySource.add(row.source);
          }
        }
        if (bySource.size >= Number(parsed.minSources)) {
          await db.insert(alertEvents).values({
            ruleId: Number(rule.id),
            message: `ALERTA: "${parsed.keyword}" em ${bySource.size} fontes hoje (limite ${parsed.minSources})`,
          });
          triggers++;
        }
      }
    } catch (e) {
      // evita travar o loop por erro de uma regra
      // log silencioso
      console.error("Erro ao avaliar regra", rule.id, e);
    }
  }
  return triggers;
}


