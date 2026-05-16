'use client'

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, AdditiveBlending, DoubleSide } from 'three'
import * as THREE from 'three'
import { Float } from '@react-three/drei'

/* ─── Floating particles ─────────────────────────────────── */
function Particles({ active }: { active: boolean }) {
  const count = 80
  const ref = useRef<THREE.Points>(null)
  const data = useMemo(() => ({
    positions: Float32Array.from({ length: count * 3 }, (_, i) =>
      i % 3 === 1 ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 4
    ),
    speeds: Float32Array.from({ length: count }, () => 0.003 + Math.random() * 0.005),
  }), [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += data.speeds[i] * (active ? 2.5 : 1)
      if (pos[i * 3 + 1] > 3.2) pos[i * 3 + 1] = -3.2
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#00d4ff" transparent opacity={0.55}
        blending={AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  )
}

/* ─── Expanding ring ─────────────────────────────────────── */
function Ring({ delay, active }: { delay: number; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const p = useRef(delay)
  useFrame((_, dt) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    if (!active) { mat.opacity = 0; p.current = delay; return }
    p.current = (p.current + dt * 0.55) % 1
    ref.current.scale.setScalar(1 + p.current * 2.2)
    mat.opacity = (1 - p.current) * 0.45
  })
  return (
    <mesh ref={ref} position={[0, 0.8, 0]}>
      <ringGeometry args={[0.72, 0.82, 64]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0} side={DoubleSide}
        blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/* ─── Holographic humanoid with animated mouth ───────────── */
function HolographicHuman({ isSpeaking }: { isSpeaking: boolean }) {
  const [tex1, tex2, tex3] = useLoader(TextureLoader, [
    '/avatars/divyansh-1.jpg',
    '/avatars/divyansh-2.jpg',
    '/avatars/divyansh-3.jpg',
  ])
  const textures = [tex1, tex2, tex3]
  const faceRef = useRef<THREE.Mesh>(null)
  const photoIdx = useRef(0)
  const lastSwap = useRef(0)

  const mouthRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)
  const rimRef  = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Cycle photo every 6 seconds (faster when speaking)
    const interval = isSpeaking ? 3 : 6
    if (t - lastSwap.current > interval) {
      lastSwap.current = t
      photoIdx.current = (photoIdx.current + 1) % 3
      if (faceRef.current) {
        const mat = faceRef.current.material as THREE.MeshBasicMaterial
        mat.map = textures[photoIdx.current]
        mat.needsUpdate = true
      }
    }
    // Mouth open/close — two overlapping sines for natural irregularity
    if (mouthRef.current) {
      const talk = isSpeaking
        ? Math.abs(Math.sin(t * 9.1)) * Math.abs(Math.cos(t * 5.7)) * 0.28
        : 0
      mouthRef.current.scale.y = 1 + talk * 14
      mouthRef.current.scale.x = 1 + talk * 2
    }
    // Head nod when speaking
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.4) * 0.06
      headRef.current.rotation.x = isSpeaking ? Math.sin(t * 7) * 0.018 : 0
    }
    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = isSpeaking
        ? 3.5 + Math.sin(t * 8) * 2
        : 1.2 + Math.sin(t * 0.9) * 0.4
    }
    if (rimRef.current) {
      rimRef.current.intensity = isSpeaking ? 1.5 + Math.sin(t * 6) * 0.8 : 0.5
    }
  })

  // Shared holographic material props
  const holo = {
    color: '#00aadd',
    emissive: '#003366' as string,
    emissiveIntensity: 0.7,
    metalness: 0.4,
    roughness: 0.15,
    transparent: true,
    opacity: 0.88,
  }

  return (
    <group>
      {/* ── Head ── */}
      <group ref={headRef} position={[0, 0.85, 0]}>
        {/* Skull */}
        <mesh>
          <sphereGeometry args={[0.62, 36, 36]} />
          <meshStandardMaterial {...holo} />
        </mesh>

        {/* Face photo — circular crop via disc geometry, cycles through 3 photos */}
        <mesh ref={faceRef} position={[0, 0.04, 0.6]}>
          <circleGeometry args={[0.46, 48]} />
          <meshBasicMaterial map={tex1} side={DoubleSide} />
        </mesh>

        {/* Animated mouth (sits on chin, below photo) */}
        <mesh ref={mouthRef} position={[0, -0.34, 0.59]}>
          <boxGeometry args={[0.26, 0.045, 0.04]} />
          <meshStandardMaterial color="#ff6b35" emissive="#ff3300"
            emissiveIntensity={1.2} transparent opacity={0.95} />
        </mesh>

        {/* Hair dome */}
        <mesh position={[0, 0.42, 0]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.64, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#111122" emissive="#002244"
            emissiveIntensity={0.4} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Glasses frames */}
        <mesh position={[-0.2, 0.12, 0.63]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.13, 0.012, 8, 24]} />
          <meshStandardMaterial color="#00d4ff" emissive="#0066ff"
            emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.2, 0.12, 0.63]}>
          <torusGeometry args={[0.13, 0.012, 8, 24]} />
          <meshStandardMaterial color="#00d4ff" emissive="#0066ff"
            emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Bridge */}
        <mesh position={[0, 0.12, 0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.009, 0.009, 0.08, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#0066ff" emissiveIntensity={1.5} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Neck ── */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.55, 20]} />
        <meshStandardMaterial {...holo} />
      </mesh>

      {/* ── Torso ── */}
      <group position={[0, -0.38, 0]}>
        {/* Chest */}
        <mesh>
          <boxGeometry args={[1.05, 0.95, 0.44]} />
          <meshStandardMaterial {...holo} />
        </mesh>
        {/* Shoulders */}
        <mesh position={[-0.65, 0.32, 0]}>
          <sphereGeometry args={[0.26, 18, 18]} />
          <meshStandardMaterial {...holo} />
        </mesh>
        <mesh position={[0.65, 0.32, 0]}>
          <sphereGeometry args={[0.26, 18, 18]} />
          <meshStandardMaterial {...holo} />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.82, -0.2, 0]} rotation={[0, 0, 0.18]}>
          <cylinderGeometry args={[0.11, 0.09, 0.85, 14]} />
          <meshStandardMaterial {...holo} />
        </mesh>
        <mesh position={[0.82, -0.2, 0]} rotation={[0, 0, -0.18]}>
          <cylinderGeometry args={[0.11, 0.09, 0.85, 14]} />
          <meshStandardMaterial {...holo} />
        </mesh>
        {/* DevX logo area - chest glow */}
        <mesh position={[0, 0.1, 0.23]}>
          <planeGeometry args={[0.35, 0.14]} />
          <meshStandardMaterial color="#00d4ff" emissive="#0066ff"
            emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* ── Lights ── */}
      <pointLight ref={glowRef} position={[0, 0.8, 2.5]} color="#00d4ff" intensity={1.2} distance={9} />
      <pointLight ref={rimRef}  position={[-2, 1, -1]} color="#0044ff" intensity={0.5} distance={8} />
      <pointLight position={[2, 0, -1]} color="#00ffcc" intensity={0.3} distance={7} />

      {/* ── Speaking rings ── */}
      {[0, 0.28, 0.56, 0.84].map((d) => <Ring key={d} delay={d} active={isSpeaking} />)}
    </group>
  )
}

/* ─── Scene ──────────────────────────────────────────────── */
function Scene({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <>
      <ambientLight intensity={0.25} color="#001133" />
      <Particles active={isSpeaking} />
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={isSpeaking ? 0.5 : 0.2}>
          <HolographicHuman isSpeaking={isSpeaking} />
        </Float>
      </Suspense>
    </>
  )
}

/* ─── Canvas export ──────────────────────────────────────── */
export default function AvatarCanvas({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Scene isSpeaking={isSpeaking} />
    </Canvas>
  )
}
