"use client"

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

interface OptimizedThreeBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  objectCount?: number
}

export default function OptimizedThreeBackground({ 
  className = '', 
  intensity = 'medium',
  objectCount = 15
}: OptimizedThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const objectsRef = useRef<THREE.Mesh[]>([])

  const intensitySettings = {
    low: { objects: 8, animationSpeed: 0.5, renderQuality: 0.5 },
    medium: { objects: objectCount, animationSpeed: 1, renderQuality: 0.75 },
    high: { objects: objectCount * 1.5, animationSpeed: 1.5, renderQuality: 1 }
  }

  const settings = intensitySettings[intensity]

  const handleResize = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current) return
    
    const camera = (sceneRef.current as any).camera
    if (camera) {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0a0a, 1, 1000)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 30
    ;(scene as any).camera = camera

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: window.devicePixelRatio <= 1, // Only use antialias on low-DPI displays
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Cap pixel ratio for performance
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = false // Disable shadows for performance
    rendererRef.current = renderer
    currentMount.appendChild(renderer.domElement)

    // Create optimized geometries (reuse instances)
    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 16, 16), // Reduced segments for performance
      new THREE.ConeGeometry(0.8, 2, 6),
      new THREE.TetrahedronGeometry(1.2),
      new THREE.OctahedronGeometry(1),
    ]

    // Create optimized materials (fewer materials, better performance)
    const materials = [
      new THREE.MeshBasicMaterial({ // Use MeshBasicMaterial for better performance
        color: 0x4f46e5, 
        transparent: true, 
        opacity: 0.6
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.5
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.7
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0xf59e0b, 
        transparent: true, 
        opacity: 0.6
      }),
    ]

    // Create objects with performance optimizations
    const objects: THREE.Mesh[] = []
    for (let i = 0; i < settings.objects; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)]
      const material = materials[Math.floor(Math.random() * materials.length)]
      const mesh = new THREE.Mesh(geometry, material)

      // Random positioning
      mesh.position.x = (Math.random() - 0.5) * 80
      mesh.position.y = (Math.random() - 0.5) * 80
      mesh.position.z = (Math.random() - 0.5) * 80

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI
      mesh.rotation.y = Math.random() * Math.PI
      mesh.rotation.z = Math.random() * Math.PI

      // Random scale
      const scale = Math.random() * 0.4 + 0.6
      mesh.scale.setScalar(scale)

      // Store animation properties
      ;(mesh as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01 * settings.animationSpeed,
        y: (Math.random() - 0.5) * 0.01 * settings.animationSpeed,
        z: (Math.random() - 0.5) * 0.01 * settings.animationSpeed
      }
      ;(mesh as any).floatSpeed = Math.random() * 0.005 + 0.003
      ;(mesh as any).floatOffset = Math.random() * Math.PI * 2

      objects.push(mesh)
      scene.add(mesh)
    }
    objectsRef.current = objects

    // Simplified lighting for better performance
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(50, 50, 50)
    scene.add(directionalLight)

    // Optimized animation loop with frame rate limiting
    let lastTime = 0
    const targetFPS = 30 // Limit to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        const time = currentTime * 0.001

        // Animate objects with reduced calculations
        objects.forEach((object, index) => {
          // Rotation animation
          object.rotation.x += (object as any).rotationSpeed.x
          object.rotation.y += (object as any).rotationSpeed.y
          object.rotation.z += (object as any).rotationSpeed.z

          // Simplified floating animation
          if (index % 2 === 0) { // Only animate every other object for performance
            const floatOffset = (object as any).floatOffset
            const floatSpeed = (object as any).floatSpeed
            object.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.05
          }
        })

        // Subtle camera movement
        camera.position.x = Math.sin(time * 0.0003) * 3
        camera.position.y = Math.cos(time * 0.0002) * 2
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
        lastTime = currentTime
      }

      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (currentMount && rendererRef.current) {
        currentMount.removeChild(rendererRef.current.domElement)
      }
      
      // Dispose of Three.js objects
      objects.forEach(object => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [settings.objects, settings.animationSpeed, handleResize])

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' 
      }}
    />
  )
}
