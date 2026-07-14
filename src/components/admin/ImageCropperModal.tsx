import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Crop, X, RefreshCw, Maximize2 } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCrop: (croppedBase64: string) => void;
  defaultAspectRatio?: number; // width / height
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageFile,
  onCrop,
  defaultAspectRatio = 1
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspectRatio);
  const [ratioName, setRatioName] = useState<string>("1:1");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Viewport container sizing bounds
  const containerSize = 360; // Max size for preview box

  useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        // Reset crop settings
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc("");
    }
  }, [isOpen, imageFile]);

  // Set ratio name when default changes
  useEffect(() => {
    if (defaultAspectRatio === 1) {
      setAspectRatio(1);
      setRatioName("1:1");
    } else if (defaultAspectRatio > 1.7) {
      setAspectRatio(16/9);
      setRatioName("16:9");
    } else if (defaultAspectRatio > 1.3) {
      setAspectRatio(4/3);
      setRatioName("4:3");
    } else if (defaultAspectRatio < 0.8) {
      setAspectRatio(3/4);
      setRatioName("3:4");
    } else {
      setAspectRatio(defaultAspectRatio);
      setRatioName("Custom");
    }
  }, [defaultAspectRatio]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Math helper to get dimensions that "cover" the aspect ratio viewport
  const getCoverDimensions = () => {
    if (!naturalSize.width || !naturalSize.height) {
      return { width: containerSize, height: containerSize, containerW: containerSize, containerH: containerSize };
    }

    // Determine viewport container dimensions matching the chosen aspect ratio
    let containerW = containerSize;
    let containerH = containerSize;

    if (aspectRatio >= 1) {
      // Wide ratios: keep width max, scale height down
      containerH = containerSize / aspectRatio;
    } else {
      // Tall ratios: keep height max, scale width down
      containerW = containerSize * aspectRatio;
    }

    const imageRatio = naturalSize.width / naturalSize.height;
    const viewRatio = containerW / containerH;

    let baseWidth = containerW;
    let baseHeight = containerH;

    if (imageRatio > viewRatio) {
      // Image is wider than container: match height, scale width
      baseHeight = containerH;
      baseWidth = containerH * imageRatio;
    } else {
      // Image is taller than container: match width, scale height
      baseWidth = containerW;
      baseHeight = containerW / imageRatio;
    }

    return {
      width: baseWidth,
      height: baseHeight,
      containerW,
      containerH
    };
  };

  const { width: baseWidth, height: baseHeight, containerW, containerH } = getCoverDimensions();

  // Mouse / Touch Handlers for panning
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = {
      x: clientX - pan.x,
      y: clientY - pan.y
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    // Bounds checking to prevent panning too far out of viewport (leave a bit of boundary buffer)
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;

    // We can restrict panning so image does not leave viewport if desired,
    // but a free pan experience is more forgiving. Let's limit it to 85% of image width/height
    const limitX = (baseWidth * zoom) / 2 + containerW / 2;
    const limitY = (baseHeight * zoom) / 2 + containerH / 2;

    setPan({
      x: Math.max(-limitX, Math.min(limitX, newX)),
      y: Math.max(-limitY, Math.min(limitY, newY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Perform crop on canvas and return base64
  const handleApplyCrop = () => {
    if (!naturalSize.width || !naturalSize.height || !imageSrc) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Output high quality upscaled image (2x the CSS viewport size)
      const exportScale = 2.5; 
      const exportW = containerW * exportScale;
      const exportH = containerH * exportScale;

      canvas.width = exportW;
      canvas.height = exportH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Enable smooth image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate where to draw the image based on zoom and pan offsets
      const CX = containerW / 2;
      const CY = containerH / 2;
      
      const xLeft = CX + pan.x - (baseWidth * zoom) / 2;
      const yTop = CY + pan.y - (baseHeight * zoom) / 2;

      const drawX = xLeft * exportScale;
      const drawY = yTop * exportScale;
      const drawW = baseWidth * zoom * exportScale;
      const drawH = baseHeight * zoom * exportScale;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      onCrop(croppedBase64);
      onClose();
    };
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  const ratios = [
    { name: "1:1 Square", value: 1 },
    { name: "16:9 Wide", value: 16/9 },
    { name: "4:3 Classic", value: 4/3 },
    { name: "3:4 Portrait", value: 3/4 },
    { name: "3:2 Photo", value: 3/2 },
    { name: "Original", value: naturalSize.width ? naturalSize.width / naturalSize.height : 1 }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 flex flex-col my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-primary-800">
            <Crop className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-bold text-gray-800 text-lg">Crop & Adjust Image</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-6">
          <p className="text-xs text-gray-500 text-center">
            Drag the image to adjust position, and use the slider to zoom.
          </p>

          {/* Interactive Crop Viewport Container */}
          <div 
            className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden flex items-center justify-center cursor-move"
            style={{ 
              width: containerSize, 
              height: containerSize,
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleDragEnd}
          >
            {/* Aspect Ratio Cropped Mask Box */}
            <div 
              className="relative overflow-hidden bg-black shadow-inner flex items-center justify-center border-2 border-amber-400/90 shadow-2xl"
              style={{
                width: containerW,
                height: containerH,
              }}
            >
              {imageSrc && (
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Source Crop"
                  onLoad={handleImageLoad}
                  style={{
                    width: baseWidth,
                    height: baseHeight,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  className="max-w-none select-none pointer-events-none transition-transform duration-75 ease-out"
                />
              )}

              {/* Viewport Overlay grid lines */}
              <div className="absolute inset-0 border border-white/20 pointer-events-none flex flex-col justify-between">
                <div className="h-px bg-white/25 w-full mt-[33.3%]"></div>
                <div className="h-px bg-white/25 w-full mb-[33.3%]"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none flex flex-row justify-between">
                <div className="w-px bg-white/25 h-full ml-[33.3%]"></div>
                <div className="w-px bg-white/25 h-full mr-[33.3%]"></div>
              </div>
            </div>

            {/* Dark Dimmer outside the crop mask */}
            <div className="absolute inset-0 pointer-events-none bg-black/40 mix-blend-multiply"></div>
            
            {/* Highlights to frame the crop area inside the dimmer container */}
            <div 
              className="absolute pointer-events-none border-2 border-white rounded shadow-md"
              style={{
                width: containerW,
                height: containerH,
                left: (containerSize - containerW) / 2,
                top: (containerSize - containerH) / 2,
              }}
            ></div>
          </div>

          {/* Ratio Selection Controls */}
          <div className="w-full">
            <label className="text-xs font-semibold text-gray-700 block mb-2 text-center">
              Aspect Ratio Crop Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ratios.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => {
                    setAspectRatio(r.value);
                    setRatioName(r.name);
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-center ${
                    ratioName === r.name
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {r.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom controls slider */}
          <div className="w-full flex items-center gap-3 px-2">
            <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-250 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-500 w-8 text-right shrink-0">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-150 flex gap-3 bg-gray-50 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-2 hover:shadow transition-all"
          >
            <Crop className="w-4 h-4" />
            Apply & Crop
          </button>
        </div>
      </div>
    </div>
  );
}
