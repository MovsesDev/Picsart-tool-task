import island from "./assets/img/dream-island.jpg";
import { showSnackbar } from "./utils/snackbar";

const colorDropperButton = document.querySelector(
  ".color-dropper__button"
) as HTMLButtonElement;
const uploadImageInput = document.querySelector(
  ".upload-image__input"
) as HTMLInputElement;
const colorDropperText = document.querySelector(
  ".color-dropper-hex"
) as HTMLParagraphElement;
const canvasWrapper = document.querySelector(
  ".canvas__wrapper"
) as HTMLDivElement;

let image: string = island; // Default image
let img: HTMLImageElement;
let context: CanvasRenderingContext2D | null = null;
const mousePos = { x: 0, y: 0 };
let selectingColor = false;
let borderColor = "";
let hexColor = "";

function updateCanvas() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  context = canvas.getContext("2d");

  img = new Image();
  img.src = image;

  img.onload = function () {
    if (context && canvasWrapper) {
      canvas.width = Math.max(canvasWrapper.clientWidth, img.width);
      canvas.height = Math.max(canvasWrapper.clientHeight, img.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    }
  };
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        image = result;
        updateCanvas();
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleColorDropperClick() {
  selectingColor = true;
}

function handleCanvasClick() {
  if (selectingColor) {
    showSnackbar(hexColor);
    colorDropperText.innerHTML = hexColor;
    colorDropperText.style.color = hexColor;
  }
}

function handleCanvasMouseMove(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  if (selectingColor && context && img) {
    mousePos.x = e.clientX - canvas.getBoundingClientRect().left;
    mousePos.y = e.clientY - canvas.getBoundingClientRect().top;
    const pixelData = context?.getImageData(mousePos.x, mousePos.y, 1, 1).data;

    if (pixelData) {
      const [r, g, b] = pixelData;
      borderColor = `rgb(${r}, ${g}, ${b})`;
      hexColor = rgbToHex(r, g, b);

      updateCursor(canvas, r, g, b);
    }

    draw(canvas);
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function updateCursor(
  canvas: HTMLCanvasElement,
  r: number,
  g: number,
  b: number
) {
  const cursorSize = 12;
  canvas.style.cursor = `url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}'><rect x='0' y='0' width='${cursorSize}' height='${cursorSize}' fill='rgb(${r},${g},${b})' stroke='white' stroke-width='2'/></svg>") ${
    cursorSize / 2
  } ${cursorSize / 2}, auto`;
}

// Draw the magnifier and border
function draw(canvas: HTMLCanvasElement) {
  if (!context || !img) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0);

  drawMagnifier();
  drawBorder();
  drawHexColorText();
}

function drawMagnifier() {
  const zoomSize = 100;
  const zoomFactor = 3;
  const radius = zoomSize / 2;
  const sx = mousePos.x - radius / zoomFactor;
  const sy = mousePos.y - radius / zoomFactor;
  const sw = (radius * 2) / zoomFactor;
  const sh = (radius * 2) / zoomFactor;
  const dx = mousePos.x - radius;
  const dy = mousePos.y - radius;
  const dw = radius * 2;
  const dh = radius * 2;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = zoomSize;
  tempCanvas.height = zoomSize;
  const tempContext = tempCanvas.getContext("2d");

  if (tempContext) {
    tempContext.drawImage(img, sx, sy, sw, sh, 0, 0, zoomSize, zoomSize);
    pixelate(tempContext, zoomSize, 10);
    if (!context) return;
    context.save();
    context.beginPath();
    context.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2, true);
    context.clip();
    context.drawImage(tempCanvas, dx, dy, dw, dh);
    context.restore();
  }
}

function pixelate(
  tempContext: CanvasRenderingContext2D,
  zoomSize: number,
  pixelSize: number
) {
  const imageData = tempContext.getImageData(0, 0, zoomSize, zoomSize);
  for (let y = 0; y < zoomSize; y += pixelSize) {
    for (let x = 0; x < zoomSize; x += pixelSize) {
      const i = (y * zoomSize + x) * 4;
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];

      tempContext.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      tempContext.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}

// Draw the circular border
function drawBorder() {
  if (context) {
    context.beginPath();
    context.arc(mousePos.x, mousePos.y, 50, 0, Math.PI * 2, true);
    context.strokeStyle = borderColor;
    context.lineWidth = 6;
    context.stroke();
    context.closePath();
  }
}

function drawHexColorText() {
  if (context) {
    const padding = 2;
    const textWidth = context.measureText(hexColor).width;
    const textHeight = 16;
    const rectX = mousePos.x - textWidth / 2 - padding;
    const rectY = mousePos.y + 20;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = textHeight + padding * 2;

    context.font = `${textHeight}px Arial`;
    context.fillStyle = "#e0e4e7";
    context.fillRect(rectX, rectY, rectWidth, rectHeight);

    context.fillStyle = borderColor;
    context.fillText(hexColor, mousePos.x - textWidth / 2, mousePos.y + 36);
  }
}

uploadImageInput.addEventListener("change", handleImageUpload);
window.onload = function () {
  updateCanvas();
  colorDropperButton?.addEventListener("click", handleColorDropperClick);

  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  if (canvas) {
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvasWrapper?.addEventListener("wheel", handleCanvasMouseMove); // Add scroll event listener here
  }
};
