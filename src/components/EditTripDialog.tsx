import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
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
import { toast } from "sonner";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface EditTripDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trip: {
        id: string;
        title: string;
        start_date: string;
        end_date: string;
        budget_limit: number;
    };
}

export function EditTripDialog({ open, onOpenChange, trip }: EditTripDialogProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tripName, setTripName] = useState(trip.title);
    const [startDate, setStartDate] = useState(trip.start_date?.split('T')[0] || "");
    const [endDate, setEndDate] = useState(trip.end_date?.split('T')[0] || "");
    const [budget, setBudget] = useState(trip.budget_limit?.toString() || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tripName || !startDate || !endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.put(`/trips/${trip.id}`, {
                title: tripName,
                start_date: startDate,
                end_date: endDate,
                budget_limit: budget ? parseFloat(budget) : 0,
            });

            toast.success("Trip updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Failed to update trip: " + (error.response?.data?.error || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Edit Trip</DialogTitle>
                    <DialogDescription>
                        Update your trip details
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

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="hero" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Trip"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
