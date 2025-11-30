import { StickFigureMap } from '../types';

function stick(ctx: CanvasRenderingContext2D, hx: number, hy: number, body: number[][], leg1: number[][], leg2: number[][] | null, arm1: number[][], arm2: number[][] | null) {
    ctx.clearRect(0, 0, 300, 300);
    ctx.strokeStyle = "#2d3436";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Head
    ctx.beginPath();
    ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    ctx.fill();

    const d = (pts: number[][] | null) => {
        if (!pts) return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
    };
    d(body); d(leg1); if(leg2) d(leg2); d(arm1); if(arm2) d(arm2);
}

export const drawingFunctions: StickFigureMap = {
    '下犬式': (ctx) => stick(ctx, 45, 70, [[50, 40], [25, 95]], [[50, 40], [80, 95]], null, [[25, 95], [50, 40]], null),
    '樹式': (ctx) => stick(ctx, 60, 25, [[60, 32], [60, 65]], [[60, 65], [60, 105]], [[60, 65], [80, 60], [60, 55]], [[60, 40], [40, 20], [60, 10]], [[60, 40], [80, 20], [60, 10]]),
    '戰士二': (ctx) => stick(ctx, 60, 25, [[60, 32], [60, 60]], [[60, 60], [90, 80], [90, 105]], [[60, 60], [30, 100]], [[20, 40], [100, 40]], null)
};