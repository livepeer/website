import Hero from "@/components/home/Hero";
import WhatIsLivepeer from "@/components/home/WhatIsLivepeer";
import Capabilities from "@/components/home/Capabilities";
import NetworkParticipants from "@/components/home/NetworkParticipants";
import WhyLivepeer from "@/components/home/WhyLivepeer";
import BuiltOnLivepeer from "@/components/home/BuiltOnLivepeer";
import NetworkStats from "@/components/home/NetworkStats";
import DeveloperCTA from "@/components/home/DeveloperCTA";
import CommunityCTA from "@/components/home/CommunityCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatIsLivepeer />
      <Capabilities />
      <NetworkParticipants />
      <WhyLivepeer />
      <BuiltOnLivepeer />
      <NetworkStats />
      <DeveloperCTA />
      <CommunityCTA />
    </>
  );
}
