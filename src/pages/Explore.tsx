
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, Loader2, RefreshCw, AlertCircle, Calendar, Clock, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Explore = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [tripPlan, setTripPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's trips for add-to-trip functionality
  const { data: userTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    },
    retry: 1
  });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    setLoading(true);
    setSuggestions([]);
    setTripPlan(null);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      // Fetch both suggestions and trip plan in parallel
      const [suggestionsRes, tripPlanRes] = await Promise.all([
        api.post('/ai/suggest', {
          city,
          trip_duration: "3 days",
          interests: "Must see attractions, food, hidden gems"
        }, { signal: controller.signal }),
        api.post('/ai/trip-plan', {
          city,
          duration: "3 days",
          interests: "Sightseeing, food, culture, history",
          budget: "Moderate"
        }, { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      if (suggestionsRes.data.suggestions && Array.isArray(suggestionsRes.data.suggestions)) {
        setSuggestions(suggestionsRes.data.suggestions);
      }

      if (tripPlanRes.data.trip_plan) {
        setTripPlan(tripPlanRes.data.trip_plan);
        toast.success(`Generated detailed trip plan for ${city}!`);
      }

    } catch (error: any) {
      console.error('[Explore] AI error:', error);

      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        setError("Request timed out. The AI is taking too long to respond. Please try again.");
        toast.error("Request timed out. Please try again.");
      } else if (error.response?.status === 429) {
        setError("AI service quota exceeded. Please try again later.");
        toast.error("AI service quota exceeded. Please try again later.");
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
        toast.error(error.response.data.error);
      } else {
        setError("Failed to get suggestions from AI. Please try again.");
        toast.error("Failed to get suggestions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTrip = async (tripId: string, suggestion: any) => {
    try {
      const trip = userTrips.find((t: any) => t.id === tripId);
      if (!trip) {
        toast.error("Trip not found");
        return;
      }

      // Fetch trip details to get stops

      const tripDetailsRes = await api.get(`/trips/${tripId}`);
      const tripDetails = tripDetailsRes.data;

      let stopId = null;

      // If trip has stops, use the first one
      if (tripDetails.stops && tripDetails.stops.length > 0) {
        stopId = tripDetails.stops[0].id;
      } else {
        // Create a default stop for this trip
        const stopRes = await api.post(`/trips/${tripId}/stops`, {
          trip_id: tripId,
          city_name: city || "Suggested Activities",
          arrival_date: trip.start_date,
          departure_date: trip.end_date
        });
        stopId = stopRes.data.id;
        toast.info("Created a new stop for your activities");
      }

      // Now add the activity with the stop_id
      await api.post(`/trips/${tripId}/activities`, {
        trip_id: tripId,
        stop_id: stopId,
        title: suggestion.title,
        cost: suggestion.cost_est || suggestion.cost || 0,
        category: suggestion.category || "activity"
      });

      toast.success(`Added "${suggestion.title}" to ${trip.title}!`);
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    } catch (error: any) {
      toast.error("Failed to add to trip: " + (error.response?.data?.error || error.message));
    }
  };

  const handleRetry = () => {
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Search Hero */}
        <div className="bg-secondary/30 py-20">
          <div className="container max-w-3xl text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Ask GlobeTrotter AI
              </h1>
              <p className="text-xl text-muted-foreground">
                Get personalized trip plans and activity recommendations powered by Gemini AI
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Where do you want to go? (e.g. Paris, Tokyo)"
                  className="pl-10 h-12 text-lg"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button size="lg" className="h-12 px-8" type="submit" disabled={loading} variant="hero">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {loading ? "Thinking..." : "Plan Trip"}
              </Button>
            </motion.form>
          </div>
        </div>

        {/* Results */}
        <div className="container py-16">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Unable to Generate Plan</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trip Plan */}
          {tripPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-display flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Detailed Trip Plan for {city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Overview</h3>
                    <p className="text-muted-foreground">{tripPlan.overview}</p>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Best Time to Visit</p>
                      <p className="font-semibold">{tripPlan.best_time_to_visit}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Budget</p>
                      <p className="font-semibold">{tripPlan.estimated_budget}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Transportation</p>
                      <p className="font-semibold text-sm">{tripPlan.transportation}</p>
                    </div>
                  </div>

                  {/* Daily Itinerary */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Day-by-Day Itinerary</h3>
                    <div className="space-y-3">
                      {tripPlan.daily_itinerary?.map((day: any, index: number) => (
                        <Card key={index} className="overflow-hidden">
                          <button
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                            className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-semibold">
                                {day.day}
                              </div>
                              <div className="text-left">
                                <h4 className="font-semibold">{day.title}</h4>
                                <p className="text-sm text-muted-foreground">Est. ₹{day.estimated_cost}</p>
                              </div>
                            </div>
                            {expandedDay === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>

                          {expandedDay === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t p-4 space-y-4"
                            >
                              {/* Morning */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <h5 className="font-semibold">Morning ({day.morning?.time})</h5>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{day.morning?.description}</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {day.morning?.activities?.map((activity: string, i: number) => (
                                    <li key={i}>{activity}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Afternoon */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <h5 className="font-semibold">Afternoon ({day.afternoon?.time})</h5>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{day.afternoon?.description}</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {day.afternoon?.activities?.map((activity: string, i: number) => (
                                    <li key={i}>{activity}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Evening */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <h5 className="font-semibold">Evening ({day.evening?.time})</h5>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{day.evening?.description}</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {day.evening?.activities?.map((activity: string, i: number) => (
                                    <li key={i}>{activity}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Meals */}
                              {day.meals && (
                                <div className="bg-secondary/30 p-3 rounded-lg">
                                  <h5 className="font-semibold mb-2 text-sm">Recommended Meals</h5>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">Breakfast</p>
                                      <p className="font-medium">{day.meals.breakfast}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Lunch</p>
                                      <p className="font-medium">{day.meals.lunch}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Dinner</p>
                                      <p className="font-medium">{day.meals.dinner}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Travel Tips */}
                  {tripPlan.travel_tips && tripPlan.travel_tips.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Travel Tips</h3>
                      <ul className="space-y-2">
                        {tripPlan.travel_tips.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Local Cuisine */}
                  {tripPlan.local_cuisine && tripPlan.local_cuisine.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Must-Try Local Cuisine</h3>
                      <div className="flex flex-wrap gap-2">
                        {tripPlan.local_cuisine.map((dish: string, index: number) => (
                          <Badge key={index} variant="secondary">{dish}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Must-Visit Places with Add to Trip */}
          {tripPlan?.must_visit_places && tripPlan.must_visit_places.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-display font-bold mb-6">Must-Visit Places</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tripPlan.must_visit_places.map((place: any, index: number) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="capitalize">
                          {place.category}
                        </Badge>
                        <span className="text-sm font-semibold text-green-600">
                          ₹{place.cost}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold mb-2">
                          {place.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {place.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {place.estimated_time}
                        </p>
                      </div>
                      {userTrips.length > 0 && (
                        <Select onValueChange={(tripId) => handleAddToTrip(tripId, { title: place.name, cost_est: place.cost, category: place.category })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add to trip" />
                          </SelectTrigger>
                          <SelectContent>
                            {userTrips.map((trip: any) => (
                              <SelectItem key={trip.id} value={trip.id}>
                                {trip.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Activity Suggestions with Add to Trip */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-display font-bold mb-6">Activity Suggestions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((item, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="capitalize">
                          {item.category}
                        </Badge>
                        <span className="text-sm font-semibold text-green-600">
                          ₹{item.cost_est}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                      {userTrips.length > 0 && (
                        <Select onValueChange={(tripId) => handleAddToTrip(tripId, item)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add to trip" />
                          </SelectTrigger>
                          <SelectContent>
                            {userTrips.map((trip: any) => (
                              <SelectItem key={trip.id} value={trip.id}>
                                {trip.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && suggestions.length === 0 && !tripPlan && !error && (
            <div className="text-center text-muted-foreground max-w-md mx-auto">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">Enter a city above to discover a detailed trip plan and amazing activities!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
