"use client"

import { useEffect, useRef } from "react"

import { getCanvasThemePalette } from "@/components/canvas-theme"
import { cn } from "@/lib/utils"

const desktopParticleCount = 1400
const mobileParticleCount = 600

type DeltaParticle = {
  colorIndex: number
  offset: number
  phase: number
  speed: number
  wave: number
}

function noise(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function makeParticles(count: number): DeltaParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    colorIndex: Math.floor(noise(index + 41) * 5),
    offset: noise(index + 19) * 2 - 1,
    phase: (index + noise(index + 3)) / count,
    speed: 0.78 + noise(index + 29) * 0.4,
    wave: noise(index + 67) * Math.PI * 2,
  }))
}

function LivepeerAgentDeltaStream({
  className,
  contained = false,
}: {
  className?: string
  contained?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d", { alpha: true })
    if (!context) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let frame = 0
    let height = 0
    let resizeFrame = 0
    let width = 0
    let particles: DeltaParticle[] = []
    let palette = getCanvasThemePalette()
    let start = performance.now()

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const nextWidth = bounds.width
      const nextHeight = bounds.height

      if (nextWidth <= 0 || nextHeight <= 0) return

      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const nextCount =
        nextWidth < 640 ? mobileParticleCount : desktopParticleCount

      width = nextWidth
      height = nextHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      if (particles.length !== nextCount) particles = makeParticles(nextCount)
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)

      const elapsed = reduceMotion ? 2.8 : (time - start) / 1000
      const isMobile = width < 640
      const particleSize = isMobile ? 2 : 3
      const sourceX = width * 0.5
      const sourceY =
        height *
        (contained ? (isMobile ? 0.92 : 0.94) : isMobile ? 0.255 : 0.39)
      const travelHeight =
        height * (contained ? (isMobile ? 0.96 : 0.98) : isMobile ? 0.34 : 0.4)
      const fanWidth = Math.min(
        width * (isMobile ? 0.46 : 0.34),
        isMobile ? 230 : 520
      )
      const interferenceRadius = Math.min(
        width * (isMobile ? 0.24 : 0.19),
        isMobile ? 92 : 240
      )
      const interferenceOffset = interferenceRadius
      const interferenceY = sourceY
      const interferenceReach = interferenceRadius * 1.28

      for (const particle of particles) {
        const progress = (particle.phase + elapsed * 0.09 * particle.speed) % 1
        const expansion = Math.pow(progress, 1.18)
        const originProgress = Math.min(1, progress / 0.14)
        const originBlend =
          originProgress * originProgress * (3 - 2 * originProgress)
        const turbulence =
          (Math.sin(progress * 19 + particle.wave + elapsed * 0.35) *
            (2 + expansion * 7) +
            Math.sin(progress * 43 + particle.wave * 1.7) *
              (1 + expansion * 3)) *
          originBlend
        let x =
          sourceX +
          particle.offset * fanWidth * expansion * originBlend +
          turbulence
        let y =
          sourceY -
          progress * travelHeight +
          Math.cos(progress * 17 + particle.wave) * expansion * 4

        const fieldX = x
        const fieldY = y
        let repulsionX = 0
        let repulsionY = 0

        for (const direction of [-1, 1]) {
          const circleX = sourceX + interferenceOffset * direction
          const deltaX = fieldX - circleX
          const deltaY = fieldY - interferenceY
          const distance = Math.hypot(deltaX, deltaY)

          if (distance < interferenceReach) {
            const proximity = 1 - distance / interferenceReach
            const normalX = distance > 0 ? deltaX / distance : direction
            const normalY = distance > 0 ? deltaY / distance : 0
            const displacement =
              proximity * proximity * interferenceRadius * 0.9 * originBlend

            repulsionX += normalX * displacement
            repulsionY += normalY * displacement * 0.35
          }
        }

        x += repulsionX
        y += repulsionY
        y = Math.min(y, sourceY)

        context.fillStyle = palette[particle.colorIndex]
        context.fillRect(
          Math.round(x - particleSize / 2),
          Math.round(y - particleSize / 2),
          particleSize,
          particleSize
        )
      }

      if (!reduceMotion) frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    })
    const themeObserver = new MutationObserver(() => {
      palette = getCanvasThemePalette()
      if (reduceMotion) draw(performance.now())
    })
    observer.observe(canvas)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    resize()
    start = performance.now()
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      themeObserver.disconnect()
    }
  }, [contained])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className
      )}
      aria-hidden="true"
    />
  )
}

export { LivepeerAgentDeltaStream }
