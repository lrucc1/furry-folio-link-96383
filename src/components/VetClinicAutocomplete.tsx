import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

export interface VetClinicData {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface VetClinicAutocompleteProps {
  value: string;
  clinicAddress: string;
  onChange: (data: VetClinicData) => void;
  placeholder?: string;
}

export const VetClinicAutocomplete = ({ 
  value, 
  clinicAddress,
  onChange, 
  placeholder = "Start typing vet clinic name…" 
}: VetClinicAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasApiKey = !!apiKey;

  console.log('VetClinicAutocomplete - API Key present:', hasApiKey);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialize Google Places API
  useEffect(() => {
    if (!hasApiKey) {
      console.log('VetClinicAutocomplete - No API key, falling back to basic input');
      return;
    }

    const initGoogle = () => {
      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
        setScriptLoaded(true);
        console.log('VetClinicAutocomplete - Google Maps Places API initialized');
      }
    };

    if (window.google?.maps?.places) {
      console.log('VetClinicAutocomplete - Google Maps already loaded');
      initGoogle();
    } else {
      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('VetClinicAutocomplete - Script already loading, waiting...');
        existingScript.addEventListener('load', initGoogle);
        return;
      }

      console.log('VetClinicAutocomplete - Loading Google Maps script');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('VetClinicAutocomplete - Script loaded successfully');
        initGoogle();
      };
      script.onerror = () => {
        console.error('VetClinicAutocomplete - Failed to load Google Maps script');
        setScriptError(true);
      };
      document.head.appendChild(script);
    }
  }, [hasApiKey, apiKey]);

  const searchVetClinics = (query: string) => {
    if (!hasApiKey || !autocompleteServiceRef.current || query.length < 3) {
      setSuggestions([]);
      return;
    }

    console.log('VetClinicAutocomplete - Searching for:', query);
    setIsLoading(true);

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'au' },
        types: ['establishment'],
      },
      (predictions, status) => {
        setIsLoading(false);
        console.log('VetClinicAutocomplete - Search status:', status, 'Results:', predictions?.length);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter for vet-related places
          const vetPredictions = predictions.filter(p => {
            const text = (p.description + ' ' + p.structured_formatting.main_text).toLowerCase();
            return text.includes('vet') || 
                   text.includes('veterinary') || 
                   text.includes('animal') ||
                   text.includes('pet');
          });
          console.log('VetClinicAutocomplete - Filtered vet results:', vetPredictions.length);
          setSuggestions(vetPredictions);
          setShowSuggestions(true);
        } else {
          console.log('VetClinicAutocomplete - No results or error');
          setSuggestions([]);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      searchVetClinics(newValue);
    }, 250);
  };

  const getPlaceDetails = (placeId: string, description: string) => {
    if (!placesServiceRef.current) {
      // Fallback if PlacesService isn't available
      const parts = description.split(', ');
      onChange({
        name: parts[0],
        address: parts.slice(1).join(', '),
      });
      setShowSuggestions(false);
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const clinicData: VetClinicData = {
            name: place.name || description.split(', ')[0],
            address: place.formatted_address || description.split(', ').slice(1).join(', '),
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          };
          
          setInputValue(clinicData.name);
          onChange(clinicData);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // If no API key or user typed manually, update with current value
      if (!hasApiKey && inputValue !== value) {
        onChange({
          name: inputValue,
          address: clinicAddress,
        });
      }
    }, 200);
  };

  // If no API key or script error, render basic input
  if (!hasApiKey || scriptError) {
    return (
      <div className="space-y-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={() => {
            if (inputValue !== value) {
              onChange({
                name: inputValue,
                address: clinicAddress,
              });
            }
          }}
          placeholder={placeholder}
        />
        {scriptError && (
          <p className="text-xs text-destructive">
            Unable to load address suggestions. Please enter the clinic name manually.
          </p>
        )}
        {!hasApiKey && (
          <p className="text-xs text-muted-foreground">
            Enter the vet clinic name manually (address autocomplete not configured).
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls="vet-suggestions"
        aria-expanded={showSuggestions}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="vet-suggestions"
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-accent ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
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
          Type at least three characters to search vet clinics in Australia.
        </p>
      )}
    </div>
  );
};
