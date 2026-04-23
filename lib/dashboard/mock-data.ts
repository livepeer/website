import type {
  Model,
  ApiKey,
  EcosystemApp,
  SolutionProvider,
  NetworkStat,
  UsageDataPoint,
  GpuNode,
  GpuGrowthPoint,
  PipelineUtilization,
  LiveJob,
  PaymentDayData,
  PaymentStats,
  PaymentTransaction,
  ApiRequestSeries,
  RemoteSigner,
  UsageSummary,
  RoutingSummary,
} from "./types";

// ─── Models ───────────────────────────────────────────────────────────────────

export const MODELS: Model[] = [
  // ── Managed Services (SLA-backed) ──────────────────────────────────────────
  {
    id: "daydream-video",
    name: "Daydream Video API",
    provider: "Daydream",
    category: "Video Generation",
    realtime: true,
    coverImage: "/images/dashboard/daydream.png",
    description:
      "Full-stack real-time AI video API with world generation, style transfer, and depth estimation. Built on Livepeer's open network of orchestrators.",
    status: "hot",
    pricing: { amount: 0.006, unit: "Minute" },
    latency: 22,
    orchestrators: 32,
    runs7d: 4_800_000,
    uptime: 99.97,
    featured: true,
    releasedAt: "2026-04-01",
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
      playgroundVariant: "webcam",
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
    category: "Live Transcoding",
    realtime: true,
    description:
      "Adaptive bitrate transcoding routed across independent orchestrators on the Livepeer network.",
    status: "hot",
    pricing: { amount: 0.005, unit: "Minute" },
    latency: 85,
    orchestrators: 45,
    runs7d: 12_000_000,
    uptime: 99.99,
    featured: true,
    tags: ["transcoding", "streaming", "cdn", "enterprise"],
    sla: { uptime: "99.95%", latencyP99: "<200ms" },
    apiEndpoint: "https://livepeer.studio/api",
    providerUrl: "https://livepeer.studio/dashboard",
    playgroundConfig: {
      fields: [
        {
          name: "name",
          label: "Stream name",
          type: "text",
          required: true,
          placeholder: "my-live-stream",
          description: "Human-readable name for the stream.",
        },
        {
          name: "source_url",
          label: "Source",
          type: "text",
          placeholder: "rtmp://rtmp.livepeer.com/live or https://example.com/video.mp4",
          description: "RTMP/WHIP ingest URL for live, or an HTTPS file URL for VOD.",
        },
        {
          name: "profile",
          label: "Rendition ladder",
          type: "select",
          options: ["adaptive", "1080p", "720p", "480p"],
          defaultValue: "adaptive",
          description: "adaptive ladders 240p → 720p. Single values cap the top rendition.",
        },
        {
          name: "record",
          label: "Record to VOD",
          type: "boolean",
          defaultValue: true,
          description: "Persist the stream as a playable recording after it ends.",
        },
      ],
      outputType: "json",
      mockOutputUrl: "https://picsum.photos/seed/livepeer-stream/1280/720",
      playgroundVariant: "transcoding",
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
    coverImage: "https://picsum.photos/seed/flux-cover/800/500",
    description:
      "Ultra-fast image generation optimized for speed. 4 steps, sub-second inference for production and near real-time applications.",
    status: "hot",
    featured: true,
    releasedAt: "2026-03-25",
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
    category: "Video Generation",
    coverImage: "https://picsum.photos/seed/svd-cover/800/500",
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
    category: "Video Editing",
    realtime: true,
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
      playgroundVariant: "webcam",
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
    category: "Language",
    description:
      "High-performance 32B parameter language model with strong reasoning and multilingual capabilities.",
    status: "hot",
    releasedAt: "2026-04-08",
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
    category: "Language",
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
    realtime: true,
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
      mockOutputUrl:
        "https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3",
    },
  },
  {
    id: "depth-anything-v2",
    name: "Depth Anything v2",
    provider: "Depth Anything",
    category: "Video Understanding",
    realtime: true,
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
      mockOutputJson: {
        status: "succeeded",
        output: {
          depth_map: "https://picsum.photos/seed/depth/1024/1024",
          width: 1024,
          height: 1024,
          model_size: "base",
          // Normalized depth stats — min/max in metres for relative depth mode.
          stats: { min: 0.42, max: 18.7, mean: 4.18, median: 3.02 },
          // Downsampled 8×8 preview of the raw depth tensor (metres). Useful
          // for sanity-checks without shipping the full 1M-sample payload.
          depth_preview: [
            [14.8, 14.2, 13.1, 10.4, 7.2, 5.8, 5.4, 5.1],
            [13.6, 12.9, 11.4, 8.7, 5.9, 4.9, 4.6, 4.4],
            [11.2, 10.1, 8.6, 6.3, 4.4, 3.7, 3.5, 3.4],
            [8.4, 7.1, 5.8, 4.3, 3.1, 2.7, 2.6, 2.5],
            [5.7, 4.8, 3.9, 2.9, 2.2, 1.9, 1.8, 1.7],
            [3.8, 3.2, 2.6, 2.0, 1.5, 1.3, 1.2, 1.1],
            [2.5, 2.1, 1.7, 1.3, 1.0, 0.8, 0.8, 0.7],
            [1.6, 1.3, 1.1, 0.9, 0.7, 0.6, 0.5, 0.5],
          ],
        },
        metrics: { inference_time: 0.042, gpus_matched: 1 },
      },
    },
  },
  {
    id: "yolov8",
    name: "YOLOv8",
    provider: "Ultralytics",
    category: "Video Understanding",
    realtime: true,
    coverImage: "https://picsum.photos/seed/yolo-cover/800/500",
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
      mockOutputJson: {
        status: "succeeded",
        output: {
          image: "https://picsum.photos/seed/yolo/1024/768",
          width: 1024,
          height: 768,
          detections: [
            {
              class: "person",
              class_id: 0,
              confidence: 0.94,
              bbox: { x: 312, y: 184, width: 168, height: 412 },
            },
            {
              class: "bicycle",
              class_id: 1,
              confidence: 0.88,
              bbox: { x: 480, y: 402, width: 236, height: 194 },
            },
            {
              class: "dog",
              class_id: 16,
              confidence: 0.81,
              bbox: { x: 128, y: 452, width: 146, height: 138 },
            },
          ],
        },
        metrics: { inference_time: 0.087, gpus_matched: 1 },
      },
    },
  },
  {
    id: "sam-2-large",
    name: "Segment Anything 2",
    provider: "Meta",
    category: "Video Understanding",
    realtime: true,
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
      mockOutputJson: {
        status: "succeeded",
        output: {
          image: "https://picsum.photos/seed/sam2/1024/1024",
          width: 1024,
          height: 1024,
          prompt: { type: "point", x: 256, y: 256 },
          masks: [
            {
              id: 0,
              score: 0.972,
              area: 184_336,
              bbox: { x: 142, y: 98, width: 574, height: 612 },
              // RLE-encoded binary mask — truncated here for readability.
              rle: { counts: "Y4c02…", size: [1024, 1024] },
            },
            {
              id: 1,
              score: 0.894,
              area: 42_108,
              bbox: { x: 612, y: 412, width: 248, height: 196 },
              rle: { counts: "P3h01…", size: [1024, 1024] },
            },
          ],
        },
        metrics: { inference_time: 0.182, gpus_matched: 1 },
      },
    },
  },
  {
    id: "llava-13b",
    name: "LLaVA 13B",
    provider: "LLaVA Team",
    category: "Language",
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
    category: "Video Understanding",
    coverImage: "https://picsum.photos/seed/esrgan-cover/800/500",
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
      mockOutputUrl:
        "https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3",
    },
  },
  {
    id: "nomic-embed",
    name: "Nomic Embed v1.5",
    provider: "Nomic AI",
    category: "Language",
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

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

// ─── Solution Providers ───────────────────────────────────────────────────────

export const SOLUTIONS: SolutionProvider[] = [
  {
    id: "daydream",
    name: "Daydream",
    provider: "Daydream",
    description:
      "Full-stack real-time AI video API with world generation, style transfer, and depth estimation. Built on Livepeer's open network of orchestrators.",
    dashboardUrl: "https://daydream.live/dashboard",
    capabilities: ["Video Generation", "Image Generation", "Video Understanding"],
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
    capabilities: ["Live Transcoding", "Speech", "Language"],
    pricingSummary: "Pay-per-minute from $0.005/min",
    trustBadges: ["Managed", "SLA", "Enterprise"],
  },
  {
    id: "livepeer-network",
    name: "Livepeer Network",
    provider: "Livepeer Foundation",
    description:
      "Direct access to the Livepeer GPU network. Run any supported pipeline on independent orchestrators at the lowest possible cost. No SLA — best-effort routing across 142+ orchestrators.",
    dashboardUrl: "https://livepeer.org/portal/quickstart",
    capabilities: [
      "Video Generation",
      "Video Editing",
      "Video Understanding",
      "Live Transcoding",
      "Image Generation",
      "Speech",
      "Language",
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
  { label: "Orchestrators", value: "142", delta: "+3", trend: "up" },
  { label: "GPU Capacity", value: "68%", delta: "+5%", trend: "up" },
  { label: "Median Latency", value: "34ms", delta: "-2ms", trend: "up" },
  { label: "Requests / sec", value: "2,840", delta: "+120", trend: "up" },
  { label: "Uptime (7D)", value: "99.97%", trend: "flat" },
  { label: "Models Available", value: "18", trend: "flat" },
  { label: "Success Rate", value: "99.2%", delta: "+0.3%", trend: "up" },
  { label: "Total GPUs", value: "1,136", delta: "+86", trend: "up" },
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

// ─── Stats: GPU Nodes ────────────────────────────────────────────────────────

export const GPU_NODES: GpuNode[] = [
  { name: "NVIDIA H100 80GB SXM", count: 724, memory: "141 GB HBM3e", tflops: 67, maxPower: "700W" },
  { name: "NVIDIA RTX A6000", count: 103, memory: "48 GB GDDR6", tflops: 38.7, maxPower: "300W" },
  { name: "NVIDIA A100 80GB SXM", count: 80, memory: "80 GB HBM2e", tflops: 19.5, maxPower: "400W" },
  { name: "NVIDIA RTX 4090", count: 62, memory: "24 GB GDDR6X", tflops: 82.6, maxPower: "450W" },
  { name: "NVIDIA L40", count: 45, memory: "48 GB GDDR6", tflops: 90.5, maxPower: "300W" },
  { name: "NVIDIA A100 40GB", count: 38, memory: "40 GB HBM2e", tflops: 19.5, maxPower: "250W" },
  { name: "NVIDIA RTX 3090", count: 29, memory: "24 GB GDDR6X", tflops: 35.6, maxPower: "350W" },
  { name: "NVIDIA L4", count: 22, memory: "24 GB GDDR6", tflops: 30.3, maxPower: "72W" },
  { name: "NVIDIA RTX 6000 Ada", count: 18, memory: "48 GB GDDR6", tflops: 91.1, maxPower: "300W" },
  { name: "NVIDIA A10G", count: 15, memory: "24 GB GDDR6", tflops: 31.2, maxPower: "150W" },
];

// ─── Stats: GPU Growth ───────────────────────────────────────────────────────

function generateGpuGrowth(): GpuGrowthPoint[] {
  const data: GpuGrowthPoint[] = [];
  const now = new Date();
  const baseTotal = 980;
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const growth = Math.round((89 - i) * 1.4 + Math.sin(i * 0.15) * 20);
    const total = baseTotal + growth;
    data.push({
      date: date.toISOString().split("T")[0],
      total,
      byType: {
        "H100": Math.round(total * 0.62),
        "A6000": Math.round(total * 0.09),
        "A100": Math.round(total * 0.10),
        "RTX 4090": Math.round(total * 0.05),
        "L40": Math.round(total * 0.04),
        "Other": Math.round(total * 0.10),
      },
    });
  }
  return data;
}

export const GPU_GROWTH: GpuGrowthPoint[] = generateGpuGrowth();

// ─── Stats: Pipeline Utilization ─────────────────────────────────────────────

export const PIPELINE_UTILIZATION: PipelineUtilization[] = [
  { id: "text-to-image", name: "Text to Image", warmOrchestrators: 47, totalCapacity: 72, utilizationPct: 78, avgLatencyMs: 1800, status: "active", price: 0.005, priceUnit: "/req" },
  { id: "image-to-image", name: "Image to Image", warmOrchestrators: 38, totalCapacity: 64, utilizationPct: 65, avgLatencyMs: 2100, status: "active", price: 0.008, priceUnit: "/req" },
  { id: "image-to-video", name: "Image to Video", warmOrchestrators: 29, totalCapacity: 45, utilizationPct: 82, avgLatencyMs: 4200, status: "active", price: 0.05, priceUnit: "/sec" },
  { id: "live-video-to-video", name: "Live Video to Video", warmOrchestrators: 32, totalCapacity: 52, utilizationPct: 71, avgLatencyMs: 22, status: "active", price: 0.006, priceUnit: "/min" },
  { id: "text-to-speech", name: "Text to Speech", warmOrchestrators: 18, totalCapacity: 30, utilizationPct: 45, avgLatencyMs: 340, status: "active", price: 0.002, priceUnit: "/req" },
  { id: "audio-to-text", name: "Audio to Text", warmOrchestrators: 22, totalCapacity: 35, utilizationPct: 52, avgLatencyMs: 890, status: "active", price: 0.003, priceUnit: "/min" },
  { id: "llm", name: "LLM Inference", warmOrchestrators: 15, totalCapacity: 24, utilizationPct: 88, avgLatencyMs: 120, status: "active", price: 0.01, priceUnit: "/M tok" },
  { id: "segment-anything", name: "Segment Anything", warmOrchestrators: 8, totalCapacity: 20, utilizationPct: 18, avgLatencyMs: 950, status: "degraded", price: 0.004, priceUnit: "/req" },
  { id: "object-detection", name: "Object Detection", warmOrchestrators: 3, totalCapacity: 15, utilizationPct: 5, avgLatencyMs: 0, status: "cold", price: 0.003, priceUnit: "/req" },
];

// ─── Stats: Live Job Feed ────────────────────────────────────────────────────

export const LIVE_JOBS: LiveJob[] = [
  { id: "j1", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl-v2v", fpsIn: 24.08, fpsOut: 21.38, age: "0s", status: "online" },
  { id: "j2", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl-v2v", fpsIn: 23.98, fpsOut: 21.48, age: "0s", status: "online" },
  { id: "j3", pipeline: "text-to-image", model: "FLUX.1 schnell", latencyMs: 1820, age: "2s", status: "online" },
  { id: "j4", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 11.64, fpsOut: 4.15, age: "10s", status: "degraded" },
  { id: "j5", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 14.53, fpsOut: 6.64, age: "10s", status: "degraded" },
  { id: "j6", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 24.03, fpsOut: 19.73, age: "10s", status: "online" },
  { id: "j7", pipeline: "text-to-image", model: "SDXL Turbo", latencyMs: 920, age: "15s", status: "completed" },
  { id: "j8", pipeline: "llm", model: "Qwen3 32B", latencyMs: 85, age: "18s", status: "online" },
  { id: "j9", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 23.98, fpsOut: 20.08, age: "20s", status: "online" },
  { id: "j10", pipeline: "image-to-video", model: "Stable Video Diffusion", latencyMs: 4100, age: "22s", status: "online" },
  { id: "j11", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl-v2v", fpsIn: 23.97, fpsOut: 20.58, age: "20s", status: "online" },
  { id: "j12", pipeline: "text-to-speech", model: "Whisper v3 Large", latencyMs: 340, age: "25s", status: "completed" },
  { id: "j13", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 24.01, fpsOut: 17.01, age: "29s", status: "online" },
  { id: "j14", pipeline: "audio-to-text", model: "Whisper v3 Large", latencyMs: 890, age: "30s", status: "online" },
  { id: "j15", pipeline: "live-video-to-video", model: "streamdiffusion-sdxl", fpsIn: 20.33, fpsOut: 14.56, age: "30s", status: "degraded" },
];

// ─── Stats: Payment History ──────────────────────────────────────────────────

function generatePaymentHistory(): PaymentDayData[] {
  const data: PaymentDayData[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 2.5 + (89 - i) * 0.04;
    const eth = parseFloat((base + Math.random() * 1.5 + Math.sin(i * 0.2) * 0.8).toFixed(4));
    data.push({
      date: date.toISOString().split("T")[0],
      volumeEth: eth,
      volumeUsd: parseFloat((eth * 3200).toFixed(2)),
    });
  }
  return data;
}

export const PAYMENT_HISTORY: PaymentDayData[] = generatePaymentHistory();

export const PAYMENT_STATS: PaymentStats = {
  lastDay: { eth: 4.82, usd: 15424 },
  lastMonth: { eth: 128.6, usd: 411520 },
  allTime: { eth: 1842.5, usd: 5896000 },
};

function generatePaymentTransactions(): PaymentTransaction[] {
  const orchestrators = [
    "0x9C10…3aB7", "0x4F2d…8cE1", "0xA71b…2fD9", "0x3E8a…5bC4",
    "0xD62f…1eA8", "0x7B4c…9dF3", "0x1F9e…6aC2", "0x8A3d…4bE7",
  ];
  const pipelines = [
    "text-to-image", "live-video-to-video", "image-to-video",
    "llm", "text-to-speech", "image-to-image",
  ];
  const txs: PaymentTransaction[] = [];
  const now = new Date();
  for (let i = 0; i < 25; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i * 3 - Math.floor(Math.random() * 2));
    const eth = parseFloat((0.01 + Math.random() * 0.15).toFixed(4));
    txs.push({
      id: `tx-${i}`,
      date: date.toISOString(),
      orchestrator: orchestrators[i % orchestrators.length],
      pipeline: pipelines[i % pipelines.length],
      amountEth: eth,
      amountUsd: parseFloat((eth * 3200).toFixed(2)),
      block: 245_000_000 - i * 120,
      txHash: `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    });
  }
  return txs;
}

export const PAYMENT_TRANSACTIONS: PaymentTransaction[] = generatePaymentTransactions();

// ─── Stats: API Request Series (for stacked bar chart) ───────────────────────

const TOP_APIS = [
  "FLUX.1 schnell", "SDXL Turbo", "Stable Video Diffusion",
  "LivePortrait", "Whisper Large", "Daydream Video",
];

const API_COLORS = ["#40bf86", "#25abd0", "#e5a536", "#d94f70", "#8b5cf6", "#06b6d4"];

function generateApiRequestSeries(): ApiRequestSeries[] {
  const data: ApiRequestSeries[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayFactor = 1 + (89 - i) * 0.01;
    const entry: ApiRequestSeries = { date: date.toISOString().split("T")[0] };
    TOP_APIS.forEach((api, idx) => {
      const base = [4200, 3100, 1800, 1500, 1200, 980][idx];
      entry[api] = Math.round(base * dayFactor + Math.random() * base * 0.3);
    });
    data.push(entry);
  }
  return data;
}

export const API_REQUEST_SERIES: ApiRequestSeries[] = generateApiRequestSeries();
export { TOP_APIS, API_COLORS };

// ─── Settings: API Keys ─────────────────────────────────────────────────────

// Default tokens provisioned at signup:
//   - Free tier (permanent, can only be rotated — tied to the account's free quota)
//   - Production + Development (starter user tokens, scoped to "any" provider — fully editable)
// Provider-specific tokens are added by the user in Billing when connecting a provider.
export const SETTINGS_API_KEYS: ApiKey[] = [
  {
    id: "key-default-free",
    name: "Free tier",
    prefix: "lp_fnd_x8k2",
    status: "active",
    created: "2026-01-15",
    lastUsed: "2026-04-11",
    calls7d: 4_230,
    isDefault: true,
    scope: "freeTier",
  },
  {
    id: "key-1",
    name: "Production",
    prefix: "lp_usr_m3p9",
    status: "active",
    created: "2026-01-15",
    lastUsed: "2026-04-10",
    calls7d: 12_840,
    scope: "any",
  },
  {
    id: "key-2",
    name: "Development",
    prefix: "lp_usr_q7w2",
    status: "active",
    created: "2026-01-15",
    lastUsed: "2026-04-09",
    calls7d: 890,
    scope: "any",
  },
];

// ─── Settings: Remote Signers ───────────────────────────────────────────────

export const REMOTE_SIGNERS: RemoteSigner[] = [
  {
    id: "paymthouse",
    name: "Paymthouse",
    description:
      "Pay-as-you-go fiat billing with credit card or ACH. USD and EUR with monthly invoicing.",
    currencies: ["USD", "EUR"],
    status: "available",
    monthlyUsage: { requests: 12_450, spentDisplay: "$4.50" },
  },
  {
    id: "livepeer-cloud",
    name: "Livepeer Cloud",
    description:
      "Managed billing from the Livepeer team. Credit card with USD invoicing and consolidated reporting.",
    currencies: ["USD"],
    status: "available",
    monthlyUsage: { requests: 3_120, spentDisplay: "$1.20" },
  },
  {
    id: "coinbase-pay",
    name: "Coinbase Pay",
    description:
      "Accept crypto payments through Coinbase. Automatic conversion from 100+ cryptocurrencies.",
    currencies: ["BTC", "ETH", "USDC"],
    status: "coming-soon",
  },
];

// ─── Account Usage (per-account view under /dashboard/settings?tab=usage) ─────
//
// The monthly totals below are the canonical account usage figures for mocks.
// They are derived from REMOTE_SIGNERS.monthlyUsage (Paymthouse + Livepeer Cloud)
// plus non-signer sources (Free tier = FOUNDATION_USED in PaymentTab, ETH wallet).
// ROUTING_SUMMARY (used by the billing tab) aggregates the same totals.
// ACCOUNT_USAGE_BY_TOKEN uses real token ids from SETTINGS_API_KEYS above.

const USAGE_FREE_TIER_REQUESTS = 1_204; // matches FOUNDATION_USED in PaymentTab
const USAGE_PAYMTHOUSE_REQUESTS = 12_450; // matches REMOTE_SIGNERS[paymthouse].monthlyUsage.requests
const USAGE_LIVEPEER_CLOUD_REQUESTS = 3_120; // matches REMOTE_SIGNERS[livepeer-cloud].monthlyUsage.requests
const USAGE_ETH_WALLET_REQUESTS = 600;
const USAGE_TOTAL_REQUESTS =
  USAGE_FREE_TIER_REQUESTS +
  USAGE_PAYMTHOUSE_REQUESTS +
  USAGE_LIVEPEER_CLOUD_REQUESTS +
  USAGE_ETH_WALLET_REQUESTS; // 17,374

// Account-wide routing breakdown for the current month.
// Signers are aggregated here — the by-signer detail lives in the Usage tab.
export const ROUTING_SUMMARY: RoutingSummary = {
  totalRequests: USAGE_TOTAL_REQUESTS,
  routes: [
    {
      label: "Free tier",
      percent: 7,
      requests: USAGE_FREE_TIER_REQUESTS,
      color: "green",
    },
    {
      label: "Signers",
      percent: 90,
      requests: USAGE_PAYMTHOUSE_REQUESTS + USAGE_LIVEPEER_CLOUD_REQUESTS,
      color: "neutral",
    },
    {
      label: "ETH wallet",
      percent: 3,
      requests: USAGE_ETH_WALLET_REQUESTS,
      color: "blue",
    },
  ],
};

export const SIGNER_COLORS: Record<
  "freeTier" | "paymthouse" | "livepeerCloud" | "ethWallet",
  string
> = {
  freeTier: "#40bf86", // green-bright
  paymthouse: "#8b5cf6", // violet
  livepeerCloud: "#e5a536", // amber
  ethWallet: "#25abd0", // blue-bright
};

export const ACCOUNT_USAGE_SUMMARY: import("./types").AccountUsageSummary = {
  requests: USAGE_TOTAL_REQUESTS,
  spendDisplay: "$5.70", // $4.50 Paymthouse + $1.20 Livepeer Cloud
  freeTierUsed: USAGE_FREE_TIER_REQUESTS,
  freeTierLimit: 10_000,
  freeTierResetIn: "6h 12m",
};

export const ACCOUNT_USAGE_BY_SIGNER: import("./types").AccountUsageBySigner[] =
  [
    {
      signer: "freeTier",
      label: "Free tier",
      requests: USAGE_FREE_TIER_REQUESTS,
      percent: 7,
      spendDisplay: "$0.00",
      color: "green",
    },
    {
      signer: "paymthouse",
      label: "Paymthouse",
      requests: USAGE_PAYMTHOUSE_REQUESTS,
      percent: 72,
      spendDisplay: "$4.50", // matches REMOTE_SIGNERS[paymthouse].monthlyUsage.spentDisplay
      color: "violet",
    },
    {
      signer: "livepeerCloud",
      label: "Livepeer Cloud",
      requests: USAGE_LIVEPEER_CLOUD_REQUESTS,
      percent: 18,
      spendDisplay: "$1.20", // matches REMOTE_SIGNERS[livepeer-cloud].monthlyUsage.spentDisplay
      color: "neutral",
    },
    {
      signer: "ethWallet",
      label: "ETH wallet",
      requests: USAGE_ETH_WALLET_REQUESTS,
      percent: 3,
      spendDisplay: "0.0019 ETH",
      color: "blue",
    },
  ];

// Token rows reference real ids from SETTINGS_API_KEYS. Request distribution is
// proportional to each key's calls7d (key-foundation 4,230 / key-1 12,840 / key-2 890),
// scaled to USAGE_TOTAL_REQUESTS monthly.
export const ACCOUNT_USAGE_BY_TOKEN: import("./types").AccountUsageByToken[] = [
  {
    tokenId: "key-foundation",
    tokenName: "Default",
    requests: 4_100,
    lastUsed: "2 minutes ago",
    spendDisplay: "$1.35",
  },
  {
    tokenId: "key-1",
    tokenName: "Production",
    requests: 12_425,
    lastUsed: "14 minutes ago",
    spendDisplay: "$4.10",
  },
  {
    tokenId: "key-2",
    tokenName: "Development",
    requests: 849,
    lastUsed: "3 hours ago",
    spendDisplay: "$0.25",
  },
];

// ─── Recent Requests (account activity log) ────────────────────────────────
//
// Deterministic ~30-row mock spanning the last ~3 hours, mixed across signers
// and tokens. Timestamps are computed at module load so the relative time
// shown on Home stays plausible. Single source of truth: Home consumes
// slice(0, 5), Settings > Usage tab consumes the full list (filtered by the
// tab-level period/signer/token state).

function generateRecentRequests(): import("./types").AccountActivityRow[] {
  type Spec = {
    model: string;
    pipeline: string;
    signer: import("./types").SignerKey;
    tokenId: string;
    status: import("./types").AccountActivityStatus;
    latencyMs: number | null;
    costDisplay: string;
    minutesAgo: number;
  };

  const SIGNER_LABEL: Record<import("./types").SignerKey, string> = {
    freeTier: "Free tier",
    paymthouse: "Paymthouse",
    livepeerCloud: "Livepeer Cloud",
    ethWallet: "ETH wallet",
  };
  const TOKEN_LABEL: Record<string, string> = {
    "key-foundation": "Default",
    "key-1": "Production",
    "key-2": "Development",
  };

  const specs: Spec[] = [
    { model: "daydream/video-v2", pipeline: "video-to-video", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 234, costDisplay: "$0.006", minutesAgo: 2 },
    { model: "livepeer/transcode", pipeline: "live-transcoding", signer: "livepeerCloud", tokenId: "key-1", status: "success", latencyMs: 156, costDisplay: "$0.005", minutesAgo: 5 },
    { model: "flux/schnell", pipeline: "text-to-image", signer: "freeTier", tokenId: "key-foundation", status: "success", latencyMs: 812, costDisplay: "$0.003", minutesAgo: 8 },
    { model: "qwen/qwen3-32b", pipeline: "language", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 412, costDisplay: "$0.004", minutesAgo: 11 },
    { model: "stability/sdxl-turbo", pipeline: "text-to-image", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 1180, costDisplay: "$0.011", minutesAgo: 15 },
    { model: "openai/whisper-v3", pipeline: "audio-to-text", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 2410, costDisplay: "$0.007", minutesAgo: 18 },
    { model: "flux/schnell", pipeline: "text-to-image", signer: "ethWallet", tokenId: "key-1", status: "failed", latencyMs: null, costDisplay: "—", minutesAgo: 22 },
    { model: "daydream/video-v2", pipeline: "video-to-video", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 248, costDisplay: "$0.006", minutesAgo: 26 },
    { model: "meta/llama-3-70b", pipeline: "language", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 389, costDisplay: "$0.012", minutesAgo: 31 },
    { model: "stability/sdxl-turbo", pipeline: "text-to-image", signer: "freeTier", tokenId: "key-foundation", status: "success", latencyMs: 1240, costDisplay: "$0.000", minutesAgo: 36 },
    { model: "livepeer/transcode", pipeline: "live-transcoding", signer: "livepeerCloud", tokenId: "key-1", status: "success", latencyMs: 142, costDisplay: "$0.005", minutesAgo: 41 },
    { model: "hexgrad/kokoro-tts", pipeline: "text-to-speech", signer: "paymthouse", tokenId: "key-2", status: "success", latencyMs: 318, costDisplay: "$0.004", minutesAgo: 47 },
    { model: "flux/schnell", pipeline: "text-to-image", signer: "freeTier", tokenId: "key-foundation", status: "success", latencyMs: 798, costDisplay: "$0.000", minutesAgo: 53 },
    { model: "ultralytics/yolov8", pipeline: "video-understanding", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 87, costDisplay: "$0.001", minutesAgo: 58 },
    { model: "qwen/qwen3-32b", pipeline: "language", signer: "paymthouse", tokenId: "key-1", status: "timeout", latencyMs: null, costDisplay: "—", minutesAgo: 64 },
    { model: "daydream/video-v2", pipeline: "video-to-video", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 261, costDisplay: "$0.006", minutesAgo: 71 },
    { model: "stability/sdxl-turbo", pipeline: "text-to-image", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 1095, costDisplay: "$0.011", minutesAgo: 78 },
    { model: "livepeer/transcode", pipeline: "live-transcoding", signer: "livepeerCloud", tokenId: "key-1", status: "success", latencyMs: 169, costDisplay: "$0.005", minutesAgo: 86 },
    { model: "openai/whisper-v3", pipeline: "audio-to-text", signer: "freeTier", tokenId: "key-foundation", status: "success", latencyMs: 2280, costDisplay: "$0.000", minutesAgo: 93 },
    { model: "meta/llama-3-70b", pipeline: "language", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 401, costDisplay: "$0.012", minutesAgo: 101 },
    { model: "flux/schnell", pipeline: "text-to-image", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 824, costDisplay: "$0.003", minutesAgo: 109 },
    { model: "daydream/video-v2", pipeline: "video-to-video", signer: "ethWallet", tokenId: "key-1", status: "success", latencyMs: 256, costDisplay: "0.0001 ETH", minutesAgo: 117 },
    { model: "stability/sdxl-turbo", pipeline: "text-to-image", signer: "paymthouse", tokenId: "key-2", status: "failed", latencyMs: null, costDisplay: "—", minutesAgo: 124 },
    { model: "ultralytics/yolov8", pipeline: "video-understanding", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 92, costDisplay: "$0.001", minutesAgo: 132 },
    { model: "hexgrad/kokoro-tts", pipeline: "text-to-speech", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 304, costDisplay: "$0.004", minutesAgo: 141 },
    { model: "qwen/qwen3-32b", pipeline: "language", signer: "freeTier", tokenId: "key-foundation", status: "success", latencyMs: 422, costDisplay: "$0.000", minutesAgo: 150 },
    { model: "livepeer/transcode", pipeline: "live-transcoding", signer: "livepeerCloud", tokenId: "key-1", status: "success", latencyMs: 158, costDisplay: "$0.005", minutesAgo: 158 },
    { model: "meta/llama-3-70b", pipeline: "language", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 376, costDisplay: "$0.012", minutesAgo: 167 },
    { model: "daydream/video-v2", pipeline: "video-to-video", signer: "paymthouse", tokenId: "key-1", status: "success", latencyMs: 271, costDisplay: "$0.006", minutesAgo: 175 },
    { model: "flux/schnell", pipeline: "text-to-image", signer: "ethWallet", tokenId: "key-1", status: "success", latencyMs: 833, costDisplay: "0.0000 ETH", minutesAgo: 184 },
  ];

  const now = Date.now();
  return specs.map((s, i) => ({
    id: `req-${i + 1}`,
    timestamp: new Date(now - s.minutesAgo * 60_000).toISOString(),
    model: s.model,
    pipeline: s.pipeline,
    status: s.status,
    latencyMs: s.latencyMs,
    signer: s.signer,
    signerLabel: SIGNER_LABEL[s.signer],
    tokenId: s.tokenId,
    tokenName: TOKEN_LABEL[s.tokenId] ?? s.tokenId,
    costDisplay: s.costDisplay,
  }));
}

export const MOCK_RECENT_REQUESTS: import("./types").AccountActivityRow[] =
  generateRecentRequests();

function generateAccountUsageDaily(): import("./types").AccountUsageDailyPoint[] {
  const data: import("./types").AccountUsageDailyPoint[] = [];
  const now = new Date();
  // Base daily values roughly yield the monthly totals above over 30 days.
  const BASE = {
    freeTier: USAGE_FREE_TIER_REQUESTS / 30, // ~40
    paymthouse: USAGE_PAYMTHOUSE_REQUESTS / 30, // ~415
    livepeerCloud: USAGE_LIVEPEER_CLOUD_REQUESTS / 30, // ~104
    ethWallet: USAGE_ETH_WALLET_REQUESTS / 30, // ~20
  };
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayFactor = 1 + (89 - i) * 0.012;
    const noise = () => 0.7 + Math.random() * 0.6;
    data.push({
      date: date.toISOString().split("T")[0],
      freeTier: Math.round(BASE.freeTier * dayFactor * noise()),
      paymthouse: Math.round(BASE.paymthouse * dayFactor * noise()),
      livepeerCloud: Math.round(BASE.livepeerCloud * dayFactor * noise()),
      ethWallet: Math.round(BASE.ethWallet * dayFactor * noise()),
    });
  }
  return data;
}

export const ACCOUNT_USAGE_DAILY: import("./types").AccountUsageDailyPoint[] =
  generateAccountUsageDaily();

// ─── Settings: Usage Summary ────────────────────────────────────────────────

export const USAGE_SUMMARY: UsageSummary = {
  requests: 4_230,
  creditsUsed: 42.3,
  creditsLimit: 100,
  tier: "Foundation Free Tier",
};
