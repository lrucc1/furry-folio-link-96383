import { Link2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  variant?: 'default' | 'light' | 'gradient';
}

export const Logo = ({ 
  className = "", 
  iconClassName = "w-6 h-6",
  textClassName = "font-bold text-lg",
  showText = true,
  variant = 'default'
}: LogoProps) => {
  const textColorClass = variant === 'light' 
    ? 'text-white' 
    : variant === 'gradient' 
    ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
    : '';
  
  const iconColorClass = variant === 'light' 
    ? 'text-white' 
    : 'text-primary';

  return (
    <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <div className="relative">
        {/* Paw print behind link icon for pet branding */}
        <span className="absolute -top-1 -left-1 text-xs opacity-60">🐾</span>
        <Link2 className={`${iconClassName} ${iconColorClass} rotate-45`} strokeWidth={2.5} />
      </div>
      {showText && <span className={`${textClassName} ${textColorClass}`}>PetLinkID</span>}
    </div>
  );
};
