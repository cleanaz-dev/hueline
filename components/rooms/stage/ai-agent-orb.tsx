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

  float noise(vec3 p) {
    return sin(p.x * 10.0 + uTime) * sin(p.y * 10.0 + uTime) * sin(p.z * 10.0 + uTime);
  }

  void main() {
    vUv = uv;
    vDistortion = noise(normal + uTime * 0.5) * (0.1 + uIntensity);
    vec3 newPosition = position + normal * vDistortion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying float vDistortion;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float brightness = 0.5 + vDistortion * 2.0;
    // Use uOpacity to control transparency
    gl_FragColor = vec4(uColor * brightness, uOpacity);
  }
`;

export const AgentOrb = ({ trackPublication, participant }: AgentOrbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const uniformsRef = useRef({
    uTime: { value: 0.0 },
    uIntensity: { value: 0.0 },
    uColor: { value: new THREE.Color("#ffffff") }, // White color
    uOpacity: { value: 0.4 }, // Adjust this value (0.0 to 1.0) for transparency
  });

  const volume = useTrackVolume(trackPublication as any);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(60, 60);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      wireframe: true,
      transparent: true, // Enable transparency
      blending: THREE.AdditiveBlending, // Optional: creates a glowing effect
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getElapsedTime();

      uniformsRef.current.uTime.value = delta;
      const targetIntensity = volume * 1.5;
      uniformsRef.current.uIntensity.value +=
        (targetIntensity - uniformsRef.current.uIntensity.value) * 0.1;

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
  }, []);

  if (!participant) return null;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="orb-container"
        style={{
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))", // White glow
        }}
      />
    </div>
  );
};