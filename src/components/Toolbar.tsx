import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FlipHorizontal,
  RotateCw,
  Sliders,
  Maximize2,
  Grid,
  Calculator,
  RefreshCw,
  Sun,
  PenTool,
  ChevronDown,
  ChevronUp,
  Eye,
  Minimize2,
} from 'lucide-react';
import { FilterState, TransformState } from '../types/tracer';

interface ToolbarProps {
  imageSrc: string | null;
  transform: TransformState;
  filters: FilterState;
  showGrid: boolean;
  backgroundTheme: 'white' | 'warm-white' | 'black';
  isFullscreen: boolean;
  onUploadClick: () => void;
  onOpenSamples: () => void;
  onOpenCalculator: () => void;
  onToggleGrid: () => void;
  onToggleFullscreen: () => void;
  onResetTransform: () => void;
  onRotate90: () => void;
  onFlipHorizontal: () => void;
  onToggleTraceMode: () => void;
  onUpdateFilters: (updater: (prev: FilterState) => FilterState) => void;
  onChangeTheme: (theme: 'white' | 'warm-white' | 'black') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  imageSrc,
  transform,
  filters,
  showGrid,
  backgroundTheme,
  isFullscreen,
  onUploadClick,
  onOpenSamples,
  onOpenCalculator,
  onToggleGrid,
  onToggleFullscreen,
  onResetTransform,
  onRotate90,
  onFlipHorizontal,
  onToggleTraceMode,
  onUpdateFilters,
  onChangeTheme,
}) => {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94vw] sm:w-auto flex flex-col items-center pointer-events-auto">
      {/* Adjustments popover panel */}
      {isAdjustOpen && (
        <div className="mb-2 p-4 bg-stone-900/95 text-white backdrop-blur-xl border border-stone-700/80 rounded-2xl shadow-2xl w-full sm:w-80 transition-all text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800">
            <span className="font-bold flex items-center gap-1.5 text-stone-200">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Trace Image Adjustments
            </span>
            <button
              type="button"
              onClick={() => setIsAdjustOpen(false)}
              className="text-stone-400 hover:text-white px-1.5 py-0.5 rounded text-[10px] bg-stone-800"
            >
              Done
            </button>
          </div>

          <div className="space-y-3">
            {/* Brightness */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-300">Image Brightness</span>
                <span className="font-mono text-amber-400">{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={filters.brightness}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                }
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-300">Contrast</span>
                <span className="font-mono text-amber-400">{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={filters.contrast}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                }
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-stone-300">Image Opacity</span>
                <span className="font-mono text-amber-400">{filters.opacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={filters.opacity}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                }
                className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => onUpdateFilters((prev) => ({ ...prev, isInverted: !prev.isInverted }))}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                  filters.isInverted
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                {filters.isInverted ? '✓ Inverted (Dark)' : 'Invert Colors'}
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters((prev) => ({ ...prev, isGrayscale: !prev.isGrayscale }))}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                  filters.isGrayscale
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
              >
                {filters.isGrayscale ? '✓ Grayscale' : 'Grayscale'}
              </button>
            </div>

            {/* Lightbox background tone */}
            <div className="pt-2 border-t border-stone-800">
              <span className="text-stone-400 block mb-1.5 text-[10px] uppercase tracking-wider font-semibold">
                Lightbox Background
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeTheme('white')}
                  className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                    backgroundTheme === 'white'
                      ? 'bg-white text-stone-900 border-white'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  Pure White
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('warm-white')}
                  className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                    backgroundTheme === 'warm-white'
                      ? 'bg-[#fffdf7] text-stone-900 border-amber-200'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  Warm White
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('black')}
                  className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                    backgroundTheme === 'black'
                      ? 'bg-stone-950 text-amber-300 border-amber-500/50'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  Black Light
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="bg-stone-900/90 hover:bg-stone-900 text-white backdrop-blur-xl border border-stone-700/80 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-2xl flex items-center gap-1 sm:gap-2 transition-all max-w-[96vw] overflow-x-auto scrollbar-none">
        {/* Upload button */}
        <button
          type="button"
          onClick={onUploadClick}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow transition-all active:scale-95"
          title="Upload your photo"
          aria-label="Upload photo"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        {/* Pick Sample */}
        <button
          type="button"
          onClick={onOpenSamples}
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all active:scale-95"
          title="Sample designs to trace"
          aria-label="Sample designs"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Samples</span>
        </button>

        <div className="w-px h-5 bg-stone-700 my-auto mx-0.5 flex-shrink-0" />

        {/* Flip Horizontal (Mirror for shrinky dinks) */}
        <button
          type="button"
          onClick={onFlipHorizontal}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            transform.isFlippedH
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
          title="Flip Horizontal (Mirror image for frosted shrinky dink side)"
          aria-label="Flip horizontal mirror"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Mirror</span>
        </button>

        {/* Rotate 90 */}
        <button
          type="button"
          onClick={onRotate90}
          className="flex-shrink-0 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1 transition-all"
          title="Rotate 90° clockwise"
          aria-label="Rotate 90 degrees"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Rotate</span>
        </button>

        {/* Trace Mode Outline Filter */}
        <button
          type="button"
          onClick={onToggleTraceMode}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            filters.isTraceMode
              ? 'bg-amber-500 text-stone-950 font-bold shadow'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
          title="Enhance black & white outlines for easier tracing"
          aria-label="Toggle trace outline mode"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trace Mode</span>
        </button>

        {/* Adjustments popover toggle */}
        <button
          type="button"
          onClick={() => setIsAdjustOpen(!isAdjustOpen)}
          className={`flex-shrink-0 p-2 rounded-xl text-xs font-medium transition-all ${
            isAdjustOpen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
          }`}
          title="Adjust brightness, contrast & filters"
          aria-label="Adjust image filters"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-stone-700 my-auto mx-0.5 flex-shrink-0" />

        {/* Shrink Size Calculator */}
        <button
          type="button"
          onClick={onOpenCalculator}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
          title="Shrinky Dink Baked Size Preview & Tips"
          aria-label="Open shrink size calculator"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Shrink Size</span>
        </button>

        {/* Grid toggle */}
        <button
          type="button"
          onClick={onToggleGrid}
          className={`flex-shrink-0 p-2 rounded-xl text-xs font-medium transition-all ${
            showGrid
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
          }`}
          title="Toggle alignment grid"
          aria-label="Toggle grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Reset View */}
        <button
          type="button"
          onClick={onResetTransform}
          className="flex-shrink-0 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-all"
          title="Reset zoom & center position"
          aria-label="Reset zoom and center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex-shrink-0 p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating tip for user */}
      <div className="mt-1.5 text-[11px] text-stone-600 font-medium bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-full border border-stone-200/60 shadow-sm flex items-center gap-1.5">
        <span>💡 Drag & pinch to position • Hit <strong>Lock</strong> to freeze & trace</span>
      </div>
    </div>
  );
};
