
import React, { useCallback } from 'react';
import { useDrawing } from '@/contexts/DrawingContext';
import { toast } from '@/components/ui/use-toast';

interface GestureHandlerProps {
  children: (props: { onHandGesture: (
    isDrawing: boolean,
    position: { x: number, y: number } | null,
    clearCanvas: boolean,
    changeColor: boolean,
    maxConfidence?: number, // Make this parameter optional
    additionalPositions?: { x: number, y: number }[]
  ) => void }) => React.ReactNode;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({ children }) => {
  const {
    setIsDrawing,
    setDrawingPosition,
    setClearCanvas,
    setBrushColor,
    brushColor,
    setIsEraser,
    isEraser
  } = useDrawing();

  // Define color options array
  const brushColorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Pink', value: '#FFC0CB' }
  ];

  // Track last gesture activation to prevent repeated notifications
  const lastGestureRef = React.useRef({
    clearCanvas: false,
    changeColor: false,
    eraserMode: false,
    multiHandDrawing: false
  });

  // Handle hand gesture detection
  const handleHandGesture = useCallback((
    gestureIsDrawing: boolean,
    position: { x: number, y: number } | null,
    gestureClearCanvas: boolean,
    gestureChangeColor: boolean,
    _maxConfidence?: number, // Optional parameter (unused)
    additionalPositions?: { x: number, y: number }[]
  ) => {
    // Debug logging for drawing state
    console.log(`GestureHandler: isDrawing=${gestureIsDrawing}, position=${position ? `x=${position.x}, y=${position.y}` : 'null'}`);

    setIsDrawing(gestureIsDrawing);
    setDrawingPosition(position);

    // Handle clear canvas gesture
    if (gestureClearCanvas && !lastGestureRef.current.clearCanvas) {
      setClearCanvas(true);
      toast({
        title: "Canvas cleared",
        description: "Canvas has been cleared by gesture"
      });
      lastGestureRef.current.clearCanvas = true;
    } else if (!gestureClearCanvas && lastGestureRef.current.clearCanvas) {
      lastGestureRef.current.clearCanvas = false;
    }

    // Handle color change gesture
    if (gestureChangeColor && !lastGestureRef.current.changeColor) {
      const currentIndex = brushColorOptions.findIndex(c => c.value === brushColor);
      const nextIndex = (currentIndex + 1) % brushColorOptions.length;
      setBrushColor(brushColorOptions[nextIndex].value);

      toast({
        title: "Color changed",
        description: `Brush color changed to ${brushColorOptions[nextIndex].name}`
      });
      lastGestureRef.current.changeColor = true;
    } else if (!gestureChangeColor && lastGestureRef.current.changeColor) {
      lastGestureRef.current.changeColor = false;
    }

    // Toggle eraser mode based on detector output
    if (position) {
      // Check if hand position has eraser flag from HandDetector
      const handDetector = document.getElementById('hand-detector');
      if (handDetector && handDetector.hasAttribute('data-eraser-active')) {
        if (!isEraser && !lastGestureRef.current.eraserMode) {
          setIsEraser(true);
          toast({
            title: "Eraser activated",
            description: "Two fingers up gesture detected"
          });
          lastGestureRef.current.eraserMode = true;
        }
      } else if (isEraser && lastGestureRef.current.eraserMode) {
        setIsEraser(false);
        lastGestureRef.current.eraserMode = false;
      }
    }

    // Handle multiple hands drawing simultaneously
    if (additionalPositions && additionalPositions.length > 0) {
      // Log multi-hand drawing activity
      console.log(`Drawing with multiple hands: Primary position and ${additionalPositions.length} additional positions`);

      // Show toast notification for multi-hand drawing the first time it's detected
      if (!lastGestureRef.current.multiHandDrawing) {
        toast({
          title: "Multi-hand drawing active",
          description: "Drawing with both hands simultaneously",
          variant: "default"
        });
        lastGestureRef.current.multiHandDrawing = true;
      }
    } else if (lastGestureRef.current.multiHandDrawing) {
      // Reset multi-hand drawing state when no longer using multiple hands
      lastGestureRef.current.multiHandDrawing = false;
    }
  }, [setIsDrawing, setDrawingPosition, setClearCanvas, setBrushColor, brushColor, setIsEraser, isEraser, brushColorOptions]);

  return children({ onHandGesture: handleHandGesture });
};

export default GestureHandler;
