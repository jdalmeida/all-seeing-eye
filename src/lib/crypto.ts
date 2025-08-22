import axios from "axios";

export interface CryptoData {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	market_cap: number;
	market_cap_rank: number;
	fully_diluted_valuation: number;
	total_volume: number;
	high_24h: number;
	low_24h: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	circulating_supply: number;
	total_supply: number;
	max_supply: number;
	ath: number;
	ath_change_percentage: number;
	ath_date: string;
	atl: number;
	atl_change_percentage: number;
	atl_date: string;
	roi: null;
	last_updated: string;
	sparkline_in_7d?: {
		price: number[];
	};
}

export interface ChartData {
	prices: [number, number][]; // [timestamp, price]
	market_caps: [number, number][];
	total_volumes: [number, number][];
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Lista das principais criptomoedas para monitorar
const TOP_CRYPTOS = [
	"bitcoin",
	"ethereum",
	"binancecoin",
	"solana",
	"cardano",
	"polkadot",
	"chainlink",
	"polygon-ecosystem-token",
];

export async function getTopCryptos(): Promise<CryptoData[]> {
	try {
		const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
			params: {
				vs_currency: "usd",
				ids: TOP_CRYPTOS.join(","),
				order: "market_cap_desc",
				per_page: 8,
				page: 1,
				sparkline: true,
				price_change_percentage: "24h,7d",
			},
		});
		return response.data;
	} catch (error) {
		console.error("Erro ao buscar dados de criptomoedas:", error);
		return [];
	}
}

export async function getCryptoChart(
	cryptoId: string,
	days = 7,
): Promise<ChartData | null> {
	try {
		const response = await axios.get(
			`${COINGECKO_API}/coins/${cryptoId}/market_chart`,
			{
				params: {
					vs_currency: "usd",
					days: days,
					interval: days > 90 ? "daily" : "hourly",
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error(`Erro ao buscar gráfico de ${cryptoId}:`, error);
		return null;
	}
}

export async function getCryptoDetails(
	cryptoId: string,
): Promise<CryptoData | null> {
	try {
		const response = await axios.get(`${COINGECKO_API}/coins/${cryptoId}`, {
			params: {
				localization: false,
				tickers: false,
				market_data: true,
				community_data: false,
				developer_data: false,
				sparkline: true,
			},
		});
		return response.data;
	} catch (error) {
		console.error(`Erro ao buscar detalhes de ${cryptoId}:`, error);
		return null;
	}
}
