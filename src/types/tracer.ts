export interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isFlippedH: boolean;
  isFlippedV: boolean;
}

export interface FilterState {
  brightness: number; // 50 to 200, default 100
  contrast: number; // 50 to 250, default 100
  isInverted: boolean;
  isGrayscale: boolean;
  isTraceMode: boolean; // High contrast outline filter for tracing
  opacity: number; // 10 to 100, default 100
}

export interface ButtonPosition {
  x: number;
  y: number;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  tag: string;
  svgDataUri: string;
  description: string;
}
