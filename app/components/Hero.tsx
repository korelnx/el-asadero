"use client";

import { motion } from "framer-motion";
import { restaurant } from "@/config/restaurant";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

export default function Hero() {
  const { tagline, hero } = restaurant;

  return (
    <section className="hero-pattern relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#090b10' }}>

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_40%_50%,transparent_30%,rgba(10,10,10,0.85)_100%)]" />

      {/* Two-column layout */}
      <div className="relative w-full max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div className="space-y-6">

            {/* Tagline */}
            <motion.p
              className="text-accent font-medium tracking-[0.3em] uppercase text-xs"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
            >
              {tagline}
            </motion.p>

            {/* Headline */}
            <div className="space-y-1">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.25}
              >
                {hero.headline}
              </motion.h1>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-primary"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.4}
              >
                {hero.headlineAccent}
              </motion.h1>
            </div>

            {/* Subheading */}
            <motion.p
              className="text-foreground/75 text-base leading-relaxed max-w-md"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.55}
            >
              {hero.subheading}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.7}
            >
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-foreground/30 text-foreground font-medium hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                View Menu
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-8 py-3.5 text-foreground/50 hover:text-foreground transition-colors text-sm"
              >
                Our Story
              </a>
            </motion.div>

            {/* Stats */}
            {/* <div className="flex flex-wrap gap-3 pt-2">
              {hero.stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2.5 border border-border/60 bg-white/[0.03] px-4 py-2.5">
                  <span className={`text-xl font-light ${i === 1 ? "text-accent" : "text-primary"}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs text-foreground/50 tracking-widest uppercase leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div> */}
          </div>

          {/* Right: image */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            variants={fadeIn}
            initial="hidden"
            animate="show"
            custom={0.5}
          >
            <div className="relative">
              {/* Orange ring */}
              <div className="w-[500px] h-[500px] rounded-full border-2 border-accent p-1.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80"
                    alt="Authentic Mexican tacos"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border border-accent/20 scale-110" />
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
