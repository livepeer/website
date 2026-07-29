import Hero from "@/components/home/Hero";
import BuiltOnLivepeer, {
  type BuiltOnLivepeerMeta,
} from "@/components/home/BuiltOnLivepeer";
import LatestPosts from "@/components/home/LatestPosts";
import CommunityCTA from "@/components/home/CommunityCTA";
import { getAppBySlug } from "@/lib/ecosystem";
import { getAllPosts } from "@/lib/blog";

const FEATURED_SLUGS = ["daydream", "frameworks", "streamplace"];

export default function Home() {
  const builtOnLivepeerMeta: BuiltOnLivepeerMeta = Object.fromEntries(
    FEATURED_SLUGS.map((slug) => {
      const app = getAppBySlug(slug);
      return [slug, { description: app.description, domain: app.hostname }];
    })
  );

  const latestPosts = getAllPosts()
    .slice(0, 3)
    .map((p) => ({ ...p, content: "" }));

  return (
    <>
      <Hero />
      <BuiltOnLivepeer meta={builtOnLivepeerMeta} />
      <LatestPosts posts={latestPosts} />
      <CommunityCTA />
    </>
  );
}
