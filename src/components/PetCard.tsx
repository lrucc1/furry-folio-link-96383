import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, QrCode, Calendar, AlertTriangle } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  photo?: string;
  isLost: boolean;
  microchipNumber?: string;
  lastVaccination?: string;
}

interface PetCardProps {
  pet: Pet;
  onViewDetails: (pet: Pet) => void;
  onToggleLost: (petId: string) => void;
}

export const PetCard = ({ pet, onViewDetails, onToggleLost }: PetCardProps) => {
  return (
    <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-spring overflow-hidden group">
      <div className="relative overflow-hidden">
        {pet.photo ? (
          <img 
            src={pet.photo} 
            alt={`${pet.name} photo`}
            className="w-full h-56 object-cover object-center group-hover:scale-105 transition-spring"
          />
        ) : (
          <div className="w-full h-56 bg-muted flex items-center justify-center group-hover:scale-105 transition-spring">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {pet.isLost && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground shadow-medium">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Lost
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-soft"
          onClick={() => onToggleLost(pet.id)}
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {pet.age}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {pet.breed} • {pet.species}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {pet.microchipNumber && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              Microchipped
            </div>
          )}
          {pet.lastVaccination && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Vaccinated
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="flex-1"
            onClick={() => onViewDetails(pet)}
          >
            View Details
          </Button>
          {pet.isLost ? (
            <Button 
              variant="success" 
              size="sm"
              onClick={() => onToggleLost(pet.id)}
              className="px-4"
            >
              Found
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onToggleLost(pet.id)}
              className="px-4"
            >
              <MapPin className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};