import React, { useRef, useState, useCallback, useEffect } from 'react';
import { TransformState, FilterState } from '../types/tracer';
import { getImageFilterCss, getTransformCss, clampScale } from '../utils/tracer-utils';
import { Upload, Image as ImageIcon, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface TracingCanvasProps {
  imageSrc: string | null;
  transform: TransformState;
  filters: FilterState;
  isLocked: boolean;
  onUpdateTransform: (updater: (prev: TransformState) => TransformState) => void;
  onUploadClick: () => void;
  onOpenSamples: () => void;
  showGrid: boolean;
  backgroundTheme: 'white' | 'warm-white' | 'black';
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  imageSrc,
  transform,
  filters,
  isLocked,
  onUpdateTransform,
  onUploadClick,
  onOpenSamples,
  showGrid,
  backgroundTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  // Multi-touch pinch tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  // Background styling
  const getBgClass = () => {
    if (isLocked) {
      // Maximum high-intensity bright white light box illumination
      return 'bg-white';
    }
    switch (backgroundTheme) {
      case 'warm-white':
        return 'bg-[#fffdf7]';
      case 'black':
        return 'bg-[#09090b]';
      case 'white':
      default:
        return 'bg-[#f8fafc]';
    }
  };

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isLocked || !imageSrc) return;
      e.preventDefault();

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      onUpdateTransform((prev) => ({
        ...prev,
        scale: clampScale(prev.scale * zoomFactor),
      }));
    },
    [isLocked, imageSrc, onUpdateTransform]
  );

  // Touch and pointer pan/zoom
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked || !imageSrc) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: transform.x,
        startY: transform.y,
      };
      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } else if (activePointersRef.current.size === 2) {
      // 2 fingers: pinch zoom start
      const points = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      initialPinchDistRef.current = dist;
      initialScaleRef.current = transform.scale;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isLocked || !imageSrc) return;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointersRef.current.size === 2 && initialPinchDistRef.current) {
      // Pinch to zoom
      const points = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const ratio = currentDist / initialPinchDistRef.current;
      const newScale = clampScale(initialScaleRef.current * ratio);

      onUpdateTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    } else if (activePointersRef.current.size === 1 && panStartRef.current && isPanning) {
      // 1-finger or mouse drag
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;

      onUpdateTransform((prev) => ({
        ...prev,
        x: panStartRef.current!.startX + dx,
        y: panStartRef.current!.startY + dy,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      initialPinchDistRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  // Prevent browser context menu while tracing/touching
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Prevent default gesture zooming on iOS/Safari and touch scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventDefaultTouch = (e: TouchEvent) => {
      if (isLocked) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    return () => {
      el.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, [isLocked]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
      className={`relative w-full h-full min-h-screen overflow-hidden transition-colors duration-300 select-none ${getBgClass()} ${
        isLocked ? 'cursor-default' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        touchAction: 'none',
      }}
    >
      {/* Lightbox grid overlay (optional for sizing & alignment) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Center crosshair for precision positioning when unlocked */}
      {!isLocked && imageSrc && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
          <div className="w-12 h-px bg-stone-900" />
          <div className="h-12 w-px bg-stone-900 absolute" />
        </div>
      )}

      {/* Main Image Layer */}
      {imageSrc ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={imageSrc}
            alt="Tracing target"
            draggable={false}
            style={{
              transform: getTransformCss(transform),
              filter: getImageFilterCss(filters),
              transformOrigin: 'center center',
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              willChange: 'transform, filter',
            }}
            className="transition-none user-select-none"
          />
        </div>
      ) : (
        /* Empty state: Clean, high-contrast onboarding for uploading a photo */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-auto">
          <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-stone-200/80">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-stone-900 mb-2">
              Shrinky Dinks Lightbox & Tracer
            </h1>

            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Upload any photo, size it to your shrinky dink sheet, then hit{' '}
              <strong className="text-stone-900 font-bold">Lock Screen</strong> to turn your device into an immovable, high-brightness tracing light table!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                onClick={onUploadClick}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>

              <button
                type="button"
                onClick={onOpenSamples}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold border border-stone-300 transition-all active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-amber-600" />
                Pick Sample
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-left pt-4 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex flex-col">
                <span className="font-semibold text-stone-700">1. Position & Flip</span>
                <span>Mirror for frosted plastic</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-700">2. Lock Screen</span>
                <span>Max brightness & freeze</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-700">3. Trace & Bake</span>
                <span>Shrinks to ~1/3 size!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Absolute Lock Shield Overlay: when locked, catches and cancels any accidental tap or swipe */}
      {isLocked && (
        <div
          className="absolute inset-0 z-40 bg-transparent"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
