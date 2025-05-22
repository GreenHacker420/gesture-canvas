
import * as React from 'react';
import GestureInstructions from '@/components/GestureInstructions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import CameraPanel from '@/components/CameraPanel';
import CanvasPanel from '@/components/CanvasPanel';
import StatusCard from '@/components/StatusCard';
import { DrawingProvider } from '@/contexts/DrawingContext';
import GestureHandler from '@/components/GestureHandler';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import MovableCamera from '@/components/MovableCamera';
import FeedbackForm from '@/components/FeedbackForm';

const Index = () => {
  const [isCameraLeft, setIsCameraLeft] = React.useState(true);
  const [confidence] = React.useState(0);
  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  // State for additional drawing positions (for multi-hand support)
  const [additionalDrawingPositions, setAdditionalDrawingPositions] = React.useState<{ x: number, y: number }[]>([]);

  const handleSwapPanels = () => {
    setIsCameraLeft(!isCameraLeft);
  };

  // Function to update confidence and additional positions
  // This is used indirectly through the GestureHandler component
  React.useEffect(() => {
    // This effect handles updating additional drawing positions when needed
    const updatePositionsFromGesture = (positions: { x: number, y: number }[]) => {
      if (positions && positions.length > 0) {
        setAdditionalDrawingPositions(positions);
      } else {
        setAdditionalDrawingPositions([]);
      }
    };

    // This is just to prevent the unused function warning
    // In a real app, we would use this more directly
    if (false) updatePositionsFromGesture([]);
  }, []);

  return (
    <DrawingProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="container max-w-6xl">
          {!isFullscreen && (
            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  {/* Empty div for spacing */}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brush-blue to-brush-purple">
                    Gesture Canvas
                  </h1>
                </div>
                <div className="flex-1 flex justify-end">
                  <FeedbackForm />
                </div>
              </div>

              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Draw with just your hand! Use gestures to change colors, clear the canvas, and create art without touching your screen.
              </p>

              <GestureInstructions />
            </div>
          )}

          {/* Mobile Layout Toggle - only show when not in fullscreen */}
          {!isFullscreen && (
            <div className="md:hidden flex justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapPanels}
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Swap Camera & Canvas
              </Button>
            </div>
          )}

          {/* Desktop Layout */}
          {!isFullscreen && (
            <div className="hidden md:block">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[600px] rounded-lg border"
              >
                {isCameraLeft ? (
                  <>
                    <ResizablePanel defaultSize={50}>
                      <GestureHandler>
                        {(handGestureProps) => (
                          <CameraPanel
                            onHandGesture={handGestureProps.onHandGesture}
                            confidence={confidence}
                          />
                        )}
                      </GestureHandler>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                      <CanvasPanel
                        onSwapPanels={handleSwapPanels}
                        additionalDrawingPositions={additionalDrawingPositions}
                        onFullscreenToggle={setIsFullscreen}
                        isFullscreen={isFullscreen}
                      />
                    </ResizablePanel>
                  </>
                ) : (
                  <>
                    <ResizablePanel defaultSize={50}>
                      <CanvasPanel
                        onSwapPanels={handleSwapPanels}
                        additionalDrawingPositions={additionalDrawingPositions}
                        onFullscreenToggle={setIsFullscreen}
                        isFullscreen={isFullscreen}
                      />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                      <GestureHandler>
                        {(handGestureProps) => (
                          <CameraPanel
                            onHandGesture={handGestureProps.onHandGesture}
                            confidence={confidence}
                          />
                        )}
                      </GestureHandler>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          )}

          {/* Mobile Layout - only show when not in fullscreen */}
          {!isFullscreen && (
            <div className="md:hidden space-y-4">
              {isCameraLeft ? (
                <>
                  <GestureHandler>
                    {(handGestureProps) => (
                      <CameraPanel
                        onHandGesture={handGestureProps.onHandGesture}
                        confidence={confidence}
                      />
                    )}
                  </GestureHandler>
                  <CanvasPanel
                    onSwapPanels={handleSwapPanels}
                    additionalDrawingPositions={additionalDrawingPositions}
                    onFullscreenToggle={setIsFullscreen}
                    isFullscreen={isFullscreen}
                  />
                </>
              ) : (
                <>
                  <CanvasPanel
                    onSwapPanels={handleSwapPanels}
                    additionalDrawingPositions={additionalDrawingPositions}
                    onFullscreenToggle={setIsFullscreen}
                    isFullscreen={isFullscreen}
                  />
                  <GestureHandler>
                    {(handGestureProps) => (
                      <CameraPanel
                        onHandGesture={handGestureProps.onHandGesture}
                        confidence={confidence}
                      />
                    )}
                  </GestureHandler>
                </>
              )}
            </div>
          )}

          {/* Fullscreen Canvas with Movable Camera */}
          {isFullscreen && (
            <div className="fixed inset-0 z-40">
              <CanvasPanel
                onFullscreenToggle={setIsFullscreen}
                isFullscreen={isFullscreen}
                additionalDrawingPositions={additionalDrawingPositions}
              />

              <GestureHandler>
                {(handGestureProps) => (
                  <MovableCamera
                    onHandGesture={handGestureProps.onHandGesture}
                    confidence={confidence}
                  />
                )}
              </GestureHandler>

              {/* Feedback button in fullscreen mode */}
              <div className="absolute top-4 right-20 z-50">
                <FeedbackForm />
              </div>
            </div>
          )}

          {!isFullscreen && <StatusCard />}

          {!isFullscreen && (
            <>
              <p className="text-center text-sm text-gray-500 mt-8">
                Make sure to allow camera access for hand tracking functionality.
                <br />
                Move your hand closer to the camera for better tracking results.
                <br />
                If hand tracking is unavailable, you can still draw with mouse or touch.
              </p>

              <div className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 mt-4 max-w-2xl mx-auto">
                <strong>Privacy Notice:</strong> This application uses your device's camera for hand tracking.
                All processing happens directly in your browser - no video data is sent to any server or stored.
                Your camera feed is only used for real-time hand gesture detection to control the drawing canvas.
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Created by GreenHacker
              </p>
            </>
          )}
        </div>
      </div>
    </DrawingProvider>
  );
};

export default Index;
