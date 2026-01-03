import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "./DestinationCard";
import { Link } from "react-router-dom";

import europeImage from "@/assets/destination-europe.jpg";
import asiaImage from "@/assets/destination-asia.jpg";
import africaImage from "@/assets/destination-africa.jpg";

const destinations = [
  {
    title: "Prague",
    country: "Czech Republic",
    image: europeImage,
    rating: 4.8,
    costIndex: "$$",
  },
  {
    title: "Kyoto",
    country: "Japan",
    image: asiaImage,
    rating: 4.9,
    costIndex: "$$$",
  },
  {
    title: "Serengeti",
    country: "Tanzania",
    image: africaImage,
    rating: 4.7,
    costIndex: "$$$$",
  },
];

export function FeaturedDestinations() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Get inspired by trending locations loved by travelers worldwide
            </p>
          </div>
          <Button variant="ghost" className="self-start md:self-auto" asChild>
            <Link to="/explore">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.title}
              {...destination}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
