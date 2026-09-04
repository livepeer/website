// Strands.
//
// Many thin lines crossing the hero, each on its own path, drawn toward one
// line as they pass the centre — the page's idea (independent teams, one
// network) drawn rather than said. The field is strongest along the top and
// has faded to nothing before the headline, so the text sits on clean ground.
//
// Colour arrives as uniforms resolved from the theme tokens, so the strands
// are the foreground at low alpha and the accent is the brand green — the same
// palette the agent hero's particles use. Output is premultiplied for a
// transparent canvas over the page.

struct Params {
  strand: vec4f,   // foreground rgb, alpha
  accent: vec4f,   // brand green rgb, alpha
  time: f32,
  aspect: f32,     // canvas width / height, so drift is the same speed at any size
  fade: f32,       // v at which the field has faded out
  pull: f32,       // how far a strand is drawn toward the centre line
}
@group(0) @binding(0) var<uniform> params: Params;

const STRANDS: u32 = 16u;

fn hash(n: f32) -> f32 {
  return fract(sin(n * 12.9898 + 78.233) * 43758.5453);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let x = uv.x * params.aspect;
  var rgb = vec3f(0.0);
  var alpha = 0.0;

  // 0 at either edge, 1 at the middle of the hero.
  let centre = 1.0 - smoothstep(0.0, 0.5, abs(uv.x - 0.5));

  for (var i = 0u; i < STRANDS; i = i + 1u) {
    let fi = f32(i);
    let base = 0.06 + hash(fi + 1.0) * 0.7;
    let amp = 0.02 + hash(fi + 7.0) * 0.05;
    let freq = 1.0 + hash(fi + 13.0) * 1.8;
    let speed = 0.04 + hash(fi + 21.0) * 0.05;
    let phase = hash(fi + 29.0) * 6.2832;
    let width = 0.0012 + hash(fi + 41.0) * 0.0022;
    let isAccent = hash(fi + 53.0) > 0.8;

    var y = base
      + amp * sin(freq * x + phase + params.time * speed)
      + amp * 0.45 * sin(freq * 2.3 * x - phase + params.time * speed * 1.6);
    // Drawn toward one line as the strand crosses the middle.
    y = mix(y, 0.42, centre * params.pull);

    let d = abs(uv.y - y);
    let line = 1.0 - smoothstep(0.0, width * 3.0, d);
    let colour = select(params.strand, params.accent, isAccent);
    let a = colour.a * line;
    rgb = rgb + colour.rgb * a;
    alpha = alpha + a;
  }

  // Strongest along the top, gone before the text band.
  let mask = 1.0 - smoothstep(0.0, params.fade, uv.y);
  let a = min(alpha, 1.0) * mask;
  // Keep the colour premultiplied by the same clamp the alpha took.
  let scale = a / max(alpha, 0.00001);
  return vec4f(rgb * scale, a);
}
