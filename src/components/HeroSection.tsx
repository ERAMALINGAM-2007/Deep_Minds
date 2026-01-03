import { motion } from "framer-motion";
import { MapPin, Calendar, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-beach.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Beautiful tropical beach destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 text-sm font-medium backdrop-blur-sm">
              Plan your perfect journey
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 leading-tight"
          >
            Dream, Design &
            <br />
            <span className="text-accent">Discover</span> the World
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-primary-foreground/80 mb-8 max-w-lg"
          >
            Create personalized multi-city itineraries, explore destinations,
            track your budget, and share adventures with friends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/trips/new">Start Planning</Link>
            </Button>
            <Button variant="outline-light" size="xl" asChild>
              <Link to="/explore">Explore Destinations</Link>
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3 mt-12"
          >
            {[
              { icon: MapPin, label: "Multi-City Planning" },
              { icon: Calendar, label: "Visual Itineraries" },
              { icon: Compass, label: "Budget Tracking" },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20"
              >
                <feature.icon className="h-4 w-4 text-accent" />
                <span className="text-sm text-primary-foreground/90">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
