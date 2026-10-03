import { notFound } from "next/navigation";

import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPeopleRegister } from "@/lib/register";

export const alt = "Livepeer — People";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getPeopleRegister()).map((p) => ({ slug: p.slug }));
}

// A person's own frame, not the organizations' (see ogArt.people): a person
// and a body shared side by side were the same picture with different words.
// An unknown slug 404s, as the page does — a card reading "People" for a
// link nobody published would hide the bad link behind a good-looking one.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = (await getPeopleRegister()).find((p) => p.slug === slug);
  if (!person) notFound();
  return renderTitledCard(ogArt.people, person.name, "Person");
}
