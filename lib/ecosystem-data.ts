export interface EcosystemApp {
  id: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  categories: string[];
  color: string;
  icon?: string;
  logo?: string; // filename in /public/ecosystem/, e.g. "daydream.svg"
}

export const ECOSYSTEM_CATEGORIES = [
  "All",
  "AI",
  "Streaming",
  "Creative",
  "Infrastructure",
];

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: "livepeer-studio",
    name: "Livepeer Studio",
    url: "https://livepeer.studio",
    domain: "livepeer.studio",
    description:
      "The official developer platform for the Livepeer network. Transcoding, AI inference, streaming APIs, and developer tools with enterprise SLAs.",
    categories: ["Infrastructure", "Streaming"],
    color: "linear-gradient(135deg, #1E9960, #18794E)",
    icon: "▶",
    logo: "livepeer-studio.png",
  },
  {
    id: "daydream",
    name: "Daydream",
    url: "https://daydream.live",
    domain: "daydream.live",
    description:
      "APIs for building interactive AI experiences — from real-time video to AI-generated worlds and beyond.",
    categories: ["AI", "Infrastructure"],
    color: "linear-gradient(135deg, #F73B41, #FF982E)",
    icon: "✦",
    logo: "daydream.svg",
  },
  {
    id: "ufo-fm",
    name: "ufo.fm",
    url: "https://ufo.fm",
    domain: "ufo.fm",
    description:
      "AI-powered music streaming platform building the future of interactive audio experiences on decentralized infrastructure.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
    icon: "♫",
    logo: "ufo-fm.svg",
  },
  {
    id: "streamplace",
    name: "Streamplace",
    url: "https://stream.place",
    domain: "stream.place",
    description:
      "The video layer for decentralized social networks. Open-source infrastructure for high-quality video on the AT Protocol.",
    categories: ["Streaming", "Infrastructure"],
    color: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    icon: "◈",
    logo: "stream-place.png",
  },
  {
    id: "the-lot-radio",
    name: "The Lot Radio",
    url: "https://www.thelotradio.com",
    domain: "thelotradio.com",
    description:
      "Independent internet radio station and cultural platform broadcasting live from a shipping container in Brooklyn, powered by Livepeer transcoding.",
    categories: ["Streaming", "Creative"],
    color: "linear-gradient(135deg, #EF4444, #B91C1C)",
    icon: "📻",
    logo: "lot-radio.png",
  },
  {
    id: "frameworks",
    name: "Frameworks",
    url: "https://frameworks.network",
    domain: "frameworks.network",
    description:
      "Stream without the cloud. A next-generation video platform delivering broadcast-quality streaming directly on Livepeer's open GPU network.",
    categories: ["Streaming", "Infrastructure"],
    color: "linear-gradient(135deg, #F5F5F5, #D4D4D4)",
    icon: "⟨⟩",
    logo: "frameworks.svg",
  },
  {
    id: "embody",
    name: "Embody",
    url: "https://embody.zone",
    domain: "embody.zone",
    description:
      "Embodied AI avatars for real-time tutoring, telepresence, and branded content powered by Livepeer infrastructure.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #06B6D4, #0891B2)",
    logo: "embody.svg",
  },
  {
    id: "streameth",
    name: "StreamETH",
    url: "https://streameth.org",
    domain: "streameth.org",
    description:
      "Open-source conference streaming platform. Record, transcode, and distribute event content globally with Livepeer infrastructure.",
    categories: ["Streaming", "Infrastructure"],
    color: "linear-gradient(135deg, #10B981, #059669)",
    icon: "▣",
    logo: "streameth-icon.png",
  },
  {
    id: "bonfire",
    name: "Bonfire",
    url: "https://bonfire.live",
    domain: "bonfire.live",
    description:
      "Community-owned live streaming platform where creators earn directly from viewers. Built on Livepeer for low-latency, censorship-resistant broadcasting.",
    categories: ["Streaming", "Creative"],
    color: "linear-gradient(135deg, #F59E0B, #D97706)",
    icon: "🔥",
  },
  {
    id: "lenstube",
    name: "Lenstube",
    url: "https://lenstube.xyz",
    domain: "lenstube.xyz",
    description:
      "Decentralized video sharing platform built on Lens Protocol. Upload, transcode, and share videos with social graph integration.",
    categories: ["Streaming", "Creative"],
    color: "linear-gradient(135deg, #84CC16, #65A30D)",
    icon: "🌿",
  },
  {
    id: "livepeer-js",
    name: "livepeer.js",
    url: "https://livepeerjs.org",
    domain: "livepeerjs.org",
    description:
      "Official JavaScript SDK for Livepeer. React hooks, player components, and TypeScript-first API client for building video applications.",
    categories: ["Infrastructure"],
    color: "linear-gradient(135deg, #FBBF24, #F59E0B)",
    icon: "{ }",
  },
  {
    id: "catalyst",
    name: "Catalyst",
    url: "https://github.com/livepeer/catalyst",
    domain: "github.com/livepeer",
    description:
      "The media server powering Livepeer's transcoding and streaming pipeline. Handles ingest, segmenting, and delivery across the network.",
    categories: ["Infrastructure"],
    color: "linear-gradient(135deg, #6366F1, #4F46E5)",
    icon: "⚡",
  },
  {
    id: "deep-realtime",
    name: "DeepRealtime",
    url: "https://deeprealtime.ai",
    domain: "deeprealtime.ai",
    description:
      "Real-time AI video analytics platform for security and retail. Object detection, tracking, and anomaly detection on live camera feeds.",
    categories: ["AI", "Infrastructure"],
    color: "linear-gradient(135deg, #EC4899, #DB2777)",
    icon: "◎",
  },
  {
    id: "restream-ai",
    name: "Restream AI",
    url: "https://restream.ai",
    domain: "restream.ai",
    description:
      "AI-powered multistreaming platform. Automatically generate highlights, captions, and clips from live streams using Livepeer inference.",
    categories: ["AI", "Streaming"],
    color: "linear-gradient(135deg, #14B8A6, #0D9488)",
    icon: "⊹",
  },
  {
    id: "voxel-worlds",
    name: "Voxel Worlds",
    url: "https://voxelworlds.gg",
    domain: "voxelworlds.gg",
    description:
      "Real-time AI-generated game environments. Procedural world creation from text prompts with frame-by-frame inference on Livepeer GPUs.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #A855F7, #9333EA)",
    icon: "◆",
  },
  {
    id: "mintcast",
    name: "MintCast",
    url: "https://mintcast.tv",
    domain: "mintcast.tv",
    description:
      "Live streaming platform for NFT drops and digital art events. Broadcast gallery openings and auctions with integrated wallet connectivity.",
    categories: ["Streaming", "Creative"],
    color: "linear-gradient(135deg, #F43F5E, #E11D48)",
    icon: "✧",
  },
  {
    id: "lingua-live",
    name: "Lingua Live",
    url: "https://lingualive.io",
    domain: "lingualive.io",
    description:
      "Real-time speech translation for live streams. Whisper-powered transcription and translation overlay for multilingual broadcasting.",
    categories: ["AI", "Streaming"],
    color: "linear-gradient(135deg, #0EA5E9, #0284C7)",
    icon: "🌐",
  },
  {
    id: "orchestrator-hub",
    name: "Orchestrator Hub",
    url: "https://orchestrator.tools",
    domain: "orchestrator.tools",
    description:
      "Dashboard and monitoring tools for Livepeer orchestrator operators. Track earnings, performance metrics, and network health.",
    categories: ["Infrastructure"],
    color: "linear-gradient(135deg, #475569, #334155)",
    icon: "⊞",
  },
  {
    id: "vidproof",
    name: "VidProof",
    url: "https://vidproof.io",
    domain: "vidproof.io",
    description:
      "Verifiable video provenance using on-chain attestations. Prove when and where footage was captured with cryptographic timestamps.",
    categories: ["Infrastructure", "Creative"],
    color: "linear-gradient(135deg, #78716C, #57534E)",
    icon: "✓",
  },
  {
    id: "neural-canvas",
    name: "Neural Canvas",
    url: "https://neuralcanvas.art",
    domain: "neuralcanvas.art",
    description:
      "Collaborative AI art studio for live creative sessions. Multiple artists generate and transform visual content in real-time together.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #E879F9, #C026D3)",
    icon: "✿",
  },
  {
    id: "pulse-monitor",
    name: "Pulse Monitor",
    url: "https://pulse.livepeer.tools",
    domain: "pulse.livepeer.tools",
    description:
      "Network health monitoring and alerting for the Livepeer ecosystem. Real-time dashboards for orchestrator uptime, ticket redemptions, and round data.",
    categories: ["Infrastructure"],
    color: "linear-gradient(135deg, #22D3EE, #06B6D4)",
    icon: "◈",
  },
  {
    id: "campus-stream",
    name: "Campus Stream",
    url: "https://campusstream.edu",
    domain: "campusstream.edu",
    description:
      "University lecture streaming platform. Record, transcode, and distribute course content with automatic captioning and chapter markers.",
    categories: ["Streaming"],
    color: "linear-gradient(135deg, #2563EB, #1E40AF)",
    icon: "🎓",
  },
  {
    id: "stage-ai",
    name: "Stage AI",
    url: "https://stage-ai.live",
    domain: "stage-ai.live",
    description:
      "AI-powered virtual production tools for live events. Real-time background replacement, camera tracking, and visual effects on live video.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #DC2626, #991B1B)",
    icon: "🎭",
  },
  {
    id: "clip-forge",
    name: "ClipForge",
    url: "https://clipforge.io",
    domain: "clipforge.io",
    description:
      "Automated short-form content creation from long-form streams. AI identifies highlights, generates clips, and formats for social platforms.",
    categories: ["AI", "Creative"],
    color: "linear-gradient(135deg, #FB923C, #EA580C)",
    icon: "✂",
  },
];
