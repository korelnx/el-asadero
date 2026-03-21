"use client";

import { motion } from "framer-motion";
import { restaurant } from "@/config/restaurant";

export default function Hero() {
  const { tagline, hero } = restaurant;

  return (
    <section
      className="hero-pattern relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_35%_50%,rgba(200,80,30,0.12)_0%,transparent_70%)]" />


      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: text */}
          <div>
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-1.5 border border-accent/30 bg-accent/10 px-3 py-1 text-accent text-xs font-medium tracking-widest uppercase">
                {tagline}
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-1 mb-6">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.08] tracking-tight"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
              >
                {hero.headline}
              </motion.h1>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.08] tracking-tight text-primary"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              >
                {hero.headlineAccent}
              </motion.h1>
            </div>

            {/* Subheading */}
            <motion.p
              className="text-foreground/70 text-base leading-relaxed max-w-md mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
            >
              {hero.subheading}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
            >
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-6 sm:px-10 py-3.5 bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-200"
              >
                View Menu
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-6 sm:px-10 py-3.5 border border-foreground/20 text-foreground/70 text-sm font-medium hover:border-foreground/50 hover:text-foreground transition-all duration-200"
              >
                Our Story
              </a>
            </motion.div>
          </div>

          {/* Right: placeholder */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/elasedro-logo.png" alt="El Asadero" className="h-24 w-auto opacity-[0.12]" />
          </motion.div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
