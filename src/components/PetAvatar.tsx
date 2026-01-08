import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface PetAvatarProps {
  photoUrl?: string | null;
  species: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showEmoji?: boolean;
}

// Species to emoji mapping
const speciesEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🦜',
  rabbit: '🐰',
  fish: '🐠',
  hamster: '🐹',
  guinea_pig: '🐹',
  turtle: '🐢',
  snake: '🐍',
  lizard: '🦎',
  horse: '🐴',
  other: '🐾',
};

// Species to background gradient mapping
const speciesGradients: Record<string, string> = {
  dog: 'bg-gradient-to-br from-amber-400 to-orange-500',
  cat: 'bg-gradient-to-br from-purple-400 to-pink-500',
  bird: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  rabbit: 'bg-gradient-to-br from-pink-300 to-rose-400',
  fish: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  hamster: 'bg-gradient-to-br from-yellow-300 to-amber-400',
  guinea_pig: 'bg-gradient-to-br from-orange-300 to-amber-500',
  turtle: 'bg-gradient-to-br from-green-400 to-emerald-500',
  snake: 'bg-gradient-to-br from-lime-400 to-green-500',
  lizard: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  horse: 'bg-gradient-to-br from-amber-500 to-yellow-600',
  other: 'bg-gradient-to-br from-primary/60 to-primary',
};

// Size classes mapping
const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
  '2xl': 'w-32 h-32 text-6xl',
};

const iconSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
  '2xl': 'text-5xl',
};

export function getSpeciesEmoji(species: string): string {
  const normalizedSpecies = species.toLowerCase().replace(/\s+/g, '_');
  return speciesEmojis[normalizedSpecies] || speciesEmojis.other;
}

export function getSpeciesGradient(species: string): string {
  const normalizedSpecies = species.toLowerCase().replace(/\s+/g, '_');
  return speciesGradients[normalizedSpecies] || speciesGradients.other;
}

export function PetAvatar({ 
  photoUrl, 
  species, 
  name, 
  size = 'md',
  className,
  showEmoji = true 
}: PetAvatarProps) {
  const emoji = getSpeciesEmoji(species);
  const gradient = getSpeciesGradient(species);
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizeClasses[size];
  
  // Use signed URL for private bucket access
  const { url: signedUrl } = useSignedUrl(photoUrl);

  return (
    <Avatar className={cn(sizeClass, className)}>
      {signedUrl && <AvatarImage src={signedUrl} alt={name} />}
      <AvatarFallback className={cn(gradient, 'text-white', iconSize)}>
        {showEmoji ? emoji : name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// Larger variant for profile pages and cards
interface PetAvatarLargeProps {
  photoUrl?: string | null;
  species: string;
  name: string;
  className?: string;
}

export function PetAvatarLarge({ 
  photoUrl, 
  species, 
  name, 
  className 
}: PetAvatarLargeProps) {
  const emoji = getSpeciesEmoji(species);
  const gradient = getSpeciesGradient(species);
  
  // Use signed URL for private bucket access
  const { url: signedUrl, loading } = useSignedUrl(photoUrl);

  if (signedUrl) {
    return (
      <div className={cn('rounded-xl overflow-hidden bg-muted', className)}>
        <img src={signedUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (loading && photoUrl) {
    return (
      <div className={cn('rounded-xl bg-muted animate-pulse', className)} />
    );
  }

  return (
    <div className={cn(
      'rounded-xl flex items-center justify-center', 
      gradient,
      className
    )}>
      <span className="text-6xl drop-shadow-md">{emoji}</span>
    </div>
  );
}
