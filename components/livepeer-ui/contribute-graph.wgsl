// The graph.
//
// A contribution graph: seven rows of rounded squares, a row per day and
// a column per week, each lit by how much happened that day. It is the
// most recognisable picture there is of people doing work in the open,
// and this page is about joining that. The activity is a slow tide — a
// cell steps a level now and then, the way the real one does when a
// commit lands, never faster than the eye can follow.
//
// Geometry is in device pixels and matches the CSS grid painted behind
// the canvas as the no-WebGPU fallback: same pitch, same cell, columns
// centred the same way, so the two never disagree by a pixel. Output is
// premultiplied for a transparent canvas over the page.

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
const ROWS: f32 = 7.0;

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
  if (cid.y >= ROWS) {
    return vec4f(0.0);
  }

  // A rounded square, anti-aliased over about a device pixel.
  let local = p - cid * pitch - cell * 0.5;
  let d = length(max(abs(local) - (cell * 0.5 - radius), vec2f(0.0))) - radius;
  let coverage = 1.0 - smoothstep(-0.6, 0.6, d);

  // How much happened that day. A slow field across the weeks gives the
  // busy stretches and the quiet ones; a fixed per-day jitter gives the
  // day-to-day. Only the field moves, so a cell keeps its character and
  // changes level only as the tide passes it.
  let t = params.time;
  let q = vec2f(cid.x * 0.085, cid.y * 0.21);
  let n = fbm(q + vec2f(t * 0.012, t * 0.004)) * 0.72 + hash(cid + 0.5) * 0.28;

  // Four levels of green, as the real one has; the rest are empty days.
  var level = 0.0;
  if (n > 0.50) { level = 0.28; }
  if (n > 0.60) { level = 0.50; }
  if (n > 0.69) { level = 0.74; }
  if (n > 0.78) { level = 1.0; }

  var colour = params.empty;
  if (level > 0.0) {
    colour = vec4f(params.green.rgb, level);
  }
  let a = colour.a * coverage;
  return vec4f(colour.rgb * a, a);
}
