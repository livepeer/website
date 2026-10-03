import { notFound } from "next/navigation";

import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getOrganizationRegister } from "@/lib/register";

export const alt = "Livepeer — Organizations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getOrganizationRegister()).map((o) => ({ slug: o.slug }));
}

// Without this file an organization page has no share image at all: its
// generateMetadata declares an `openGraph` object with no `images`, which drops
// the card it would otherwise inherit from /organizations. An unknown slug
// 404s, as the page does, rather than drawing a card for a body that is not
// there.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = (await getOrganizationRegister()).find((o) => o.slug === slug);
  if (!org) notFound();
  return renderTitledCard(ogArt.organizations, org.name, "Organization");
}
