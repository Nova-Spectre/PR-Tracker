"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'

interface StableThreeBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  objectCount?: number
}

export default function StableThreeBackground({ 
  className = '', 
  intensity = 'low',
  objectCount = 8
}: StableThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  // Simplified intensity settings for better performance
  const intensitySettings = {
    low: { objects: Math.min(objectCount, 6), animationSpeed: 0.3 },
    medium: { objects: Math.min(objectCount, 10), animationSpeed: 0.5 },
    high: { objects: Math.min(objectCount, 15), animationSpeed: 0.8 }
  }

  const settings = intensitySettings[intensity]

  // Theme detection with performance optimization
  useEffect(() => {
    const detectTheme = () => {
      try {
        const htmlElement = document.documentElement
        const isDark = htmlElement.classList.contains('dark') || 
                      htmlElement.getAttribute('data-theme') === 'dark' ||
                      (!htmlElement.classList.contains('light') && 
                       window.matchMedia('(prefers-color-scheme: dark)').matches)
        setIsDarkMode(isDark)
      } catch (error) {
        console.warn('Theme detection failed:', error)
        setIsDarkMode(true) // fallback to dark mode
      }
    }

    detectTheme()

    // Debounced theme detection
    let timeoutId: NodeJS.Timeout
    const debouncedDetectTheme = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(detectTheme, 100)
    }

    const observer = new MutationObserver(debouncedDetectTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', debouncedDetectTheme)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      mediaQuery.removeEventListener('change', debouncedDetectTheme)
    }
  }, [])

  // Pause animation when modal is open to prevent freezing
  useEffect(() => {
    const checkModalState = () => {
      const hasModal = document.querySelector('[role="dialog"], .modal, [data-modal]')
      setIsVisible(!hasModal)
    }

    checkModalState()
    
    // Watch for modal changes
    const observer = new MutationObserver(checkModalState)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role', 'class', 'data-modal']
    })

    return () => observer.disconnect()
  }, [])

  const handleResize = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current) return
    
    try {
      const camera = (sceneRef.current as any).camera
      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    } catch (error) {
      console.warn('Resize handler failed:', error)
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current
    let objects: THREE.Mesh[] = []

    try {
      // Scene setup
      const scene = new THREE.Scene()
      scene.fog = isDarkMode 
        ? new THREE.Fog(0x0a0a0a, 1, 1000)
        : new THREE.Fog(0xf8fafc, 1, 1000)
      
      sceneRef.current = scene

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 25
      ;(scene as any).camera = camera

      // Renderer setup with conservative settings
      const renderer = new THREE.WebGLRenderer({ 
        antialias: false, // Disable for performance
        alpha: true,
        powerPreference: "default" // Use default instead of high-performance
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Cap pixel ratio
      renderer.setClearColor(0x000000, 0)
      rendererRef.current = renderer
      currentMount.appendChild(renderer.domElement)

      // Simple geometries for better performance
      const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.8, 8, 8), // Reduced segments
        new THREE.TetrahedronGeometry(0.8),
      ]

      // Theme-based materials with reduced complexity
      const materials = isDarkMode ? [
        new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.4 }),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.3 }),
        new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 }),
      ] : [
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2 }),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.15 }),
        new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.25 }),
      ]

      // Create fewer objects with simpler animation
      for (let i = 0; i < settings.objects; i++) {
        const geometry = geometries[i % geometries.length]
        const material = materials[i % materials.length]
        const mesh = new THREE.Mesh(geometry, material)

        // Simpler positioning
        mesh.position.x = (Math.random() - 0.5) * 60
        mesh.position.y = (Math.random() - 0.5) * 60
        mesh.position.z = (Math.random() - 0.5) * 40

        // Store simple animation properties
        ;(mesh as any).rotationSpeed = {
          x: (Math.random() - 0.5) * 0.005 * settings.animationSpeed,
          y: (Math.random() - 0.5) * 0.005 * settings.animationSpeed,
          z: (Math.random() - 0.5) * 0.005 * settings.animationSpeed
        }

        objects.push(mesh)
        scene.add(mesh)
      }

      // Simple lighting
      const ambientLight = new THREE.AmbientLight(isDarkMode ? 0x404040 : 0x606060, isDarkMode ? 0.6 : 1.0)
      scene.add(ambientLight)

      // Performance-optimized animation loop
      let lastTime = 0
      const targetFPS = 20 // Lower FPS for better performance
      const frameInterval = 1000 / targetFPS

      const animate = (currentTime: number) => {
        if (!isVisible) {
          animationIdRef.current = requestAnimationFrame(animate)
          return
        }

        if (currentTime - lastTime >= frameInterval) {
          try {
            // Simple rotation animation only
            objects.forEach((object) => {
              const speed = (object as any).rotationSpeed
              object.rotation.x += speed.x
              object.rotation.y += speed.y
              object.rotation.z += speed.z
            })

            renderer.render(scene, camera)
            lastTime = currentTime
          } catch (error) {
            console.warn('Animation error:', error)
          }
        }

        animationIdRef.current = requestAnimationFrame(animate)
      }

      animate(0)

      // Add resize listener
      window.addEventListener('resize', handleResize)

    } catch (error) {
      console.error('3D Background initialization failed:', error)
    }

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      try {
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
      } catch (error) {
        console.warn('Cleanup error:', error)
      }
    }
  }, [settings.objects, settings.animationSpeed, handleResize, isDarkMode, isVisible])

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
