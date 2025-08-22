import type { ParsedAlertRule } from "./types";

// Parser simples baseado em regex para PT-BR. Pode ser evoluído depois com IA.
export function parseNaturalLanguageRule(text: string): ParsedAlertRule | null {
  const normalized = text.trim().toLowerCase();

  // "Me avise se BTC cair mais de 5% em 1h"
  const cryptoDrop = normalized.match(/(btc|eth|sol|ada|dot|link|bnb)\s+(cair|queda|cair\s+mais)\s+(de\s+)?(\d+)[%％]\s+em\s+(\d+)h/);
  if (cryptoDrop) {
    const symbol = cryptoDrop[1] ?? "";
    const percent = Number(cryptoDrop[4] ?? 0);
    const timeframeHours = Number(cryptoDrop[5] ?? 0);
    return {
      ruleType: "crypto",
      params: {
        kind: "crypto_drop_percent",
        symbol,
        percent,
        timeframeHours,
      },
    };
  }

  // "Me avise se NVIDIA aparecer em mais de 3 fontes no mesmo dia"
  const newsMulti = normalized.match(/(\w[\w\s\-\.]+)\s+aparecer\s+em\s+mais\s+de\s+(\d+)\s+fontes\s+no\s+mesmo\s+dia/);
  if (newsMulti) {
    const keyword = (newsMulti[1] ?? "").trim();
    const minSources = Number(newsMulti[2] ?? 0);
    return {
      ruleType: "news",
      params: {
        kind: "news_multi_source",
        keyword,
        minSources,
        window: "same_day",
      },
    };
  }

  return null;
}


