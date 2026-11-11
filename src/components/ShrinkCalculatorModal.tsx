import React, { useState } from 'react';
import { X, Sparkles, Flame, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { calculateShrinkDimensions } from '../utils/tracer-utils';

interface ShrinkCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShrinkCalculatorModal: React.FC<ShrinkCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [width, setWidth] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(3.5);
  const [shrinkPercent, setShrinkPercent] = useState<number>(35);

  if (!isOpen) return null;

  const { bakedWidth, bakedHeight, areaReductionPercent } = calculateShrinkDimensions(
    width,
    height,
    shrinkPercent
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-stone-950" />
            <h2 className="text-lg font-black tracking-tight">Shrinky Dinks Size Calculator</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-stone-900"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800">
          {/* Controls */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Measurement Unit
              </span>
              <div className="flex rounded-lg p-0.5 bg-stone-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setUnit('inches');
                    setWidth(3.5);
                    setHeight(3.5);
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    unit === 'inches' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUnit('cm');
                    setWidth(9);
                    setHeight(9);
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    unit === 'cm' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Traced Width ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={width}
                  onChange={(e) => setWidth(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Traced Height ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={height}
                  onChange={(e) => setHeight(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Shrink rate slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-stone-600">Plastic Shrink Rate</span>
                <span className="font-bold text-amber-700">{shrinkPercent}% of original size (approx 1/3)</span>
              </div>
              <input
                type="range"
                min="25"
                max="50"
                value={shrinkPercent}
                onChange={(e) => setShrinkPercent(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>25% (Extreme shrink)</span>
                <span>35% (Standard brand default)</span>
                <span>50% (Mild shrink)</span>
              </div>
            </div>
          </div>

          {/* Visual Size Comparison Box */}
          <div className="border border-stone-200 rounded-2xl p-5 bg-gradient-to-b from-stone-50 to-white flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Traced Size Card */}
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                1. Traced On Screen
              </span>
              <div
                className="w-28 h-28 border-2 border-dashed border-stone-400 bg-amber-50/70 rounded-xl flex items-center justify-center text-center p-2 relative shadow-inner"
              >
                <div className="text-xs font-bold text-stone-700">
                  {width} × {height} {unit}
                </div>
                <div className="absolute top-2 right-2 text-[9px] text-stone-400 font-mono">100%</div>
              </div>
              <span className="text-[11px] text-stone-500 mt-2 font-medium">Sheet drawing size</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[11px] font-bold text-orange-600 mt-1">Bake at 325°F</span>
              <ArrowRight className="w-4 h-4 text-stone-400 mt-1 hidden sm:block" />
            </div>

            {/* Baked Final Miniature Card */}
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                2. Final Baked Charm
              </span>
              <div
                className="w-16 h-16 border-2 border-amber-600 bg-amber-500 rounded-xl flex items-center justify-center text-center p-2 shadow-lg relative transform hover:scale-105 transition-transform"
              >
                <div className="text-[11px] font-black text-stone-950 leading-tight">
                  {bakedWidth} × {bakedHeight} <br />
                  <span className="text-[9px] font-bold">{unit}</span>
                </div>
                <div className="absolute -top-2 -right-2 bg-stone-900 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow">
                  7x THICK!
                </div>
              </div>
              <span className="text-[11px] text-stone-800 mt-2 font-bold">
                {areaReductionPercent}% smaller & thick hard plastic!
              </span>
            </div>
          </div>

          {/* Quick Crafting Tips */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Shrinky Dinks Crafting Pro-Tips
            </h4>
            <ul className="space-y-1.5 text-amber-900/90 leading-relaxed list-disc list-inside">
              <li>
                <strong>Punch Holes BEFORE Baking:</strong> A standard hole punch (1/4" or 6mm) will shrink down to ~2mm, perfectly sized for keychain jump rings and earring hooks!
              </li>
              <li>
                <strong>Frosted vs Smooth Side:</strong> Use colored pencils on the rough/frosted side. Use Sharpies or Posca markers on either side.
              </li>
              <li>
                <strong>Mirror Text & Asymmetric Art:</strong> Hit the <strong>Mirror (Flip H)</strong> button on the toolbar so your text faces the right direction once flipped after baking!
              </li>
              <li>
                <strong>Don't Panic While Baking:</strong> The plastic will curl up dramatically like a taco at first. It will flatten completely flat within 2 to 3 minutes.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
