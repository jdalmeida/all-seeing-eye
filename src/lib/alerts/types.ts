export type AlertRuleType = "crypto" | "news";

export interface BaseAlertRuleParams {
  kind: string;
}

// Ex.: "Me avise se BTC cair mais de 5% em 1h"
export interface CryptoDropPercentParams extends BaseAlertRuleParams {
  kind: "crypto_drop_percent";
  symbol: string; // e.g., btc
  percent: number; // e.g., 5
  timeframeHours: number; // e.g., 1
}

// Ex.: "Me avise se NVIDIA aparecer em mais de 3 fontes no mesmo dia"
export interface NewsMultiSourceParams extends BaseAlertRuleParams {
  kind: "news_multi_source";
  keyword: string; // e.g., NVIDIA
  minSources: number; // e.g., 3
  window: "same_day" | "24h";
}

export type AnyAlertParams = CryptoDropPercentParams | NewsMultiSourceParams;

export interface ParsedAlertRule {
  ruleType: AlertRuleType;
  params: AnyAlertParams;
}


