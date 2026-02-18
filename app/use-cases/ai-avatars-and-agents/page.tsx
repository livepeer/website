import Container from "@/components/ui/Container";

export default function Page() {
  return (
    <section className="relative py-32 lg:py-44">
      <Container>
        <p className="font-mono text-xs uppercase tracking-wider text-green">
          Use Case
        </p>
        <h1 className="mt-4 text-4xl font-medium text-white lg:text-5xl">
          AI Avatars & Agents
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/50">
          Motion capture and style transfer powering persistent digital
          identities in real time. Coming soon.
        </p>
      </Container>
    </section>
  );
}
