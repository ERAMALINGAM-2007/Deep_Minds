import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedDestinations } from "@/components/FeaturedDestinations";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { CreateTripDialog } from "@/components/CreateTripDialog";

const Index = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedDestinations />
        <FeaturesSection />
      </main>
      <Footer />
      <CreateTripDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};

export default Index;
