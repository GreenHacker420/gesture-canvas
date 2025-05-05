import * as React from 'react';
interface CanvasPanelProps {
    onSwapPanels?: () => void;
    additionalDrawingPositions?: {
        x: number;
        y: number;
    }[];
    onFullscreenToggle?: (isFullscreen: boolean) => void;
    isFullscreen?: boolean;
}
declare const CanvasPanel: React.FC<CanvasPanelProps>;
export default CanvasPanel;
