
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowLeft, Sparkles, Loader2, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CreateTrip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to create a trip");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleGetAISuggestions = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination first");
      return;
    }

    setIsLoadingAI(true);
    try {
      const duration = startDate && endDate
        ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
        : "3 days";

      const res = await api.post('/ai/suggest', {
        city: destination,
        trip_duration: duration,
        interests: description || "General sightseeing, food, culture"
      });

      if (res.data.suggestions && Array.isArray(res.data.suggestions)) {
        setAiSuggestions(res.data.suggestions);
        toast.success(`Found ${res.data.suggestions.length} suggestions for ${destination}!`);
      }
    } catch (error: any) {
      console.error('[CreateTrip] AI error:', error);
      toast.error(error.response?.data?.error || "Failed to get AI suggestions");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/trips', {
        title: tripName,
        start_date: startDate,
        end_date: endDate,
        budget_limit: budget ? parseFloat(budget) : 0,
        currency: 'INR'
      });

      toast.success(`Trip "${tripName}" created successfully!`);
      navigate(`/trips/${response.data.id}`);
    } catch (error: any) {
      toast.error("Failed to create trip: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/trips"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 w-fit transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Trips
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Create New Trip</CardTitle>
                  <CardDescription>
                    Start planning your next adventure by setting up the basics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Trip Name */}
                    <div className="space-y-2">
                      <Label htmlFor="tripName">Trip Name *</Label>
                      <Input
                        id="tripName"
                        placeholder="e.g., European Summer Adventure"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                      />
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                      <Label htmlFor="destination">Main Destination</Label>
                      <Input
                        id="destination"
                        placeholder="e.g., Paris, Tokyo, New York"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <div className="relative">
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-10"
                          />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <div className="relative">
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-10"
                          />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Limit (INR)</Label>
                      <div className="relative">
                        <Input
                          id="budget"
                          type="number"
                          placeholder="e.g. 5000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="pl-10"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Interests (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="What are you interested in? (e.g., food, art, history, nightlife)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* AI Suggestions Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGetAISuggestions}
                      disabled={isLoadingAI || !destination}
                    >
                      {isLoadingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting AI Suggestions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get AI Suggestions
                        </>
                      )}
                    </Button>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate("/trips")}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Trip"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* AI Suggestions Panel */}
              <div className="space-y-4">
                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              <CardTitle>AI Suggestions for {destination}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAiSuggestions([])}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>
                            Here are some recommended activities for your trip
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                          {aiSuggestions.map((suggestion, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-foreground">
                                      {suggestion.title}
                                    </h4>
                                    <Badge variant="secondary" className="capitalize flex-shrink-0">
                                      {suggestion.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {suggestion.description}
                                  </p>
                                  <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-medium text-green-600">
                                      ₹{suggestion.cost_est}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {aiSuggestions.length === 0 && !isLoadingAI && (
                  <Card className="bg-secondary/20">
                    <CardContent className="p-8 text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-semibold text-foreground mb-2">Get AI-Powered Suggestions</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter a destination and click "Get AI Suggestions" to discover amazing activities!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTrip;
