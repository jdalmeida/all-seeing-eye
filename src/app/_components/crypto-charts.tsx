"use client";

import type { CryptoData } from "@/lib/crypto";
import { getCryptoChart, getTopCryptos } from "@/lib/crypto";
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

interface CryptoWithChart extends CryptoData {
	chartData?: {
		prices: [number, number][];
		market_caps: [number, number][];
		total_volumes: [number, number][];
	} | null;
}

interface TimeFrame {
	label: string;
	days: number;
}

export function CryptoCharts() {
	const [cryptos, setCryptos] = useState<CryptoWithChart[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCrypto, setSelectedCrypto] = useState<string>("bitcoin");
	const [selectedTimeFrame, setSelectedTimeFrame] = useState<number>(7);
	const [isAutoRefresh, setIsAutoRefresh] = useState(true);

	const timeFrames: TimeFrame[] = [
		{ label: "24H", days: 1 },
		{ label: "7D", days: 7 },
		{ label: "30D", days: 30 },
		{ label: "90D", days: 90 },
	];

	useEffect(() => {
		// Carregar dados iniciais
		loadCryptoData();

		// Atualizar dados a cada 30 segundos se auto-refresh estiver ligado
		let interval: NodeJS.Timeout | null = null;
		if (isAutoRefresh) {
			interval = setInterval(() => {
				loadCryptoData();
			}, 30000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isAutoRefresh]);

	useEffect(() => {
		const loadChart = async () => {
			if (selectedCrypto) {
				await loadChartData(selectedCrypto, selectedTimeFrame);
			}
		};
		loadChart();
	}, [selectedCrypto, selectedTimeFrame]);

	const loadCryptoData = async () => {
		try {
			setLoading(true);
			const cryptoData = await getTopCryptos();
			setCryptos(cryptoData.map((crypto) => ({ ...crypto, chartData: null })));

			// Carregar dados do gráfico para a criptomoeda selecionada
			if (selectedCrypto) {
				await loadChartData(selectedCrypto, selectedTimeFrame);
			}
		} catch (error) {
			console.error("Erro ao carregar dados de criptomoedas:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadChartData = async (cryptoId: string, days: number) => {
		try {
			const chartData = await getCryptoChart(cryptoId, days);
			if (chartData?.prices?.length) {
				setCryptos((prev) =>
					prev.map((crypto) =>
						crypto.id === cryptoId ? { ...crypto, chartData } : crypto,
					),
				);
			} else {
				console.warn(
					`Dados do gráfico para ${cryptoId} estão vazios ou inválidos`,
				);
			}
		} catch (error) {
			console.error(`Erro ao carregar gráfico de ${cryptoId}:`, error);
			// Definir chartData como null em caso de erro
			setCryptos((prev) =>
				prev.map((crypto) =>
					crypto.id === cryptoId ? { ...crypto, chartData: null } : crypto,
				),
			);
		}
	};

	const formatChartData = (
		chartData: { prices?: [number, number][] } | null,
	) => {
		if (!chartData?.prices) return [];

		return chartData.prices.map((price: [number, number]) => ({
			timestamp: price[0],
			price: price[1],
		}));
	};

	const formatPrice = (value: number) => {
		if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
		if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
		return `$${value.toFixed(2)}`;
	};

	const formatCryptoPrice = (price: number) => {
		if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
		if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
		return `$${price.toFixed(2)}`;
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("pt-BR", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
		});
	};

	// Chart.js options for terminal theme
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(10, 10, 10, 0.9)",
				titleColor: "#00ff41",
				bodyColor: "#00ff41",
				borderColor: "#00cc33",
				borderWidth: 1,
				cornerRadius: 4,
				titleFont: {
					family: '"Courier New", "Monaco", "Menlo", monospace',
					size: 12,
				},
				bodyFont: {
					family: '"Courier New", "Monaco", "Menlo", monospace',
					size: 11,
				},
				callbacks: {
					title: (tooltipItems: Array<{ parsed?: { x?: number } }>) => {
						const x = tooltipItems[0]?.parsed?.x;
						return typeof x === "number" ? formatTimestamp(x) : "";
					},
					label: (context: { parsed: { y: number } }) => {
						return `$${context.parsed.y.toFixed(2)}`;
					},
				},
			},
		},
		scales: {
			x: {
				type: "linear" as const,
				display: true,
				grid: {
					color: "#2a2a2a",
				},
				ticks: {
					color: "#d1d5db",
					font: {
						family: '"Courier New", "Monaco", "Menlo", monospace',
						size: 10,
					},
				},
			},
			y: {
				display: true,
				grid: {
					color: "#2a2a2a",
				},
				ticks: {
					color: "#d1d5db",
					font: {
						family: '"Courier New", "Monaco", "Menlo", monospace',
						size: 10,
					},
					callback: (value: number | string) => {
						return formatPrice(
							typeof value === "string" ? Number.parseFloat(value) : value,
						);
					},
				},
			},
		},
		elements: {
			point: {
				radius: 3,
				hoverRadius: 6,
			},
		},
	};

	if (loading) {
		return (
			<div className="rounded-lg border border-primary bg-terminal p-4">
				<div className="text-center text-text-muted">
					<div className="animate-pulse">
						&gt; Carregando dados de criptomoedas...
					</div>
				</div>
			</div>
		);
	}

	const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);

	return (
		<div className="rounded-lg border border-primary bg-terminal p-4">
			<div className="mb-4">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="font-bold text-lg text-neon">&gt; CRYPTO_MONITOR</h2>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setIsAutoRefresh(!isAutoRefresh)}
							className={`rounded border px-2 py-1 text-xs transition-all ${
								isAutoRefresh
									? "border-green-500 bg-green-500 text-black"
									: "border-red-500 bg-red-500 text-black"
							}`}
							title={
								isAutoRefresh ? "Auto-refresh ligado" : "Auto-refresh desligado"
							}
						>
							{isAutoRefresh ? "↻" : "⏸"}
						</button>
						<button
							type="button"
							onClick={loadCryptoData}
							className="rounded border border-primary px-2 py-1 text-text-primary text-xs transition-all hover:bg-primary hover:text-black"
							title="Atualizar dados"
						>
							⟳
						</button>
					</div>
				</div>

				{/* Time Frame Selector */}
				<div className="mb-3 flex gap-1">
					{timeFrames.map((timeFrame) => (
						<button
							key={timeFrame.days}
							type="button"
							onClick={() => setSelectedTimeFrame(timeFrame.days)}
							className={`rounded border px-2 py-1 text-xs transition-all ${
								selectedTimeFrame === timeFrame.days
									? "border-primary bg-primary text-black"
									: "border-primary text-text-primary hover:bg-primary hover:text-black"
							}`}
						>
							{timeFrame.label}
						</button>
					))}
				</div>

				{/* Crypto Selector */}
				<div className="mb-4 flex flex-wrap gap-1">
					{cryptos.map((crypto) => (
						<button
							key={crypto.id}
							type="button"
							onClick={() => setSelectedCrypto(crypto.id)}
							onKeyDown={(e) =>
								e.key === "Enter" && setSelectedCrypto(crypto.id)
							}
							className={`rounded border border-primary px-2 py-1 text-xs transition-all ${
								selectedCrypto === crypto.id
									? "border-primary bg-primary text-black"
									: "border-primary bg-terminal text-text-primary hover:bg-primary hover:text-black"
							}`}
						>
							{crypto.symbol.toUpperCase()}
						</button>
					))}
				</div>
			</div>

			{/* Gráfico principal */}
			{selectedCryptoData && (
				<div className="mb-6">
					<div className="mb-2 flex items-center justify-between">
						<div>
							<h3 className="font-bold text-text-primary">
								{selectedCryptoData.name} (
								{selectedCryptoData.symbol.toUpperCase()})
							</h3>
							<div className="font-bold text-lg text-neon">
								$
								{selectedCryptoData.current_price.toLocaleString("pt-BR", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</div>
						</div>
						<div className="text-right">
							<div
								className={`text-sm ${
									selectedCryptoData.price_change_percentage_24h >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{selectedCryptoData.price_change_percentage_24h >= 0
									? "↗"
									: "↘"}
								{Math.abs(
									selectedCryptoData.price_change_percentage_24h,
								).toFixed(2)}
								%
							</div>
							<div className="text-text-muted text-xs">24h</div>
						</div>
					</div>

					{selectedCryptoData.chartData &&
						selectedCryptoData.chartData.prices.length > 0 && (
							<div className="h-64">
								<Line
									data={{
										labels: selectedCryptoData.chartData.prices.map((price) =>
											new Date(price[0]).toLocaleString("pt-BR", {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											}),
										),
										datasets: [
											{
												label: `${selectedCryptoData.name} (${selectedCryptoData.symbol.toUpperCase()})`,
												data: selectedCryptoData.chartData.prices.map(
													(price) => price[1],
												),
												borderColor: "#00ff41",
												backgroundColor: "rgba(0, 255, 65, 0.1)",
												borderWidth: 2,
												pointBackgroundColor: "#00ff41",
												pointBorderColor: "#00ff41",
												pointRadius: 3,
												pointHoverRadius: 6,
												fill: false,
												tension: 0.1,
											},
										],
									}}
									options={chartOptions}
								/>
							</div>
						)}

					{selectedCryptoData.chartData &&
						selectedCryptoData.chartData.prices.length === 0 && (
							<div className="flex h-64 items-center justify-center rounded border border-primary">
								<div className="text-center text-text-muted">
									<div>&gt; Carregando dados do gráfico...</div>
								</div>
							</div>
						)}

					{!selectedCryptoData.chartData && (
						<div className="flex h-64 items-center justify-center rounded border border-primary">
							<div className="text-center text-text-muted">
								<div>&gt; Selecione uma criptomoeda para ver o gráfico</div>
								<div>&gt; Dados não disponíveis</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Lista de criptomoedas */}
			<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
				{cryptos.map((crypto) => (
					<button
						key={crypto.id}
						type="button"
						className={`cursor-pointer rounded border border-primary p-2 transition-all ${
							selectedCrypto === crypto.id
								? "border-primary bg-primary bg-opacity-10"
								: "border-primary hover:border-primary"
						}`}
						onClick={() => setSelectedCrypto(crypto.id)}
						onKeyDown={(e) => e.key === "Enter" && setSelectedCrypto(crypto.id)}
					>
						<div className="mb-1 flex items-center justify-between">
							<span className="mr-1 flex-1 truncate font-bold text-text-primary text-xs">
								{crypto.symbol.toUpperCase()}
							</span>
							<span
								className={`flex-shrink-0 text-xs ${
									crypto.price_change_percentage_24h >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{crypto.price_change_percentage_24h >= 0 ? "↗" : "↘"}
							</span>
						</div>
						<div className="mb-1 truncate font-bold text-neon text-sm">
							{formatCryptoPrice(crypto.current_price)}
						</div>
						<div
							className={`text-xs ${
								crypto.price_change_percentage_24h >= 0
									? "text-green-400"
									: "text-red-400"
							}`}
						>
							{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
						</div>
					</button>
				))}
			</div>

			<div className="mt-4 space-y-1 text-text-muted text-xs">
				<div>&gt; Auto-refresh: {isAutoRefresh ? "LIGADO" : "DESLIGADO"}</div>
				<div>
					&gt; Timeframe:{" "}
					{timeFrames.find((tf) => tf.days === selectedTimeFrame)?.label}
				</div>
				<div>&gt; Status: {loading ? "CARREGANDO..." : "ATUALIZADO"}</div>
			</div>
		</div>
	);
}
