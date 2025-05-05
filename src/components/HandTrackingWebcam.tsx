import React, { useEffect, useRef, useState } from 'react';
import { HandDetector } from './HandDetector';
import { HandLandmarkRenderer } from './HandLandmarkRenderer';
import { detectHand, HandDetection } from '@/utils/handTracking';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { useDrawing } from '@/contexts/DrawingContext';
import Webcam from './Webcam';

interface HandTrackingWebcamProps {
  onHandGesture: (
    isDrawing: boolean,
    position: { x: number, y: number } | null,
    clearCanvas: boolean,
    changeColor: boolean,
    maxConfidence: number,
    additionalPositions?: { x: number, y: number }[]
  ) => void;
  width?: number;
  height?: number;
}

export const HandTrackingWebcam: React.FC<HandTrackingWebcamProps> = ({
  onHandGesture,
  width = 640,
  height = 480
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [detection, setDetection] = useState<HandDetection | null>(null);
  const { cameraEnabled } = useApp();

  // Initialize camera with fixed aspect ratio
  useEffect(() => {
    if (!cameraEnabled) return;

    const initializeCamera = async () => {
      try {
        // Request a specific aspect ratio (16:9) to maintain consistency
        const aspectRatio = 16/9;
        const targetWidth = 640;
        const targetHeight = Math.round(targetWidth / aspectRatio);

        console.log(`Requesting camera with fixed dimensions: ${targetWidth}x${targetHeight}`);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: targetWidth, max: 1280 },
            height: { ideal: targetHeight, max: 720 },
            aspectRatio: { ideal: aspectRatio },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Set fixed dimensions on the video element
          videoRef.current.width = targetWidth;
          videoRef.current.height = targetHeight;

          // Wait for video to be ready before playing
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              // Log the actual dimensions we got
              console.log(`Camera initialized with dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
              videoRef.current.play().catch(console.error);
            }
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initializeCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraEnabled]);

  // Update video element when ref changes
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
  }, [videoRef.current]);

  // Get drawing context functions
  const { setIsEraser } = useDrawing();

  // Handle hand detection
  const handleHandDetection = (detection: HandDetection) => {
    setDetection(detection);

    // Process gestures and notify parent component
    if (detection.isHandDetected && detection.hands.length > 0) {
      // Get the hand with highest confidence for confidence reporting
      const sortedHands = [...detection.hands].sort((a, b) => b.confidence - a.confidence);
      const maxConfidence = sortedHands[0].confidence;

      // Separate hands by handedness - only need right hand for preference
      const rightHand = detection.hands.find(h => h.handedness === 'Right');

      // Track all drawing positions from all hands
      // Include isDrawing flag for each position
      let drawingPositions: { x: number, y: number, isDrawing?: boolean }[] = [];

      // Process all hands to collect drawing positions
      detection.hands.forEach(hand => {
        if (!hand.isDetected) return;

        // Debug logging for finger positions and gestures
        console.log(`Hand ${hand.handedness}: Drawing=${hand.gesture.isDrawing}, Position=${hand.indexFingerPosition ? 'Valid' : 'Invalid'}`);

        // If hand has a valid index finger position, consider it for drawing
        // We'll check the drawing gesture later, but we need the position regardless
        if (hand.indexFingerPosition) {
          // Validate coordinates before using them
          const { x, y } = hand.indexFingerPosition;

          // Check if coordinates are valid numbers
          if (typeof x === 'number' && !isNaN(x) &&
              typeof y === 'number' && !isNaN(y)) {

            // Mirror the x-coordinate for natural drawing and ensure values are within bounds
            const correctedPosition = {
              x: Math.min(width, Math.max(0, width - x)),
              y: Math.min(height, Math.max(0, y))
            };

            // Add the position to our list, along with the drawing state
            drawingPositions.push({
              ...correctedPosition,
              isDrawing: hand.gesture.isDrawing
            });

            console.log(`Added hand position: x=${correctedPosition.x}, y=${correctedPosition.y}, isDrawing=${hand.gesture.isDrawing}`);
          } else {
            console.warn(`Invalid hand position detected: x=${x}, y=${y}`);
          }
        }
      });

      // Update eraser mode based on any hand having eraser gesture
      const anyEraser = detection.gesture.isEraser;
      if (anyEraser !== (setIsEraser as any).isEraser) {
        setIsEraser(anyEraser);
      }

      // Determine primary drawing position (prefer right hand if available)
      let primaryDrawingPosition = null;
      let primaryIsDrawing = false;

      // Find drawing positions that are actually in drawing mode
      const activeDrawingPositions = drawingPositions.filter(pos => pos.isDrawing);

      // If we have any positions with drawing mode active, use those
      if (activeDrawingPositions.length > 0) {
        // Prefer right hand if available
        const rightHandPos = drawingPositions.find(pos =>
          rightHand && rightHand.indexFingerPosition &&
          Math.abs(pos.x - (width - rightHand.indexFingerPosition.x)) < 5 &&
          Math.abs(pos.y - rightHand.indexFingerPosition.y) < 5
        );

        if (rightHandPos && rightHandPos.isDrawing) {
          // Use right hand as primary
          primaryDrawingPosition = { x: rightHandPos.x, y: rightHandPos.y };
          primaryIsDrawing = true;
          console.log("Using right hand as primary drawing hand");
        } else {
          // Use first active drawing position
          primaryDrawingPosition = { x: activeDrawingPositions[0].x, y: activeDrawingPositions[0].y };
          primaryIsDrawing = true;
          console.log("Using active drawing position");
        }
      }
      // If no active drawing positions, still track a hand position for cursor
      else if (drawingPositions.length > 0) {
        // Just use the first position for cursor tracking
        primaryDrawingPosition = { x: drawingPositions[0].x, y: drawingPositions[0].y };
        primaryIsDrawing = false;
        console.log("Using hand position for cursor only (not drawing)");
      }

      // Remove the primary position from additional positions to avoid duplicates
      const secondaryDrawingPositions = activeDrawingPositions
        .filter(pos => !primaryDrawingPosition ||
          Math.abs(pos.x - primaryDrawingPosition.x) > 5 ||
          Math.abs(pos.y - primaryDrawingPosition.y) > 5
        )
        .map(pos => ({ x: pos.x, y: pos.y })); // Convert to simple x,y format

      // Log when multiple hands are drawing
      if (secondaryDrawingPositions.length > 0) {
        console.log(`Drawing with multiple hands: Primary hand and ${secondaryDrawingPositions.length} additional hand(s)`);
      }

      // Use our calculated primaryIsDrawing instead of the global detection.gesture.isDrawing
      // This gives us more precise control over when drawing happens
      onHandGesture(
        primaryIsDrawing,
        primaryDrawingPosition,
        detection.gesture.isClearCanvas,
        detection.gesture.isChangeColor,
        maxConfidence,
        secondaryDrawingPositions.length > 0 ? secondaryDrawingPositions : undefined
      );
    } else {
      // No hands detected
      onHandGesture(false, null, false, false, 0, undefined);
    }
  };

  // Define fixed dimensions for consistency
  const fixedWidth = 640;
  const fixedHeight = 360; // 16:9 aspect ratio

  return (
    <div className="relative" style={{
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      // Create a fixed aspect ratio container
      paddingBottom: `${(fixedHeight / fixedWidth) * 100}%`, // Maintain 16:9 aspect ratio
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          width={fixedWidth}
          height={fixedHeight}
          playsInline
          muted
          autoPlay
          style={{
            transform: 'scaleX(-1)', // Mirror the video
            display: cameraEnabled ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute'
          }}
        />
        {videoElement && (
          <>
            <HandDetector
              videoElement={videoElement}
              onHandDetection={handleHandDetection}
            />
            <HandLandmarkRenderer
              videoElement={videoElement}
              detection={detection}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HandTrackingWebcam;
