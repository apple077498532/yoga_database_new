import React, { useRef, useEffect } from 'react';
import { drawingFunctions } from '../utils/stickFigure';

interface StickFigureProps {
  poseName: string;
  width?: number;
  height?: number;
}

const StickFigure: React.FC<StickFigureProps> = ({ poseName, width = 120, height = 110 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas first
        ctx.clearRect(0, 0, width, height);
        
        // Check if we have a drawing function for this pose
        const drawFn = drawingFunctions[poseName];
        if (drawFn) {
          drawFn(ctx);
        } else {
            // Placeholder for missing drawings
            ctx.fillStyle = "#eee";
            ctx.fillRect(20, 20, width - 40, height - 40);
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "#aaa";
            ctx.textAlign = "center";
            ctx.fillText("No Image", width / 2, height / 2);
        }
      }
    }
  }, [poseName, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="mx-auto" />;
};

export default StickFigure;