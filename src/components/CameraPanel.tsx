import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HandTrackingWebcam from '@/components/HandTrackingWebcam';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

interface CameraPanelProps {
  onSwapPanels?: () => void;
  onHandGesture: (
    isDrawing: boolean,
    position: { x: number, y: number } | null,
    clearCanvas: boolean,
    changeColor: boolean,
    maxConfidence: number,
    additionalPositions?: { x: number, y: number }[]
  ) => void;
  confidence: number;
}

const CameraPanel: React.FC<CameraPanelProps> = ({
  onSwapPanels,
  onHandGesture,
  // confidence is used in the props interface but not in the component
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="rounded-none border-0 h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Hand Tracking Camera</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs px-2 py-1 h-auto"
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
          {onSwapPanels && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSwapPanels}
              title="Swap Positions"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 relative p-0 sm:p-6">
        {!isCollapsed && (
          <>
            <div className="relative w-full h-full">
              <HandTrackingWebcam
                onHandGesture={onHandGesture}
                width={640}
                height={480}
              />
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Camera view collapsed. Click Expand to show.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraPanel;
