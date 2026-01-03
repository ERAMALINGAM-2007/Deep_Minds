import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";

interface TripCardProps {
  id: string;
  title: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  destinations: number;
  budget: number;
  index: number;
  onEdit?: (tripId: string) => void;
  onDelete?: (tripId: string) => void;
}

export function TripCard({
  id,
  title,
  coverImage,
  startDate,
  endDate,
  destinations,
  budget,
  index,
  onEdit,
  onDelete,
}: TripCardProps) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/trips/${id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card variant="interactive" className="overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-card/50 backdrop-blur-sm hover:bg-card/70"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute bottom-3 left-3">
            <h3 className="font-display text-lg font-semibold text-primary-foreground">
              {title}
            </h3>
          </div>
        </div>
        <CardContent className="p-4 pt-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{startDate} - {endDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              <span>{destinations} stops</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>₹{budget.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="default" size="sm" className="flex-1" asChild>
              <Link to={`/trips/${id}`}>View Itinerary</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

