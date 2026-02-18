import Container from "@/components/ui/Container";

export default function Page() {
  return (
    <section className="relative py-32 lg:py-44">
      <Container>
        <p className="font-mono text-xs uppercase tracking-wider text-green">
          Use Case
        </p>
        <h1 className="mt-4 text-4xl font-medium text-white lg:text-5xl">
          Composable AI Pipelines
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/50">
          Chain inference models into multi-stage pipelines that process video
          end to end. Coming soon.
        </p>
      </Container>
    </section>
  );
}
