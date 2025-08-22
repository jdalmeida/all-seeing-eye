"use client";

import { api } from "@/trpc/react";
import { Float, Html, Line, Sphere, Text } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { type JSX, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import { NewsInsightModal } from "./news-insight-modal";
import { Eye, EyeIcon } from "lucide-react";

interface NewsItem {
	id: string;
	title: string;
	link: string;
	source: string;
	publishedAt: Date;
	createdAt: Date;
	insights: {
		id: number;
		content: string;
		createdAt: Date;
	}[];
}

// Componente 3D para cards de notícias
function NewsCard3D({
	newsItem,
	position,
	rotation,
	opacity,
	onClick,
}: {
	newsItem: NewsItem;
	position: [number, number, number];
	rotation: [number, number, number];
	opacity: number;
	onClick: (news: NewsItem) => void;
}) {
	const groupRef = useRef<THREE.Group>(null);
	const [hovered, setHovered] = useState(false);

	// Responsividade do tamanho do card baseada na largura do canvas
	const { size } = useThree();
	const baseWidth = 2.5;
	const baseHeight = 1.2;
	const scaleFactor = Math.max(0.7, Math.min(1.2, size.width / 1200));
	const cardWidth = baseWidth * scaleFactor;
	const cardHeight = baseHeight * scaleFactor;

	// Manter o card sempre voltado para a câmera
	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.lookAt(state.camera.position);
		}
	});

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("pt-BR", {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<group ref={groupRef} position={position} rotation={rotation}>
			{/* Card principal - clicável */}
			<mesh
				position={[0, 0, 0]}
				onPointerDown={() => onClick(newsItem)}
				onPointerOver={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "pointer";
					setHovered(true);
				}}
				onPointerOut={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "default";
					setHovered(false);
				}}
			>
				<planeGeometry args={[cardWidth, cardHeight]} />
				<meshBasicMaterial
					color="#001100"
					transparent
					opacity={opacity * 0.8 + (hovered ? 0.1 : 0)}
				/>
			</mesh>

			{/* Borda do card */}
			<lineSegments>
				<planeGeometry args={[cardWidth, cardHeight]} />
				<lineBasicMaterial
					color="#00ff41"
					transparent
					opacity={opacity + (hovered ? 0.1 : 0)}
				/>
			</lineSegments>

			{/* Indicador visual de que é clicável */}
			<Text
				position={[0, -0.5, 0.01]}
				fontSize={0.03 * scaleFactor}
				color="#00ff41"
				anchorX="center"
				anchorY="middle"
			>
				[CLIQUE PARA CONVERSAR]
			</Text>

			{/* Título da notícia */}
			<Text
				position={[0, 0.3, 0.01]}
				fontSize={0.08 * scaleFactor}
				color="#00ff41"
				anchorX="center"
				anchorY="middle"
				maxWidth={2.3 * scaleFactor}
				lineHeight={1.2}
			>
				{newsItem.title.length > 60
					? `${newsItem.title.substring(0, 60)}...`
					: newsItem.title}
			</Text>

			{/* Fonte e data */}
			<Text
				position={[-1.1, -0.2, 0.01]}
				fontSize={0.05 * scaleFactor}
				color="#00aa00"
				anchorX="left"
				anchorY="middle"
			>
				{newsItem.source}
			</Text>

			<Text
				position={[1.1, -0.2, 0.01]}
				fontSize={0.05 * scaleFactor}
				color="#008800"
				anchorX="right"
				anchorY="middle"
			>
				{formatDate(newsItem.publishedAt)}
			</Text>

			{/* Insights */}
			{newsItem.insights.length > 0 && newsItem.insights[0] && (
				<Text
					position={[0, -0.4, 0.01]}
					fontSize={0.04 * scaleFactor}
					color="#00ff41"
					anchorX="center"
					anchorY="middle"
					maxWidth={2.3 * scaleFactor}
				>
					{newsItem.insights[0].content.length > 80
						? `${newsItem.insights[0].content.substring(0, 80)}...`
						: newsItem.insights[0].content}
				</Text>
			)}

			{/* Tooltip HTML quando em hover */}
			{hovered && (
				<Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
					<div
						style={{
							background: "rgba(0, 0, 0, 0.8)",
							border: "1px solid #00ff41",
							color: "#00ff41",
							padding: "6px 8px",
							fontSize: "12px",
							whiteSpace: "nowrap",
							borderRadius: 2,
						}}
					>
						{newsItem.source}
					</div>
				</Html>
			)}
		</group>
	);
}

// Componente da esfera do globo com efeito hacker
function HackerGlobe({
	onNewsClick,
	rotationSpeed = 0.005,
	isPaused = false,
	showNews = true,
}: {
	onNewsClick: (news: NewsItem) => void;
	rotationSpeed?: number;
	isPaused?: boolean;
	showNews?: boolean;
}): JSX.Element {
	const meshRef = useRef<THREE.Mesh>(null);
	const rotationRef = useRef(0);
	const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
	const [hoveringScene, setHoveringScene] = useState(false);

	// Buscar notícias
	const { data: newsData, isLoading: newsLoading } = api.news.getAll.useQuery({
		limit: 8,
		offset: 0,
	});

	// Atualizar notícias quando carregadas
	useEffect(() => {
		if (newsData?.success && newsData.data) {
			setNewsItems(newsData.data);
		}
	}, [newsData]);

	// Removido: códigos flutuantes substituídos por matrix rain

	// Animação de rotação (pausável)
	useFrame(() => {
		const paused = isPaused || hoveringScene;
		if (meshRef.current && !paused) {
			meshRef.current.rotation.y += rotationSpeed;
			meshRef.current.rotation.x += rotationSpeed * 0.4;
		}

		if (!paused) {
			rotationRef.current += rotationSpeed * 0.6;
		}
	});

	return (
		<group
			onPointerOver={() => setHoveringScene(true)}
			onPointerOut={() => setHoveringScene(false)}
		>
			{/* Globo principal com efeito hacker */}
			<Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
				<Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
					<meshPhongMaterial
						color="#00ff41"
						transparent
						opacity={0.3}
						wireframe
						emissive="#00ff41"
						emissiveIntensity={0.1}
					/>
				</Sphere>
			</Float>

			{/* Removido: códigos flutuantes - substituídos por matrix rain */}

			{/* Notícias orbitando ao redor do globo com fundo matrix rain */}
			{showNews &&
				!newsLoading &&
				newsItems.map((newsItem, index) => {
					const angle =
						(index / newsItems.length) * Math.PI * 2 + rotationRef.current;
					const radius = 5; // Órbita das notícias ao redor do globo
					const height = Math.sin(angle) * 0.5; // Variação de altura

					// Calcular posição na órbita
					const x = Math.cos(angle) * radius;
					const y = height;
					const z = Math.sin(angle) * radius;

					// Calcular opacidade baseada na distância da câmera (simulando profundidade)
					const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
					const opacity = Math.max(0.3, 1 - (distanceFromCenter - 3) / 4);

					return (
						<NewsCard3D
							key={`news-${newsItem.id}`}
							newsItem={newsItem}
							position={[x, y, z]}
							rotation={[0, 0, 0]} // A rotação será controlada pelo lookAt na câmera
							opacity={opacity}
							onClick={onNewsClick}
						/>
					);
				})}

			{/* Linhas de conexão removidas - foco no globo com matrix rain */}
		</group>
	);
}

// Componente principal do canvas 3D
export function HackerGlobeCanvas() {
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [rotationSpeed] = useState(0.005);
	const [isPaused] = useState(false);
	const [eyeBlink, setEyeBlink] = useState(false);
	const [eyeOpen, setEyeOpen] = useState(true);

	// Função para abrir modal com notícia selecionada
	const handleNewsClick = (news: NewsItem) => {
		setSelectedNews(news);
		setIsModalOpen(true);
	};

	// Função para fechar modal
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedNews(null);
	};

	// Animação de piscar do olho
	useEffect(() => {
		const blinkInterval = setInterval(() => {
			// Piscar rápido (simulando observação atenta)
			setEyeBlink(true);
			setTimeout(() => setEyeBlink(false), 150);
		}, 3000 + Math.random() * 2000); // Intervalo variável entre 3-5 segundos

		const longBlinkInterval = setInterval(() => {
			// Piscar mais longo (simulando processamento)
			setEyeBlink(true);
			setTimeout(() => setEyeBlink(false), 300);
		}, 8000 + Math.random() * 4000); // Intervalo variável entre 8-12 segundos

		return () => {
			clearInterval(blinkInterval);
			clearInterval(longBlinkInterval);
		};
	}, []);

	// Função para renderizar o olho com animação
	const renderEye = () => {
		if (eyeBlink) {
			return (
				<div className="flex h-40 items-center justify-center text-green-400/30 transition-all duration-150">
					<div className="h-2 w-40 rounded-full bg-green-400/30" />
				</div>
			);
		}
		return (
			<div className="text-green-400 transition-all duration-150">
				<EyeIcon className="size-40 text-green-400" />
			</div>
		);
	};

	return (
		<div className="relative h-full w-full overflow-hidden">
			<Canvas
				camera={{ position: [0, 0, 8], fov: 50 }}
				gl={{
					antialias: true,
					alpha: true,
					powerPreference: "high-performance",
				}}
				style={{ background: "transparent" }}
				dpr={[1, 2]}
			>
				{/* Iluminação hacker */}
				<ambientLight intensity={0.4} color="#00ff41" />
				<pointLight position={[10, 10, 10]} intensity={1} color="#00ff41" />
				<pointLight
					position={[-10, -10, -10]}
					intensity={0.5}
					color="#009926"
				/>

				<Float floatIntensity={0.5}>
					<Html
						position={[-1, 1.5, -50]}
						rotation={[0, 0, 0]}
						rotateY={20}
						transform
					>
						{renderEye()}
					</Html>
				</Float>

				<HackerGlobe
					onNewsClick={handleNewsClick}
					rotationSpeed={rotationSpeed}
					isPaused={isPaused}
					showNews={false}
				/>
			</Canvas>

			{/* Overlay sutil sem causar scroll */}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

			{/* Modal removido na home limpa */}
		</div>
	);
}
