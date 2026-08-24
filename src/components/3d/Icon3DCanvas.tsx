'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Box, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

interface StepIconProps {
  step: '01' | '02' | '03' | '04';
}

function StepShape({ step }: StepIconProps) {
  const meshRef = useRef<any>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  const materialProps = {
    color: '#0d9488',
    emissive: '#0284c7',
    emissiveIntensity: 0.3,
    roughness: 0.2,
    metalness: 0.7,
    wireframe: true,
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 3]} intensity={1} color="#38bdf8" />
      {step === '01' && (
        <Icosahedron ref={meshRef} args={[0.9, 0]}>
          <meshStandardMaterial {...materialProps} />
        </Icosahedron>
      )}
      {step === '02' && (
        <Box ref={meshRef} args={[1, 1, 1]}>
          <meshStandardMaterial {...materialProps} color="#0284c7" />
        </Box>
      )}
      {step === '03' && (
        <Torus ref={meshRef} args={[0.7, 0.25, 16, 32]}>
          <meshStandardMaterial {...materialProps} color="#10b981" />
        </Torus>
      )}
      {step === '04' && (
        <Octahedron ref={meshRef} args={[0.9, 0]}>
          <meshStandardMaterial {...materialProps} color="#8b5cf6" />
        </Octahedron>
      )}
    </Float>
  );
}

export default function Icon3DCanvas({ step }: StepIconProps) {
  return (
    <div className="w-12 h-12 relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <StepShape step={step} />
      </Canvas>
    </div>
  );
}
