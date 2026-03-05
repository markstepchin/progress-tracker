"use client";

import { useEffect, useCallback, useState } from "react";
import { ZoomableImage } from "./ZoomableImage";
import type { ImageSettings, ImageSettingsSetters } from "./CompareView";

export interface CompareSlide {
  label: string;
  leftSrc: string;
  rightSrc: string;
}

interface ComparePhotoModalProps {
  slides: CompareSlide[];
  currentIndex: number;
  leftLabel: string;
  rightLabel: string;
  leftWeight?: string;
  rightWeight?: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  leftImageSettings?: ImageSettings;
  rightImageSettings?: ImageSettings;
  setLeftImageSettings?: ImageSettingsSetters;
  setRightImageSettings?: ImageSettingsSetters;
}

export function ComparePhotoModal({
  slides,
  currentIndex,
  leftLabel,
  rightLabel,
  leftWeight,
  rightWeight,
  onClose,
  onNavigate,
  leftImageSettings,
  rightImageSettings,
  setLeftImageSettings,
  setRightImageSettings,
}: ComparePhotoModalProps) {
  const slide = slides[currentIndex];
  const [showControls, setShowControls] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < slides.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [currentIndex, slides.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!slide) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Top right: controls toggle and close button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowControls((s) => !s);
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors ${
            showControls ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
          aria-label={showControls ? "Hide controls" : "Show controls"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Controls
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* View type label (e.g. Front / Side / Back) */}
      <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
        {slide.label}
      </div>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Previous view"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < slides.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Next view"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      )}

      {/* Side-by-side images: 3:2 container (two 3:4 portraits) so no letterboxing, gap-0 */}
      <div
        className="flex h-full w-full items-center justify-center p-4 pt-14 pb-14"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full max-w-full shrink-0 gap-0 aspect-3/2 w-auto">
          <ZoomableImage
            src={slide.leftSrc}
            alt={`${slide.label} - ${leftLabel}`}
            label={leftLabel}
            secondaryLabel={leftWeight}
            zoom={leftImageSettings?.zoom}
            brightness={leftImageSettings?.brightness}
            contrast={leftImageSettings?.contrast}
            onZoomChange={setLeftImageSettings?.setZoom}
            onBrightnessChange={setLeftImageSettings?.setBrightness}
            onContrastChange={setLeftImageSettings?.setContrast}
            showControls={showControls}
          />
          <ZoomableImage
            src={slide.rightSrc}
            alt={`${slide.label} - ${rightLabel}`}
            label={rightLabel}
            secondaryLabel={rightWeight}
            zoom={rightImageSettings?.zoom}
            brightness={rightImageSettings?.brightness}
            contrast={rightImageSettings?.contrast}
            onZoomChange={setRightImageSettings?.setZoom}
            onBrightnessChange={setRightImageSettings?.setBrightness}
            onContrastChange={setRightImageSettings?.setContrast}
            showControls={showControls}
          />
        </div>
      </div>

      {/* Dots: Front / Side / Back */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index);
            }}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to ${slides[index]?.label ?? "slide"}`}
          />
        ))}
      </div>
    </div>
  );
}
