import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import BlogPostContent from "@/components/blog/BlogPostContent";
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
        images: post.image ? [post.image] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: post.image ? [post.image] : [],
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

  if (post.draft && process.env.NODE_ENV === "production") {
    notFound();
  }

  const html = await renderMarkdown(post.content);

  return (
    <article className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <Container className="max-w-[680px]">
        <BlogPostHeader post={post} />

        <BlogPostContent html={html} />

        <div className="divider-gradient my-16" />

        <div className="flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-sm text-white/30 transition-colors hover:text-white/60"
          >
            ← All posts
          </Link>
        </div>
      </Container>
    </article>
  );
}
