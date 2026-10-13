import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                   */
/* -------------------------------------------------------------------------- */

type PetalShape = { length: number; width: number; cup: number; curl: number }

/**
 * Maps (u, v) on a unit petal to 3D. u runs -1…1 across, v runs 0…1 from base
 * to tip. The petal grows along +Y; its concave (inner) side faces +Z. It is
 * cupped across its width, hollowed like a spoon along its length, and the
 * tip turns very slightly back out.
 */
function petalPoint(u: number, v: number, shape: PetalShape, target = new THREE.Vector3()) {
  // The exponent rises toward the tip, which turns a rounded end into a soft point.
  const profile = Math.pow(Math.sin(Math.PI * Math.pow(v, 0.78)), 0.62 + 0.75 * Math.pow(v, 4))
  const halfWidth = shape.width * profile
  const x = u * halfWidth
  const y = v * shape.length
  const across = shape.cup * halfWidth * (1 - Math.cos((u * Math.PI) / 2))
  const along = -0.13 * shape.length * Math.sin(Math.PI * v)
  const tip = -shape.curl * shape.length * Math.pow(v, 3)
  return target.set(x, y, across + along + tip)
}

/** The petal surface, with colour deepening toward the base like a real lotus. */
function createPetalGeometry(shape: PetalShape, base: string, tip: string) {
  const geometry = new THREE.PlaneGeometry(1, 1, 18, 36)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const from = new THREE.Color(base)
  const to = new THREE.Color(tip)
  const mixed = new THREE.Color()
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) * 2
    const v = pos.getY(i) + 0.5
    petalPoint(u, v, shape, p)
    pos.setXYZ(i, p.x, p.y, p.z)
    mixed.copy(from).lerp(to, Math.pow(v, 0.6) * (1 - 0.12 * u * u))
    mixed.toArray(colors, i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

/** A thin gilded rim that traces the petal's outline. */
function createPetalRimGeometry(shape: PetalShape) {
  const points: THREE.Vector3[] = []
  const steps = 40
  for (let i = 0; i <= steps; i++) points.push(petalPoint(1, i / steps, shape))
  for (let i = steps - 1; i >= 0; i--) points.push(petalPoint(-1, i / steps, shape))
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  return new THREE.TubeGeometry(curve, 120, 0.0055, 5, false)
}

/** The kumbh itself, turned on a lathe: foot, belly, shoulder, neck and lip. */
function createPotGeometry() {
  const profile: [number, number][] = [
    [0, 0],
    [0.12, 0],
    [0.14, 0.025],
    [0.11, 0.055],
    [0.19, 0.11],
    [0.26, 0.2],
    [0.285, 0.3],
    [0.27, 0.4],
    [0.215, 0.48],
    [0.135, 0.545],
    [0.1, 0.585],
    [0.1, 0.635],
    [0.15, 0.665],
    [0.158, 0.69],
    [0.11, 0.695],
    [0.09, 0.67],
  ]
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    72,
  )
}

/** A drop of amrit — a small teardrop, also lathe-turned. */
function createDropGeometry() {
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const a = t * Math.PI
    const r = Math.sin(a) * (0.055 * (1 - t * 0.55)) * (t < 0.5 ? 1 : 1 - (t - 0.5) * 0.6)
    points.push(new THREE.Vector2(r, -Math.cos(a) * 0.075 + t * t * 0.06))
  }
  return new THREE.LatheGeometry(points, 32)
}

/* -------------------------------------------------------------------------- */
/*  Art direction                                                              */
/* -------------------------------------------------------------------------- */

type RingSpec = PetalShape & {
  base: string
  tip: string
  count: number
  radius: number
  open: number
  closed: number
  offset: number
  delay: number
  material: THREE.MeshPhysicalMaterialParameters
}

const RINGS: RingSpec[] = [
  {
    base: '#8a6a45',
    tip: '#e6d2ae',
    count: 9,
    length: 1.08,
    width: 0.34,
    cup: 0.55,
    curl: 0.05,
    radius: 0.24,
    open: 1.08,
    closed: 0.3,
    offset: 0.5,
    delay: 0,
    material: { roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color('#f0d6a4') },
  },
  {
    base: '#cf8a4c',
    tip: '#fcf4e6',
    count: 11,
    length: 1.32,
    width: 0.36,
    cup: 0.6,
    curl: 0.06,
    radius: 0.17,
    open: 0.68,
    closed: 0.14,
    offset: 0,
    delay: 0.18,
    material: {
      roughness: 0.36,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      sheen: 0.4,
      sheenColor: new THREE.Color('#fff1d6'),
    },
  },
  {
    base: '#b5602a',
    tip: '#f6cf9c',
    count: 9,
    length: 1.1,
    width: 0.32,
    cup: 0.7,
    curl: 0.03,
    radius: 0.11,
    open: 0.38,
    closed: 0.08,
    offset: 0.5,
    delay: 0.36,
    material: { roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.22 },
  },
  {
    base: '#7d5a24',
    tip: '#f3dda2',
    count: 7,
    length: 0.82,
    width: 0.26,
    cup: 0.8,
    curl: 0.0,
    radius: 0.06,
    open: 0.16,
    closed: 0.03,
    offset: 0.25,
    delay: 0.54,
    material: { metalness: 0.85, roughness: 0.26 },
  },
]

const BLOOM_SECONDS = 2.6
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

/* -------------------------------------------------------------------------- */
/*  Scene pieces                                                               */
/* -------------------------------------------------------------------------- */

/** Builds a tiny art-directed studio for reflections — no HDR download needed. */
function Studio() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new THREE.Scene()
    room.background = new THREE.Color('#1a1d45')
    const plane = new THREE.PlaneGeometry(1, 1)
    const materials: THREE.Material[] = []
    const softbox = (color: string, intensity: number, position: [number, number, number], scale: [number, number]) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      })
      materials.push(material)
      const mesh = new THREE.Mesh(plane, material)
      mesh.position.set(...position)
      mesh.scale.set(scale[0], scale[1], 1)
      mesh.lookAt(0, 0, 0)
      room.add(mesh)
    }
    softbox('#ffc98a', 5, [-4, 3, 4], [5, 3])
    softbox('#ffe2b8', 2.2, [0, 6, 1], [6, 2])
    softbox('#6f9fc9', 2.6, [4, 1, -4], [4, 4])
    softbox('#d9864a', 1.6, [0, -3, 4], [8, 1.5])

    const target = pmrem.fromScene(room, 0.035)
    scene.environment = target.texture
    invalidate()

    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      plane.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [gl, scene, invalidate])

  return null
}

type LotusProps = {
  reducedMotion: boolean
  progress?: MotionValue<number>
  pointer: RefObject<{ x: number; y: number }>
  onFirstFrame: () => void
  onTooSlow: () => void
}

/** If the device cannot hold a reasonable frame rate, hand back to the SVG emblem. */
const SLOW_FRAME = 1 / 24
const SAMPLE_FRAMES = 45

function Lotus({ reducedMotion, progress, pointer, onFirstFrame, onTooSlow }: LotusProps) {
  const frameTimes = useRef<number[]>([])
  const judged = useRef(false)
  const root = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Group>(null)
  const drop = useRef<THREE.Mesh>(null)
  const ripples = useRef<THREE.Mesh[]>([])
  const rings = useRef<THREE.InstancedMesh[]>([])
  const rimMeshes = useRef<THREE.InstancedMesh[]>([])
  const started = useRef<number | null>(null)
  const reported = useRef(false)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const assets = useMemo(() => {
    const petals = RINGS.map((ring) => createPetalGeometry(ring, ring.base, ring.tip))
    const rims = RINGS.map((ring) => createPetalRimGeometry(ring))
    const petalMaterials = RINGS.map(
      (ring) =>
        new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, vertexColors: true, ...ring.material }),
    )
    const gold = new THREE.MeshPhysicalMaterial({
      color: '#e3c27a',
      metalness: 1,
      roughness: 0.22,
      clearcoat: 0.4,
    })
    const haloMaterial = new THREE.MeshStandardMaterial({
      color: '#e2c98f',
      metalness: 1,
      roughness: 0.3,
      emissive: '#b8954f',
      emissiveIntensity: 0.55,
    })
    const dropMaterial = new THREE.MeshStandardMaterial({
      color: '#ffe3a8',
      emissive: '#f4b469',
      emissiveIntensity: 1.6,
      roughness: 0.2,
    })
    const rippleMaterials = [0, 1, 2].map(
      () =>
        new THREE.MeshBasicMaterial({
          color: '#e2c98f',
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
    )
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: '#f0d796',
      metalness: 1,
      roughness: 0.25,
      emissive: '#a07a35',
      emissiveIntensity: 0.6,
    })
    return {
      petals,
      rims,
      rimMaterial,
      petalMaterials,
      gold,
      haloMaterial,
      dropMaterial,
      rippleMaterials,
      pot: createPotGeometry(),
      drop: createDropGeometry(),
      ring: new THREE.TorusGeometry(1, 0.0035, 8, 220),
      moon: new THREE.SphereGeometry(0.026, 20, 20),
      ripple: new THREE.RingGeometry(0.985, 1, 128),
    }
  }, [])

  useEffect(
    () => () => {
      assets.petals.forEach((g) => g.dispose())
      assets.rims.forEach((g) => g.dispose())
      assets.rimMaterial.dispose()
      assets.petalMaterials.forEach((m) => m.dispose())
      assets.rippleMaterials.forEach((m) => m.dispose())
      ;[assets.gold, assets.haloMaterial, assets.dropMaterial].forEach((m) => m.dispose())
      ;[assets.pot, assets.drop, assets.ring, assets.moon, assets.ripple].forEach((g) => g.dispose())
    },
    [assets],
  )

  const layoutPetals = (bloom: (ring: RingSpec) => number) => {
    RINGS.forEach((ring, r) => {
      const mesh = rings.current[r]
      if (!mesh) return
      const tilt = ring.closed + (ring.open - ring.closed) * bloom(ring)
      for (let i = 0; i < ring.count; i++) {
        const phi = ((i + ring.offset) / ring.count) * Math.PI * 2
        dummy.position.set(Math.sin(phi) * ring.radius, 0, Math.cos(phi) * ring.radius)
        dummy.rotation.set(-tilt, phi + Math.PI, 0, 'YXZ')
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        rimMeshes.current[r]?.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      if (rimMeshes.current[r]) rimMeshes.current[r].instanceMatrix.needsUpdate = true
    })
  }

  useFrame((state, delta) => {
    if (!judged.current && !reducedMotion) {
      frameTimes.current.push(delta)
      // Skip the first frames: they include shader compilation.
      if (frameTimes.current.length === SAMPLE_FRAMES + 10) {
        judged.current = true
        const sorted = frameTimes.current.slice(10).sort((a, b) => a - b)
        if (sorted[Math.floor(sorted.length / 2)] > SLOW_FRAME) onTooSlow()
      }
    }
    const now = state.clock.elapsedTime
    if (started.current === null) started.current = now
    const t = now - started.current
    const scroll = reducedMotion ? 0 : (progress?.get() ?? 0)

    layoutPetals((ring) => {
      const bloom = reducedMotion ? 1 : easeOutCubic(clamp01((t - ring.delay) / BLOOM_SECONDS))
      return bloom * (1 - scroll * 0.45)
    })

    if (!reducedMotion) {
      if (spin.current) spin.current.rotation.y += delta * 0.07
      if (halo.current) {
        halo.current.children[0].rotation.z += delta * 0.05
        halo.current.children[1].rotation.z -= delta * 0.035
      }
      if (drop.current) drop.current.position.y = 1.5 + Math.sin(now * 1.1) * 0.035
      ripples.current.forEach((mesh, i) => {
        const cycle = ((now + i * 2.2) % 6.6) / 6.6
        const s = 0.7 + cycle * 1.6
        mesh.scale.set(s, s, s)
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.42 * (1 - cycle) * Math.min(1, cycle * 6)
      })
      if (root.current) {
        const p = pointer.current ?? { x: 0, y: 0 }
        root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, p.y * 0.09, 3, delta)
        root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, -p.x * 0.06, 3, delta)
        root.current.position.y = -scroll * 0.55
      }
    } else {
      ripples.current.forEach((mesh, i) => {
        const s = 1 + i * 0.35
        mesh.scale.set(s, s, s)
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.28 - i * 0.07
      })
    }

    if (!reported.current) {
      reported.current = true
      requestAnimationFrame(onFirstFrame)
    }
  })

  return (
    <group ref={root}>
      <group ref={spin} scale={1.2}>
        {RINGS.map((ring, r) => (
          <instancedMesh
            key={r}
            ref={(mesh) => {
              if (mesh) rings.current[r] = mesh
            }}
            args={[assets.petals[r], assets.petalMaterials[r], ring.count]}
            frustumCulled={false}
          />
        ))}
        {RINGS.map((ring, r) => (
          <instancedMesh
            key={`rim-${r}`}
            ref={(mesh) => {
              if (mesh) rimMeshes.current[r] = mesh
            }}
            args={[assets.rims[r], assets.rimMaterial, ring.count]}
            frustumCulled={false}
          />
        ))}
        <mesh geometry={assets.pot} material={assets.gold} position={[0, 0.12, 0]} scale={1.32} />
      </group>

      <mesh ref={drop} geometry={assets.drop} material={assets.dropMaterial} position={[0, 1.5, 0]} />
      <pointLight position={[0, 1.4, 0.3]} color="#ffcf8a" intensity={1.4} distance={2.4} decay={2} />

      <group ref={halo} position={[0, 0.8, 0]}>
        <group rotation={[1.32, 0.18, 0]}>
          <mesh geometry={assets.ring} material={assets.haloMaterial} scale={1.62} />
          <mesh geometry={assets.moon} material={assets.dropMaterial} position={[1.62, 0, 0]} />
        </group>
        <group rotation={[1.18, -0.26, 0]}>
          <mesh geometry={assets.ring} material={assets.haloMaterial} scale={1.86} />
        </group>
      </group>

      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            if (mesh) ripples.current[i] = mesh
          }}
          geometry={assets.ripple}
          material={assets.rippleMaterials[i]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.005, 0]}
        />
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  Canvas                                                                     */
/* -------------------------------------------------------------------------- */

export type LotusCanvasProps = {
  active: boolean
  reducedMotion: boolean
  progress?: MotionValue<number>
  pointer: RefObject<{ x: number; y: number }>
  onReady: () => void
  onLost: () => void
  onTooSlow: () => void
}

export default function LotusCanvas({
  active,
  reducedMotion,
  progress,
  pointer,
  onReady,
  onLost,
  onTooSlow,
}: LotusCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.55, 6.4], fov: 32, near: 0.1, far: 40 }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.setClearColor(0x000000, 0)
        camera.lookAt(0, 1.0, 0)
        gl.domElement.addEventListener('webglcontextlost', onLost, { once: true })
      }}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <Studio />
      <ambientLight intensity={0.12} color="#8c93c9" />
      <directionalLight position={[-3.5, 3.5, 4]} intensity={2.6} color="#ffd29a" />
      <directionalLight position={[3, 2.5, -4.5]} intensity={3.2} color="#86b8de" />
      <directionalLight position={[0, -2, 3]} intensity={0.5} color="#d68b38" />
      <Lotus
        reducedMotion={reducedMotion}
        progress={progress}
        pointer={pointer}
        onFirstFrame={onReady}
        onTooSlow={onTooSlow}
      />
    </Canvas>
  )
}
