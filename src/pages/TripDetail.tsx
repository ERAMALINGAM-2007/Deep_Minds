
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Plus,
  Share2,
  Edit,
  MoreVertical,
  Loader2,
  Sparkles,
  Check,
  Trash2,
  Pencil
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";
import { EditTripDialog } from "@/components/EditTripDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import europeImage from "@/assets/destination-europe.jpg";

const TripDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [loadingAIForStop, setLoadingAIForStop] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{ stopId: string, suggestions: any[] }>({ stopId: '', suggestions: [] });
  const [editTripDialogOpen, setEditTripDialogOpen] = useState(false);
  const [deleteStopDialogOpen, setDeleteStopDialogOpen] = useState(false);
  const [deleteActivityDialogOpen, setDeleteActivityDialogOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Fetch Trip Details
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const res = await api.get(`/trips/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // Calculate Budget Stats
  const { data: budgetStats } = useQuery({
    queryKey: ['trip-budget', id],
    queryFn: async () => {
      const res = await api.get(`/trips/${id}/budget`);
      return res.data;
    },
    enabled: !!id
  });

  // Mutation to add a Stop
  const addStopMutation = useMutation({
    mutationFn: async (newStop: any) => {
      return await api.post(`/trips/${id}/stops`, newStop);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      toast.success("Stop added successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to add stop");
    }
  });

  const handleAddStop = () => {
    const city = prompt("Enter city name:");
    if (!city) return;
    const country = prompt("Enter country code (2 letters):", "US");

    addStopMutation.mutate({
      trip_id: id,
      city_name: city,
      country_code: country,
      arrival_date: new Date().toISOString(),
      order_index: (trip?.stops?.length || 0) + 1
    });
  };

  const handleGetAISuggestions = async (stopId: string, cityName: string) => {
    setLoadingAIForStop(stopId);
    try {
      const res = await api.post('/ai/suggest', {
        city: cityName,
        trip_duration: "2 days",
        interests: "Must see attractions, local food, hidden gems"
      });

      if (res.data.suggestions && Array.isArray(res.data.suggestions)) {
        setAiSuggestions({ stopId, suggestions: res.data.suggestions });
        toast.success(`Found ${res.data.suggestions.length} suggestions for ${cityName}!`);
      }
    } catch (error: any) {
      console.error('[TripDetail] AI error:', error);
      toast.error(error.response?.data?.error || "Failed to get AI suggestions");
    } finally {
      setLoadingAIForStop(null);
    }
  };

  const handleAddActivityFromAI = async (stopId: string, suggestion: any) => {
    try {
      await api.post(`/trips/${id}/activities`, {
        stop_id: stopId,
        trip_id: id,
        title: suggestion.title,
        cost: suggestion.cost_est || 0,
        category: suggestion.category || "activity"
      });

      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trip-budget', id] });
      toast.success(`Added "${suggestion.title}" to your itinerary!`);
    } catch (err) {
      toast.error("Failed to add activity");
    }
  };

  const handleAddActivity = (stopId: string) => {
    const name = prompt("Enter activity name:");
    if (!name) return;
    const cost = prompt("Enter cost (USD):", "0");
    const category = prompt("Category (activity, food, transport, stay):", "activity");

    api.post(`/trips/${id}/activities`, {
      stop_id: stopId,
      trip_id: id,
      title: name,
      cost: parseFloat(cost || "0"),
      category: category || "activity"
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trip-budget', id] });
      toast.success("Activity added!");
    }).catch(err => toast.error("Failed to add activity"));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public share link copied to clipboard!");
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (error || !trip) return <div className="p-20 text-center">Trip not found</div>;

  const totalSpent = budgetStats?.total_spent || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80">
          <img
            src={europeImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 container flex flex-col justify-end pb-8">
            <Link
              to="/trips"
              className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trips
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
              {trip.title}
            </h1>
            <p className="text-primary-foreground/80">My Awesome Trip</p>
          </div>
        </div>

        <div className="container py-8">
          {/* Trip Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Calendar, label: "Duration", value: trip.start_date ? `${format(new Date(trip.start_date), "MMM d")} - ${format(new Date(trip.end_date), "MMM d")}` : "Flexible" },
              { icon: MapPin, label: "Stops", value: `${trip.stops?.length || 0} cities` },
              { icon: DollarSign, label: "Budget Used", value: `₹${totalSpent} / ₹${trip.budget_limit}` },
              { icon: Clock, label: "Status", value: "Planning" },
            ].map((stat) => (
              <Card key={stat.label} variant="flat" className="bg-secondary/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button variant="hero" onClick={handleAddStop}>
              <Plus className="h-4 w-4" />
              Add Stop
            </Button>
            <Button variant="outline" onClick={() => setEditTripDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              Edit Trip
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </motion.div>

          {/* Itinerary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Itinerary
            </h2>

            <div className="space-y-6">
              {trip.stops && trip.stops.length > 0 ? trip.stops.map((stop: any, index: number) => (
                <Card key={stop.id} variant="default">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {stop.city_name}
                            <Badge variant="secondary">{stop.country_code}</Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {stop.arrival_date ? format(new Date(stop.arrival_date), "MMM d, yyyy") : "Date TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStop(stop);
                            setDeleteStopDialogOpen(true);
                          }}
                          title="Delete stop"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Activities */}
                    <div className="space-y-3 mb-4">
                      {stop.activities && stop.activities.map((activity: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.category}
                            </Badge>
                            <span className="text-foreground">{activity.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {activity.cost === 0 ? "Free" : `₹${activity.cost}`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedActivity(activity);
                                setDeleteActivityDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Suggestions for this stop */}
                    <AnimatePresence>
                      {aiSuggestions.stopId === stop.id && aiSuggestions.suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                            <Sparkles className="h-4 w-4" />
                            AI Suggestions - Click to add
                          </div>
                          {aiSuggestions.suggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleAddActivityFromAI(stop.id, suggestion)}
                              className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border border-primary/20"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground">{suggestion.title}</span>
                                  <Badge variant="secondary" className="text-xs capitalize">{suggestion.category}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <span className="text-sm font-medium text-green-600">₹{suggestion.cost_est}</span>
                                <Plus className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGetAISuggestions(stop.id, stop.city_name)}
                        disabled={loadingAIForStop === stop.id}
                      >
                        {loadingAIForStop === stop.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            Get AI Suggestions
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleAddActivity(stop.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Activity Manually
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center text-muted-foreground">No stops yet. Add one to get started!</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Dialogs */}
      {trip && (
        <EditTripDialog
          open={editTripDialogOpen}
          onOpenChange={setEditTripDialogOpen}
          trip={trip}
        />
      )}

      <ConfirmDialog
        open={deleteStopDialogOpen}
        onOpenChange={setDeleteStopDialogOpen}
        onConfirm={async () => {
          if (!selectedStop) return;
          try {
            await api.delete(`/trips/${id}/stops/${selectedStop.id}`);
            toast.success("Stop deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
            queryClient.invalidateQueries({ queryKey: ['trip-budget', id] });
            setSelectedStop(null);
          } catch (error: any) {
            toast.error("Failed to delete stop: " + (error.response?.data?.error || error.message));
          }
        }}
        title="Delete Stop"
        description={`Are you sure you want to delete ${selectedStop?.city_name}? All activities in this stop will also be deleted.`}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteActivityDialogOpen}
        onOpenChange={setDeleteActivityDialogOpen}
        onConfirm={async () => {
          if (!selectedActivity) return;
          try {
            await api.delete(`/trips/${id}/activities/${selectedActivity.id}`);
            toast.success("Activity deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
            queryClient.invalidateQueries({ queryKey: ['trip-budget', id] });
            setSelectedActivity(null);
          } catch (error: any) {
            toast.error("Failed to delete activity: " + (error.response?.data?.error || error.message));
          }
        }}
        title="Delete Activity"
        description={`Are you sure you want to delete "${selectedActivity?.title}"?`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default TripDetail;
