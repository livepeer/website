import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPeopleRegister } from "@/lib/register";

export const alt = "Livepeer — People";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getPeopleRegister()).map((p) => ({ slug: p.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = (await getPeopleRegister()).find((p) => p.slug === slug);
  return renderTitledCard(
    ogArt.organizations,
    person?.name ?? "People",
    "Person"
  );
}
