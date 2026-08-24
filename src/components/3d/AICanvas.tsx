'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus } from '@react-three/drei';
import * as THREE from 'three';

function NeuralNodes() {
  const groupRef = useRef<any>(null!);
  const torusRef = useRef<any>(null!);

  const { positions, lines } = useMemo(() => {
    const nodeCount = 30;
    const pos = new Float32Array(nodeCount * 3);
    const lineIndices: number[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const r = 1.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.3) {
          lineIndices.push(i, j);
        }
      }
    }

    return {
      positions: pos,
      lines: new Uint16Array(lineIndices),
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.08;
    }
    if (torusRef.current) {
      torusRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#0d9488" />

      {/* Orbiting Halo Ring */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <Torus ref={torusRef} args={[1.6, 0.03, 16, 64]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#a855f7"
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </Torus>
      </Float>

      {/* Node Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#c084fc" transparent opacity={0.9} />
      </points>

      {/* Neural Connection Lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[lines, 1]} />
        </bufferGeometry>
        <lineBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

export default function AICanvas() {
  return (
    <div className="w-full h-[320px] relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <NeuralNodes />
      </Canvas>
    </div>
  );
}
