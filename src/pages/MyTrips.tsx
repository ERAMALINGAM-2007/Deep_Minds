import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Grid, List, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { EditTripDialog } from "@/components/EditTripDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import europeImage from "@/assets/destination-europe.jpg";
import asiaImage from "@/assets/destination-asia.jpg";
import africaImage from "@/assets/destination-africa.jpg";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const MyTrips = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    },
    retry: 1
  });

  // Map API data to UI format
  const formattedTrips = trips.map((trip: any) => ({
    id: trip.id,
    title: trip.title,
    coverImage: europeImage, // consistent placeholder for now
    startDate: trip.start_date ? format(new Date(trip.start_date), "MMM d") : "TBD",
    endDate: trip.end_date ? format(new Date(trip.end_date), "MMM d") : "TBD",
    destinations: 0, // Backend doesn't send count yet, defaulting to 0
    budget: trip.budget_limit || 0,
    rawData: trip, // Keep raw data for editing
  }));

  const filteredTrips = formattedTrips.filter((trip: any) =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tripId: string) => {
    const trip = trips.find((t: any) => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (tripId: string) => {
    const trip = trips.find((t: any) => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedTrip) return;

    try {
      await api.delete(`/trips/${selectedTrip.id}`);
      toast.success("Trip deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setDeleteDialogOpen(false);
      setSelectedTrip(null);
    } catch (error: any) {
      toast.error("Failed to delete trip: " + (error.response?.data?.error || error.message));
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading trips...</div>;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-2xl">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold text-foreground mb-2">Unable to Load Trips</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There was an error loading your trips. This might be a temporary issue.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              My Trips
            </h1>
            <p className="text-muted-foreground">
              Manage your travel plans and create new adventures
            </p>
          </motion.div>

          {/* Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New Trip
              </Button>
            </div>
          </motion.div>

          {/* Trips Grid */}
          {filteredTrips.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  {...trip}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No trips found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start planning your first adventure!"}
              </p>
              <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Your First Trip
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <CreateTripDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedTrip && (
        <>
          <EditTripDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            trip={selectedTrip}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Delete Trip"
            description={`Are you sure you want to delete "${selectedTrip.title}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )}
    </div>
  );
};

export default MyTrips;

