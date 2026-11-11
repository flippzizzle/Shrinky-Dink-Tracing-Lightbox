import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Unlock, Move, Sun, ShieldAlert } from 'lucide-react';
import { ButtonPosition } from '../types/tracer';
import { clampPosition } from '../utils/tracer-utils';

interface FloatingLockButtonProps {
  isLocked: boolean;
  onToggleLock: () => void;
  isWakeLockActive: boolean;
}

export const FloatingLockButton: React.FC<FloatingLockButtonProps> = ({
  isLocked,
  onToggleLock,
  isWakeLockActive,
}) => {
  // Position of the floating button on the screen
  const [position, setPosition] = useState<ButtonPosition>(() => {
    // Initial position: top right corner with good margin
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - 180),
        y: 24,
      };
    }
    return { x: 240, y: 24 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number } | null>(null);
  const hasMovedSignificantlyRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Safety unlock hold-to-unlock feature when screen is locked
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  // Keep button within window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition((prev) =>
        clampPosition(
          prev,
          { width: rect.width || 160, height: rect.height || 48 },
          { width: window.innerWidth, height: window.innerHeight },
          16
        )
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag handling (unified for mouse & touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Capture pointer so moving fast doesn't lose the drag
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    hasMovedSignificantlyRef.current = false;
    setIsDragging(true);

    // If locked, also start the safety hold-to-unlock timer in case this is a hold gesture
    if (isLocked) {
      startHoldToUnlock();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Check if moved more than 6px
    if (Math.hypot(deltaX, deltaY) > 6) {
      hasMovedSignificantlyRef.current = true;
      // If user moved significantly, cancel hold-to-unlock because they are repositioning it!
      cancelHoldToUnlock();
    }

    const newX = dragStartRef.current.startPosX + deltaX;
    const newY = dragStartRef.current.startPosY + deltaY;

    const btnWidth = buttonRef.current?.offsetWidth || 160;
    const btnHeight = buttonRef.current?.offsetHeight || 48;

    const clamped = clampPosition(
      { x: newX, y: newY },
      { width: btnWidth, height: btnHeight },
      { width: window.innerWidth, height: window.innerHeight },
      8
    );

    setPosition(clamped);
  };

  const justDraggedRef = useRef(false);

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    if (hasMovedSignificantlyRef.current) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 150);
    }

    dragStartRef.current = null;
    setIsDragging(false);

    if (isLocked) {
      cancelHoldToUnlock();
    }
  };

  // Hold-to-unlock mechanism when locked
  const startHoldToUnlock = () => {
    holdStartTimeRef.current = Date.now();
    const duration = 650; // ms

    const step = () => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      setHoldProgress(progress);

      if (progress < 1) {
        holdTimerRef.current = window.requestAnimationFrame(step);
      } else {
        // Unlock triggered via hold!
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 200);
        onToggleLock();
        setHoldProgress(0);
      }
    };

    holdTimerRef.current = window.requestAnimationFrame(step);
  };

  const cancelHoldToUnlock = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  // Standard click handler for the button (fires on both mouse and tap)
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (justDraggedRef.current || hasMovedSignificantlyRef.current) {
      return;
    }
    onToggleLock();
  };

  return (
    <div
      ref={buttonRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'scale-105' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label="Floating lock controller"
    >
      {isLocked ? (
        /* LOCKED STATE: Clean, wordless floating button so it never covers or detracts from the work area */
        <div className="relative group">
          <button
            type="button"
            onClick={handleButtonClick}
            aria-label="Unlock screen"
            title="Tap or hold to unlock (Drag anywhere to move)"
            className="w-12 h-12 rounded-full font-medium shadow-2xl transition-all duration-200 bg-rose-600/95 hover:bg-rose-600 active:scale-95 text-white border-2 border-rose-300/90 backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-85 hover:opacity-100"
          >
            {/* SVG circular progress ring for hold-to-unlock */}
            <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="#ffffff"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="81.68"
                  strokeDashoffset={81.68 * (1 - holdProgress)}
                  strokeLinecap="round"
                />
              </svg>
              {holdProgress > 0.4 ? (
                <Unlock className="w-4 h-4 text-white absolute" />
              ) : (
                <Lock className="w-4 h-4 text-white absolute" />
              )}
            </div>
          </button>
        </div>
      ) : (
        /* UNLOCKED STATE: Inviting, clear, draggable action button */
        <div className="relative group">
          <button
            type="button"
            onClick={handleButtonClick}
            aria-label="Lock screen for tracing"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full font-semibold shadow-xl transition-all duration-200 bg-amber-500 hover:bg-amber-600 text-stone-950 border-2 border-amber-300 active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400/90 flex items-center justify-center shadow-inner">
              <Lock className="w-3.5 h-3.5 text-stone-900" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide uppercase leading-tight">
                Lock Screen to Trace
              </span>
              <span className="text-[10px] text-stone-800/80 flex items-center gap-1 font-normal">
                <Move className="w-2.5 h-2.5 opacity-70" /> Drag anywhere to move
              </span>
            </div>

            <span className="text-[11px] font-bold bg-stone-900 text-amber-300 px-2 py-0.5 rounded-full ml-1">
              LOCK
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
