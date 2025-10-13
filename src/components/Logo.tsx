import { Link2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export const Logo = ({ 
  className = "", 
  iconClassName = "w-6 h-6",
  textClassName = "font-bold text-lg",
  showText = true 
}: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Link2 className={`${iconClassName} text-primary rotate-45`} strokeWidth={2.5} />
      </div>
      {showText && <span className={textClassName}>PetLinkID</span>}
    </div>
  );
};
