
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const GestureInstructions: React.FC = () => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">Gesture Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Drawing Mode */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">☝️</span>
            </div>
            <span className="text-sm">
              <b>Index finger only:</b> Drawing mode
            </span>
          </div>

          {/* Color Selection */}
          <div className="flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">🖖</span>
            </div>
            <span className="text-sm">
              <b>Three fingers extended:</b> Color selection
            </span>
          </div>

          {/* Stop Drawing */}
          <div className="flex items-center gap-2">
            <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">✊</span>
            </div>
            <span className="text-sm">
              <b>Closed fist:</b> Pause drawing
            </span>
          </div>

          {/* Clear Canvas */}
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">🖐️</span>
            </div>
            <span className="text-sm">
              <b>All fingers extended:</b> Hold for 1-2s to clear canvas
            </span>
          </div>

          {/* Eraser Mode */}
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">✌️</span>
            </div>
            <span className="text-sm">
              <b>Two fingers extended:</b> Eraser mode (adjust size by changing finger distance)
            </span>
          </div>

          {/* Dual-Hand Drawing */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">👆👆</span>
            </div>
            <span className="text-sm">
              <b>Both hands with index fingers:</b> Draw with both hands simultaneously
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 italic">
          Note: For best results, ensure your hands are clearly visible in the camera view and well-lit.
        </div>
      </CardContent>
    </Card>
  );
};

export default GestureInstructions;
