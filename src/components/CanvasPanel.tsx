
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDrawing } from '@/contexts/DrawingContext';
import DrawingTools from './DrawingTools';
import MultiHandDrawingCanvas from './MultiHandDrawingCanvas';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';
import { ArrowLeftRight, Maximize, Minimize } from 'lucide-react';
import { loadImageFromFile } from '@/utils/imageUtils';

interface CanvasPanelProps {
  onSwapPanels?: () => void;
  additionalDrawingPositions?: { x: number, y: number }[];
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({
  onSwapPanels,
  additionalDrawingPositions = [],
  onFullscreenToggle,
  isFullscreen = false
}) => {
  const {
    drawingPosition,
    clearCanvas,
    setClearCanvas,
    brushColor,
    brushSize,
    isEraser,
    backgroundImage,
    setBackgroundImage,
    backgroundOpacity,
    // strokeHistory,
    // currentStrokeIndex,
    // addStroke,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDrawing();

  // Function to handle canvas download
  const handleCanvasDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `hand-drawing-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Download started",
        description: "Your drawing is being downloaded as a PNG file.",
      });
    } catch (err) {
      console.error("Error downloading canvas:", err);
      toast({
        title: "Download failed",
        description: "There was an error downloading your drawing.",
        variant: "destructive"
      });
    }
  };

  // Handle background upload
  const handleBackgroundUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Load the image (not using the returned image directly)
      await loadImageFromFile(file);

      // Set the background image
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);

      toast({
        title: "Background added",
        description: "Your background image has been applied to the canvas.",
      });
    } catch (err) {
      console.error("Error loading background image:", err);
      toast({
        title: "Image load failed",
        description: "There was an error loading your background image.",
        variant: "destructive"
      });
    }
  };

  const handleFullscreenToggle = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle(!isFullscreen);
    }
  };

  return (
    <Card className={`rounded-none border-0 h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-40 bg-white' : ''}`}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle>Drawing Canvas</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreenToggle}
            className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullscreen ? (
              <><Minimize className="h-3 w-3" /><span className="hidden sm:inline">Exit</span></>
            ) : (
              <><Maximize className="h-3 w-3" /><span className="hidden sm:inline">Full Screen</span></>
            )}
          </Button>

          {onSwapPanels && !isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwapPanels}
              className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span className="hidden sm:inline">Swap</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-2 sm:p-6">
        <div className="flex-1 relative bg-gray-50 rounded-lg overflow-hidden">
          <MultiHandDrawingCanvas
            isDrawing={!!drawingPosition}
            drawingPosition={drawingPosition}
            clearCanvas={clearCanvas}
            onCanvasCleared={() => setClearCanvas(false)}
            brushColor={brushColor}
            brushSize={brushSize}
            additionalDrawingPositions={additionalDrawingPositions}
            isEraser={isEraser}
            isFullscreen={isFullscreen}
            backgroundImage={backgroundImage}
            backgroundOpacity={backgroundOpacity}
          />
        </div>
        <DrawingTools
          onDownload={handleCanvasDownload}
          onUndo={undo}
          onRedo={redo}
          onBackgroundUpload={handleBackgroundUpload}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </CardContent>
    </Card>
  );
};

export default CanvasPanel;
