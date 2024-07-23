import { Shape } from '../interface';

export const drawRectangle = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  if (shape.text) {
    drawShapeText(ctx, shape);
  }
};

export const drawCircle = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.beginPath();
  ctx.arc(
    shape.x + shape.width / 2,
    shape.y + shape.height / 2,
    shape.width / 2,
    0,
    2 * Math.PI
  );
  ctx.stroke();
  if (shape.text) {
    drawShapeText(ctx, shape);
  }
};

export const drawText = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.font = "16px Arial";
  ctx.fillStyle = shape.color;
  ctx.fillText(shape.text || "", shape.x, shape.y + 20);
};

export const drawFreehand = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  if (shape.points && shape.points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
};

export const drawShapeText = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.font = "14px Arial";
  ctx.fillStyle = shape.color;
  const textWidth = ctx.measureText(shape.text || "").width;
  const textX = shape.x + (shape.width - textWidth) / 2;
  const textY = shape.y + shape.height / 2;
  ctx.fillText(shape.text || "", textX, textY);
};
