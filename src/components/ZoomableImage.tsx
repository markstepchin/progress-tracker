"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Configuration constants for zoom, brightness, and contrast controls.
 * Adjust these to change the behavior of the component.
 */
const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const BRIGHTNESS_MIN = 0.5;
const BRIGHTNESS_MAX = 1.5;
const BRIGHTNESS_STEP = 0.1;
const CONTRAST_MIN = 0.5;
const CONTRAST_MAX = 1.5;
const CONTRAST_STEP = 0.1;

interface ZoomableImageProps {
  /** The image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Label displayed in the bottom-left corner (e.g., date or name) */
  label: string;
  /** Optional secondary info shown after the label (e.g., weight) */
  secondaryLabel?: string;
  /** Controlled zoom value (1 = 100%) */
  zoom?: number;
  /** Controlled brightness value (1 = 100%) */
  brightness?: number;
  /** Controlled contrast value (1 = 100%) */
  contrast?: number;
  /** Callback when zoom changes (for controlled mode) */
  onZoomChange?: (value: number | null) => void;
  /** Callback when brightness changes (for controlled mode) */
  onBrightnessChange?: (value: number | null) => void;
  /** Callback when contrast changes (for controlled mode) */
  onContrastChange?: (value: number | null) => void;
  /** Controlled visibility of controls (when provided, hides internal toggle) */
  showControls?: boolean;
}

/**
 * Checks if a URL is from Uploadcare (utfs.io or ufs.sh).
 * These URLs require using a regular <img> tag instead of Next.js Image.
 */
function isUploadcareUrl(src: string) {
  return src && (src.includes("utfs.io") || src.includes("ufs.sh"));
}

/**
 * ZoomableImage - A reusable image component with zoom, brightness, contrast, grid, and pan controls.
 * 
 * ## Features:
 * - Zoom in/out via buttons or mouse wheel (50% - 300%)
 * - Brightness adjustment via slider (50% - 150%)
 * - Contrast adjustment via slider (50% - 150%)
 * - Grid overlay toggle (rule-of-thirds for alignment)
 * - Click-and-drag to pan when zoomed in
 * - All controls are view-only (no image source modification)
 * 
 * ## DOM Structure Requirements:
 * 
 * ```
 * <OuterContainer>           - relative, flex-1, min-w-0: Takes up available space in parent flex container
 *   <ClipContainer>          - absolute inset-0, overflow-hidden: Fixed size, clips zoomed content
 *     <TransformContainer>   - h-full w-full, transform/filter styles: Scales and moves, gets clipped
 *       <Image />            - The actual image element
 *     </TransformContainer>
 *   </ClipContainer>
 *   <Controls />             - absolute positioned, z-10: Floats above image, not affected by zoom
 *   <Label />                - absolute positioned: Shows label, not affected by zoom
 * </OuterContainer>
 * ```
 * 
 * Key points:
 * - ClipContainer MUST have overflow-hidden and be separate from TransformContainer
 * - TransformContainer applies scale() and translate() - these would affect overflow bounds if on same element
 * - Controls and Label are outside ClipContainer so they don't scale/move with the image
 */
export function ZoomableImage({
  src,
  alt,
  label,
  secondaryLabel,
  zoom: controlledZoom,
  brightness: controlledBrightness,
  contrast: controlledContrast,
  onZoomChange,
  onBrightnessChange,
  onContrastChange,
  showControls = true,
}: ZoomableImageProps) {
  // Internal state for uncontrolled mode
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalBrightness, setInternalBrightness] = useState(1);
  const [internalContrast, setInternalContrast] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled values if provided, otherwise use internal state
  const isControlled = controlledZoom !== undefined;
  const zoom = controlledZoom ?? internalZoom;
  const brightness = controlledBrightness ?? internalBrightness;
  const contrast = controlledContrast ?? internalContrast;

  // Setters that work in both controlled and uncontrolled mode
  const setZoom = useCallback(
    (value: number | ((prev: number) => number)) => {
      const newValue = typeof value === "function" ? value(zoom) : value;
      if (onZoomChange) {
        onZoomChange(newValue === 1 ? null : newValue);
      } else {
        setInternalZoom(newValue);
      }
    },
    [zoom, onZoomChange],
  );

  const setBrightness = useCallback(
    (value: number | ((prev: number) => number)) => {
      const newValue = typeof value === "function" ? value(brightness) : value;
      if (onBrightnessChange) {
        onBrightnessChange(newValue === 1 ? null : newValue);
      } else {
        setInternalBrightness(newValue);
      }
    },
    [brightness, onBrightnessChange],
  );

  const setContrast = useCallback(
    (value: number | ((prev: number) => number)) => {
      const newValue = typeof value === "function" ? value(contrast) : value;
      if (onContrastChange) {
        onContrastChange(newValue === 1 ? null : newValue);
      } else {
        setInternalContrast(newValue);
      }
    },
    [contrast, onContrastChange],
  );

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Calculate max pan distance based on zoom level.
  // At zoom 1, pan should be 0. At higher zoom, allow panning up to the extra area.
  const getMaxPan = useCallback(() => {
    if (!containerRef.current || zoom <= 1) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const maxPanX = (rect.width * (zoom - 1)) / 2;
    const maxPanY = (rect.height * (zoom - 1)) / 2;
    return { x: maxPanX, y: maxPanY };
  }, [zoom]);

  // Clamp pan values to valid range
  const clampPan = useCallback(
    (newPan: { x: number; y: number }) => {
      const max = getMaxPan();
      return {
        x: Math.max(-max.x, Math.min(max.x, newPan.x)),
        y: Math.max(-max.y, Math.min(max.y, newPan.y)),
      };
    },
    [getMaxPan]
  );

  // When zoom changes, clamp pan to new valid range
  useEffect(() => {
    setPan((prev) => clampPan(prev));
  }, [zoom, clampPan]);

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)));
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  // Handle drag move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan(
        clampPan({
          x: dragStartRef.current.panX + dx,
          y: dragStartRef.current.panY + dy,
        })
      );
    },
    [isDragging, clampPan]
  );

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleReset = () => {
    if (onZoomChange) {
      onZoomChange(null);
    } else {
      setInternalZoom(1);
    }
    setPan({ x: 0, y: 0 });
  };

  const isModified = zoom !== 1 || brightness !== 1 || contrast !== 1;
  const canPan = zoom > 1;

  return (
    /**
     * OuterContainer: The root element that participates in flex layout.
     * - relative: Establishes positioning context for absolutely positioned children
     * - flex-1 min-w-0: Takes available space in parent flex container, can shrink below content size
     */
    <div
      ref={containerRef}
      className="relative flex-1 min-w-0"
      onWheel={handleWheel}
    >
      {/**
       * ClipContainer: Creates a fixed-size viewport that clips zoomed/panned content.
       * - absolute inset-0: Fills the OuterContainer exactly
       * - overflow-hidden: CRITICAL - clips the TransformContainer when it scales beyond bounds
       * 
       * This MUST be a separate element from TransformContainer because:
       * - CSS transforms create a new stacking context and affect how overflow is calculated
       * - If overflow-hidden and transform are on the same element, the clipping happens
       *   before the transform is applied, so zoomed content won't be clipped properly
       */}
      <div className="absolute inset-0 overflow-hidden">
        {/**
         * TransformContainer: Applies zoom (scale) and pan (translate) transforms.
         * - h-full w-full: Fills the ClipContainer at 100% (before transforms)
         * - transform: scale() for zoom, translate() for pan
         * - filter: brightness() and contrast() for image adjustments
         * - cursor changes based on whether panning is available/active
         * 
         * The transform-origin is "center center" so zooming scales from the middle.
         * Pan translation moves the scaled content within the clipped viewport.
         */}
        <div
          className={`h-full w-full ${canPan ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            filter: `brightness(${brightness}) contrast(${contrast})`,
            transformOrigin: "center center",
          }}
          onMouseDown={handleMouseDown}
        >
          {/**
           * Image: The actual image element.
           * - Uses regular <img> for Uploadcare URLs (they don't work with Next.js Image optimization)
           * - Uses Next.js <Image> for other URLs (better optimization, lazy loading)
           * - object-contain: Scales image to fit while maintaining aspect ratio
           */}
          {src && isUploadcareUrl(src) ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-contain pointer-events-none"
              draggable={false}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain pointer-events-none"
              sizes="50vw"
              priority
              draggable={false}
            />
          )}
        </div>
      </div>

      {/**
       * Grid Overlay: Rule-of-thirds grid for alignment assistance.
       * - Only shown when showGrid is true
       * - Uses CSS linear-gradient to draw grid lines
       * - Positioned over the image but doesn't zoom/pan with it
       * - pointer-events-none so it doesn't interfere with dragging
       */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(180, 180, 180, 0.6) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(180, 180, 180, 0.6) 1px, transparent 1px)
            `,
            backgroundSize: "33.333% 33.333%",
            backgroundPosition: "center center",
          }}
        />
      )}

      {/**
       * Controls: Zoom and brightness controls positioned in the top-right corner.
       * - absolute top-1 right-1: Positions in corner of OuterContainer
       * - z-10: Ensures controls float above the image
       * - These are OUTSIDE the ClipContainer so they don't zoom/pan with the image
       */}
      <div className="absolute top-1 right-1 z-10 flex flex-col gap-1">
        {showControls && (
          <>
            {/* Zoom controls: minus, percentage display, plus, and reset (when zoomed) */}
            <div className="flex items-center gap-0.5 rounded-lg bg-black/60 px-1.5 py-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                aria-label="Zoom out"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="min-w-10 text-center text-xs text-white/90">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                aria-label="Zoom in"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              {zoom !== 1 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-0.5 rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                  aria-label="Reset zoom and position"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {/* Brightness control: sun icon and slider */}
            <div className="flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-1 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <input
                type="range"
                min={BRIGHTNESS_MIN}
                max={BRIGHTNESS_MAX}
                step={BRIGHTNESS_STEP}
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
                aria-label="Brightness"
              />
              {brightness !== 1 && (
                <button
                  type="button"
                  onClick={() => setBrightness(1)}
                  className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                  aria-label="Reset brightness"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {/* Contrast control: half-circle icon and slider */}
            <div className="flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-1 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" fill="currentColor" />
              </svg>
              <input
                type="range"
                min={CONTRAST_MIN}
                max={CONTRAST_MAX}
                step={CONTRAST_STEP}
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
                aria-label="Contrast"
              />
              {contrast !== 1 && (
                <button
                  type="button"
                  onClick={() => setContrast(1)}
                  className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                  aria-label="Reset contrast"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {/* Grid toggle: shows/hides rule-of-thirds grid overlay */}
            <button
              type="button"
              onClick={() => setShowGrid((g) => !g)}
              className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 backdrop-blur-sm transition-colors ${
                showGrid ? "bg-white/30 text-white" : "bg-black/60 text-white/80 hover:bg-white/20 hover:text-white"
              }`}
              aria-label={showGrid ? "Hide grid" : "Show grid"}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9.333h16M4 14.667h16M9.333 4v16M14.667 4v16" />
              </svg>
              <span className="text-xs">Grid</span>
            </button>

            {/* Pan hint - shown when zoomed to indicate dragging is available */}
            {canPan && !isDragging && (
              <div className="rounded-lg bg-black/60 px-1.5 py-1 text-center text-xs text-white/70 backdrop-blur-sm">
                Drag to pan
              </div>
            )}
          </>
        )}
      </div>

      {/**
       * Label: Information label in the bottom-left corner.
       * - absolute bottom-1 left-1: Positioned in corner of OuterContainer
       * - Outside ClipContainer so it doesn't zoom/pan with the image
       */}
      <span className="absolute bottom-1 left-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {label}
        {secondaryLabel != null &&
          secondaryLabel !== "" &&
          secondaryLabel !== "—" && <> · {secondaryLabel}</>}
      </span>
    </div>
  );
}
