import { notFound } from "next/navigation";

import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { OrganizationRecord } from "@/components/livepeer-ui/organization-record";
import { RecordSheet } from "@/components/livepeer-ui/record-sheet";
import { getOrganizationRegister, getRegister } from "@/lib/register";

/**
 * An organisation, slid over the roadmap.
 *
 * `(..)` rather than `(.)`: organisations are not under /roadmap, they are a
 * sibling one level up, and the marker counts route segments rather than
 * folders — `@modal` is a slot and does not count as one. So this intercepts
 * /organizations/<slug> for a client-side navigation that starts inside
 * /roadmap, which is the only place that links here.
 *
 * The same record either way. A reader who follows an owner's name gets the
 * panel over the register they were reading; a shared link, a refresh, or a
 * crawler gets the page. Both render OrganizationRecord.
 */
export default async function InterceptedOrganization({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [organizations, commitments] = await Promise.all([
    getOrganizationRegister(),
    getRegister(),
  ]);

  const org = organizations.find((o) => o.slug === slug);
  if (!org) notFound();

  return (
    <RecordSheet
      href={`/organizations/${slug}`}
      closeTo="/roadmap"
      title={org.name}
      cover={
        org.cover && (
          <RecordCover src={org.cover} alt={`${org.name} cover image`} />
        )
      }
    >
      <OrganizationRecord
        organization={org}
        owned={commitments.filter((c) => c.ownerSlug === org.slug)}
      />
    </RecordSheet>
  );
}
