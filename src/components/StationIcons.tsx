import React from 'react';
import {
  Drum,
  Mic,
  Disc,
  Guitar,
  Piano,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import { StationId, TrafficLightRating } from '../types';

interface StationIconProps {
  stationId: StationId;
  className?: string;
  size?: number;
}

export const StationIcon: React.FC<StationIconProps> = ({
  stationId,
  className = 'w-4 h-4',
  size = 16,
}) => {
  switch (stationId) {
    case 'drums':
      return <Drum className={className} size={size} />;
    case 'vocals':
      return <Mic className={className} size={size} />;
    case 'bass':
      return <Disc className={className} size={size} />;
    case 'guitars':
      return <Guitar className={className} size={size} />;
    case 'keyboard':
      return <Piano className={className} size={size} />;
    case 'sound':
      return <Volume2 className={className} size={size} />;
    default:
      return <HelpCircle className={className} size={size} />;
  }
};

export const TrafficLightBadge: React.FC<{
  rating?: TrafficLightRating;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ rating, size = 'md' }) => {
  if (!rating) return null;

  const config = {
    green: {
      dot: 'bg-green-500 shadow-[0_0_8px_#22c55e]',
      label: 'Green',
    },
    yellow: {
      dot: 'bg-yellow-500 shadow-[0_0_8px_#eab308]',
      label: 'Yellow',
    },
    red: {
      dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      label: 'Red',
    },
  }[rating];

  const dotSize =
    size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';

  return (
    <span
      title={config.label}
      aria-label={config.label}
      className={`inline-block rounded-full shrink-0 ${dotSize} ${config.dot}`}
    />
  );
};
