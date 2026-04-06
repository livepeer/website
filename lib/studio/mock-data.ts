import type {
  Model,
  ApiKey,
  EcosystemApp,
  SolutionProvider,
  NetworkStat,
  UsageDataPoint,
} from "./types";

// ─── Models ───────────────────────────────────────────────────────────────────

export const MODELS: Model[] = [
  // ── Managed Services (SLA-backed) ──────────────────────────────────────────
  {
    id: "daydream-video",
    name: "Daydream Video API",
    provider: "Daydream",
    category: "Video",
    coverImage: "https://picsum.photos/seed/daydream-cover/600/340",
    description:
      "Full-stack real-time AI video API with world generation, style transfer, and depth estimation. Managed SLA with 99.9% uptime guarantee.",
    status: "hot",
    pricing: { amount: 0.006, unit: "Minute" },
    latency: 22,
    orchestrators: 32,
    runs7d: 4_800_000,
    uptime: 99.97,
    managed: true,
    featured: true,
    tags: ["real-time", "streaming", "video", "style-transfer"],
    sla: { uptime: "99.9%", latencyP99: "<100ms" },
    apiEndpoint: "https://api.daydream.live/v1",
    providerUrl: "https://daydream.live/dashboard",
    networkPrice: { amount: 0.003, unit: "Minute" },
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "Describe the video style or transformation...",
          description: "Text prompt for video style transfer.",
        },
        {
          name: "style",
          label: "Style Preset",
          type: "select",
          options: ["cinematic", "anime", "watercolor", "neon", "sketch", "none"],
          defaultValue: "cinematic",
          description: "Pre-defined style preset to apply.",
        },
        {
          name: "strength",
          label: "Style Strength",
          type: "range",
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.7,
          description: "How strongly the style is applied. 0 = no effect, 1 = full effect.",
        },
      ],
      outputType: "video",
      mockOutputUrl: "https://picsum.photos/seed/daydream/640/360",
    },
    readme: `# Daydream Video API

Full-stack real-time AI video API powered by the Livepeer network.

## Capabilities
- **World Generation** — Generate immersive 3D environments from text descriptions
- **Style Transfer** — Apply artistic styles to live video streams in real-time
- **Depth Estimation** — Real-time monocular depth from video frames

## Pricing
| Tier | Price | SLA |
|------|-------|-----|
| Standard | $0.006/min | 99.9% uptime |
| Enterprise | Custom | 99.99% uptime |

## Rate Limits
- Free tier: 100 requests/day
- Standard: 10,000 requests/day
- Enterprise: Unlimited

## Getting Started
1. Create an account at [daydream.live](https://daydream.live)
2. Generate an API key from your dashboard
3. Use the API key in the \`Authorization\` header`,
  },
  {
    id: "livepeer-transcode",
    name: "Livepeer Transcoding",
    provider: "Livepeer Studio",
    category: "Video",
    coverImage: "https://picsum.photos/seed/transcode-cover/600/340",
    description:
      "Production-grade adaptive bitrate transcoding with global CDN delivery. Enterprise SLA with 99.95% uptime.",
    status: "hot",
    pricing: { amount: 0.005, unit: "Minute" },
    latency: 85,
    orchestrators: 45,
    runs7d: 12_000_000,
    uptime: 99.99,
    managed: true,
    tags: ["transcoding", "streaming", "cdn", "enterprise"],
    sla: { uptime: "99.95%", latencyP99: "<200ms" },
    apiEndpoint: "https://livepeer.studio/api",
    providerUrl: "https://livepeer.studio/dashboard",
    playgroundConfig: {
      fields: [
        {
          name: "source_url",
          label: "Source URL",
          type: "text",
          required: true,
          placeholder: "https://example.com/video.mp4",
          description: "URL of the video to transcode.",
        },
        {
          name: "profile",
          label: "Encoding Profile",
          type: "select",
          options: ["720p", "1080p", "4K", "adaptive"],
          defaultValue: "adaptive",
          description: "Target encoding profile.",
        },
      ],
      outputType: "json",
    },
    readme: `# Livepeer Transcoding

Production-grade adaptive bitrate transcoding powered by the Livepeer network with global CDN delivery.

## Features
- Adaptive bitrate streaming (HLS/DASH)
- Global CDN with <200ms latency
- Live and VOD transcoding
- Enterprise SLA: 99.95% uptime

## Getting Started
Visit [livepeer.studio](https://livepeer.studio) to create an account and get your API key.`,
  },

  // ── Network Capabilities ───────────────────────────────────────────────────
  {
    id: "flux-schnell",
    name: "FLUX.1 [schnell]",
    provider: "Black Forest Labs",
    category: "Image Generation",
    coverImage: "https://picsum.photos/seed/flux-cover/600/340",
    description:
      "Ultra-fast image generation optimized for speed. 4 steps, sub-second inference for production and near real-time applications.",
    status: "hot",
    featured: true,
    pricing: { amount: 0.003, unit: "Request" },
    latency: 450,
    orchestrators: 22,
    precision: "FP16",
    runs7d: 3_400_000,
    uptime: 99.95,
    tags: ["fast", "image-generation", "flux"],
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder:
            "A surreal underwater garden scene with bioluminescent flora against a dark background...",
          description: "Text prompt for image generation.",
        },
        {
          name: "aspect_ratio",
          label: "Aspect Ratio",
          type: "select",
          options: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          defaultValue: "1:1",
          description: "Aspect ratio for the generated image.",
        },
        {
          name: "seed",
          label: "Seed",
          type: "number",
          placeholder: "Random",
          description: "Random seed. Set for reproducible generation.",
        },
        {
          name: "go_fast",
          label: "Go Fast",
          type: "boolean",
          defaultValue: true,
          description: "Run faster predictions with additional optimizations.",
        },
        {
          name: "output_format",
          label: "Output Format",
          type: "select",
          options: ["jpg", "png", "webp"],
          defaultValue: "jpg",
          description: "Format of the output image.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/flux-schnell/1024/1024",
    },
    readme: `# FLUX.1 [schnell]

Very fast image generation and editing model. 4 steps distilled, sub-second inference for production and near real-time applications.

## Parameters
- **prompt** (string, required) — Text prompt for image generation
- **aspect_ratio** (string) — Output aspect ratio. Default: "1:1"
- **seed** (integer) — Random seed for reproducibility
- **go_fast** (boolean) — Enable speed optimizations. Default: true
- **output_format** (string) — jpg, png, or webp. Default: "jpg"

## Supported Models
- FLUX.1 [schnell] — Optimized for speed (4 steps)
- FLUX.1 [dev] — Higher quality (50 steps)

## Limitations
- Max resolution: 1024x1024 (higher with upscaling)
- NSFW content is filtered`,
  },
  {
    id: "sdxl-turbo",
    name: "SDXL Turbo",
    provider: "Stability AI",
    category: "Image Generation",
    coverImage: "https://picsum.photos/seed/sdxl-cover/600/340",
    description:
      "Ultra-fast image generation in a single step, optimized for real-time applications.",
    status: "hot",
    pricing: { amount: 0.002, unit: "Step" },
    latency: 35,
    orchestrators: 14,
    precision: "FP16",
    runs7d: 2_800_000,
    uptime: 99.94,
    tags: ["fast", "real-time", "image-generation"],
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "A photorealistic portrait of a cat wearing a top hat...",
          description: "Text prompt for image generation.",
        },
        {
          name: "negative_prompt",
          label: "Negative Prompt",
          type: "textarea",
          placeholder: "blurry, low quality, distorted",
          description: "What to exclude from the generation.",
        },
        {
          name: "num_inference_steps",
          label: "Steps",
          type: "range",
          min: 1,
          max: 4,
          step: 1,
          defaultValue: 1,
          description: "Number of inference steps. Lower = faster.",
        },
        {
          name: "guidance_scale",
          label: "Guidance Scale",
          type: "range",
          min: 0,
          max: 2,
          step: 0.1,
          defaultValue: 0,
          description: "How closely to follow the prompt.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/sdxl-turbo/1024/1024",
    },
    readme: `# SDXL Turbo

Single-step image generation for real-time applications. Based on Stable Diffusion XL with adversarial distillation.

## Key Features
- Single-step generation (1 inference step)
- Sub-second latency
- 1024x1024 output resolution`,
  },
  {
    id: "img2img-sdxl",
    name: "Image-to-Image SDXL",
    provider: "Stability AI",
    category: "Image Generation",
    coverImage: "https://picsum.photos/seed/img2img-cover/600/340",
    description:
      "Transform existing images using text prompts. Powered by Stable Diffusion XL with fine-grained control over style transfer strength.",
    status: "hot",
    pricing: { amount: 0.004, unit: "Request" },
    latency: 1200,
    orchestrators: 10,
    precision: "FP16",
    runs7d: 680_000,
    uptime: 99.89,
    tags: ["image-to-image", "style-transfer"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Input image to transform. Must be jpeg, png, gif, or webp.",
        },
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "Transform into a watercolor painting...",
          description: "Text prompt describing the desired transformation.",
        },
        {
          name: "strength",
          label: "Strength",
          type: "range",
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.75,
          description:
            "How much to transform the image. 0 = no change, 1 = complete regeneration.",
        },
        {
          name: "guidance_scale",
          label: "Guidance Scale",
          type: "range",
          min: 1,
          max: 20,
          step: 0.5,
          defaultValue: 7.5,
          description: "How closely to follow the prompt.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/img2img/1024/1024",
    },
    readme: `# Image-to-Image SDXL

Transform images using text prompts with SDXL. Upload an image and describe how you want it changed.

## Parameters
- **image** (file, required) — The source image
- **prompt** (string, required) — What to transform the image into
- **strength** (float, 0-1) — Transformation strength
- **guidance_scale** (float, 1-20) — Prompt adherence`,
  },
  {
    id: "stable-video-diffusion",
    name: "Stable Video Diffusion",
    provider: "Stability AI",
    category: "Video",
    coverImage: "https://picsum.photos/seed/svd-cover/600/340",
    description:
      "Generate short video clips from images. High visual quality with temporal consistency.",
    status: "cold",
    pricing: { amount: 0.05, unit: "Request" },
    latency: 2400,
    orchestrators: 6,
    precision: "FP16",
    runs7d: 45_000,
    uptime: 99.2,
    tags: ["video-generation", "image-to-video"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Input Image",
          type: "file",
          required: true,
          description: "Source image to animate into a video clip.",
        },
        {
          name: "motion_bucket_id",
          label: "Motion Amount",
          type: "range",
          min: 1,
          max: 255,
          step: 1,
          defaultValue: 127,
          description: "Controls the amount of motion. Higher = more motion.",
        },
        {
          name: "fps",
          label: "Frames Per Second",
          type: "select",
          options: ["6", "12", "24"],
          defaultValue: "12",
          description: "Output video frame rate.",
        },
      ],
      outputType: "video",
      mockOutputUrl: "https://picsum.photos/seed/svd/640/360",
    },
  },
  {
    id: "live-video-to-video",
    name: "LivePortrait",
    provider: "Livepeer",
    category: "Video",
    coverImage: "https://picsum.photos/seed/liveportrait-cover/600/340",
    description:
      "Real-time live video transformation pipeline. Apply AI effects, style transfer, and compositing to live video streams with sub-frame latency.",
    status: "hot",
    featured: true,
    pricing: { amount: 0.008, unit: "Second" },
    latency: 24,
    orchestrators: 18,
    precision: "FP16",
    runs7d: 1_240_000,
    uptime: 99.97,
    tags: ["real-time", "streaming", "live", "video-to-video"],
    playgroundConfig: {
      fields: [
        {
          name: "pipeline",
          label: "Pipeline",
          type: "select",
          options: [
            "style-transfer",
            "depth-estimation",
            "segmentation",
            "compositing",
          ],
          defaultValue: "style-transfer",
          description: "Which live processing pipeline to use.",
        },
        {
          name: "prompt",
          label: "Style Prompt",
          type: "textarea",
          placeholder: "Cyberpunk neon city at night...",
          description: "Text prompt for style-transfer pipeline.",
        },
        {
          name: "strength",
          label: "Effect Strength",
          type: "range",
          min: 0,
          max: 1,
          step: 0.05,
          defaultValue: 0.6,
          description: "Intensity of the applied effect.",
        },
      ],
      outputType: "video",
      mockOutputUrl: "https://picsum.photos/seed/live-v2v/640/360",
    },
    readme: `# LivePortrait — Live Video-to-Video

Real-time video transformation on the Livepeer network. This is Livepeer's signature pipeline — purpose-built for streaming AI inference.

## Streaming Protocol
Uses the Trickle protocol for continuous frame exchange:
- **pub** channel: send input frames
- **sub** channel: receive processed frames
- **control** channel: update parameters mid-stream
- **events** channel: receive status and metadata

## Pipelines
- **style-transfer** — Apply artistic styles to live video
- **depth-estimation** — Real-time monocular depth maps
- **segmentation** — Person/object segmentation
- **compositing** — Green-screen and background replacement

## Endpoint
\`\`\`
POST /process/stream/start
\`\`\`

## Latency
Typical end-to-end: 20-40ms per frame on dedicated orchestrators.`,
  },
  {
    id: "qwen3-32b",
    name: "Qwen3 32B",
    provider: "Qwen",
    category: "LLM",
    coverImage: "https://picsum.photos/seed/qwen-cover/600/340",
    description:
      "High-performance 32B parameter language model with strong reasoning and multilingual capabilities.",
    status: "hot",
    pricing: {
      amount: 0.08,
      unit: "M Tokens",
      inputPrice: 0.08,
      outputPrice: 0.24,
    },
    latency: 12,
    orchestrators: 24,
    precision: "BF16",
    runs7d: 25_010_000,
    uptime: 99.99,
    tags: ["llm", "reasoning", "multilingual"],
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "Tell me a story about a cat in Paris...",
          description: "The input prompt for the language model.",
        },
        {
          name: "temperature",
          label: "Temperature",
          type: "range",
          min: 0,
          max: 2,
          step: 0.1,
          defaultValue: 0.7,
          description: "Controls randomness. Lower = more focused, higher = more creative.",
        },
        {
          name: "max_tokens",
          label: "Max Tokens",
          type: "number",
          defaultValue: 1024,
          min: 1,
          max: 8192,
          description: "Maximum number of tokens to generate.",
        },
      ],
      outputType: "text",
      mockOutputText: `Once upon a time, in the winding cobblestone streets of Paris, there lived a peculiar cat named Monsieur Whiskers. Unlike the other cats who lounged in windowsills and chased pigeons in the Tuileries Garden, Monsieur Whiskers had developed an extraordinary taste for croissants.

Every morning, he would pad silently through the Marais district, his sleek grey fur catching the golden light of dawn. The bakers knew him well — not as a nuisance, but as a connoisseur. He would sit perfectly still outside Boulangerie Dupont, his green eyes following each tray of fresh pastries as they emerged from the oven.

"Ah, Monsieur Whiskers," old Madame Dupont would say, placing a small piece of butter croissant on a china saucer. "You have better taste than most of my customers."`,
    },
    readme: `# Qwen3 32B

High-performance 32B parameter language model from the Qwen team.

## Capabilities
- Multilingual text generation (100+ languages)
- Code generation and analysis
- Mathematical reasoning
- Instruction following

## API (OpenAI-compatible)
\`\`\`bash
curl -X POST https://gateway.livepeer.org/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"model": "qwen3-32b", "messages": [{"role": "user", "content": "Hello"}]}'
\`\`\``,
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    category: "LLM",
    coverImage: "https://picsum.photos/seed/llama-cover/600/340",
    description:
      "Open-weight 70B parameter model with excellent instruction following and coding abilities.",
    status: "hot",
    pricing: {
      amount: 0.12,
      unit: "M Tokens",
      inputPrice: 0.12,
      outputPrice: 0.36,
    },
    latency: 18,
    orchestrators: 22,
    precision: "FP8",
    runs7d: 18_500_000,
    uptime: 99.98,
    tags: ["llm", "coding", "open-weight"],
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Prompt",
          type: "textarea",
          required: true,
          placeholder: "Write a Python function that...",
          description: "The input prompt.",
        },
        {
          name: "system_prompt",
          label: "System Prompt",
          type: "textarea",
          placeholder: "You are a helpful assistant...",
          description: "Optional system message to set behavior.",
        },
        {
          name: "temperature",
          label: "Temperature",
          type: "range",
          min: 0,
          max: 2,
          step: 0.1,
          defaultValue: 0.5,
          description: "Controls randomness.",
        },
        {
          name: "max_tokens",
          label: "Max Tokens",
          type: "number",
          defaultValue: 1024,
          min: 1,
          max: 4096,
          description: "Maximum tokens to generate.",
        },
      ],
      outputType: "text",
      mockOutputText: `Here's a Python function that implements a binary search algorithm:

\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    """
    Perform binary search on a sorted array.

    Args:
        arr: A sorted list of integers
        target: The value to search for

    Returns:
        The index of target if found, -1 otherwise
    """
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
\`\`\`

This implementation has O(log n) time complexity and O(1) space complexity.`,
    },
  },
  {
    id: "whisper-v3",
    name: "Whisper v3 Large",
    provider: "OpenAI",
    category: "Speech",
    coverImage: "https://picsum.photos/seed/whisper-cover/600/340",
    description:
      "Production-grade speech-to-text transcription with support for 99 languages and automatic language detection.",
    status: "hot",
    pricing: { amount: 0.002, unit: "Minute" },
    latency: 45,
    orchestrators: 15,
    runs7d: 3_200_000,
    uptime: 99.98,
    tags: ["speech-to-text", "transcription", "multilingual"],
    playgroundConfig: {
      fields: [
        {
          name: "audio",
          label: "Audio File",
          type: "file",
          required: true,
          description: "Audio file to transcribe. Supports mp3, wav, m4a, webm.",
        },
        {
          name: "language",
          label: "Language",
          type: "select",
          options: [
            "auto",
            "en",
            "es",
            "fr",
            "de",
            "ja",
            "zh",
            "ko",
            "pt",
            "ru",
            "ar",
          ],
          defaultValue: "auto",
          description: "Language of the audio. 'auto' for automatic detection.",
        },
        {
          name: "task",
          label: "Task",
          type: "select",
          options: ["transcribe", "translate"],
          defaultValue: "transcribe",
          description: "'translate' will translate to English.",
        },
      ],
      outputType: "text",
      mockOutputText:
        "Hello, and welcome to the Livepeer network. Today we're going to explore how real-time AI inference works on a decentralized GPU network. The key insight is that by distributing workloads across independent orchestrators, we can achieve lower latency and cost compared to centralized alternatives.",
    },
    readme: `# Whisper v3 Large

OpenAI's Whisper large-v3 model for speech recognition and translation.

## Supported Formats
mp3, mp4, mpeg, mpga, m4a, wav, webm

## Languages
99 languages supported with automatic detection.`,
  },
  {
    id: "kokoro-tts",
    name: "Kokoro TTS",
    provider: "Hexgrad",
    category: "Speech",
    coverImage: "https://picsum.photos/seed/kokoro-cover/600/340",
    description:
      "High-quality text-to-speech synthesis with multiple voices and emotional control. Natural-sounding output with low latency.",
    status: "hot",
    pricing: { amount: 0.004, unit: "Request" },
    latency: 320,
    orchestrators: 8,
    runs7d: 890_000,
    uptime: 99.91,
    tags: ["text-to-speech", "tts", "voices"],
    playgroundConfig: {
      fields: [
        {
          name: "text",
          label: "Text",
          type: "textarea",
          required: true,
          placeholder: "Enter the text you want to convert to speech...",
          description: "Text to synthesize into speech.",
        },
        {
          name: "voice",
          label: "Voice",
          type: "select",
          options: [
            "alloy",
            "echo",
            "fable",
            "onyx",
            "nova",
            "shimmer",
          ],
          defaultValue: "nova",
          description: "Voice preset to use.",
        },
        {
          name: "speed",
          label: "Speed",
          type: "range",
          min: 0.5,
          max: 2,
          step: 0.1,
          defaultValue: 1,
          description: "Playback speed multiplier.",
        },
      ],
      outputType: "audio",
    },
  },
  {
    id: "depth-anything-v2",
    name: "Depth Anything v2",
    provider: "Depth Anything",
    category: "Object Detection",
    coverImage: "https://picsum.photos/seed/depth-cover/600/340",
    description:
      "State-of-the-art monocular depth estimation for real-time 3D understanding of video streams.",
    status: "hot",
    pricing: { amount: 0.003, unit: "Minute" },
    latency: 8,
    orchestrators: 12,
    precision: "FP16",
    runs7d: 890_000,
    uptime: 99.95,
    tags: ["depth-estimation", "3d", "real-time"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Input image for depth estimation.",
        },
        {
          name: "model_size",
          label: "Model Size",
          type: "select",
          options: ["small", "base", "large"],
          defaultValue: "base",
          description: "Model variant. Larger = more accurate, slower.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/depth/1024/1024",
    },
  },
  {
    id: "yolov8",
    name: "YOLOv8",
    provider: "Ultralytics",
    category: "Object Detection",
    coverImage: "https://picsum.photos/seed/yolo-cover/600/340",
    description:
      "Real-time object detection, segmentation, and tracking for live video analysis.",
    status: "hot",
    pricing: { amount: 0.001, unit: "Second" },
    latency: 8,
    orchestrators: 20,
    runs7d: 5_600_000,
    uptime: 99.96,
    tags: ["object-detection", "real-time", "tracking"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Image for object detection.",
        },
        {
          name: "confidence",
          label: "Confidence Threshold",
          type: "range",
          min: 0.1,
          max: 1,
          step: 0.05,
          defaultValue: 0.5,
          description: "Minimum confidence score for detections.",
        },
        {
          name: "task",
          label: "Task",
          type: "select",
          options: ["detect", "segment", "classify", "pose"],
          defaultValue: "detect",
          description: "Detection task type.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/yolo/1024/768",
    },
  },
  {
    id: "sam-2-large",
    name: "Segment Anything 2",
    provider: "Meta",
    category: "Object Detection",
    coverImage: "https://picsum.photos/seed/sam-cover/600/340",
    description:
      "Promptable image and video segmentation. Click a point or draw a box to segment any object in an image.",
    status: "hot",
    pricing: { amount: 0.005, unit: "Request" },
    latency: 180,
    orchestrators: 9,
    precision: "FP16",
    runs7d: 420_000,
    uptime: 99.87,
    tags: ["segmentation", "interactive", "video"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Input image to segment.",
        },
        {
          name: "point_x",
          label: "Point X",
          type: "number",
          placeholder: "256",
          description: "X coordinate of the prompt point.",
        },
        {
          name: "point_y",
          label: "Point Y",
          type: "number",
          placeholder: "256",
          description: "Y coordinate of the prompt point.",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/sam2/1024/1024",
    },
  },
  {
    id: "llava-13b",
    name: "LLaVA 13B",
    provider: "LLaVA Team",
    category: "LLM",
    coverImage: "https://picsum.photos/seed/llava-cover/600/340",
    description:
      "Large Language and Vision Assistant. Multimodal model that understands both images and text for visual question answering.",
    status: "cold",
    pricing: {
      amount: 0.15,
      unit: "M Tokens",
      inputPrice: 0.15,
      outputPrice: 0.45,
    },
    latency: 950,
    orchestrators: 5,
    precision: "FP16",
    runs7d: 120_000,
    uptime: 98.8,
    tags: ["multimodal", "vision", "image-to-text"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Image to analyze.",
        },
        {
          name: "prompt",
          label: "Question",
          type: "textarea",
          required: true,
          placeholder: "What is happening in this image?",
          description: "Question about the image.",
        },
        {
          name: "max_tokens",
          label: "Max Tokens",
          type: "number",
          defaultValue: 512,
          min: 1,
          max: 2048,
          description: "Maximum response length.",
        },
      ],
      outputType: "text",
      mockOutputText:
        "The image shows a busy street scene in what appears to be a European city, likely Paris based on the distinctive Haussmann-style architecture. In the foreground, there are several pedestrians walking along a wide boulevard lined with trees. The buildings have ornate balconies and cream-colored facades typical of 19th century French urban planning. A few cafes with outdoor seating can be seen along the ground floor of the buildings.",
    },
  },
  {
    id: "real-esrgan-4x",
    name: "Real-ESRGAN 4x",
    provider: "Xinntao",
    category: "Image Generation",
    coverImage: "https://picsum.photos/seed/esrgan-cover/600/340",
    description:
      "Image upscaling and enhancement. Upscale images by 4x while adding realistic detail and removing artifacts.",
    status: "cold",
    pricing: { amount: 0.003, unit: "Request" },
    latency: 800,
    orchestrators: 7,
    precision: "FP16",
    runs7d: 340_000,
    uptime: 99.6,
    tags: ["upscale", "enhancement", "super-resolution"],
    playgroundConfig: {
      fields: [
        {
          name: "image",
          label: "Image",
          type: "file",
          required: true,
          description: "Image to upscale.",
        },
        {
          name: "scale",
          label: "Scale Factor",
          type: "select",
          options: ["2", "4"],
          defaultValue: "4",
          description: "Upscaling factor.",
        },
        {
          name: "face_enhance",
          label: "Face Enhancement",
          type: "boolean",
          defaultValue: false,
          description: "Apply face-specific enhancement (GFPGAN).",
        },
      ],
      outputType: "image",
      mockOutputUrl: "https://picsum.photos/seed/esrgan/2048/2048",
    },
  },
  {
    id: "musicgen",
    name: "MusicGen Large",
    provider: "Meta",
    category: "Speech",
    coverImage: "https://picsum.photos/seed/musicgen-cover/600/340",
    description:
      "Generate high-quality music from text descriptions with controllable style, tempo, and instruments.",
    status: "cold",
    pricing: { amount: 0.01, unit: "Second" },
    latency: 800,
    orchestrators: 4,
    runs7d: 12_000,
    uptime: 98.5,
    tags: ["music", "audio-generation"],
    playgroundConfig: {
      fields: [
        {
          name: "prompt",
          label: "Description",
          type: "textarea",
          required: true,
          placeholder:
            "An upbeat electronic track with synthesizers and a driving beat...",
          description: "Describe the music you want to generate.",
        },
        {
          name: "duration",
          label: "Duration (seconds)",
          type: "range",
          min: 5,
          max: 30,
          step: 1,
          defaultValue: 10,
          description: "Length of the generated audio.",
        },
      ],
      outputType: "audio",
    },
  },
  {
    id: "nomic-embed",
    name: "Nomic Embed v1.5",
    provider: "Nomic AI",
    category: "Embeddings",
    coverImage: "https://picsum.photos/seed/nomic-cover/600/340",
    description:
      "High-performance text embeddings for semantic search, clustering, and RAG applications. 768 dimensions, 8192 token context.",
    status: "hot",
    pricing: { amount: 0.01, unit: "M Tokens" },
    latency: 5,
    orchestrators: 16,
    runs7d: 8_900_000,
    uptime: 99.99,
    tags: ["embeddings", "search", "rag"],
    playgroundConfig: {
      fields: [
        {
          name: "text",
          label: "Text",
          type: "textarea",
          required: true,
          placeholder: "Enter text to embed...",
          description: "Input text to generate embeddings for.",
        },
        {
          name: "task_type",
          label: "Task Type",
          type: "select",
          options: [
            "search_document",
            "search_query",
            "clustering",
            "classification",
          ],
          defaultValue: "search_document",
          description: "Optimize embeddings for a specific task.",
        },
      ],
      outputType: "json",
    },
    readme: `# Nomic Embed v1.5

High-performance text embedding model with 768 dimensions and 8192 token context window.

## Use Cases
- Semantic search and retrieval
- RAG (Retrieval-Augmented Generation)
- Document clustering
- Text classification`,
  },
];

// ─── Solution Providers ───────────────────────────────────────────────────────

export const SOLUTIONS: SolutionProvider[] = [
  {
    id: "daydream",
    name: "Daydream",
    provider: "Daydream",
    description:
      "Full-stack real-time AI video API with world generation, style transfer, and depth estimation. Managed SLA with 99.9% uptime guarantee.",
    dashboardUrl: "https://daydream.live/dashboard",
    capabilities: ["Video", "Image Generation", "Object Detection"],
    pricingSummary: "Usage-based from $0.006/min",
    trustBadges: ["Managed", "SLA"],
  },
  {
    id: "livepeer-studio",
    name: "Livepeer Studio",
    provider: "Livepeer Studio",
    description:
      "Production-grade adaptive bitrate transcoding with global CDN delivery, live streaming, and comprehensive developer APIs.",
    dashboardUrl: "https://livepeer.studio/dashboard",
    capabilities: ["Video", "Speech", "LLM"],
    pricingSummary: "Pay-per-minute from $0.005/min",
    trustBadges: ["Managed", "SLA", "Enterprise"],
  },
  {
    id: "livepeer-network",
    name: "Livepeer Network",
    provider: "Livepeer Foundation",
    description:
      "Direct access to the Livepeer GPU network. Run any supported pipeline on independent orchestrators at the lowest possible cost. No SLA — best-effort routing across 142+ orchestrators.",
    dashboardUrl: "https://livepeer.org/studio/quickstart",
    capabilities: [
      "LLM",
      "Image Generation",
      "Video",
      "Speech",
      "Object Detection",
      "Embeddings",
    ],
    pricingSummary: "Pay-per-use from $0.001/sec",
    trustBadges: [],
  },
];

// ─── API Keys (mock) ──────────────────────────────────────────────────────────

export const API_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "production",
    prefix: "lp_sk_1a2b",
    status: "active",
    created: "2025-12-15",
    lastUsed: "2026-03-23",
    calls7d: 48_230,
  },
  {
    id: "2",
    name: "staging",
    prefix: "lp_sk_9x4z",
    status: "active",
    created: "2026-01-20",
    lastUsed: "2026-03-22",
    calls7d: 3_150,
  },
  {
    id: "3",
    name: "dev-local",
    prefix: "lp_sk_7m3k",
    status: "revoked",
    created: "2025-11-01",
    lastUsed: "2026-02-14",
    calls7d: 0,
  },
];

// ─── Network Stats ────────────────────────────────────────────────────────────

export const NETWORK_STATS: NetworkStat[] = [
  { label: "Active Orchestrators", value: "142", delta: "+3", trend: "up" },
  { label: "GPU Capacity", value: "68%", delta: "+5%", trend: "up" },
  { label: "Median Latency", value: "34ms", delta: "-2ms", trend: "up" },
  { label: "Requests / sec", value: "2,840", delta: "+120", trend: "up" },
  { label: "Uptime (7D)", value: "99.97%", trend: "flat" },
  { label: "Models Available", value: "18", trend: "flat" },
];

// ─── Usage History (30 days) ──────────────────────────────────────────────────

function generateUsageHistory(): UsageDataPoint[] {
  const data: UsageDataPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 1200 + Math.sin(i * 0.3) * 400;
    const requests = Math.round(base + Math.random() * 600);
    data.push({
      date: date.toISOString().split("T")[0],
      requests,
      cost: parseFloat((requests * 0.0032).toFixed(2)),
    });
  }
  return data;
}

export const USAGE_HISTORY: UsageDataPoint[] = generateUsageHistory();

// ─── Ecosystem Apps ───────────────────────────────────────────────────────────

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: "daydream",
    name: "Daydream",
    url: "https://daydream.live",
    domain: "daydream.live",
    description:
      "APIs for building interactive AI experiences — from real-time video to AI-generated worlds and beyond.",
    categories: ["AI", "Infrastructure"],
    featured: true,
  },
  {
    id: "frameworks",
    name: "Frameworks",
    url: "https://frameworks.network",
    domain: "frameworks.network",
    description:
      "Stream without the cloud. A next-generation video platform delivering broadcast-quality streaming directly on Livepeer's open GPU network.",
    categories: ["Streaming", "Infrastructure"],
  },
  {
    id: "streamplace",
    name: "Streamplace",
    url: "https://stream.place",
    domain: "stream.place",
    description:
      "The video layer for decentralized social networks. Open-source infrastructure for high-quality video on the AT Protocol.",
    categories: ["Streaming", "Social"],
  },
  {
    id: "embody",
    name: "Embody",
    url: "https://embody.zone",
    domain: "embody.zone",
    description:
      "Embodied AI avatars for real-time tutoring, telepresence, and branded content powered by Livepeer infrastructure.",
    categories: ["AI", "Creative"],
  },
  {
    id: "ufo-fm",
    name: "ufo.fm",
    url: "https://ufo.fm",
    domain: "ufo.fm",
    description:
      "AI-powered music streaming platform building the future of interactive audio experiences.",
    categories: ["AI", "Creative"],
  },
  {
    id: "livecast",
    name: "LiveCast",
    url: "https://livecast.live",
    domain: "livecast.live",
    description:
      "Low-latency live broadcasting platform for creators and events, powered by Livepeer transcoding.",
    categories: ["Streaming", "Tools"],
  },
  {
    id: "vidai",
    name: "VidAI",
    url: "https://vidai.io",
    domain: "vidai.io",
    description:
      "Automated video analysis and content moderation using real-time AI inference on the Livepeer network.",
    categories: ["AI", "Tools"],
  },
  {
    id: "transcodex",
    name: "Transcodex",
    url: "https://transcodex.dev",
    domain: "transcodex.dev",
    description:
      "Developer toolkit for building custom transcoding pipelines with fine-grained control over encoding parameters.",
    categories: ["Infrastructure", "Tools"],
  },
];
