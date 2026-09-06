const canvasThemeTokens = [
  "--foreground",
  "--muted-foreground",
  "--border",
  "--muted",
] as const

export function getCanvasThemePalette(inverted = false) {
  const styles = getComputedStyle(document.documentElement)
  const neutralColors = canvasThemeTokens.map((token) =>
    styles.getPropertyValue(token).trim()
  )

  if (inverted) {
    neutralColors[0] = styles.getPropertyValue("--background").trim()
    neutralColors[3] = styles.getPropertyValue("--secondary").trim()
  }

  return [...neutralColors, "color(display-p3 0.04 0.74 0.49)"]
}
