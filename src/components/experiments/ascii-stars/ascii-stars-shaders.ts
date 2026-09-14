// Ordered-dither thresholds adapted from niccolofanton/dithering-shader (MIT).
// See THIRD_PARTY_LICENSE.txt in this directory for attribution and license.
export const screenVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const sculptureVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

export const sculptureFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(-vPosition);
    vec3 reflected = reflect(-view, normal);
    // Broad studio reflections give the thin sculpture a changing chrome relief.
    float angle = uTime * 0.16;
    vec3 key = normalize(vec3(cos(angle) * 0.8, 0.7, 1.2));
    float diffuse = max(dot(normal, key), 0.0);
    float strip = pow(max(0.0, 1.0 - abs(reflected.x * 0.8 + reflected.y * 0.6 - 0.25)), 14.0);
    float secondStrip = pow(max(0.0, 1.0 - abs(reflected.y - 0.45)), 22.0);
    float darkBand = smoothstep(-0.12, 0.08, reflected.x) * (1.0 - smoothstep(0.25, 0.48, reflected.x));
    float rim = pow(1.0 - abs(dot(normal, view)), 2.5);
    float light = 0.23 + diffuse * 0.37 + strip * 0.43 + secondStrip * 0.24;
    light = light * (1.0 - darkBand * 0.76) + rim * 0.16;
    gl_FragColor = vec4(vec3(clamp(light, 0.08, 0.96)), 1.0);
  }
`

export const asciiFragmentShader = /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uGlyphs;
  uniform vec2 uResolution;
  uniform float uCell;
  uniform float uMode;
  uniform float uTransparent;
  uniform float uExport;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  varying vec2 vUv;

  float bayer(vec2 position) {
    ivec2 p = ivec2(mod(floor(position), 4.0));
    if (p.x == 0) {
      if (p.y == 0) return 16.0 / 17.0;
      if (p.y == 1) return 5.0 / 17.0;
      if (p.y == 2) return 13.0 / 17.0;
      return 1.0 / 17.0;
    }
    if (p.x == 1) {
      if (p.y == 0) return 8.0 / 17.0;
      if (p.y == 1) return 12.0 / 17.0;
      if (p.y == 2) return 4.0 / 17.0;
      return 9.0 / 17.0;
    }
    if (p.x == 2) {
      if (p.y == 0) return 14.0 / 17.0;
      if (p.y == 1) return 2.0 / 17.0;
      if (p.y == 2) return 15.0 / 17.0;
      return 3.0 / 17.0;
    }
    if (p.y == 0) return 6.0 / 17.0;
    if (p.y == 1) return 10.0 / 17.0;
    if (p.y == 2) return 7.0 / 17.0;
    return 11.0 / 17.0;
  }

  vec4 inkColor(float coverage) {
    // Straight alpha retains the ink color at soft edges on any background.
    if (uTransparent > 0.5) return vec4(uInk, coverage);
    return vec4(mix(uPaper, uInk, coverage), 1.0);
  }

  float ditherMark(vec2 pixel) {
    float dotSize = max(1.0, uCell * 0.22);
    vec2 dotGrid = floor(pixel / dotSize);
    vec4 sampleColor = texture2D(uScene, (dotGrid + 0.5) * dotSize / uResolution);
    float darkness = clamp(1.0 - sampleColor.r * 0.86, 0.12, 0.95);
    return step(bayer(dotGrid), darkness) * step(0.3, sampleColor.a);
  }

  void main() {
    vec2 pixel = vUv * uResolution;
    if (uMode > 0.5) {
      float mark = ditherMark(pixel);
      if (uExport > 0.5) {
        // Subpixel coverage smooths fractional dot edges in the exported PNG.
        mark = (ditherMark(pixel + vec2(-0.25, -0.25))
              + ditherMark(pixel + vec2(0.25, -0.25))
              + ditherMark(pixel + vec2(-0.25, 0.25))
              + ditherMark(pixel + vec2(0.25, 0.25))) * 0.25;
      }
      gl_FragColor = inkColor(mark);
      return;
    }

    vec2 cellSize = vec2(uCell, uCell * 1.3);
    vec2 cell = floor(pixel / cellSize);
    vec2 local = fract(pixel / cellSize);
    vec4 sampleColor = texture2D(uScene, (cell + 0.5) * cellSize / uResolution);
    float darkness = clamp(1.0 - sampleColor.r * 0.92, 0.08, 0.96);
    // Bayer quantizes brightness into neighboring glyphs instead of flat pixels.
    float glyph = clamp(floor(darkness * 15.0 + bayer(cell) * 1.8), 1.0, 15.0);
    vec2 atlasUv = vec2((glyph + local.x) / 16.0, local.y);
    float mark = texture2D(uGlyphs, atlasUv).a;
    mark *= step(0.28, sampleColor.a);
    gl_FragColor = inkColor(mark);
  }
`
