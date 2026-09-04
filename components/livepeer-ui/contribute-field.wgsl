// The field.
//
// A slow, drifting ground of dots behind the hero: one smooth value, put
// through an ordered dither, so every dot is either there or not and the
// gradient lives in how many of them there are. The blog's card art is
// dithered the same way — this is that grammar, moving. Grey where the
// field is dim, brand green where it peaks, and gone before the headline.
//
// Colour arrives as uniforms resolved from the theme tokens. Output is
// premultiplied for a transparent canvas over the page.

struct Params {
  dim: vec4f,      // foreground rgb, alpha — the grey dots
  accent: vec4f,   // brand green rgb, alpha — the bright ones
  size: vec2f,     // canvas, in device pixels
  time: f32,
  cell: f32,       // dot pitch, in device pixels
  fade: f32,       // v at which the field has faded out
}
@group(0) @binding(0) var<uniform> params: Params;

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

// 8×8 Bayer threshold for a cell: the bits of (x ^ y) and y, interleaved.
fn bayer(c: vec2u) -> f32 {
  let x = c.x & 7u;
  let y = c.y & 7u;
  let z = x ^ y;
  var v = 0u;
  for (var i = 0u; i < 3u; i = i + 1u) {
    let shift = 2u * (2u - i);
    v = v | (((z >> i) & 1u) << (shift + 1u)) | (((y >> i) & 1u) << shift);
  }
  return (f32(v) + 0.5) / 64.0;
}

@fragment fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  // Everything is decided once per cell, at its centre, so a dot is one
  // colour and either present or absent.
  let cid = floor(pos.xy / params.cell);
  let centre = (cid + 0.5) * params.cell / params.size;
  let aspect = params.size.x / params.size.y;
  let q = vec2f(centre.x * aspect, centre.y) * 2.0;
  let t = params.time;

  // Two layers drifting in different directions, so the shapes change
  // rather than scroll past.
  let n = fbm(q + vec2f(t * 0.040, t * 0.016)) * 0.65
    + fbm(q * 1.6 + vec2f(-t * 0.025, t * 0.030) + 9.0) * 0.35;

  // Faint at the very top edge, fullest just below it, gone before the text.
  let mask = smoothstep(0.0, 0.14, centre.y)
    * (1.0 - smoothstep(0.1, params.fade, centre.y));
  let density = smoothstep(0.34, 0.76, n) * mask;
  let on = step(bayer(vec2u(cid)), density);

  // A round dot, not a square cell.
  let local = fract(pos.xy / params.cell) - 0.5;
  let aa = 1.0 / params.cell;
  let disc = 1.0 - smoothstep(0.30 - aa, 0.30 + aa, length(local));

  // Green where the field peaks.
  let green = smoothstep(0.52, 0.80, n);
  let colour = mix(params.dim, params.accent, green);
  let a = colour.a * on * disc;
  return vec4f(colour.rgb * a, a);
}
