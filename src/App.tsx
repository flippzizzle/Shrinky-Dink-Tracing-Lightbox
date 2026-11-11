/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TracingCanvas } from './components/TracingCanvas';
import { FloatingLockButton } from './components/FloatingLockButton';
import { Toolbar } from './components/Toolbar';
import { ShrinkCalculatorModal } from './components/ShrinkCalculatorModal';
import { SampleDesignsModal } from './components/SampleDesignsModal';
import { TransformState, FilterState, SampleImage } from './types/tracer';
import { SAMPLE_DESIGNS } from './utils/tracer-utils';
import { Sun, Check, AlertTriangle } from 'lucide-react';

export default function App() {
  // Image source state (default to cute sample so app is never an empty void)
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_DESIGNS[0].svgDataUri);

  // Lock state
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  // Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);

  // Grid & Lightbox Theme
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [backgroundTheme, setBackgroundTheme] = useState<'white' | 'warm-white' | 'black'>('white');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform state (pan, zoom, rotation, mirror)
  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    isFlippedH: false,
    isFlippedV: false,
  });

  // Filter state (brightness, contrast, trace mode)
  const [filters, setFilters] = useState<FilterState>({
    brightness: 110,
    contrast: 120,
    isInverted: false,
    isGrayscale: false,
    isTraceMode: false,
    opacity: 100,
  });

  const showToast = useCallback((msg: string, duration = 3500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  }, []);

  // Screen Wake Lock API management
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        const sentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinelRef.current = sentinel;
        setIsWakeLockActive(true);

        sentinel.addEventListener('release', () => {
          setIsWakeLockActive(false);
          wakeLockSentinelRef.current = null;
        });
      }
    } catch {
      // Wake Lock might be denied or unsupported
      setIsWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch {
        // Ignore
      }
      wakeLockSentinelRef.current = null;
      setIsWakeLockActive(false);
    }
  }, []);

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not permitted in iframe or denied
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Lock / Unlock toggle
  const handleToggleLock = useCallback(() => {
    setIsLocked((prevLocked) => {
      const nextLocked = !prevLocked;

      if (nextLocked) {
        // Request wake lock so screen does not dim or sleep during tracing
        requestWakeLock();

        // Attempt fullscreen to hide browser chrome & maximize bright light
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }

        // Clear any toast so tracing canvas has zero text obstructing the artwork
        setToastMessage(null);
      } else {
        releaseWakeLock();
        showToast('Screen unlocked! You can now adjust, pan, or change photos.');
      }

      return nextLocked;
    });
  }, [requestWakeLock, releaseWakeLock, showToast]);

  // Handle uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
    // Reset input so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageSrc(event.target.result);
        // Reset transform to center
        setTransform({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          isFlippedH: false,
          isFlippedV: false,
        });
        showToast('Photo uploaded! Position, zoom, or mirror it before locking.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop photo anywhere
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (isLocked) return;
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        loadFile(file);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (isLocked) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            loadFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isLocked]);

  // Transform actions
  const handleRotate90 = () => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleFlipHorizontal = () => {
    setTransform((prev) => ({
      ...prev,
      isFlippedH: !prev.isFlippedH,
    }));
    showToast(!transform.isFlippedH ? 'Mirrored for frosted plastic tracing' : 'Original orientation restored');
  };

  const handleToggleTraceMode = () => {
    setFilters((prev) => {
      const next = !prev.isTraceMode;
      showToast(next ? 'Trace Outline Mode ON: Outlines boosted' : 'Color Mode restored');
      return { ...prev, isTraceMode: next };
    });
  };

  const handleResetTransform = () => {
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      isFlippedH: false,
      isFlippedV: false,
    });
    showToast('Reset to original center position and zoom');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans bg-white">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload photo file"
      />

      {/* Main Tracing Canvas and Lightbox */}
      <TracingCanvas
        imageSrc={imageSrc}
        transform={transform}
        filters={filters}
        isLocked={isLocked}
        onUpdateTransform={setTransform}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenSamples={() => setIsSamplesOpen(true)}
        showGrid={showGrid}
        backgroundTheme={backgroundTheme}
      />

      {/* Floating Draggable Lock/Unlock Button (Always accessible & movable) */}
      <FloatingLockButton
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        isWakeLockActive={isWakeLockActive}
      />

      {/* Bottom Toolbar: visible only when unlocked so tracing area is completely clean */}
      {!isLocked && (
        <Toolbar
          imageSrc={imageSrc}
          transform={transform}
          filters={filters}
          showGrid={showGrid}
          backgroundTheme={backgroundTheme}
          isFullscreen={isFullscreen}
          onUploadClick={() => fileInputRef.current?.click()}
          onOpenSamples={() => setIsSamplesOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onToggleFullscreen={toggleFullscreen}
          onResetTransform={handleResetTransform}
          onRotate90={handleRotate90}
          onFlipHorizontal={handleFlipHorizontal}
          onToggleTraceMode={handleToggleTraceMode}
          onUpdateFilters={setFilters}
          onChangeTheme={setBackgroundTheme}
        />
      )}

      {/* Toast Alert Banner: only show when unlocked so artwork is never obstructed */}
      {toastMessage && !isLocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/90 text-white text-xs font-semibold shadow-2xl border border-stone-700 backdrop-blur-md animate-fade-in">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ShrinkCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <SampleDesignsModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={(sample: SampleImage) => {
          setImageSrc(sample.svgDataUri);
          setTransform({
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            isFlippedH: false,
            isFlippedV: false,
          });
          showToast(`Loaded ${sample.title}! Ready to trace.`);
        }}
      />
    </div>
  );
}
