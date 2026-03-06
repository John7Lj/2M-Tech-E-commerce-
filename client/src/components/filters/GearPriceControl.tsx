import React, { useState, useRef, useEffect } from 'react';

interface GearPriceControlProps {
  minValue?: number;
  maxValue?: number;
  currentMin: number;
  currentMax: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  className?: string;
}

const GearPriceControl: React.FC<GearPriceControlProps> = ({
  currentMin,
  currentMax,
  step = 1000,
  onChange,
  className = ''
}) => {
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const [minRotation, setMinRotation] = useState(0);
  const [maxRotation, setMaxRotation] = useState(0);
  const minGearRef = useRef<HTMLDivElement>(null);
  const maxGearRef = useRef<HTMLDivElement>(null);

  // For unlimited rotation tracking
  const [minTotalRotation, setMinTotalRotation] = useState(0);
  const [maxTotalRotation, setMaxTotalRotation] = useState(0);
  const [lastMinAngle, setLastMinAngle] = useState(0);
  const [lastMaxAngle, setLastMaxAngle] = useState(0);

  // Enhanced touch tracking
  const [, setStartDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  // Initialize rotations
  useEffect(() => {
    const minRot = (currentMin / step) * 30; // 30 degrees per step
    const maxRot = (currentMax / step) * 30;
    setMinRotation(minRot);
    setMaxRotation(maxRot);
    setMinTotalRotation(minRot);
    setMaxTotalRotation(maxRot);
  }, []);

  // Helper function to get coordinates from mouse or touch event
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  // Calculate distance from center for touch sensitivity
  const getDistanceFromCenter = (clientX: number, clientY: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const handleStart = (gear: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const gearRef = gear === 'min' ? minGearRef.current : maxGearRef.current;
    if (!gearRef) return;

    const { clientX, clientY } = getEventCoordinates(e.nativeEvent);
    const rect = gearRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;

    // For touch events, also track distance for better sensitivity
    if ('touches' in e.nativeEvent) {
      const distance = getDistanceFromCenter(clientX, clientY, rect);
      setStartDistance(distance);
      setTotalDistance(0);
    }

    if (gear === 'min') {
      setIsDraggingMin(true);
      setLastMinAngle(angle);
    } else {
      setIsDraggingMax(true);
      setLastMaxAngle(angle);
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingMin && !isDraggingMax) return;

    e.preventDefault();

    const gear = isDraggingMin ? minGearRef.current : maxGearRef.current;
    if (!gear) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = gear.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;

    // Detect if this is a touch event
    const isTouch = 'touches' in e;

    let sensitivity = 1;
    let angleDiff = 0;

    if (isTouch) {
      // For touch, use a combination of angle difference and distance-based sensitivity
      const currentDistance = getDistanceFromCenter(clientX, clientY, rect);
      const distanceRatio = Math.max(0.5, Math.min(2, currentDistance / 50)); // Normalize distance

      // Calculate raw angle difference
      const currentAngle = isDraggingMin ? lastMinAngle : lastMaxAngle;
      angleDiff = angle - currentAngle;

      // Handle angle wrap-around
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      // Enhanced touch sensitivity based on distance from center
      sensitivity = 3.5 * distanceRatio;
      angleDiff *= sensitivity;

      // Add cumulative distance tracking for very small movements
      const movementDistance = Math.abs(angleDiff);
      setTotalDistance(prev => prev + movementDistance);

      // Boost very small movements on touch
      if (Math.abs(angleDiff) < 5 && totalDistance > 10) {
        angleDiff *= 2;
      }
    } else {
      // Mouse handling (unchanged)
      const currentAngle = isDraggingMin ? lastMinAngle : lastMaxAngle;
      angleDiff = angle - currentAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
    }

    if (isDraggingMin) {
      const newTotalRotation = minTotalRotation + angleDiff;
      const steps = Math.round(newTotalRotation / 30);
      const newMin = Math.max(0, steps * step);

      if (newMin < currentMax - step) {
        setMinTotalRotation(newTotalRotation);
        setMinRotation(newTotalRotation);
        setLastMinAngle(angle);
        onChange(newMin, currentMax);
      }
    } else {
      const newTotalRotation = maxTotalRotation + angleDiff;
      const steps = Math.round(newTotalRotation / 30);
      const newMax = Math.max(currentMin + step, steps * step);

      setMaxTotalRotation(newTotalRotation);
      setMaxRotation(newTotalRotation);
      setLastMaxAngle(angle);
      onChange(currentMin, newMax);
    }
  };

  const handleEnd = (e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    setIsDraggingMin(false);
    setIsDraggingMax(false);
    setStartDistance(0);
    setTotalDistance(0);
  };

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e);
      };
      const handleMouseUp = () => handleEnd();
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        handleEnd();
      };

      // Add event listeners with proper options
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDraggingMin, isDraggingMax, currentMin, currentMax, minTotalRotation, maxTotalRotation, lastMinAngle, lastMaxAngle, totalDistance]);

  const SimpleGear = ({ rotation }: { rotation: number }) => {
    const teethCount = 8;
    const radius = 28;
    const toothHeight = 4;

    // Create simple gear path
    let gearPath = '';
    for (let i = 0; i < teethCount; i++) {
      const angle = (i * 360) / teethCount;
      const nextAngle = ((i + 1) * 360) / teethCount;
      const midAngle = angle + 360 / teethCount / 2;

      const rad1 = (angle * Math.PI) / 180;
      const rad2 = (nextAngle * Math.PI) / 180;
      const radMid = (midAngle * Math.PI) / 180;

      const x1 = 32 + radius * Math.cos(rad1);
      const y1 = 32 + radius * Math.sin(rad1);
      const x2 = 32 + (radius + toothHeight) * Math.cos(radMid);
      const y2 = 32 + (radius + toothHeight) * Math.sin(radMid);
      const x3 = 32 + radius * Math.cos(rad2);
      const y3 = 32 + radius * Math.sin(rad2);

      if (i === 0) {
        gearPath = `M ${x1} ${y1}`;
      }
      gearPath += ` L ${x2} ${y2} L ${x3} ${y3}`;
    }
    gearPath += ' Z';

    return (
      <div
        className="w-20 h-20 cursor-grab active:cursor-grabbing transition-transform duration-150 hover:scale-105 select-none"
        style={{
          transform: `rotate(${rotation}deg)`,
          touchAction: 'none',
        }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full pointer-events-none">
          {/* Simple gear body */}
          <path
            d={gearPath}
            fill="#6b7280"
            stroke="#374151"
            strokeWidth="1"
          />

          {/* Center circle */}
          <circle
            cx="32"
            cy="32"
            r="18"
            fill="#9ca3af"
            stroke="#4b5563"
            strokeWidth="1"
          />

          {/* Inner center */}
          <circle
            cx="32"
            cy="32"
            r="8"
            fill="#e5e7eb"
            stroke="#6b7280"
            strokeWidth="1"
          />

          {/* Simple indicator line */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="20"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  const handleGearInteraction = (gear: 'min' | 'max') => {
    return {
      onMouseDown: handleStart(gear),
      onTouchStart: handleStart(gear)
    };
  };

  return (
    <div className={`space-y-6 ${className}`} style={{ touchAction: 'none' }}>
      <div className="text-xs font-black text-gray-400 dark:text-gray-500 text-center mb-6 uppercase tracking-[0.2em]">
        Price Control
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="text-center">
          <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3">Range Summary</div>
          <div className="flex justify-between items-center px-4">
            <div className="text-lg font-black text-primary">
              LE {currentMin.toLocaleString()}
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1 mx-4" />
            <div className="text-lg font-black text-primary">
              LE {currentMax.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-around items-center py-8 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="text-center">
          <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 mb-4 uppercase tracking-widest">
            Min
          </div>
          <div
            ref={minGearRef}
            {...handleGearInteraction('min')}
            className={`transform transition-all duration-150 ${isDraggingMin
                ? 'scale-110'
                : 'hover:scale-105'
              }`}
            style={{ touchAction: 'none' }}
          >
            <SimpleGear rotation={minRotation} />
          </div>
          <div className="text-sm text-primary mt-3 font-black">
            LE {currentMin.toLocaleString()}
          </div>
        </div>

        <div className="flex-1 mx-6 relative">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse" />
          </div>
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500">Range: LE {(currentMax - currentMin).toLocaleString()}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-black text-gray-400 dark:text-gray-600 mb-4 uppercase tracking-widest">
            Max
          </div>
          <div
            ref={maxGearRef}
            {...handleGearInteraction('max')}
            className={`transform transition-all duration-150 ${isDraggingMax
                ? 'scale-110'
                : 'hover:scale-105'
              }`}
            style={{ touchAction: 'none' }}
          >
            <SimpleGear rotation={maxRotation} />
          </div>
          <div className="text-sm text-primary mt-3 font-black">
            LE {currentMax.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GearPriceControl;