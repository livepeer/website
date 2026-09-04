// The graph.
//
// A contribution graph as a ground: the grid of rounded squares a
// contributor's year is drawn on, filling the hero, with activity moving
// through it as slow bands — the picture of people doing work in the open,
// behind the page that asks the reader to join them. A cell steps a level
// now and then as a band passes; nothing scrolls.
//
// Geometry is in device pixels and matches the CSS grid painted behind the
// canvas as the no-WebGPU fallback: same pitch, same cell, columns centred
// the same way. The clearing around the text is a CSS mask on the canvas,
// not drawn here, so it shapes the fallback and this output alike. Output
// is premultiplied for a transparent canvas over the page.

struct Params {
  green: vec4f,  // brand green rgb; a unused
  empty: vec4f,  // foreground rgb, alpha — a day with nothing on it
  size: vec2f,   // canvas, in device pixels
  time: f32,
  dpr: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

const PITCH: f32 = 14.0;  // CSS px, cell plus gap
const CELL: f32 = 11.0;
const RADIUS: f32 = 2.0;

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

// Value noise, smooth between lattice points.
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
    mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p: vec2f) -> f32 {
  return (noise(p) * 0.5
    + noise(p * 2.03 + 17.0) * 0.25
    + noise(p * 4.07 + 31.0) * 0.125) / 0.875;
}

@fragment fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let pitch = PITCH * params.dpr;
  let cell = CELL * params.dpr;
  let radius = RADIUS * params.dpr;

  // Columns centred on the canvas, as `background-position: center` centres
  // the fallback's tile.
  let origin = vec2f(params.size.x * 0.5 - pitch * 0.5, 0.0);
  let p = pos.xy - origin;
  let cid = floor(p / pitch);

  // A rounded square, anti-aliased over about a device pixel.
  let local = p - cid * pitch - cell * 0.5;
  let d = length(max(abs(local) - (cell * 0.5 - radius), vec2f(0.0))) - radius;
  let coverage = 1.0 - smoothstep(-0.6, 0.6, d);

  // How much happened that day. A slow field gives the busy stretches and
  // the quiet ones; a diagonal swell moving through it gives the bands; a
  // fixed per-day jitter gives the day-to-day. Only the field and the swell
  // move, so a cell keeps its character and changes level as they pass.
  let t = params.time;
  let q = cid * 0.075;
  let field = fbm(q + vec2f(t * 0.014, t * 0.005));
  let swell = 0.5 + 0.5 * sin((cid.x * 0.55 + cid.y * 0.85) * 0.09 - t * 0.06);
  // Busier toward the top: on a phone the clearing spans the width and only
  // the rows above the eyebrow survive, and they should carry some green.
  let lift = 0.06 * (1.0 - clamp(pos.y / params.size.y, 0.0, 1.0));
  let n = field * 0.62 + swell * 0.23 + hash(cid + 0.5) * 0.15 + lift;

  // Four levels of green, as the real one has; the rest are empty days.
  var level = 0.0;
  if (n > 0.52) { level = 0.26; }
  if (n > 0.60) { level = 0.46; }
  if (n > 0.68) { level = 0.70; }
  if (n > 0.77) { level = 0.95; }

  var colour = params.empty;
  if (level > 0.0) {
    colour = vec4f(params.green.rgb, level);
  }
  let a = colour.a * coverage;
  return vec4f(colour.rgb * a, a);
}
