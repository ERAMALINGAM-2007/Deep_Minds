import { motion } from "framer-motion";
import { Map, Calendar, DollarSign, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Map,
    title: "Multi-City Planning",
    description: "Add unlimited stops to your journey. Drag and drop to reorder cities and optimize your route.",
  },
  {
    icon: Calendar,
    title: "Visual Itineraries",
    description: "See your trip come to life with beautiful timeline views and day-by-day breakdowns.",
  },
  {
    icon: DollarSign,
    title: "Budget Tracking",
    description: "Get automatic cost estimates for transport, stays, and activities. Stay within budget.",
  },
  {
    icon: Users,
    title: "Share & Collaborate",
    description: "Share trips with friends or make them public. Get inspired by other travelers.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to Plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to make trip planning as enjoyable as the journey itself
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="default" className="h-full group hover:border-primary/30">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
