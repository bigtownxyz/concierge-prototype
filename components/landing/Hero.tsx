import { ShaderBackground, HeroContent, PulsingCircle } from "@/components/ui/shaders-hero-section"

export function Hero() {
  return (
    <ShaderBackground>
      <HeroContent />
      <PulsingCircle />
    </ShaderBackground>
  )
}
