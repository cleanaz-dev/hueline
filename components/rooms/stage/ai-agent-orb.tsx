"use client";

import { useEffect, useRef } from "react";
import { TrackPublication, LocalParticipant, RemoteParticipant } from "livekit-client";
import { useTrackVolume } from "@livekit/components-react";
import * as THREE from "three";

interface AgentOrbProps {
  trackPublication?: TrackPublication;
  participant?: RemoteParticipant | LocalParticipant;
}

const vertexShader = `
  varying vec2 vUv;
  varying float vDistortion;
  uniform float uTime;
  uniform float uIntensity;

  // Simple noise function
  float noise(vec3 p) {
    return sin(p.x * 10.0 + uTime) * sin(p.y * 10.0 + uTime) * sin(p.z * 10.0 + uTime);
  }

  void main() {
    vUv = uv;
    // Constant base movement (0.1) + audio reactivity (uIntensity)
    vDistortion = noise(normal + uTime * 0.5) * (0.1 + uIntensity);
    vec3 newPosition = position + normal * vDistortion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying float vDistortion;
  uniform vec3 uColor;
  
  void main() {
    // Brighten the color based on displacement
    float brightness = 0.5 + vDistortion * 2.0;
    gl_FragColor = vec4(uColor * brightness, 1.0);
  }
`;

export const AgentOrb = ({ trackPublication, participant }: AgentOrbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const uniformsRef = useRef({
    uTime: { value: 0.0 },
    uIntensity: { value: 0.0 },
    uColor: { value: new THREE.Color("#8B5CF6") }, // Purple
  });

  // Use the built-in LiveKit hook for volume (returns 0 to 1)
  const volume = useTrackVolume(trackPublication as any);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(120, 120);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Create Orb
    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      wireframe: true,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // 3. Animation Loop
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getElapsedTime();
      
      // Update Uniforms
      uniformsRef.current.uTime.value = delta;
      
      // Smoothly interpolate volume to avoid flickering
      // volume * 1.5 makes it more dramatic
      const targetIntensity = volume * 1.5;
      uniformsRef.current.uIntensity.value += (targetIntensity - uniformsRef.current.uIntensity.value) * 0.1;

      // Rotate Orb
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.z += 0.005;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Only run once on mount

  if (!participant) return null;

  return (
    <div className="flex items-center justify-center">
      {/* Glow Effect via CSS (Cheaper than Three.js Bloom) */}
      <div 
        ref={containerRef} 
        className="relative transition-transform duration-300"
        style={{
          filter: `drop-shadow(0 0 ${10 + volume * 20}px rgba(139, 92, 246, 0.5))`,
          transform: `scale(${1 + volume * 0.2})`
        }}
      />
    </div>
  );
};