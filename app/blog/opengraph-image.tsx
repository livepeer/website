import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og-card";

export const alt = "Livepeer Blog — The latest in Livepeer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OGImage() {
  return renderOgCard({
    title: "The latest in Livepeer",
    category: "Blog",
    seed: "livepeer-blog",
    cardArt: "/images/blog/cards/livepeer-blog.jpg",
  });
}
