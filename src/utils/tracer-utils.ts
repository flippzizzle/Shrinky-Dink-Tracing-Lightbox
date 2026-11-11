import { TransformState, FilterState, ButtonPosition, SampleImage } from '../types/tracer';

/**
 * Calculates the final baked dimensions for Shrinky Dinks plastic.
 * Typical shrink percentage is ~33% to 40% of original size (shrinks to ~1/3 size).
 */
export function calculateShrinkDimensions(
  width: number,
  height: number,
  shrinkPercent: number = 35
): {
  bakedWidth: number;
  bakedHeight: number;
  areaReductionPercent: number;
} {
  const factor = Math.max(0.1, Math.min(1.0, shrinkPercent / 100));
  const bakedWidth = Math.round(width * factor * 10) / 10;
  const bakedHeight = Math.round(height * factor * 10) / 10;
  const originalArea = width * height;
  const bakedArea = bakedWidth * bakedHeight;
  const areaReductionPercent = originalArea > 0 
    ? Math.round((1 - bakedArea / originalArea) * 100)
    : 0;

  return {
    bakedWidth,
    bakedHeight,
    areaReductionPercent,
  };
}

/**
 * Clamps floating lock/unlock button position within viewport bounds with safe padding.
 */
export function clampPosition(
  pos: ButtonPosition,
  buttonSize: { width: number; height: number },
  viewportSize: { width: number; height: number },
  padding: number = 16
): ButtonPosition {
  const minX = padding;
  const maxX = Math.max(padding, viewportSize.width - buttonSize.width - padding);
  const minY = padding;
  const maxY = Math.max(padding, viewportSize.height - buttonSize.height - padding);

  return {
    x: Math.max(minX, Math.min(maxX, pos.x)),
    y: Math.max(minY, Math.min(maxY, pos.y)),
  };
}

/**
 * Generates the CSS filter rule for the tracing image.
 */
export function getImageFilterCss(filters: FilterState): string {
  const parts: string[] = [];

  let brightnessVal = filters.brightness;
  let contrastVal = filters.contrast;

  if (filters.isTraceMode) {
    // High contrast black-and-white outline mode optimized for tracing
    parts.push('grayscale(100%)');
    contrastVal = Math.max(contrastVal, 220);
    brightnessVal = Math.max(brightnessVal, 110);
  } else if (filters.isGrayscale) {
    parts.push('grayscale(100%)');
  }

  if (filters.isInverted) {
    parts.push('invert(100%)');
  }

  parts.push(`brightness(${brightnessVal}%)`);
  parts.push(`contrast(${contrastVal}%)`);

  if (filters.opacity < 100) {
    parts.push(`opacity(${filters.opacity}%)`);
  }

  return parts.join(' ');
}

/**
 * Generates the CSS transform rule for pan, zoom, rotate, and mirror.
 */
export function getTransformCss(transform: TransformState): string {
  const scaleX = transform.isFlippedH ? -transform.scale : transform.scale;
  const scaleY = transform.isFlippedV ? -transform.scale : transform.scale;

  return `translate(${Math.round(transform.x)}px, ${Math.round(transform.y)}px) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY})`;
}

/**
 * Clamps scale/zoom factor safely.
 */
export function clampScale(scale: number, min: number = 0.1, max: number = 8): number {
  return Math.max(min, Math.min(max, Math.round(scale * 100) / 100));
}

// Built-in high quality SVG tracing samples for instant crafting test
export const SAMPLE_DESIGNS: SampleImage[] = [
  {
    id: 'kawaii-boba-cat',
    title: 'Kawaii Boba Cat Keychain',
    category: 'Cute / Animals',
    tag: 'Keychain Ready',
    description: 'Adorable kitten hugging a bubble tea cup with a pre-marked keychain hole guide.',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="400" height="450">
        <rect width="400" height="450" fill="white" />
        <!-- Keychain hole mark -->
        <circle cx="200" cy="35" r="14" fill="none" stroke="#222222" stroke-width="4" stroke-dasharray="4 2" />
        <circle cx="200" cy="35" r="6" fill="#ef4444" />
        <text x="200" y="20" font-family="sans-serif" font-size="11" font-weight="bold" fill="#666" text-anchor="middle">HOLE PUNCH HERE</text>
        
        <!-- Boba Cup -->
        <path d="M 120 180 L 140 380 Q 200 400 260 380 L 280 180 Z" fill="#fed7aa" stroke="#222222" stroke-width="6" stroke-linejoin="round" />
        <!-- Boba Straw -->
        <rect x="220" y="80" width="22" height="130" rx="6" transform="rotate(15 220 80)" fill="#f43f5e" stroke="#222222" stroke-width="5" />
        <!-- Boba Lid -->
        <ellipse cx="200" cy="180" rx="82" ry="16" fill="#fdba74" stroke="#222222" stroke-width="6" />
        <!-- Tapioca Pearls -->
        <circle cx="165" cy="350" r="14" fill="#3f3f46" stroke="#222222" stroke-width="3" />
        <circle cx="200" cy="360" r="15" fill="#3f3f46" stroke="#222222" stroke-width="3" />
        <circle cx="235" cy="350" r="14" fill="#3f3f46" stroke="#222222" stroke-width="3" />
        <circle cx="180" cy="325" r="13" fill="#3f3f46" stroke="#222222" stroke-width="3" />
        <circle cx="218" cy="325" r="14" fill="#3f3f46" stroke="#222222" stroke-width="3" />
        
        <!-- Kawaii Cat Head -->
        <path d="M 130 160 C 120 100 135 70 150 60 C 165 50 180 80 190 90 C 200 90 210 90 220 90 C 230 80 245 50 260 60 C 275 70 290 100 280 160 Z" fill="#ffffff" stroke="#222222" stroke-width="6" stroke-linejoin="round" />
        <!-- Inner Ears -->
        <polygon points="146,72 170,88 150,105" fill="#fda4af" />
        <polygon points="264,72 240,88 260,105" fill="#fda4af" />
        
        <!-- Eyes & Cheeks -->
        <ellipse cx="170" cy="125" rx="8" ry="11" fill="#222222" />
        <circle cx="168" cy="120" r="3" fill="#ffffff" />
        <ellipse cx="240" cy="125" rx="8" ry="11" fill="#222222" />
        <circle cx="238" cy="120" r="3" fill="#ffffff" />
        <!-- Blush -->
        <ellipse cx="152" cy="138" rx="10" ry="6" fill="#f43f5e" opacity="0.6" />
        <ellipse cx="258" cy="138" rx="10" ry="6" fill="#f43f5e" opacity="0.6" />
        <!-- Mouth -->
        <path d="M 195 135 Q 200 139 205 135 Q 210 139 215 135" fill="none" stroke="#222222" stroke-width="4" stroke-linecap="round" />
        
        <!-- Tiny Paws resting on cup -->
        <ellipse cx="150" cy="180" rx="16" ry="12" fill="#ffffff" stroke="#222222" stroke-width="5" />
        <ellipse cx="250" cy="180" rx="16" ry="12" fill="#ffffff" stroke="#222222" stroke-width="5" />
      </svg>
    `)}`,
  },
  {
    id: 'retro-motel-badge',
    title: 'Retro Motel Charm',
    category: 'Vintage / Badges',
    tag: 'Classic Charm',
    description: 'Iconic diamond motel room key tag with bold vintage typography and hole punch.',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500" width="350" height="500">
        <rect width="350" height="500" fill="white" />
        <!-- Outer Diamond Tag -->
        <path d="M 175 40 L 320 250 L 175 460 L 30 250 Z" fill="#0284c7" stroke="#0f172a" stroke-width="8" stroke-linejoin="round" />
        <!-- Inner Border Line -->
        <path d="M 175 65 L 295 250 L 175 435 L 55 250 Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
        
        <!-- Keyhole top -->
        <circle cx="175" cy="100" r="14" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="175" cy="100" r="6" fill="#ef4444" />
        
        <!-- Typography -->
        <text x="175" y="160" font-family="'Courier New', monospace" font-size="20" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="4">SUNSET</text>
        <text x="175" y="210" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">MOTEL</text>
        
        <!-- Star icon -->
        <path d="M 175 230 L 179 242 L 192 242 L 181 250 L 185 262 L 175 254 L 165 262 L 169 250 L 158 242 L 171 242 Z" fill="#fef08a" stroke="#0f172a" stroke-width="2" />
        
        <!-- Room Number -->
        <rect x="110" y="280" width="130" height="55" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <text x="175" y="322" font-family="sans-serif" font-size="36" font-weight="900" fill="#0284c7" text-anchor="middle">777</text>
        
        <text x="175" y="380" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e0f2fe" text-anchor="middle" letter-spacing="2">PLEASE RETURN KEY</text>
      </svg>
    `)}`,
  },
  {
    id: 'monarch-butterfly',
    title: 'Monarch Butterfly',
    category: 'Nature / Flora',
    tag: 'Detailed Trace',
    description: 'Crisp botanical butterfly outlines, ideal for tracing vibrant colored pencils on frosted plastic.',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 350" width="450" height="350">
        <rect width="450" height="350" fill="white" />
        <!-- Keychain hole indicator at antenna top -->
        <circle cx="225" cy="35" r="10" fill="none" stroke="#222" stroke-width="3" stroke-dasharray="3 3"/>
        <circle cx="225" cy="35" r="4" fill="#ef4444" />
        
        <!-- Left Forewing -->
        <path d="M 225 150 C 180 80 90 60 50 110 C 20 150 40 210 110 230 C 160 240 215 180 225 150 Z" fill="#fb923c" stroke="#18181b" stroke-width="6" />
        <!-- Left Hindwing -->
        <path d="M 220 180 C 160 210 110 260 130 300 C 160 330 220 270 225 210 Z" fill="#f97316" stroke="#18181b" stroke-width="6" />
        
        <!-- Right Forewing -->
        <path d="M 225 150 C 270 80 360 60 400 110 C 430 150 410 210 340 230 C 290 240 235 180 225 150 Z" fill="#fb923c" stroke="#18181b" stroke-width="6" />
        <!-- Right Hindwing -->
        <path d="M 230 180 C 290 210 340 260 320 300 C 290 330 230 270 225 210 Z" fill="#f97316" stroke="#18181b" stroke-width="6" />
        
        <!-- Wing Veins -->
        <path d="M 225 150 Q 150 130 90 120 M 225 150 Q 140 170 100 190 M 220 180 Q 170 240 160 280" fill="none" stroke="#18181b" stroke-width="4" />
        <path d="M 225 150 Q 300 130 360 120 M 225 150 Q 310 170 350 190 M 230 180 Q 280 240 290 280" fill="none" stroke="#18181b" stroke-width="4" />
        
        <!-- Butterfly Body -->
        <ellipse cx="225" cy="180" rx="8" ry="40" fill="#18181b" />
        <circle cx="225" cy="130" r="10" fill="#18181b" />
        <!-- Antennae -->
        <path d="M 225 125 Q 210 90 195 80 M 225 125 Q 240 90 255 80" fill="none" stroke="#18181b" stroke-width="3" stroke-linecap="round" />
        <circle cx="195" cy="80" r="3" fill="#18181b" />
        <circle cx="255" cy="80" r="3" fill="#18181b" />
      </svg>
    `)}`,
  },
  {
    id: 'pixel-game-heart',
    title: '8-Bit Gaming Heart',
    category: 'Retro Gaming',
    tag: 'Quick Trace',
    description: 'Pixel art retro gaming heart with highlight shine, perfect for first-time Shrinky Dinkers.',
    svgDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
        <rect width="320" height="320" fill="white" />
        <!-- Hole indicator -->
        <circle cx="160" cy="30" r="10" fill="none" stroke="#222" stroke-width="3" stroke-dasharray="3 3"/>
        <circle cx="160" cy="30" r="4" fill="#ef4444" />
        
        <g transform="translate(40, 50) scale(15)">
          <!-- Black outline pixels -->
          <rect x="2" y="1" width="4" height="1" fill="#18181b"/>
          <rect x="10" y="1" width="4" height="1" fill="#18181b"/>
          <rect x="1" y="2" width="1" height="4" fill="#18181b"/>
          <rect x="6" y="2" width="1" height="2" fill="#18181b"/>
          <rect x="9" y="2" width="1" height="2" fill="#18181b"/>
          <rect x="14" y="2" width="1" height="4" fill="#18181b"/>
          <rect x="7" y="3" width="2" height="2" fill="#18181b"/>
          <rect x="1" y="6" width="1" height="2" fill="#18181b"/>
          <rect x="14" y="6" width="1" height="2" fill="#18181b"/>
          <rect x="2" y="8" width="1" height="2" fill="#18181b"/>
          <rect x="13" y="8" width="1" height="2" fill="#18181b"/>
          <rect x="3" y="10" width="2" height="1" fill="#18181b"/>
          <rect x="11" y="10" width="2" height="1" fill="#18181b"/>
          <rect x="5" y="11" width="2" height="1" fill="#18181b"/>
          <rect x="9" y="11" width="2" height="1" fill="#18181b"/>
          <rect x="7" y="12" width="2" height="1" fill="#18181b"/>
          
          <!-- Red fill -->
          <rect x="2" y="2" width="4" height="6" fill="#ef4444"/>
          <rect x="10" y="2" width="4" height="6" fill="#ef4444"/>
          <rect x="6" y="4" width="4" height="4" fill="#ef4444"/>
          <rect x="3" y="8" width="10" height="2" fill="#ef4444"/>
          <rect x="5" y="10" width="6" height="1" fill="#ef4444"/>
          <rect x="7" y="11" width="2" height="1" fill="#ef4444"/>
          
          <!-- White shine -->
          <rect x="3" y="3" width="2" height="2" fill="#ffffff"/>
          <rect x="3" y="5" width="1" height="1" fill="#ffffff"/>
        </g>
      </svg>
    `)}`,
  }
];
