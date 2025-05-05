import React, { useEffect, useRef, useState } from 'react';
import { HandDetection, drawHandLandmarks } from '@/utils/handTracking';

interface HandLandmarkRendererProps {
  videoElement: HTMLVideoElement;
  detection: HandDetection | null;
}

export const HandLandmarkRenderer: React.FC<HandLandmarkRendererProps> = ({
  videoElement,
  detection
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store fixed dimensions to maintain consistency
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 360 });

  // Set canvas dimensions once when video is loaded
  useEffect(() => {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) return;

    // Only update dimensions if they've changed significantly
    if (Math.abs(videoElement.videoWidth - canvasDimensions.width) > 10 ||
        Math.abs(videoElement.videoHeight - canvasDimensions.height) > 10) {

      console.log(`Updating canvas dimensions to match video: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      setCanvasDimensions({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    }
  }, [videoElement, videoElement?.videoWidth, videoElement?.videoHeight]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to our stored fixed dimensions
    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;

    console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks for each detected hand
    if (detection && detection.isHandDetected) {
      // Log detection info for debugging
      console.log('HandLandmarkRenderer: detection info', {
        isHandDetected: detection.isHandDetected,
        handsCount: detection.hands.length,
        handsWithLandmarks: detection.hands.filter(h => h.landmarks && h.landmarks.length === 21).length
      });

      // Draw landmarks for each hand
      detection.hands.forEach((hand, index) => {
        console.log(`Rendering hand ${index}:`, {
          hasLandmarks: !!hand.landmarks,
          landmarksLength: hand.landmarks ? hand.landmarks.length : 0,
          isArray: hand.landmarks ? Array.isArray(hand.landmarks) : false,
          handedness: hand.handedness
        });

        // Check if hand has valid landmarks
        if (hand.landmarks && Array.isArray(hand.landmarks)) {
          // Log the first few landmarks for debugging
          console.log(`First few landmarks for hand ${index}:`,
            hand.landmarks.slice(0, 3).map(lm => ({ x: lm.x, y: lm.y }))
          );

          // Verify landmarks have valid coordinates
          const validLandmarks = hand.landmarks.filter(lm =>
            typeof lm.x === 'number' && !isNaN(lm.x) &&
            typeof lm.y === 'number' && !isNaN(lm.y)
          );

          console.log(`Hand ${index} has ${validLandmarks.length}/${hand.landmarks.length} valid landmarks`);

          if (validLandmarks.length > 0) {
            // Draw all hand landmarks with labels
            drawHandLandmarks(ctx, validLandmarks, {
              color: hand.handedness === 'Right' ? 'lime' : 'yellow',
              radius: 6,
              showLabels: true // Show labels for all landmarks
            });

            // Draw index finger position with special highlight
            if (hand.indexFingerPosition &&
                typeof hand.indexFingerPosition.x === 'number' && !isNaN(hand.indexFingerPosition.x) &&
                typeof hand.indexFingerPosition.y === 'number' && !isNaN(hand.indexFingerPosition.y)) {
              ctx.fillStyle = '#0000FF';
              ctx.beginPath();
              ctx.arc(
                hand.indexFingerPosition.x,
                hand.indexFingerPosition.y,
                7,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }

            // Add hand label
            ctx.fillStyle = hand.handedness === 'Right' ? 'lime' : 'yellow';
            ctx.font = '16px Arial';

            // Find wrist or use first valid landmark
            const wrist = hand.landmarks.find(lm => lm.name === 'wrist') || validLandmarks[0];
            if (wrist) {
              ctx.fillText(hand.handedness, wrist.x, wrist.y - 10);
            }
          } else {
            console.warn(`Hand ${index} has no valid landmark coordinates`);
          }
        } else {
          console.warn(`Hand ${index} missing valid landmarks array`);
        }
      });
    }
  }, [detection, videoElement, canvasDimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasDimensions.width}
      height={canvasDimensions.height}
      className="absolute top-0 left-0"
      style={{
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'scaleX(-1)', // Mirror the canvas to match video
        opacity: detection?.isHandDetected ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
};
