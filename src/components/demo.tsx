import * as React from "react";
import GlassCard from "@/components/ui/glass-card";
import { SplineSceneBasic } from "./SplineSceneBasic";
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { DarkLandingPage } from "./DarkLandingPage"

const GlassCardDemo = () => {
  return (
    <div className="flex h-[450px] w-full items-center justify-center bg-zinc-100 p-10 dark:bg-zinc-800">
      <GlassCard />
    </div>
  );
};

const SplineDemo = () => {
  return (
    <div className="w-full p-6">
      <SplineSceneBasic />
    </div>
  );
};

function DemoHeroGeometric() {
    return (
        <HeroGeometric 
            badge="CallGenie AI"
            title1="Your AI-Powered"
            title2="Voice Assistant"
        />
    )
}

function DemoDarkLandingPage() {
    return <DarkLandingPage />
}

export { GlassCardDemo as DemoOne, SplineDemo, DemoHeroGeometric, DemoDarkLandingPage };
