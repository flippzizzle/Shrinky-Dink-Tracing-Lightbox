import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { SAMPLE_DESIGNS } from '../utils/tracer-utils';
import { SampleImage } from '../types/tracer';

interface SampleDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleImage) => void;
}

export const SampleDesignsModal: React.FC<SampleDesignsModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-black tracking-tight">Ready-to-Trace Sample Designs</h2>
              <p className="text-xs text-stone-400">
                Choose a pre-made design with keychain hole guides to test tracing right away!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 transition-colors text-stone-300 hover:text-white"
            aria-label="Close sample gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_DESIGNS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group cursor-pointer rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-white p-4 transition-all duration-200 hover:shadow-xl flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  {sample.tag}
                </span>
              </div>

              {/* Thumbnail preview */}
              <div className="w-36 h-36 bg-stone-50 rounded-xl flex items-center justify-center p-2 mb-3 border border-stone-100 group-hover:scale-105 transition-transform duration-200">
                <img
                  src={sample.svgDataUri}
                  alt={sample.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="font-bold text-stone-900 text-sm mb-1 group-hover:text-amber-600 transition-colors">
                {sample.title}
              </h3>
              <p className="text-xs text-stone-500 leading-snug mb-3">
                {sample.description}
              </p>

              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-stone-100 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Select & Trace
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-500">
            Tip: You can also upload any image from your phone or computer anytime with the <strong>Upload Photo</strong> button.
          </p>
        </div>
      </div>
    </div>
  );
};
