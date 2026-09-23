// The graph.
//
// A contribution graph as a ground: the grid a contributor's year is drawn
// on, filling the hero — the picture of people doing work in the open,
// behind the page that asks the reader to join them.
//
// Two things move. A tide: one slow field, so the busy stretches and the
// quiet ones creep, and a cell steps a level as the field passes it. A
// swell: a slow diagonal wave over the tide, so whole regions brighten and
// dim together in a sweep. The steps are hard — a cell snaps between
// levels — so the motion reads as cells lighting, and a passing swell as a
// wave of them. Sparse throughout: about one day in eight is lit, and the
// graph is the gaps. An event model was tried in between, with weeks
// passing and commits landing; it was truer and weaker.
//
// Geometry is in device pixels and matches the CSS grid painted behind the
// canvas as the no-WebGPU fallback: same pitch, same cell, columns centred
// the same way. The clearing around the text is a CSS mask on the canvas,
// not drawn here. Colour is handled premultiplied throughout, for a
// transparent canvas over the page.

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
// Rows are phased so a gap falls on the site header's bottom edge (64px
// from the top of the window, where the canvas starts): (64 + gap / 2) mod
// pitch. Otherwise the header's glass slices a row and leaves a sliver of
// every cell showing under it.
const ROW_OFFSET: f32 = 9.5;

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
  let t = params.time;

  // Columns centred on the canvas, as `background-position: center` centres
  // the fallback's tile; rows phased to the header, as its y offset is.
  let origin = vec2f(params.size.x * 0.5 - pitch * 0.5, ROW_OFFSET * params.dpr);
  let p = pos.xy - origin;
  let cid = floor(p / pitch);

  // A rounded square, anti-aliased over about a device pixel.
  let local = p - cid * pitch - cell * 0.5;
  let d = length(max(abs(local) - (cell * 0.5 - radius), vec2f(0.0))) - radius;
  let coverage = 1.0 - smoothstep(-0.6, 0.6, d);

  // How much happened that day. The tide gives the busy stretches and the
  // quiet ones; the swell moves through them; a fixed per-day jitter gives
  // the day-to-day, so a cell keeps its character and changes level as the
  // two pass it. Busier toward the top: on a phone the clearing spans the
  // width and only the rows above the eyebrow survive.
  let q = cid * 0.075;
  let tide = fbm(q + vec2f(t * 0.014, t * 0.005));
  let swell = 0.5 + 0.5 * sin((cid.x * 0.55 + cid.y * 0.85) * 0.09 - t * 0.06);
  let lift = 0.05 * (1.0 - clamp(pos.y / params.size.y, 0.0, 1.0));
  let n = tide * 0.62 + swell * 0.23 + hash(cid + 0.5) * 0.15 + lift;

  // Four levels of green, as the real one has, set so about one day in
  // eight is lit: the graph is the gaps. Hard steps, on purpose — easing
  // was tried and turned lighting into breathing. Mixed premultiplied, so
  // the arithmetic stays exact for an empty cell at 4% alpha. The four
  // greens arrive resolved for the theme (see the component).
  var colour = pm(params.empty);
  colour = mix(colour, pm(params.level1), step(0.66, n));
  colour = mix(colour, pm(params.level2), step(0.73, n));
  colour = mix(colour, pm(params.level3), step(0.79, n));
  colour = mix(colour, pm(params.level4), step(0.85, n));
  return colour * coverage;
}
