import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(() => {
    if (!imgRef.current || !crop) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpg';
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg', 1);
    });
  }, [crop, rotation, scale]);

  const handleCropComplete = async () => {
    try {
      const croppedImageUrl = await getCroppedImg();
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Crop Profile Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Drag to position the crop area. Focus on the face for best results.
            </p>
            
            {/* Controls */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleRotate}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                <RotateCw size={16} />
                Rotate
              </button>
              <button
                onClick={handleZoomIn}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                <ZoomIn size={16} />
                Zoom In
              </button>
              <button
                onClick={handleZoomOut}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                <ZoomOut size={16} />
                Zoom Out
              </button>
            </div>
          </div>

          {/* Image Cropper */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={aspectRatio}
              minWidth={50}
              minHeight={50}
              keepSelection
            >
              <img
                ref={imgRef}
                src={image}
                alt="Crop preview"
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  maxWidth: '100%',
                  maxHeight: '60vh',
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 