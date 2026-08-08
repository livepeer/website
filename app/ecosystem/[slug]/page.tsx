import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcosystemDetail } from "@/components/livepeer-ui/ecosystem-detail";
import {
  getAppBySlug,
  getAppSlugs,
  renderEcosystemMarkdown,
} from "@/lib/ecosystem";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAppSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = getAppBySlug(slug);
    return {
      title: `${app.name} | Livepeer Ecosystem`,
      description: app.description,
      openGraph: {
        title: `${app.name} | Livepeer Ecosystem`,
        description: app.description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${app.name} | Livepeer Ecosystem`,
        description: app.description,
      },
    };
  } catch {
    return { title: "Project Not Found — Livepeer Ecosystem" };
  }
}

export default async function EcosystemAppPage({ params }: Props) {
  const { slug } = await params;

  let app;
  try {
    app = getAppBySlug(slug);
  } catch {
    notFound();
  }

  const html = await renderEcosystemMarkdown(app.content);

  return <EcosystemDetail app={app} html={html} />;
}
