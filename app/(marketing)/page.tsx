import Hero from "@/components/home/Hero";
import WhatIsLivepeer from "@/components/home/WhatIsLivepeer";
import Capabilities from "@/components/home/Capabilities";

import WhyLivepeer from "@/components/home/WhyLivepeer";
import BuiltOnLivepeer from "@/components/home/BuiltOnLivepeer";
import DeveloperCTA from "@/components/home/DeveloperCTA";
import CommunityCTA from "@/components/home/CommunityCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <WhatIsLivepeer />
      <WhyLivepeer />
      <BuiltOnLivepeer />
      <DeveloperCTA />
      <CommunityCTA />
    </>
  );
}
