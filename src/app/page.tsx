import { ConstructionHero } from "@/components/hero/ConstructionHero";
import { Marquee } from "@/components/sections/Marquee";
import { Numbers } from "@/components/sections/Numbers";
import { Principles } from "@/components/sections/Principles";
import { FeaturedWorks } from "@/components/sections/FeaturedWorks";
import { Trust } from "@/components/sections/Trust";
import { Promises } from "@/components/sections/Promises";
import { Process } from "@/components/sections/Process";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      <ConstructionHero />
      <Marquee />
      <Numbers />
      <Principles />
      <FeaturedWorks />
      <Trust />
      <Promises />
      <Process />
      <CTA />
    </>
  );
}
