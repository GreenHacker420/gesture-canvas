import React from 'react';
interface DrawingToolsProps {
    onDownload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onBackgroundUpload: (file: File) => void;
    canUndo: boolean;
    canRedo: boolean;
}
declare const DrawingTools: React.FC<DrawingToolsProps>;
export default DrawingTools;
