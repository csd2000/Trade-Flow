import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({ 
  children, 
  leftAction, 
  rightAction, 
  className,
  disabled = false 
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const SWIPE_THRESHOLD = 80;
  const MAX_TRANSLATE = 120;

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = clientX;
    currentX.current = translateX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    
    const deltaX = clientX - startX.current;
    const newTranslateX = Math.max(
      Math.min(currentX.current + deltaX, MAX_TRANSLATE),
      -MAX_TRANSLATE
    );
    
    setTranslateX(newTranslateX);
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setIsAnimating(true);

    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      if (translateX > 0 && rightAction) {
        rightAction.action();
      } else if (translateX < 0 && leftAction) {
        leftAction.action();
      }
    }

    setTranslateX(0);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Global mouse move and up events
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, translateX]);

  const getActionOpacity = (side: 'left' | 'right') => {
    const absTranslate = Math.abs(translateX);
    if (absTranslate === 0) return 0;
    
    if (side === 'left' && translateX < 0) {
      return Math.min(absTranslate / SWIPE_THRESHOLD, 1);
    }
    if (side === 'right' && translateX > 0) {
      return Math.min(absTranslate / SWIPE_THRESHOLD, 1);
    }
    return 0;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Action */}
      {leftAction && (
        <div 
          className="absolute left-0 top-0 h-full flex items-center justify-center w-24 z-0"
          style={{ 
            opacity: getActionOpacity('left'),
            backgroundColor: leftAction.color
          }}
        >
          <div className="text-white text-center">
            <div className="flex justify-center mb-1">
              {leftAction.icon}
            </div>
            <div className="text-xs font-medium">
              {leftAction.label}
            </div>
          </div>
        </div>
      )}

      {/* Right Action */}
      {rightAction && (
        <div 
          className="absolute right-0 top-0 h-full flex items-center justify-center w-24 z-0"
          style={{ 
            opacity: getActionOpacity('right'),
            backgroundColor: rightAction.color
          }}
        >
          <div className="text-white text-center">
            <div className="flex justify-center mb-1">
              {rightAction.icon}
            </div>
            <div className="text-xs font-medium">
              {rightAction.label}
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card
        ref={cardRef}
        className={cn(
          "relative z-10 cursor-grab transition-transform select-none",
          isDragging && "cursor-grabbing",
          isAnimating && "duration-300 ease-out",
          disabled && "cursor-default",
          className
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Card>

      {/* Swipe Hint */}
      {!disabled && (leftAction || rightAction) && (
        <div className="absolute top-2 right-2 opacity-50">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            ← Swipe →
          </div>
        </div>
      )}
    </div>
  );
}