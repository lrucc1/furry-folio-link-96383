import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserCountry } from '@/hooks/useUserCountry';
import { 
  getRegistriesForCountry, 
  getInsuranceProvidersForCountry,
  isKnownProvider,
  ProviderOption 
} from '@/config/petRegistries';

interface RegionAwareSelectProps {
  type: 'registry' | 'insurance';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

/**
 * Smart select component that shows region-appropriate options
 * and supports manual entry via "Other" option.
 */
export const RegionAwareSelect = ({
  type,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  error = false,
}: RegionAwareSelectProps) => {
  const { countryCode, loading } = useUserCountry();
  const [options, setOptions] = useState<ProviderOption[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Get appropriate options based on type and country
  useEffect(() => {
    const opts = type === 'registry'
      ? getRegistriesForCountry(countryCode)
      : getInsuranceProvidersForCountry(countryCode);
    setOptions(opts);
  }, [countryCode, type]);

  // Determine if current value is a custom entry
  useEffect(() => {
    if (value && !isKnownProvider(value, type, countryCode) && value !== 'Other' && value !== '') {
      // Value exists but is not in the predefined list - it's a custom entry
      setShowCustomInput(true);
      setCustomValue(value);
    } else if (value === 'Other') {
      setShowCustomInput(true);
      setCustomValue('');
    } else {
      setShowCustomInput(false);
      setCustomValue('');
    }
  }, [value, type, countryCode]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'Other') {
      setShowCustomInput(true);
      setCustomValue('');
      // Don't update parent yet - wait for custom input
    } else {
      setShowCustomInput(false);
      setCustomValue('');
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (inputValue: string) => {
    setCustomValue(inputValue);
    onChange(inputValue);
  };

  // Determine what to show in the select
  const selectDisplayValue = showCustomInput ? 'Other' : value;

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={`bg-muted/50 border-0 ${className}`}>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      <Select 
        value={selectDisplayValue} 
        onValueChange={handleSelectChange}
      >
        <SelectTrigger 
          className={`bg-muted/50 border-0 ${error ? 'ring-2 ring-destructive' : ''} ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustomInput && (
        <Input
          value={customValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={type === 'registry' ? 'Enter registry name...' : 'Enter insurance provider...'}
          className={`bg-muted/50 border-0 ${error ? 'ring-2 ring-destructive' : ''}`}
          autoFocus
        />
      )}
    </div>
  );
};

// Convenience exports for specific use cases
export const RegistrySelect = (props: Omit<RegionAwareSelectProps, 'type'>) => (
  <RegionAwareSelect {...props} type="registry" />
);

export const InsuranceProviderSelect = (props: Omit<RegionAwareSelectProps, 'type'>) => (
  <RegionAwareSelect {...props} type="insurance" />
);
