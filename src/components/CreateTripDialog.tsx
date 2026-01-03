import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTripDialog({ open, onOpenChange }: CreateTripDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      onOpenChange(false);

      // Reset form
      setTripName("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setDescription("");

      // Navigate to the new trip
      navigate(`/trips/${response.data.id}`);
    } catch (error: any) {
      toast.error("Failed to create trip: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create New Trip</DialogTitle>
          <DialogDescription>
            Start planning your next adventure by setting up the basics
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name *</Label>
            <Input
              id="tripName"
              placeholder="e.g., European Summer Adventure"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this trip about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

