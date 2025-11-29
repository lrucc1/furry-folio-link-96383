import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONE_GROUPS = {
  'Australia & Pacific': [
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Australia/Hobart',
    'Pacific/Auckland',
    'Pacific/Fiji',
  ],
  'Americas': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Sao_Paulo',
    'America/Mexico_City',
  ],
  'Europe': [
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Amsterdam',
    'Europe/Dublin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Stockholm',
  ],
  'Asia': [
    'Asia/Tokyo',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Seoul',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
  ],
};

const formatTimezone = (tz: string): string => {
  const parts = tz.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const offset = formatter.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';
    return `${city} (${offset})`;
  } catch {
    return city;
  }
};

interface TimezoneSelectorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TimezoneSelector = ({
  value,
  onChange,
  placeholder = "Select timezone",
  disabled = false,
}: TimezoneSelectorProps) => {
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return null;
    }
  }, []);

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {detectedTimezone && (
          <SelectGroup>
            <SelectLabel>Detected</SelectLabel>
            <SelectItem value={detectedTimezone}>
              {formatTimezone(detectedTimezone)} (Auto-detected)
            </SelectItem>
          </SelectGroup>
        )}
        {Object.entries(TIMEZONE_GROUPS).map(([region, timezones]) => (
          <SelectGroup key={region}>
            <SelectLabel>{region}</SelectLabel>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {formatTimezone(tz)}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
