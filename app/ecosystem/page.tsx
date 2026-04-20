import EcosystemListingClient, {
  type EcosystemListingApp,
} from "@/components/ecosystem/EcosystemListingClient";
import { getAllApps, getEcosystemCategories } from "@/lib/ecosystem";

export default async function EcosystemPage({
  searchParams,
}: {
  searchParams: Promise<{ categories?: string; q?: string }>;
}) {
  const { categories: catsParam, q } = await searchParams;
  const apps: EcosystemListingApp[] = getAllApps().map((app) => ({
    slug: app.slug,
    name: app.name,
    url: app.url,
    hostname: app.hostname,
    description: app.description,
    categories: app.categories,
    logo: app.logo,
    logoBg: app.logoBg,
  }));
  const categories = getEcosystemCategories();

  return (
    <EcosystemListingClient
      apps={apps}
      categories={categories}
      initialCategories={
        catsParam ? catsParam.split(",").map(decodeURIComponent) : []
      }
      initialSearch={q ?? ""}
    />
  );
}
