/**
 * SVG filters for iOS liquid glass (supplied snippet, 2026-10-20). Render once at the app root; buttons
 * reference them with `filter: url(#btn-glass)`. Hidden; takes no space.
 */
import { GLASS_MAP } from './glassMap';

export function GlassFilters() {
  return (
    <svg style={{ display: 'none' }} aria-hidden="true">
      <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves={2} seed={92} result="noise" />
        <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
        <feDisplacementMap in="SourceGraphic" in2="blur" scale={77} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="btn-glass" primitiveUnits="objectBoundingBox">
        <feImage href={GLASS_MAP} x="0" y="0" width="1" height="1" result="map" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
        <feDisplacementMap in="blur" in2="map" scale={1} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
