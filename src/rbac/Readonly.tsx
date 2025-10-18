import { ReactNode, useEffect, useRef } from 'react';

interface ReadonlyProps {
  when: boolean;
  children: ReactNode;
}

/**
 * Component to make child elements read-only when condition is met
 * Disables all inputs and adds pointer-events:none
 */
export function Readonly({ when, children }: ReadonlyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const inputs = container.querySelectorAll('input, textarea, select, button');

    inputs.forEach((input) => {
      if (when) {
        // Skip navigation buttons
        if (input.getAttribute('data-readonly-skip') === 'true') {
          return;
        }
        input.setAttribute('disabled', 'true');
      } else {
        input.removeAttribute('disabled');
      }
    });
  }, [when]);

  return (
    <div 
      ref={containerRef}
      className={when ? 'pointer-events-auto' : ''}
      style={when ? { opacity: 0.7 } : undefined}
    >
      {children}
    </div>
  );
}
