"use client";

import { Coins, Maximize2, MessageSquare, Minimize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AIChat } from "./ai-chat";
import { CryptoCharts } from "./crypto-charts";

export type SidebarMode = "chat" | "crypto" | "none";

interface RightSidebarProps {
	defaultMode?: SidebarMode;
}

export function RightSidebar({ defaultMode = "none" }: RightSidebarProps) {
	const [activeMode, setActiveMode] = useState<SidebarMode>(defaultMode);
	const [isExpanded, setIsExpanded] = useState(true);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.altKey) {
				switch (event.key.toLowerCase()) {
					case "t":
						event.preventDefault();
						handleModeChange("chat");
						break;
					case "c":
						event.preventDefault();
						handleModeChange("crypto");
						break;
					case "x":
						event.preventDefault();
						setActiveMode("none");
						break;
					case "m":
						event.preventDefault();
						toggleExpanded();
						break;
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleModeChange = (mode: SidebarMode) => {
		if (mode === activeMode) {
			setActiveMode("none");
		} else {
			setActiveMode(mode);
		}
	};

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	const isCollapsed = activeMode === "none" || !isExpanded;

	return (
		<div className="fixed top-0 right-0 z-50 flex h-screen">
			{/* Sidebar Content */}
			<div
				className={`flex flex-col border-primary border-l bg-terminal transition-all duration-300 ${
					isCollapsed
						? "w-0 opacity-0"
						: activeMode === "chat"
							? "w-[90dvw] opacity-100"
							: "w-96 opacity-100"
				}`}
			>
				{activeMode === "chat" && (
					<div className="flex flex-1 flex-col">
						<div className="flex items-center justify-between border-primary border-b p-3">
							<h2 className="font-bold text-neon text-sm">&gt; AI CHAT</h2>
							<button
								type="button"
								onClick={toggleExpanded}
								className="text-text-muted transition-colors hover:text-neon"
								aria-label={isExpanded ? "Minimizar chat" : "Expandir chat"}
							>
								{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
							</button>
						</div>
						<div className="flex-1">
							<AIChat isSidebar={true} />
						</div>
					</div>
				)}

				{activeMode === "crypto" && (
					<div className="flex flex-1 flex-col">
						<div className="flex items-center justify-between border-primary border-b p-3">
							<h2 className="font-bold text-neon text-sm">
								&gt; CRYPTO_MONITOR
							</h2>
							<button
								type="button"
								onClick={toggleExpanded}
								className="text-text-muted transition-colors hover:text-neon"
								aria-label={
									isExpanded
										? "Minimizar crypto monitor"
										: "Expandir crypto monitor"
								}
							>
								{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
							</button>
						</div>
						<div className="flex-1 overflow-y-auto">
							<CryptoCharts />
						</div>
					</div>
				)}
			</div>

			{/* Control Panel */}
			<div className="flex flex-col gap-2 border-primary border-l bg-terminal p-2">
				<button
					type="button"
					onClick={() => handleModeChange("chat")}
					className={`rounded p-2 transition-all ${
						activeMode === "chat"
							? "bg-primary text-black"
							: "text-text-muted hover:bg-primary hover:bg-opacity-20 hover:text-neon"
					}`}
					aria-label="AI Chat"
					title="AI Chat (Alt+T)"
				>
					<MessageSquare size={20} />
				</button>

				<button
					type="button"
					onClick={() => handleModeChange("crypto")}
					className={`rounded p-2 transition-all ${
						activeMode === "crypto"
							? "bg-primary text-black"
							: "text-text-muted hover:bg-primary hover:bg-opacity-20 hover:text-neon"
					}`}
					aria-label="Crypto Monitor"
					title="Crypto Monitor (Alt+C)"
				>
					<Coins size={20} />
				</button>

				<button
					type="button"
					onClick={() => setActiveMode("none")}
					className={`rounded p-2 transition-all ${
						activeMode === "none"
							? "bg-red-500 text-black"
							: "text-text-muted hover:bg-red-500 hover:bg-opacity-20 hover:text-red-400"
					}`}
					aria-label="Fechar sidebar"
					title="Fechar (Alt+X)"
				>
					<X size={20} />
				</button>

				{activeMode !== "none" && (
					<button
						type="button"
						onClick={toggleExpanded}
						className="rounded p-2 text-text-muted transition-all hover:bg-primary hover:bg-opacity-20 hover:text-neon"
						aria-label={isExpanded ? "Minimizar" : "Expandir"}
						title={isExpanded ? "Minimizar (Alt+M)" : "Expandir (Alt+M)"}
					>
						{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
					</button>
				)}
			</div>

			{/* Collapsed Indicator */}
			{isCollapsed && activeMode !== "none" && (
				<div className="absolute top-4 right-12 rounded border border-primary bg-terminal px-2 py-1">
					<span className="text-text-muted text-xs">
						{activeMode === "chat" ? "Chat minimizado" : "Crypto minimizado"}
					</span>
				</div>
			)}
		</div>
	);
}
