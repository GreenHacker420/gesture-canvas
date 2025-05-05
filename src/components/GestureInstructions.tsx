
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const GestureInstructions: React.FC = () => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">Gesture Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">✋</span>
            </div>
            <span className="text-sm">
              <b>Index finger:</b> Draw
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">👌</span>
            </div>
            <span className="text-sm">
              <b>3 fingers up:</b> Change color
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">✊</span>
            </div>
            <span className="text-sm">
              <b>Fist/closed hand:</b> Stop drawing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">👐</span>
            </div>
            <span className="text-sm">
              <b>All fingers up:</b> Clear canvas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">✌️</span>
            </div>
            <span className="text-sm">
              <b>Two fingers up:</b> Eraser mode
            </span>
          </div>

          <div className="flex items-center gap-2 col-span-1 md:col-span-2 lg:col-span-3">
            <div className="bg-indigo-100 rounded-full p-2 flex-shrink-0">
              <span className="font-bold">👐👐</span>
            </div>
            <span className="text-sm">
              <b>Both hands with index fingers up:</b> Draw with both hands simultaneously
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GestureInstructions;
