import { ReactNode } from 'react';
import { MobileCard } from './MobileCard';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
        {title}
      </h3>
      <MobileCard className="p-0 divide-y divide-border overflow-hidden">
        {children}
      </MobileCard>
    </div>
  );
}

interface FormRowProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function FormRow({ label, required, children }: FormRowProps) {
  return (
    <div className="p-4">
      <label className="text-sm font-medium text-foreground mb-2 block">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface FormToggleRowProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function FormToggleRow({ icon, label, description, checked, onCheckedChange }: FormToggleRowProps) {
  return (
    <div className="flex items-center gap-3 p-4">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onCheckedChange(e.target.checked)} 
        />
        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
      </label>
    </div>
  );
}
