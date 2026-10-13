"use client";

// Reads the theme off the document, so it only runs in the browser. The
// directive keeps a Server Component from importing it by mistake: called
// from one it would fail at runtime on `document`, and this way it fails at
// the import instead.

const canvasThemeTokens = [
  "--foreground",
  "--muted-foreground",
  "--border",
  "--muted",
] as const;

export function getCanvasThemePalette(inverted = false) {
  const styles = getComputedStyle(document.documentElement);
  const neutralColors = canvasThemeTokens.map((token) =>
    styles.getPropertyValue(token).trim()
  );

  if (inverted) {
    neutralColors[0] = styles.getPropertyValue("--background").trim();
    neutralColors[3] = styles.getPropertyValue("--secondary").trim();
  }

  // The brand green is `--color-brand` in app/globals.css, one value for the
  // canvases and the utilities alike; a literal repeated here would be a
  // second copy to keep in step.
  return [...neutralColors, styles.getPropertyValue("--color-brand").trim()];
}
