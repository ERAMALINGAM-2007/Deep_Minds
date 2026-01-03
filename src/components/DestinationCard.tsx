import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DestinationCardProps {
  title: string;
  country: string;
  image: string;
  rating: number;
  costIndex: string;
  index: number;
}

export function DestinationCard({
  title,
  country,
  image,
  rating,
  costIndex,
  index,
}: DestinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card variant="interactive" className="overflow-hidden group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-primary-foreground">
                {title}
              </h3>
              <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                <MapPin className="h-3 w-3" />
                {country}
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
              <Star className="h-3 w-3 text-accent fill-accent" />
              <span className="text-sm font-medium text-primary-foreground">{rating}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Cost Index: <span className="font-medium text-foreground">{costIndex}</span>
            </span>
            <Button variant="secondary" size="sm">
              Add to Trip
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
