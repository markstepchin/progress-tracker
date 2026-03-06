"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { ZoomableImage } from "./ZoomableImage";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";

type Image = RouterOutputs["checkIn"]["getAll"][number]["frontPhoto"];

export interface CompareSlide {
  label: string;
  leftImage: Image;
  rightImage: Image;
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
}

interface ImageAdjustments {
  zoom: number;
  panX: number;
  panY: number;
  brightness: number;
  contrast: number;
  rotation: number;
}

function useImageAdjustments(image: Image) {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: image.zoom ?? 1,
    panX: image.panX ?? 0,
    panY: image.panY ?? 0,
    brightness: image.brightness ?? 1,
    contrast: image.contrast ?? 1,
    rotation: image.rotation ?? 0,
  });

  const utils = api.useUtils();
  const mutation = api.checkIn.updateImageAdjustments.useMutation({
    onSuccess: () => {
      utils.checkIn.getAll.invalidate();
    },
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<Partial<ImageAdjustments>>({});

  const debouncedSave = useCallback(
    (updates: Partial<ImageAdjustments>) => {
      pendingRef.current = { ...pendingRef.current, ...updates };

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const toSave = pendingRef.current;
        pendingRef.current = {};
        mutation.mutate({
          imageId: image.id,
          zoom: toSave.zoom === 1 ? null : toSave.zoom,
          panX: toSave.panX === 0 ? null : toSave.panX,
          panY: toSave.panY === 0 ? null : toSave.panY,
          brightness: toSave.brightness === 1 ? null : toSave.brightness,
          contrast: toSave.contrast === 1 ? null : toSave.contrast,
          rotation: toSave.rotation === 0 ? null : toSave.rotation,
        });
      }, 500);
    },
    [image.id, mutation],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const setZoom = useCallback(
    (value: number | null) => {
      const newZoom = value ?? 1;
      setAdjustments((prev) => ({ ...prev, zoom: newZoom }));
      debouncedSave({ zoom: newZoom });
    },
    [debouncedSave],
  );

  const setPan = useCallback(
    (x: number | null, y: number | null) => {
      const newPanX = x ?? 0;
      const newPanY = y ?? 0;
      setAdjustments((prev) => {
        if (prev.panX === newPanX && prev.panY === newPanY) {
          return prev;
        }
        return { ...prev, panX: newPanX, panY: newPanY };
      });
      debouncedSave({ panX: newPanX, panY: newPanY });
    },
    [debouncedSave],
  );

  const setBrightness = useCallback(
    (value: number | null) => {
      const newBrightness = value ?? 1;
      setAdjustments((prev) => ({ ...prev, brightness: newBrightness }));
      debouncedSave({ brightness: newBrightness });
    },
    [debouncedSave],
  );

  const setContrast = useCallback(
    (value: number | null) => {
      const newContrast = value ?? 1;
      setAdjustments((prev) => ({ ...prev, contrast: newContrast }));
      debouncedSave({ contrast: newContrast });
    },
    [debouncedSave],
  );

  const setRotation = useCallback(
    (value: number | null) => {
      const newRotation = value ?? 0;
      setAdjustments((prev) => ({ ...prev, rotation: newRotation }));
      debouncedSave({ rotation: newRotation });
    },
    [debouncedSave],
  );

  return {
    adjustments,
    setZoom,
    setPan,
    setBrightness,
    setContrast,
    setRotation,
    isSaving: mutation.isPending,
  };
}

function CompareImage({
  image,
  label,
  secondaryLabel,
  slideLabel,
  showControls,
}: {
  image: Image;
  label: string;
  secondaryLabel?: string;
  slideLabel: string;
  showControls: boolean;
}) {
  const { adjustments, setZoom, setPan, setBrightness, setContrast, setRotation } =
    useImageAdjustments(image);

  return (
    <ZoomableImage
      src={image.url}
      alt={`${slideLabel} - ${label}`}
      label={label}
      secondaryLabel={secondaryLabel}
      zoom={adjustments.zoom}
      panX={adjustments.panX}
      panY={adjustments.panY}
      brightness={adjustments.brightness}
      contrast={adjustments.contrast}
      rotation={adjustments.rotation}
      onZoomChange={setZoom}
      onPanChange={setPan}
      onBrightnessChange={setBrightness}
      onContrastChange={setContrast}
      onRotationChange={setRotation}
      showControls={showControls}
    />
  );
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
          <CompareImage
            key={slide.leftImage.id}
            image={slide.leftImage}
            label={leftLabel}
            secondaryLabel={leftWeight}
            slideLabel={slide.label}
            showControls={showControls}
          />
          <CompareImage
            key={slide.rightImage.id}
            image={slide.rightImage}
            label={rightLabel}
            secondaryLabel={rightWeight}
            slideLabel={slide.label}
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
