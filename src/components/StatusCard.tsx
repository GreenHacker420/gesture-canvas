import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDrawing } from '@/contexts/DrawingContext';
import { CirclePercent, Check } from 'lucide-react';

const StatusCard = () => {
  const { brushColor, brushSize, isEraser } = useDrawing();
  const [handConfidence, setHandConfidence] = useState(0);
  const [showTips, setShowTips] = useState(false);

  // Listen for hand detection confidence updates from HandDetector
  useEffect(() => {
    const handConfidenceElement = document.getElementById('hand-detector');
    if (!handConfidenceElement) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-confidence') {
          const confidenceValue = parseFloat(handConfidenceElement.getAttribute('data-confidence') || '0');
          setHandConfidence(confidenceValue * 100);
          // Show tips more often to help users
          setShowTips(confidenceValue < 0.5);
        }
      });
    });

    observer.observe(handConfidenceElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Card className="mt-4 border-2 border-blue-200 shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Brush Color</h3>
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                style={{ backgroundColor: brushColor }}
              />
              <span className="text-xs">{brushColor}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Brush Size</h3>
            <div className="flex items-center">
              <div
                className="rounded-full mr-2 border border-gray-300"
                style={{
                  width: `${Math.min(brushSize, 16) + 2}px`,
                  height: `${Math.min(brushSize, 16) + 2}px`,
                  backgroundColor: isEraser ? 'white' : brushColor
                }}
              />
              <span className="text-xs">{brushSize}px</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Mode</h3>
            <div className="text-xs font-semibold">
              <span className={`px-2 py-1 rounded-full ${isEraser ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {isEraser ? 'Eraser' : 'Draw'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center">
              <CirclePercent className="h-4 w-4 mr-1" />
              <span className="font-bold">Hand Detection</span>
            </h3>
            <div className="flex items-center">
              <Progress
                value={handConfidence}
                className={`h-3 flex-1 mr-2 ${
                  handConfidence > 70 ? 'bg-green-100' :
                  handConfidence > 40 ? 'bg-amber-100' : 'bg-red-100'
                }`}
              />
              <span className={`text-sm font-bold ${
                handConfidence > 70 ? 'text-green-600' :
                handConfidence > 40 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {Math.round(handConfidence)}%
              </span>
            </div>

            {showTips && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                <p className="font-medium">Tips for better detection:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Ensure good lighting on your hand</li>
                  <li>Keep hand clearly visible in camera</li>
                  <li>Move closer to camera</li>
                  <li>Try extending your index finger clearly</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
