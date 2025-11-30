import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { searchBreeds, getBreedsForSpecies } from '@/config/petBreeds';

interface BreedAutocompleteProps {
  species: string;
  value: string;
  onChange: (breed: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function BreedAutocomplete({
  species,
  value,
  onChange,
  placeholder = 'Select breed',
  className,
  error,
}: BreedAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const breeds = species ? searchBreeds(species, search) : [];
  const showAddCustom = search.trim() && !breeds.some(b => b.toLowerCase() === search.toLowerCase());

  // Reset search when species changes
  useEffect(() => {
    setSearch('');
  }, [species]);

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (breed: string) => {
    onChange(breed);
    setSearch('');
    setOpen(false);
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (trimmed) {
      onChange(trimmed);
      setSearch('');
      setOpen(false);
    }
  };

  if (!species) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select species first"
        disabled
        className={cn('bg-muted/50 border-0', className)}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-muted/50 border-0 font-normal h-10',
            !value && 'text-muted-foreground',
            error && 'ring-2 ring-destructive',
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${species.toLowerCase()} breeds...`}
            className="flex h-8 w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {breeds.length === 0 && !showAddCustom ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No breeds found
            </div>
          ) : (
            <>
              {breeds.map((breed) => (
                <div
                  key={breed}
                  onClick={() => handleSelect(breed)}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    value === breed && 'bg-accent'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === breed ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {breed}
                </div>
              ))}
              {showAddCustom && (
                <div
                  onClick={handleAddCustom}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-t mt-1 pt-2"
                >
                  <Plus className="mr-2 h-4 w-4 text-primary" />
                  <span>Add "{search.trim()}"</span>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
