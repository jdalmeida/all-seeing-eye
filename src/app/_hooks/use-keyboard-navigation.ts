import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useKeyboardNavigation() {
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore se estiver digitando em um input ou textarea
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Ctrl+G - Ir para página inicial
			if (e.ctrlKey && e.key === "g") {
				e.preventDefault();
				router.push("/");
			}

			// Ctrl+N - Ir para notícias
			if (e.ctrlKey && e.key === "n") {
				e.preventDefault();
				router.push("/news");
			}

			// Ctrl+H - Ir para ajuda (página inicial com terminal expandido)
			if (e.ctrlKey && e.key === "h") {
				e.preventDefault();
				router.push("/");
				// Disparar evento para expandir terminal
				window.dispatchEvent(new CustomEvent("expand-terminal"));
			}

			// F1 - Ajuda rápida
			if (e.key === "F1") {
				e.preventDefault();
				showQuickHelp();
			}

			// Escape - Voltar à página anterior
			if (e.key === "Escape") {
				e.preventDefault();
				if (window.history.length > 1) {
					router.back();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [router]);
}

function showQuickHelp() {
	const helpMessage = `
┌─[ATALHOS DE TECLADO]─────────────────────────────┐
│ Ctrl+G    - Página inicial                          │
│ Ctrl+N    - Página de notícias                      │
│ Ctrl+H    - Ajuda (terminal expandido)             │
│ Ctrl+T    - Colapsar/expandir terminal             │
│ F1        - Esta ajuda                             │
│ Escape    - Voltar                                 │
│ Tab       - Auto-complete (no terminal)            │
│ ↑↓        - Navegar histórico (no terminal)        │
└─────────────────────────────────────────────────────┘
`;

	// Criar um modal temporário ou usar notificação
	const notification = document.createElement("div");
	notification.className =
		"fixed top-4 right-4 bg-terminal border border-primary rounded-lg p-4 z-50 max-w-md font-mono text-sm";
	notification.innerHTML = `<div class="whitespace-pre text-text-primary">${helpMessage}</div>`;

	document.body.appendChild(notification);

	setTimeout(() => {
		if (notification.parentNode) {
			notification.parentNode.removeChild(notification);
		}
	}, 5000);
}

// Hook para escutar eventos customizados do terminal
export function useTerminalEvents(onExpand?: () => void) {
	useEffect(() => {
		const handleExpandTerminal = () => {
			onExpand?.();
		};

		window.addEventListener("expand-terminal", handleExpandTerminal);
		return () =>
			window.removeEventListener("expand-terminal", handleExpandTerminal);
	}, [onExpand]);
}
