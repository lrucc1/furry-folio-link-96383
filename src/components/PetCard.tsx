import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, QrCode, Calendar, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

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
  publicId?: string;
}

interface PetCardProps {
  pet: Pet;
  onViewDetails: (pet: Pet) => void;
  onToggleLost: (petId: string) => void;
}

export const PetCard = ({ pet, onViewDetails, onToggleLost }: PetCardProps) => {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const publicUrl = `${window.location.origin}/pet/${pet.publicId || pet.id}`;

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
        
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-background/90 hover:bg-background shadow-soft"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Public Profile QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this code to view {pet.name}'s public profile
              </p>
              <code className="text-xs bg-muted px-3 py-2 rounded font-mono">
                {publicUrl}
              </code>
            </div>
          </DialogContent>
        </Dialog>
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
        </div>
      </CardContent>
    </Card>
  );
};