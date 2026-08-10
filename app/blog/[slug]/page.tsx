import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPost } from "@/components/livepeer-ui/blog-post";
import { getPostBySlug, getPostSlugs, renderMarkdown } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} | Livepeer Blog`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        authors: post.author ? [post.author.name] : [],
        // No `images` here: an explicit list wins over the file convention, and
        // the card is now composited in opengraph-image.tsx — the post's art
        // with the lockup and the headline over it, rather than the bare art.
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return { title: "Post Not Found — Livepeer Blog" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  // Drafts are hidden only on the public production deployment. They remain
  // visible on Vercel preview deployments (VERCEL_ENV === "preview") and in
  // local dev so they can be reviewed before going public.
  if (post.draft && process.env.VERCEL_ENV === "production") {
    notFound();
  }

  const html = await renderMarkdown(post.content);

  return (
    <BlogPost
      post={{
        title: post.title,
        category: post.category,
        date: post.date,
        readingTime: post.readingTime,
        // heroImage is the wide 16:9 art; image is the square card cover. Fall
        // back to the cover so a post that only ships one still opens on
        // something rather than a bare panel.
        heroImage: post.heroImage || post.image || undefined,
        imageAlt: post.imageAlt || undefined,
      }}
      html={html}
    />
  );
}
