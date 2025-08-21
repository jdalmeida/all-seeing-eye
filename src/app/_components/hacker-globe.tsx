"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Sphere, Text, Float, OrbitControls, Line } from '@react-three/drei';
import type * as THREE from 'three';

// Componente da esfera do globo com efeito hacker
function HackerGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Códigos binários/insights flutuando
  const floatingCodes = useMemo(() => [
    '01010101', 'H4CK3R', 'INSIGHT', 'D4T4', 'C0D3', 'N30N', 'M4TR1X', '01001000'
  ], []);

  // Animação de rotação
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
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

      {/* Códigos flutuando ao redor */}
      {floatingCodes.map((code, index) => (
        <Float key={`code-${index}`} speed={1} rotationIntensity={0.5} floatIntensity={0.3}>
          <Text
            position={[
              Math.cos((index / floatingCodes.length) * Math.PI * 2) * 3,
              Math.sin((index / floatingCodes.length) * Math.PI) * 1.5,
              Math.sin((index / floatingCodes.length) * Math.PI * 2) * 3
            ]}
            fontSize={0.15}
            color="#00ff41"
            anchorX="center"
            anchorY="middle"
          >
            {code}
          </Text>
        </Float>
      ))}

      {/* Linhas de conexão usando Line do drei */}
      {floatingCodes.map((_, index) => {
        const nextIndex = (index + 1) % floatingCodes.length;
        const pos1 = [
          Math.cos((index / floatingCodes.length) * Math.PI * 2) * 3,
          Math.sin((index / floatingCodes.length) * Math.PI) * 1.5,
          Math.sin((index / floatingCodes.length) * Math.PI * 2) * 3
        ];
        const pos2 = [
          Math.cos((nextIndex / floatingCodes.length) * Math.PI * 2) * 3,
          Math.sin((nextIndex / floatingCodes.length) * Math.PI) * 1.5,
          Math.sin((nextIndex / floatingCodes.length) * Math.PI * 2) * 3
        ];

        return (
          <Line
            key={`line-${index}`}
            points={[pos1, pos2]}
            color="#00ff41"
            lineWidth={1}
            opacity={0.3}
            transparent
          />
        );
      })}

      {/* Título principal */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.8}
          color="#00ff41"
          anchorX="center"
          anchorY="middle"
        >
          ALL-SEEING EYE
        </Text>
      </Float>

      {/* Subtítulo */}
      <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.1}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.3}
          color="#009926"
          anchorX="center"
          anchorY="middle"
        >
          Sistema de Insights Hacker
        </Text>
      </Float>
    </group>
  );
}

// Componente principal do canvas 3D
export function HackerGlobeCanvas() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Iluminação hacker */}
        <ambientLight intensity={0.4} color="#00ff41" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ff41" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#009926" />

        <HackerGlobe />

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
    </div>
  );
}
