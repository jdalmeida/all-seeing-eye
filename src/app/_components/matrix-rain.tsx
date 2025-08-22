"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type * as THREE from "three";

interface MatrixColumn {
  id: string;
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  opacity: number;
}

function MatrixRainEffect() {
  const groupRef = useRef<THREE.Group>(null);
  const columnsRef = useRef<MatrixColumn[]>([]);

  // Caracteres da matrix
  const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";

  // Inicializar colunas
  useEffect(() => {
    const columns: MatrixColumn[] = [];
    const numColumns = 50; // Número de colunas de chuva
    const spacing = 0.5; // Espaçamento entre colunas

    for (let i = 0; i < numColumns; i++) {
      const x = (i - numColumns / 2) * spacing;
      const length = Math.floor(Math.random() * 20) + 10;
      const chars = Array.from({ length }, () =>
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).filter((char): char is string => char !== undefined);

      columns.push({
        id: `column-${i}`,
        x,
        y: 20 + Math.random() * 10, // Começar acima da tela
        speed: 0.1 + Math.random() * 0.3,
        chars,
        length,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }

    columnsRef.current = columns;
  }, []);

  // Animação das colunas caindo
  useFrame(() => {
    columnsRef.current.forEach((column) => {
      column.y -= column.speed;

      // Reset quando sai da tela
      if (column.y < -20) {
        column.y = 25;
        column.chars = Array.from({ length: column.length }, () =>
          matrixChars[Math.floor(Math.random() * matrixChars.length)]
        ).filter((char): char is string => char !== undefined);
        column.speed = 0.1 + Math.random() * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {columnsRef.current.map((column) => (
        <group key={column.id} position={[column.x, 0, -10]}>
          {column.chars.map((char, index) => {
            const y = column.y - index * 0.8;
            const opacity = column.opacity * (1 - index / column.length);

            return (
              <Text
                key={`${column.id}-${index}`}
                position={[0, y, 0]}
                fontSize={0.4}
                color={`rgba(0, 255, 65, ${opacity})`}
                anchorX="center"
                anchorY="middle"
                font="/fonts/matrix-code.woff"
              >
                {char}
              </Text>
            );
          })}
        </group>
      ))}
    </group>
  );
}

export function MatrixRainCanvas() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-screen h-screen">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <MatrixRainEffect />
      </Canvas>
    </div>
  );
}
