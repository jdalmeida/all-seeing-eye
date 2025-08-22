"use client";

import { useRef, useMemo, useState, useEffect, type JSX } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { Sphere, Text, Float, OrbitControls, Line } from "@react-three/drei";
import { api } from "@/trpc/react";
import { NewsInsightModal } from "./news-insight-modal";
import type * as THREE from "three";

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
        onClick={() => onClick(newsItem)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[2.5, 1.2]} />
        <meshBasicMaterial
          color="#001100"
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

      {/* Borda do card */}
      <lineSegments>
        <planeGeometry args={[2.5, 1.2]} />
        <lineBasicMaterial color="#00ff41" transparent opacity={opacity} />
      </lineSegments>

      {/* Indicador visual de que é clicável */}
      <Text
        position={[0, -0.5, 0.01]}
        fontSize={0.03}
        color="#00ff41"
        anchorX="center"
        anchorY="middle"
      >
        [CLIQUE PARA CONVERSAR]
      </Text>

      {/* Título da notícia */}
      <Text
        position={[0, 0.3, 0.01]}
        fontSize={0.08}
        color="#00ff41"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.3}
        lineHeight={1.2}
      >
        {newsItem.title.length > 60
          ? newsItem.title.substring(0, 60) + "..."
          : newsItem.title}
      </Text>

      {/* Fonte e data */}
      <Text
        position={[-1.1, -0.2, 0.01]}
        fontSize={0.05}
        color="#00aa00"
        anchorX="left"
        anchorY="middle"
      >
        {newsItem.source}
      </Text>

      <Text
        position={[1.1, -0.2, 0.01]}
        fontSize={0.05}
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
            fontSize={0.04}
            color="#00ff41"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.3}
          >
            {newsItem.insights[0].content.length > 80
              ? newsItem.insights[0].content.substring(0, 80) + "..."
              : newsItem.insights[0].content}
          </Text>
        )}
    </group>
  );
}

// Componente da esfera do globo com efeito hacker
function HackerGlobe({ onNewsClick }: { onNewsClick: (news: NewsItem) => void }): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

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

  // Animação de rotação
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }

    // Rotação das notícias (mais lenta para um efeito mais suave)
    rotationRef.current += 0.003;
  });

  return (
    <group>
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
      {!newsLoading &&
        newsItems.map((newsItem, index) => {
          const angle = (index / newsItems.length) * Math.PI * 2 + rotationRef.current;
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
  return (
    <div className="w-full h-full relative overflow-hidden">
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

        <HackerGlobe onNewsClick={handleNewsClick} />

        {/* Controles de órbita suaves */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Overlay sutil sem causar scroll */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10" />

      {/* Modal de insights e chatbot */}
      {selectedNews && (
        <NewsInsightModal
          newsItem={selectedNews}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
