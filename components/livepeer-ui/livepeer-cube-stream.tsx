"use client"

import { useEffect, useRef } from "react"

import { getCanvasThemePalette } from "@/components/canvas-theme"
import { cn } from "@/lib/utils"

const desktopParticleCount = 1800
const mobileParticleCount = 650
// The count the desktop field was tuned at. Above this the canvas keeps
// growing but the particle count would not, so the stream thins out on wide
// monitors — worst at the bottom, where it stops reading as rising from the
// footer. The section's height is fixed, so area grows linearly with width and
// the count should too. The cap covers 3440 (the common ultrawide) at full
// density; past that it degrades rather than paying for particles at a size
// nobody can pick out.
const referenceWidth = 1440
const maxDensityScale = 2.4

function particleCountFor(width: number) {
  if (width < 640) return mobileParticleCount
  const scale = Math.min(maxDensityScale, Math.max(1, width / referenceWidth))
  return Math.round(desktopParticleCount * scale)
}

type Particle = {
  colorIndex: number
  speed: number
  wave: number
  vx: number
  vy: number
  x: number
  y: number
}

function noise(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function makeParticles(
  count: number,
  width: number,
  height: number,
  variant: "banner" | "card" | "default"
): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const progress = noise(index + 3)
    const arch = progress * progress
    const centerX = (0.46 + progress * 0.12 + arch * 0.3) * width
    const spread =
      (noise(index + 19) * 2 - 1) *
      Math.min(width * 0.25, 340) *
      (0.4 + progress * 0.6)
    const fieldCenterX =
      width *
      (width < 640
        ? 0.18
        : variant === "banner"
          ? 0.5
          : variant === "card"
            ? 0.32
            : 0.3)
    const fieldCenterY = height * 0.5
    const fieldRadius =
      width < 640
        ? width * 0.92
        : variant === "banner"
          ? Math.min(width * 0.42, height * 0.68)
          : variant === "card"
            ? Math.min(width * 0.42, height * 0.95)
            : Math.min(width * 0.36, height * 0.54)
    let x = centerX + spread
    let y = (-0.1 + progress * 1.2) * height
    const fieldX = x - fieldCenterX
    const fieldY = y - fieldCenterY
    const distance = Math.max(1, Math.hypot(fieldX, fieldY))

    if (distance < fieldRadius) {
      x = fieldCenterX + (fieldX / distance) * fieldRadius
      y = fieldCenterY + (fieldY / distance) * fieldRadius
    }

    return {
      colorIndex: Math.floor(noise(index + 41) * 5),
      speed: 0.72 + noise(index + 29) * 0.72,
      wave: noise(index + 67) * Math.PI * 2,
      vx: (noise(index + 73) - 0.5) * 0.18,
      vy: -(0.9 + noise(index + 79) * 0.85),
      x,
      y,
    }
  })
}

/**
 * `bleedTop` lets the canvas element extend above its section without moving
 * the field. Every geometry term below is a fraction of the canvas height, so
 * simply making the element taller re-centres and rescales the whole arc. With
 * a bleed, the field is still laid out against the section's own height and is
 * drawn anchored to the bottom; the extra strip on top is pure overflow, where
 * the crown of the arc — which the canvas edge used to clip — can now be seen.
 */
function LivepeerCubeStream({
  bleedTop = 0,
  className,
  freezeAtSeconds,
  inverted = false,
  startAtSeconds = 0,
  variant = "default",
}: {
  bleedTop?: number
  className?: string
  freezeAtSeconds?: number
  inverted?: boolean
  startAtSeconds?: number
  variant?: "banner" | "card" | "default"
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
    let heroExclusionRadius = 0
    let isPrerolling = false
    let resizeFrame = 0
    let width = 0
    let particles: Particle[] = []
    let palette = getCanvasThemePalette(inverted)
    let readyFrame = 0
    let readyPaintFrame = 0
    let start = performance.now() - startAtSeconds * 1000
    let previousTime = start

    if (freezeAtSeconds !== undefined) {
      delete document.documentElement.dataset.captureReady
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const nextWidth = bounds.width
      // The layout height excludes the bleed strip, so the field is composed
      // against the section it belongs to rather than the element's full box.
      const nextHeight = bounds.height - bleedTop

      if (nextWidth <= 0 || nextHeight <= 0) return

      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const previousWidth = width
      const previousHeight = height
      const crossedMobileBreakpoint =
        previousWidth > 0 && previousWidth < 640 !== nextWidth < 640

      width = nextWidth
      height = nextHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(bounds.height * ratio)
      // Origin sits at the top of the layout box, so the bleed strip occupies
      // negative y and everything below draws exactly where it did before.
      context.setTransform(ratio, 0, 0, ratio, 0, bleedTop * ratio)

      const heroCopy =
        variant === "card" || variant === "banner"
          ? canvas.parentElement?.querySelector("[data-particle-exclusion]")
          : canvas.parentElement?.querySelector("h1")?.parentElement

      if (heroCopy instanceof HTMLElement && width >= 640) {
        const copyBounds = heroCopy.getBoundingClientRect()
        const fieldCenterX =
          width *
          (variant === "banner" ? 0.5 : variant === "card" ? 0.32 : 0.3)
        const fieldCenterY = height * 0.5
        const fieldPadding = variant === "card" ? 20 : 32
        const copyRight = copyBounds.right - bounds.left + fieldPadding
        const copyTop = copyBounds.top - bounds.top - fieldPadding - bleedTop
        const copyBottom =
          copyBounds.bottom - bounds.top + fieldPadding - bleedTop

        heroExclusionRadius = Math.max(
          Math.hypot(copyRight - fieldCenterX, copyTop - fieldCenterY),
          Math.hypot(copyRight - fieldCenterX, copyBottom - fieldCenterY)
        )
      }

      const targetCount = particleCountFor(width)

      if (particles.length === 0 || crossedMobileBreakpoint) {
        particles = makeParticles(targetCount, width, height, variant)
        return
      }

      const scaleX = width / previousWidth
      const scaleY = height / previousHeight

      for (const particle of particles) {
        particle.x *= scaleX
        particle.y *= scaleY
        particle.vx *= scaleX
        particle.vy *= scaleY
      }

      // Reconcile toward the width's target rather than regenerating: dragging
      // a window wider should thicken the stream, not restart it. makeParticles
      // is deterministic per index, so the tail beyond the current length is
      // exactly the set this width would have had.
      if (particles.length < targetCount) {
        particles.push(
          ...makeParticles(targetCount, width, height, variant).slice(
            particles.length
          )
        )
      } else if (particles.length > targetCount) {
        particles.length = targetCount
      }
    }

    const draw = (time: number) => {
      context.clearRect(0, -bleedTop, width, height + bleedTop)

      const elapsed = reduceMotion ? 2.8 : (time - start) / 1000
      const delta = reduceMotion
        ? 0
        : Math.min(2, Math.max(0.25, (time - previousTime) / 16.667))
      previousTime = time
      const fieldCenterX =
        width *
        (width < 640
          ? 0.18
          : variant === "banner"
            ? 0.5
            : variant === "card"
              ? 0.32
              : 0.3)
      const fieldCenterY = height * 0.5
      const fieldRadius =
        width < 640
          ? width * 0.92
          : Math.max(
              variant === "banner"
                ? Math.min(width * 0.42, height * 0.68)
                : variant === "card"
                  ? Math.min(width * 0.42, height * 0.95)
                  : Math.min(width * 0.42, height * 0.78),
              heroExclusionRadius
            )
      const influenceRadius =
        fieldRadius +
        Math.min(
          width * (variant === "card" || variant === "banner" ? 0.15 : 0.1),
          180
        )
      const particleSize = width < 640 ? 2 : variant === "banner" ? 5 : 3
      const windForce =
        width < 640
          ? -0.002
          : variant === "card" || variant === "banner"
            ? -0.014
            : -0.0065

      for (const particle of particles) {
        const waveX = Math.sin(elapsed * 1.4 + particle.wave) * 0.004
        const waveY = Math.cos(elapsed * 1.1 + particle.wave) * 0.003
        const riseProgress = Math.max(0, 1 - particle.y / height)
        const risingWindForce = windForce * (1 + riseProgress * 1.2)
        const fieldX = particle.x - fieldCenterX
        const fieldY = particle.y - fieldCenterY
        const fieldDistance = Math.max(1, Math.hypot(fieldX, fieldY))

        const approachDistance = Math.min(width * 0.28, 360)
        const approachProgress = Math.max(
          0,
          1 - (fieldDistance - influenceRadius) / approachDistance
        )

        if (approachProgress > 0) {
          const proximity =
            fieldDistance < influenceRadius
              ? 1 - fieldDistance / influenceRadius
              : approachProgress * 0.16
          const radialX = fieldX / fieldDistance
          const radialY = fieldY / fieldDistance
          const radialError = fieldDistance - fieldRadius
          const radialForce =
            radialError *
            (variant === "card" || variant === "banner"
              ? 0.00006
              : 0.000035) *
            proximity
          const orbitForce =
            proximity *
            proximity *
            (variant === "card" || variant === "banner" ? 0.085 : 0.06)

          // The demo combines radial gravity with a stronger perpendicular
          // force. Here the target radius protects the copy while the
          // clockwise tangent carries the current upward around it.
          particle.vx += (-radialX * radialForce + radialY * orbitForce) * delta
          particle.vy += (-radialY * radialForce - radialX * orbitForce) * delta
        }

        particle.vx += (risingWindForce + waveX) * delta
        particle.vy += (-0.012 * particle.speed + waveY) * delta
        particle.vx *= Math.pow(0.992, delta)
        particle.vy *= Math.pow(0.992, delta)
        particle.x += particle.vx * delta
        particle.y += particle.vy * delta

        const nextFieldX = particle.x - fieldCenterX
        const nextFieldY = particle.y - fieldCenterY
        const nextFieldDistance = Math.max(
          1,
          Math.hypot(nextFieldX, nextFieldY)
        )

        if (nextFieldDistance < fieldRadius) {
          const normalX = nextFieldX / nextFieldDistance
          const normalY = nextFieldY / nextFieldDistance
          const inwardVelocity = particle.vx * normalX + particle.vy * normalY

          particle.x = fieldCenterX + normalX * fieldRadius
          particle.y = fieldCenterY + normalY * fieldRadius

          if (inwardVelocity < 0) {
            particle.vx -= inwardVelocity * normalX
            particle.vy -= inwardVelocity * normalY
          }
        }

        // Recycling has to happen past the top of the *element*, not the layout
        // box — otherwise particles are retired at the old boundary and the
        // bleed strip stays empty, which is the clipping this was meant to fix.
        if (
          particle.y < -bleedTop - height * 0.16 ||
          particle.x < -width * 0.25 ||
          particle.x > width * 1.25
        ) {
          const spread = (noise(particle.wave + time) * 2 - 1) * width * 0.18
          particle.x = width * 0.7 + spread
          particle.y = height * (1.04 + noise(particle.wave + 11) * 0.12)
          particle.vx = -0.08 - noise(particle.wave + 17) * 0.18
          particle.vy = -(0.9 + particle.speed * 0.58)
        }

        context.globalAlpha = 1

        if (variant === "banner" && particle.x < fieldCenterX) {
          continue
        }

        context.fillStyle = palette[particle.colorIndex]
        context.fillRect(
          Math.round(particle.x - particleSize / 2),
          Math.round(particle.y - particleSize / 2),
          particleSize,
          particleSize
        )
      }

      context.globalAlpha = 1
      const frozen =
        freezeAtSeconds !== undefined && elapsed >= freezeAtSeconds

      if (frozen || reduceMotion) {
        if (
          freezeAtSeconds !== undefined &&
          !isPrerolling &&
          readyFrame === 0
        ) {
          readyFrame = requestAnimationFrame(() => {
            readyPaintFrame = requestAnimationFrame(() => {
              document.documentElement.dataset.captureReady = "true"
            })
          })
        }
      } else if (!isPrerolling) {
        frame = requestAnimationFrame(draw)
      }
    }

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    })
    const themeObserver = new MutationObserver(() => {
      palette = getCanvasThemePalette(inverted)
      if (reduceMotion) draw(performance.now())
    })
    observer.observe(canvas)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    frame = requestAnimationFrame(() => {
      resize()

      const prerollStart = performance.now()
      start = prerollStart
      previousTime = prerollStart

      if (!reduceMotion && startAtSeconds > 0) {
        isPrerolling = true

        for (
          let simulatedTime = 16.667;
          simulatedTime <= startAtSeconds * 1000;
          simulatedTime += 16.667
        ) {
          draw(prerollStart + simulatedTime)
        }

        isPrerolling = false
      }

      const playbackStart = performance.now()
      start = playbackStart - startAtSeconds * 1000
      previousTime = playbackStart
      frame = requestAnimationFrame(draw)
    })

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(readyFrame)
      cancelAnimationFrame(readyPaintFrame)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      themeObserver.disconnect()
      if (freezeAtSeconds !== undefined) {
        delete document.documentElement.dataset.captureReady
      }
    }
  }, [bleedTop, freezeAtSeconds, inverted, startAtSeconds, variant])

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

export { LivepeerCubeStream }
