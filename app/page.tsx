import Hero from "@/components/home/Hero";
import StartBuilding from "@/components/home/StartBuilding";
import UseCases from "@/components/home/UseCases";
import BuiltOnLivepeer from "@/components/home/BuiltOnLivepeer";
import CommunityCTA from "@/components/home/CommunityCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <StartBuilding />
      <UseCases />
      <BuiltOnLivepeer />
      <CommunityCTA />
    </>
  );
}
