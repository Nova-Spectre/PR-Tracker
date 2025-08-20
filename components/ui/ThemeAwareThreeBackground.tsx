"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'

interface ThemeAwareThreeBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  objectCount?: number
}

export default function ThemeAwareThreeBackground({ 
  className = '', 
  intensity = 'medium',
  objectCount = 15
}: ThemeAwareThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const objectsRef = useRef<THREE.Mesh[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)

  const intensitySettings = {
    low: { objects: 8, animationSpeed: 0.5, renderQuality: 0.5 },
    medium: { objects: objectCount, animationSpeed: 1, renderQuality: 0.75 },
    high: { objects: objectCount * 1.5, animationSpeed: 1.5, renderQuality: 1 }
  }

  const settings = intensitySettings[intensity]

  // Theme detection
  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement
      const isDark = htmlElement.classList.contains('dark') || 
                    htmlElement.getAttribute('data-theme') === 'dark' ||
                    (!htmlElement.classList.contains('light') && 
                     window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDarkMode(isDark)
    }

    // Initial detection
    detectTheme()

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', detectTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', detectTheme)
    }
  }, [])

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
    
    // Theme-based fog and background
    if (isDarkMode) {
      scene.fog = new THREE.Fog(0x0a0a0a, 1, 1000)
      scene.background = null // Transparent for dark gradient
    } else {
      scene.fog = new THREE.Fog(0xf8fafc, 1, 1000)
      scene.background = null // Transparent for light gradient
    }
    
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
      antialias: window.devicePixelRatio <= 1,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = false
    rendererRef.current = renderer
    currentMount.appendChild(renderer.domElement)

    // Create optimized geometries
    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.ConeGeometry(0.8, 2, 6),
      new THREE.TetrahedronGeometry(1.2),
      new THREE.OctahedronGeometry(1),
    ]

    // Theme-based materials
    const darkMaterials = [
      new THREE.MeshBasicMaterial({ 
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

    const lightMaterials = [
      new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.3
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x10b981, 
        transparent: true, 
        opacity: 0.25
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.35
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0xf59e0b, 
        transparent: true, 
        opacity: 0.3
      }),
    ]

    const materials = isDarkMode ? darkMaterials : lightMaterials

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

    // Theme-based lighting
    if (isDarkMode) {
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight.position.set(50, 50, 50)
      scene.add(directionalLight)
    } else {
      const ambientLight = new THREE.AmbientLight(0x606060, 1.2)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight.position.set(50, 50, 50)
      scene.add(directionalLight)
    }

    // Optimized animation loop
    let lastTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        const time = currentTime * 0.001

        // Animate objects
        objects.forEach((object, index) => {
          // Rotation animation
          object.rotation.x += (object as any).rotationSpeed.x
          object.rotation.y += (object as any).rotationSpeed.y
          object.rotation.z += (object as any).rotationSpeed.z

          // Simplified floating animation
          if (index % 2 === 0) {
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
      darkMaterials.forEach(material => material.dispose())
      lightMaterials.forEach(material => material.dispose())
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [settings.objects, settings.animationSpeed, handleResize, isDarkMode])

  // Theme-based background gradients
  const backgroundStyle = isDarkMode 
    ? { background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }
    : { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 -z-10 ${className}`}
      style={backgroundStyle}
    />
  )
}
