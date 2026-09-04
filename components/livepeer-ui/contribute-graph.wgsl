// The graph.
//
// A contribution graph as a ground: the grid a contributor's year is drawn
// on, filling the hero — the picture of people doing work in the open,
// behind the page that asks the reader to join them.
//
// It is animated as what it is, a record of events in time, rather than as
// a texture. Time flows: columns are weeks, the grid drifts left a column
// every ten seconds, today is the right edge. Commits land: a cell lights
// because something happened, flares for a couple of seconds, then glows
// and cools over weeks of drift. Landings are sparse and random, more
// likely inside a busy stretch and along a contributor's habitual row, and
// every so often a release sweeps across the timeline as a wave of them.
// Nothing moves without a reason to.
//
// Geometry is in device pixels and matches the CSS grid painted behind the
// canvas as the no-WebGPU fallback: same pitch, same cell, columns centred
// the same way (the drift is a whole number of columns at the still time,
// so the handover is seamless). The clearing around the text is a CSS mask
// on the canvas, not drawn here. Colour is handled premultiplied
// throughout, for a transparent canvas over the page.

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

const WEEK: f32 = 10.0;     // seconds for the grid to drift one column
const SLOT: f32 = 6.0;      // seconds per chance of a commit landing
const RELEASE: f32 = 70.0;  // seconds between release waves
const SWEEP: f32 = 6.0;     // seconds a wave takes to cross the canvas

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn hash3(p: vec3f) -> f32 {
  return fract(sin(dot(p, vec3f(127.1, 311.7, 74.7))) * 43758.5453);
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

// A commit that landed at `at`, seen at `t`: a flare that settles in a
// couple of seconds, and a glow that cools over a few weeks of drift.
fn landing(t: f32, at: f32) -> vec2f {
  let dt = t - at;
  if (dt < 0.0) {
    return vec2f(0.0);
  }
  return vec2f(exp(-dt / 1.8), exp(-dt / 25.0));
}

@fragment fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let pitch = PITCH * params.dpr;
  let cell = CELL * params.dpr;
  let radius = RADIUS * params.dpr;
  let t = params.time;

  // Columns centred on the canvas, as `background-position: center` centres
  // the fallback's tile, then carried left as the weeks pass.
  let drift = t / WEEK * pitch;
  let origin = vec2f(params.size.x * 0.5 - pitch * 0.5, 0.0);
  let p = pos.xy - origin + vec2f(drift, 0.0);
  let cid = floor(p / pitch);

  // A rounded square, anti-aliased over about a device pixel.
  let local = p - cid * pitch - cell * 0.5;
  let d = length(max(abs(local) - (cell * 0.5 - radius), vec2f(0.0))) - radius;
  let coverage = 1.0 - smoothstep(-0.6, 0.6, d);

  // What that day rests at. A field fixed to the weeks, not to the screen,
  // gives the busy stretches and the quiet ones and drifts with them; a
  // fixed per-day jitter gives the day-to-day. Busier toward the top: on a
  // phone the clearing spans the width and only the rows above the eyebrow
  // survive.
  let cluster = fbm(cid * 0.075);
  let lift = 0.05 * (1.0 - clamp(pos.y / params.size.y, 0.0, 1.0));
  var n = cluster * 0.75 + hash(cid + 0.5) * 0.25 + lift;

  // The chance, in any slot, that a commit lands on this day: small, higher
  // in a busy stretch, and higher along a row where someone has a habit —
  // the same weekday, for a run of weeks.
  let habit = step(hash(vec2f(cid.y, floor(cid.x / 8.0)) + 3.0), 0.12);
  let chance = 0.002 + 0.012 * smoothstep(0.45, 0.8, cluster) + 0.02 * habit;

  // Landings in this slot and the three before it, which is as far back as
  // a glow reaches.
  var flare = 0.0;
  var glow = 0.0;
  let slot = floor(t / SLOT);
  for (var i = 0.0; i < 4.0; i = i + 1.0) {
    let k = slot - i;
    if (hash3(vec3f(cid, k)) < chance) {
      let at = (k + hash3(vec3f(cid, k) + 7.0)) * SLOT;
      let l = landing(t, at);
      flare = max(flare, l.x);
      glow = max(glow, l.y);
    }
  }

  // A release: every so often a wave of landings sweeps the timeline left to
  // right. Screen position, since a wave crosses what is in view.
  let across = ((cid.x + 0.5) * pitch - drift + origin.x) / params.size.x;
  let wave = floor(t / RELEASE);
  for (var j = 0.0; j < 2.0; j = j + 1.0) {
    let w = wave - j;
    if (hash3(vec3f(cid, w + 500.0)) < 0.15) {
      let l = landing(t, w * RELEASE + across * SWEEP);
      flare = max(flare, l.x);
      glow = max(glow, l.y);
    }
  }
  n = n + flare * 0.2 + glow * 0.1;

  // Four levels of green, as the real one has, set so about one day in
  // eight is lit: the graph is the gaps.
  // Each threshold is a short ramp rather than a step, so a cell eases into
  // its next colour instead of popping. Mixed premultiplied: an empty cell
  // is the ink at 5% alpha, and halfway to an opaque green in straight alpha
  // is half ink at half opacity — a grey tile. The four greens arrive
  // resolved for the theme (see the component).
  const W: f32 = 0.012;
  var colour = pm(params.empty);
  colour = mix(colour, pm(params.level1), smoothstep(0.64 - W, 0.64 + W, n));
  colour = mix(colour, pm(params.level2), smoothstep(0.71 - W, 0.71 + W, n));
  colour = mix(colour, pm(params.level3), smoothstep(0.77 - W, 0.77 + W, n));
  colour = mix(colour, pm(params.level4), smoothstep(0.83 - W, 0.83 + W, n));
  return colour * coverage;
}
