import Hero from "@/components/home/Hero";
import UseCases from "@/components/home/UseCases";
import BuiltOnLivepeer, {
  type BuiltOnLivepeerMeta,
} from "@/components/home/BuiltOnLivepeer";
import CommunityCTA from "@/components/home/CommunityCTA";
import { getAppBySlug } from "@/lib/ecosystem";

const FEATURED_SLUGS = ["daydream", "frameworks", "streamplace", "embody"];

export default function Home() {
  const builtOnLivepeerMeta: BuiltOnLivepeerMeta = Object.fromEntries(
    FEATURED_SLUGS.map((slug) => {
      const app = getAppBySlug(slug);
      return [slug, { description: app.description, domain: app.hostname }];
    })
  );

  return (
    <>
      <Hero />
      <UseCases />
      <BuiltOnLivepeer meta={builtOnLivepeerMeta} />
      <CommunityCTA />
    </>
  );
}
