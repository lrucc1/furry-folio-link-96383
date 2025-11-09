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
  const hasPublicId = !!pet.publicId;
  const publicUrl = hasPublicId ? `${window.location.origin}/pet/${pet.publicId}` : "";

  return (
    <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-spring overflow-hidden group">
      <div className="relative overflow-hidden">
        {pet.photo ? (
          <img 
            src={pet.photo} 
            alt={`${pet.name} photo`}
            className="w-full h-48 sm:h-56 md:h-64 object-cover object-center group-hover:scale-105 transition-spring"
          />
        ) : (
          <div className="w-full h-48 sm:h-56 md:h-64 bg-muted flex items-center justify-center group-hover:scale-105 transition-spring">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
          </div>
        )}
        
        {pet.isLost && (
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-destructive text-destructive-foreground shadow-medium text-[10px] sm:text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Lost
          </Badge>
        )}
        
        {hasPublicId && (
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-background/90 hover:bg-background shadow-soft"
                aria-label={`Show QR code for ${pet.name}'s public profile`}
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
                    alt={`${pet.name} public profile QR code`}
                    className="w-48 h-48"
                    loading="lazy"
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
        )}
      </div>

      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">{pet.name}</h3>
          <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
            {pet.age}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm truncate">
          {pet.breed} • {pet.species}
        </p>
      </CardHeader>

      <CardContent className="pt-0 px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
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
            className="flex-1 text-sm sm:text-base"
            onClick={() => onViewDetails(pet)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};