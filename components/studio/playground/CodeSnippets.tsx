"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Model } from "@/lib/studio/types";

type Lang = "curl" | "python" | "node" | "http";

const LANGS: { key: Lang; label: string }[] = [
  { key: "curl", label: "cURL" },
  { key: "python", label: "Python" },
  { key: "node", label: "Node.js" },
  { key: "http", label: "HTTP" },
];

function generateSnippets(model: Model): Record<Lang, string> {
  const baseUrl = model.apiEndpoint ?? "https://gateway.livepeer.org/v1";
  const endpoint =
    model.category === "LLM"
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/${model.id}`;

  const isLLM = model.category === "LLM";

  const body = isLLM
    ? `{
    "model": "${model.id}",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }`
    : `{
    "prompt": "A scenic mountain landscape at sunset",
    "model": "${model.id}"
  }`;

  return {
    curl: `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`,

    python: isLLM
      ? `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}",
    api_key="YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="${model.id}",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    temperature=0.7,
    max_tokens=1024,
)
print(response.choices[0].message.content)`
      : `import requests

response = requests.post(
    "${endpoint}",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "prompt": "A scenic mountain landscape at sunset",
        "model": "${model.id}",
    },
)
print(response.json())`,

    node: isLLM
      ? `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}",
  apiKey: "YOUR_API_KEY",
});

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [
    { role: "user", content: "Hello, how are you?" },
  ],
  temperature: 0.7,
  max_tokens: 1024,
});
console.log(response.choices[0].message.content);`
      : `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "A scenic mountain landscape at sunset",
    model: "${model.id}",
  }),
});
const result = await response.json();
console.log(result);`,

    http: `POST ${endpoint} HTTP/1.1
Host: ${new URL(baseUrl).host}
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

${body}`,
  };
}

export default function CodeSnippets({ model }: { model: Model }) {
  const [lang, setLang] = useState<Lang>("curl");
  const [copied, setCopied] = useState(false);
  const snippets = generateSnippets(model);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex">
          {LANGS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                lang === l.key
                  ? "border-green-bright text-white"
                  : "border-transparent text-white/50 hover:text-white/60"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="mr-2 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/50 hover:bg-white/[0.04] hover:text-white/60"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-bright" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-black/40 p-4 font-mono text-xs leading-relaxed text-white/60">
        {snippets[lang]}
      </pre>
    </div>
  );
}
