import Hero from "@/components/home/Hero";
import BuiltOnLivepeer from "@/components/home/BuiltOnLivepeer";
import LatestPosts from "@/components/home/LatestPosts";
import CommunityCTA from "@/components/home/CommunityCTA";
import { getAllPosts } from "@/lib/blog";

export default function Home() {
  const latestPosts = getAllPosts()
    .slice(0, 3)
    .map((p) => ({ ...p, content: "" }));

  return (
    <>
      <Hero />
      <BuiltOnLivepeer />
      <LatestPosts posts={latestPosts} />
      <CommunityCTA />
    </>
  );
}
