import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPost } from "@/components/livepeer-ui/blog-post";
import { getBlogPost, getBlogRegister } from "@/lib/register";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogRegister();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found — Livepeer Blog" };

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
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Null covers both a slug nobody published and a draft on production; the
  // register decides which posts exist here. See lib/register.ts.
  const post = await getBlogPost(slug);
  if (!post) notFound();

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
      html={post.html}
    />
  );
}
