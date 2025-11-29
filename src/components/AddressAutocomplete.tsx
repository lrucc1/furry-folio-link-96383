import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import log from '@/lib/log';

export interface AddressData {
  formatted: string;
  line1?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (data: AddressData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address…",
  className,
  disabled
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGoogleMaps, setHasGoogleMaps] = useState(false);
  
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedInput = useDebounce(inputValue, 250);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setHasGoogleMaps(false);
      return;
    }

    if ((window as any).google?.maps?.places) {
      setHasGoogleMaps(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setHasGoogleMaps(true);
    };
    script.onerror = () => {
      log.error('Failed to load Google Maps script');
      setHasGoogleMaps(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initialize services
  useEffect(() => {
    if (!hasGoogleMaps || !(window as any).google?.maps?.places) return;

    const google = (window as any).google;
    autocompleteService.current = new google.maps.places.AutocompleteService();
    
    // Create a hidden div for PlacesService
    const div = document.createElement('div');
    placesService.current = new google.maps.places.PlacesService(div);
  }, [hasGoogleMaps]);

  // Fetch suggestions
  useEffect(() => {
    if (!hasGoogleMaps || !debouncedInput || debouncedInput.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!autocompleteService.current) return;

    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: debouncedInput,
        types: ['address']
      },
      (predictions: any, status: any) => {
        setIsLoading(false);
        const google = (window as any).google;
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    );
  }, [debouncedInput, hasGoogleMaps]);

  // Parse address components
  const parseAddressComponents = useCallback((place: any): AddressData => {
    const components = place.address_components || [];
    let line1 = '';
    let suburb = '';
    let state = '';
    let postcode = '';

    // Build street address
    const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
    const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
    line1 = `${streetNumber} ${route}`.trim();

    // Get locality/suburb
    suburb = components.find((c: any) => c.types.includes('locality'))?.long_name || 
             components.find((c: any) => c.types.includes('sublocality'))?.long_name || '';

    // Get state
    state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';

    // Get postcode
    postcode = components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

    return {
      formatted: place.formatted_address || inputValue,
      line1,
      suburb,
      state,
      postcode,
      country: 'Australia',
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng()
    };
  }, [inputValue]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((prediction: any) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'formatted_address', 'geometry']
      },
      (place: any, status: any) => {
        const google = (window as any).google;
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const addressData = parseAddressComponents(place);
          setInputValue(addressData.formatted);
          onChange(addressData);
          setIsOpen(false);
          setSuggestions([]);
        }
      }
    );
  }, [onChange, parseAddressComponents]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallback for no API key
  if (!apiKey || !hasGoogleMaps) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onBlur={() => {
          onChange({ formatted: inputValue });
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="address-suggestions"
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="address-suggestions"
          role="listbox"
          className={cn(
            "absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              role="option"
              aria-selected={selectedIndex === index}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion.description}
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && inputValue.length > 0 && inputValue.length < 3 && (
        <p className="text-xs text-muted-foreground mt-1">
          Type at least three characters to search addresses in Australia.
        </p>
      )}
    </div>
  );
}
