import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import BlogListingClient from "@/components/blog/BlogListingClient";
import { getAllPosts, getCategories } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getCategories();

  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Tile grid + green gradient — fades out after header */}
      <div
        className="tile-bg pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(24,121,78,0.04) 0%, transparent 70%)",
        }}
      />

      <Container>
        <SectionHeader
          label="Blog"
          title="Latest Updates"
          description="News, insights, and updates from across the Livepeer ecosystem."
          align="left"
        />

        <div className="mt-12">
          <BlogListingClient posts={posts} categories={categories} />
        </div>
      </Container>
    </section>
  );
}
