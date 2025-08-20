"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeBackgroundProps {
  className?: string
}

export default function ThreeBackground({ className = '' }: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Create floating geometric objects
    const objects: THREE.Mesh[] = []
    
    // Create various geometric shapes
    const geometries = [
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.ConeGeometry(1, 3, 8),
      new THREE.TetrahedronGeometry(2),
      new THREE.OctahedronGeometry(1.5),
      new THREE.DodecahedronGeometry(1.5),
      new THREE.IcosahedronGeometry(1.5),
      new THREE.TorusGeometry(1.5, 0.5, 16, 100)
    ]

    // Create materials with different colors and properties
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x4f46e5, 
        transparent: true, 
        opacity: 0.7,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x06b6d4, 
        transparent: true, 
        opacity: 0.6,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.8,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xf59e0b, 
        transparent: true, 
        opacity: 0.7,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0.6,
        shininess: 100
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x10b981, 
        transparent: true, 
        opacity: 0.7,
        shininess: 100
      })
    ]

    // Create 20 floating objects
    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)]
      const material = materials[Math.floor(Math.random() * materials.length)]
      const mesh = new THREE.Mesh(geometry, material)

      // Random positioning
      mesh.position.x = (Math.random() - 0.5) * 100
      mesh.position.y = (Math.random() - 0.5) * 100
      mesh.position.z = (Math.random() - 0.5) * 100

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI
      mesh.rotation.y = Math.random() * Math.PI
      mesh.rotation.z = Math.random() * Math.PI

      // Random scale
      const scale = Math.random() * 0.5 + 0.5
      mesh.scale.setScalar(scale)

      // Store animation properties
      ;(mesh as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      }
      ;(mesh as any).floatSpeed = Math.random() * 0.01 + 0.005
      ;(mesh as any).floatOffset = Math.random() * Math.PI * 2

      objects.push(mesh)
      scene.add(mesh)
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(50, 50, 50)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0x4f46e5, 0.4)
    directionalLight2.position.set(-50, -50, -50)
    scene.add(directionalLight2)

    const pointLight = new THREE.PointLight(0x06b6d4, 0.6, 100)
    pointLight.position.set(0, 0, 50)
    scene.add(pointLight)

    // Animation loop
    let time = 0
    const animate = () => {
      time += 0.01

      // Animate objects
      objects.forEach((object, index) => {
        // Rotation animation
        object.rotation.x += (object as any).rotationSpeed.x
        object.rotation.y += (object as any).rotationSpeed.y
        object.rotation.z += (object as any).rotationSpeed.z

        // Floating animation
        const floatOffset = (object as any).floatOffset
        const floatSpeed = (object as any).floatSpeed
        object.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.1

        // Gentle drift
        object.position.x += Math.sin(time * 0.001 + index) * 0.02
        object.position.z += Math.cos(time * 0.001 + index) * 0.02
      })

      // Camera gentle movement
      camera.position.x = Math.sin(time * 0.0005) * 5
      camera.position.y = Math.cos(time * 0.0003) * 3
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return
      
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      // Use the captured mount element to avoid stale closure
      if (currentMount && rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
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
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

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
