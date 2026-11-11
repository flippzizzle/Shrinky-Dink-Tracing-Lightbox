import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateShrinkDimensions,
  clampPosition,
  getImageFilterCss,
  getTransformCss,
  clampScale,
} from './tracer-utils';
import { FilterState, TransformState } from '../types/tracer';

test('calculateShrinkDimensions accurately scales down dimensions for shrinky dinks', () => {
  // Tracing size 100mm x 100mm at 35% shrink factor (typical standard Shrinky Dink sheet)
  const result = calculateShrinkDimensions(100, 100, 35);
  assert.equal(result.bakedWidth, 35);
  assert.equal(result.bakedHeight, 35);
  // Area reduction: 100x100 = 10000, 35x35 = 1225 -> (1 - 1225/10000) * 100 = 87.75 -> approx 88%
  assert.equal(result.areaReductionPercent, 88);
});

test('calculateShrinkDimensions handles rectangular aspect ratios and custom shrink factors', () => {
  const result = calculateShrinkDimensions(120, 80, 40);
  assert.equal(result.bakedWidth, 48);
  assert.equal(result.bakedHeight, 32);
  assert.equal(result.areaReductionPercent, 84);
});

test('clampPosition keeps the floating button inside viewport margins', () => {
  const buttonSize = { width: 140, height: 48 };
  const viewportSize = { width: 800, height: 600 };
  const padding = 16;

  // Negative coordinates should clamp to padding
  const clampedMin = clampPosition({ x: -50, y: -20 }, buttonSize, viewportSize, padding);
  assert.equal(clampedMin.x, 16);
  assert.equal(clampedMin.y, 16);

  // Overflowing coordinates should clamp to viewport - button - padding
  const clampedMax = clampPosition({ x: 9999, y: 9999 }, buttonSize, viewportSize, padding);
  assert.equal(clampedMax.x, 800 - 140 - 16); // 644
  assert.equal(clampedMax.y, 600 - 48 - 16);  // 536

  // Coordinate within boundaries should remain unchanged
  const valid = clampPosition({ x: 200, y: 300 }, buttonSize, viewportSize, padding);
  assert.equal(valid.x, 200);
  assert.equal(valid.y, 300);
});

test('getImageFilterCss returns correct CSS filter string for standard, trace mode, and inverted', () => {
  const normalFilters: FilterState = {
    brightness: 120,
    contrast: 110,
    isInverted: false,
    isGrayscale: false,
    isTraceMode: false,
    opacity: 90,
  };
  const css = getImageFilterCss(normalFilters);
  assert.ok(css.includes('brightness(120%)'));
  assert.ok(css.includes('contrast(110%)'));
  assert.ok(css.includes('opacity(90%)'));
  assert.ok(!css.includes('invert'));
  assert.ok(!css.includes('grayscale'));

  // Trace mode should enforce grayscale and high contrast outline enhancement
  const traceFilters: FilterState = {
    ...normalFilters,
    isTraceMode: true,
  };
  const traceCss = getImageFilterCss(traceFilters);
  assert.ok(traceCss.includes('grayscale(100%)'));
  assert.ok(traceCss.includes('contrast(220%)'));

  // Inverted mode
  const invertFilters: FilterState = {
    ...normalFilters,
    isInverted: true,
  };
  const invertCss = getImageFilterCss(invertFilters);
  assert.ok(invertCss.includes('invert(100%)'));
});

test('getTransformCss correctly handles horizontal/vertical flip and rotation', () => {
  const transform: TransformState = {
    x: 50,
    y: 100,
    scale: 1.5,
    rotation: 90,
    isFlippedH: true,
    isFlippedV: false,
  };
  const transformStr = getTransformCss(transform);
  assert.ok(transformStr.includes('translate(50px, 100px)'));
  assert.ok(transformStr.includes('rotate(90deg)'));
  // Flipped horizontally: scaleX is -1.5, scaleY is 1.5
  assert.ok(transformStr.includes('scale(-1.5, 1.5)'));
});

test('clampScale keeps scale in reasonable zoom limits', () => {
  assert.equal(clampScale(0.01), 0.1);
  assert.equal(clampScale(20), 8);
  assert.equal(clampScale(2.3456), 2.35);
});
