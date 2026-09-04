// The graph.
//
// A contribution graph as a ground: the grid a contributor's year is drawn
// on, filling the hero — the picture of people doing work in the open,
// behind the page that asks the reader to join them.
//
// What makes the real one read is that it is mostly empty. Activity is
// sparse and clustered, and the eye finds rhythm in the gaps; a wall of lit
// cells is wallpaper. So about a fifth of the cells are lit, grouped by one
// slow field, and only that field moves — a cell changes level now and
// then, one at a time, and eases into its next colour rather than popping.
//
// Geometry is in device pixels and matches the CSS grid painted behind the
// canvas as the no-WebGPU fallback: same pitch, same cell, columns centred
// the same way. The clearing around the text is a CSS mask on the canvas,
// not drawn here, so it shapes the fallback and this output alike. Colour
// is handled premultiplied throughout, for a transparent canvas over the
// page.

struct Params {
  empty: vec4f,   // foreground rgb, alpha — a day with nothing on it
  level1: vec4f,  // the four greens, quietest first, already on the ground
  level2: vec4f,
  level3: vec4f,
  level4: vec4f,
  size: vec2f,    // canvas, in device pixels
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

fn pm(c: vec4f) -> vec4f {
  return vec4f(c.rgb * c.a, c.a);
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

  // How much happened that day. One slow field gives the busy stretches and
  // the quiet ones; a fixed per-day jitter gives the day-to-day. Only the
  // field moves, so a cell keeps its character and changes level as the
  // field passes it. Busier toward the top: on a phone the clearing spans
  // the width and only the rows above the eyebrow survive.
  let t = params.time;
  let q = cid * 0.075;
  let field = fbm(q + vec2f(t * 0.008, t * 0.003));
  let lift = 0.05 * (1.0 - clamp(pos.y / params.size.y, 0.0, 1.0));
  let n = field * 0.75 + hash(cid + 0.5) * 0.25 + lift;

  // Four levels of green, as the real one has, set so most days are empty.
  // Each threshold is a short ramp rather than a step, so a cell the field
  // is crossing eases into its next colour over a moment instead of popping.
  // The four greens arrive resolved for the theme (see the component): what
  // makes a ramp read is decided in colour space, not here.
  // Mixed premultiplied: an empty cell is the ink at 5% alpha, and halfway
  // between that and an opaque green in straight alpha is half ink at half
  // opacity — a grey tile. Premultiplied, the empty is nearly nothing and the
  // midpoint is a paler green, which is what easing in should look like.
  const W: f32 = 0.012;
  var colour = pm(params.empty);
  colour = mix(colour, pm(params.level1), smoothstep(0.60 - W, 0.60 + W, n));
  colour = mix(colour, pm(params.level2), smoothstep(0.67 - W, 0.67 + W, n));
  colour = mix(colour, pm(params.level3), smoothstep(0.73 - W, 0.73 + W, n));
  colour = mix(colour, pm(params.level4), smoothstep(0.79 - W, 0.79 + W, n));
  return colour * coverage;
}
