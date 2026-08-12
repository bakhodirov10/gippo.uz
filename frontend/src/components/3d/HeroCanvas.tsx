'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MedicalAISphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const outerWireframeRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Generate surrounding particle positions
  const count = 75;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.25;
    }
    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.x -= delta * 0.1;
      outerWireframeRef.current.rotation.y -= delta * 0.2;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Ambient and Key Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#0284c7" />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#0d9488" />

      {/* Inner Glowing Distorted Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere ref={meshRef} args={[1.2, 32, 32]} scale={1}>
          <MeshDistortMaterial
            color="#0d9488"
            emissive="#0284c7"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
            distort={0.35}
            speed={2}
          />
        </Sphere>
      </Float>

      {/* Outer Wireframe Medical/Tech Cage */}
      <Sphere ref={outerWireframeRef} args={[1.7, 16, 16]}>
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.35}
          emissive="#0d9488"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Orbiting Neural Node Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#38bdf8"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <div className="w-full h-[400px] sm:h-[480px] relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <MedicalAISphere />
      </Canvas>
    </div>
  );
}
