
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, Undo, Redo, Eraser, Image as ImageIcon, Brush, Trash2, Camera, Upload, FileImage } from 'lucide-react';
import { useDrawing } from '@/contexts/DrawingContext';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface DrawingToolsProps {
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onBackgroundUpload: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  onDownload,
  onUndo,
  onRedo,
  onBackgroundUpload,
  canUndo,
  canRedo
}) => {
  const {
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser
  } = useDrawing();

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const {
    backgroundImage,
    setBackgroundImage,
    backgroundOpacity,
    setBackgroundOpacity
  } = useDrawing();

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onBackgroundUpload(file);
      setImageDialogOpen(true);
    }
  };

  // Handle URL image upload
  const handleUrlUpload = () => {
    if (imageUrl.trim()) {
      // Create a temporary image to test the URL
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(imageUrl);
        setImageDialogOpen(true);
      };
      img.onerror = () => {
        alert('Failed to load image from URL. Please check the URL and try again.');
      };
      img.src = imageUrl;
    }
  };

  // Handle webcam capture
  const handleWebcamCapture = () => {
    // Get the video element from the camera panel
    const video = document.querySelector('video');
    if (!video) {
      alert('Camera not available. Please ensure your camera is enabled.');
      return;
    }

    // Create a temporary canvas to capture the frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    if (ctx) {
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      // Convert to data URL
      const dataUrl = tempCanvas.toDataURL('image/png');
      setBackgroundImage(dataUrl);
      setImageDialogOpen(true);
    }
  };

  // Handle removing the background image
  const handleRemoveBackground = () => {
    setBackgroundImage(null);
    setImageDialogOpen(false);
  };

  // Predefined colors for quick selection
  const colorPresets = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Pink', value: '#FFC0CB' },
  ];

  // Predefined brush sizes
  const brushSizePresets = [1, 5, 10, 20, 30];

  return (
    <>
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Settings</DialogTitle>
            <DialogDescription>
              Adjust your background image settings for annotation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-opacity-dialog">Image Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="image-opacity-dialog"
                  value={[backgroundOpacity]}
                  onValueChange={([value]) => setBackgroundOpacity(value)}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-right">{backgroundOpacity}%</span>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              type="button"
              onClick={handleRemoveBackground}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Image
            </Button>
            <Button type="button" onClick={() => setImageDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-4 space-y-4">
        <Tabs defaultValue="brush" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="brush">Brush Settings</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

        <TabsContent value="brush" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Brush Color</label>
              <div className="flex flex-col gap-2">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />

                {/* Color presets */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {colorPresets.map((color) => (
                    <Tooltip key={color.value}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          title={color.name}
                          onClick={() => setBrushColor(color.value)}
                          className={`w-6 h-6 rounded-full border ${
                            brushColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{color.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brush Size: {brushSize}px</label>
              <Slider
                value={[brushSize]}
                onValueChange={([value]) => setBrushSize(value)}
                min={1}
                max={30}
                step={1}
                className="mt-3"
              />

              {/* Brush size presets */}
              <div className="flex justify-between mt-2">
                {brushSizePresets.map((size) => (
                  <Tooltip key={size}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setBrushSize(size)}
                        className={`rounded-full border ${
                          brushSize === size ? 'border-blue-500' : 'border-gray-300'
                        } flex items-center justify-center`}
                        style={{ width: `${Math.min(size + 10, 30)}px`, height: `${Math.min(size + 10, 30)}px` }}
                      >
                        <span
                          className="rounded-full bg-black"
                          style={{ width: `${size}px`, height: `${size}px` }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{size}px</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Eraser toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="eraser-mode"
              checked={isEraser}
              onCheckedChange={setIsEraser}
            />
            <Label htmlFor="eraser-mode" className="cursor-pointer">
              {isEraser ? 'Eraser Mode' : 'Drawing Mode'}
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="pt-2">
          <Tabs defaultValue="image">
            <TabsList className="w-full grid grid-cols-2 mb-2">
              <TabsTrigger value="image">Image Options</TabsTrigger>
              <TabsTrigger value="drawing">Drawing Options</TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Add Image</h3>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('background-upload')?.click()}
                      className="flex items-center justify-start gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      Upload from Device
                    </Button>

                    <input
                      id="background-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <Button
                      variant="outline"
                      onClick={handleWebcamCapture}
                      className="flex items-center justify-start gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Capture from Camera
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center justify-start gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Load from URL
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Load Image from URL</DialogTitle>
                          <DialogDescription>
                            Enter the URL of the image you want to use as background.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleUrlUpload}>Load Image</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Image Actions</h3>
                  <div className="flex flex-col space-y-2">
                    {backgroundImage && (
                      <Button
                        variant="outline"
                        onClick={() => setImageDialogOpen(true)}
                        className="flex items-center justify-start gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Edit Background Image
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleRemoveBackground}
                      disabled={!backgroundImage}
                      className="flex items-center justify-start gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Background
                    </Button>

                    <Button
                      variant="outline"
                      onClick={onDownload}
                      className="flex items-center justify-start gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Drawing
                    </Button>
                  </div>

                  {backgroundImage && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="image-opacity" className="text-sm font-medium">
                          Image Opacity
                        </Label>
                        <span className="text-xs">{backgroundOpacity}%</span>
                      </div>
                      <Slider
                        id="image-opacity"
                        value={[backgroundOpacity]}
                        onValueChange={([value]) => setBackgroundOpacity(value)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="drawing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Drawing History</h3>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="flex items-center justify-start gap-2"
                    >
                      <Undo className="h-4 w-4" />
                      Undo
                    </Button>

                    <Button
                      variant="outline"
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="flex items-center justify-start gap-2"
                    >
                      <Redo className="h-4 w-4" />
                      Redo
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Current tool indicator */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <div
          className={`w-6 h-6 rounded-full border ${isEraser ? 'bg-white border-gray-400' : 'border-transparent'}`}
          style={{
            backgroundColor: isEraser ? 'white' : brushColor,
            width: Math.min(brushSize * 1.5, 30),
            height: Math.min(brushSize * 1.5, 30),
            boxShadow: isEraser ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
          }}
        />
        <span className="text-sm">
          {isEraser ? 'Eraser' : 'Brush'} ({brushSize}px)
        </span>
      </div>
    </Card>
    </>
  );
};

export default DrawingTools;
