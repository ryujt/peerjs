import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './Whiteboard.css';

const Whiteboard = forwardRef(({ onDraw, isConnected }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen');
  const lastPos = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    handleRemoteDrawing: (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      if (data.action === 'draw') {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
      } else if (data.action === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (data.action === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = data.lineWidth * 2;
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  const startDrawing = (e) => {
    if (!isConnected) return;
    
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e) => {
    if (!isDrawing || !isConnected) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (tool === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      onDraw({
        action: 'draw',
        from: lastPos.current,
        to: currentPos,
        color: currentColor,
        lineWidth: lineWidth
      });
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 2;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      onDraw({
        action: 'erase',
        from: lastPos.current,
        to: currentPos,
        lineWidth: lineWidth
      });
    }

    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!isConnected) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    onDraw({ action: 'clear' });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="tool-group">
          <button
            className={tool === 'pen' ? 'active' : ''}
            onClick={() => setTool('pen')}
            disabled={!isConnected}
          >
            Pen
          </button>
          <button
            className={tool === 'eraser' ? 'active' : ''}
            onClick={() => setTool('eraser')}
            disabled={!isConnected}
          >
            Eraser
          </button>
        </div>

        <div className="tool-group">
          <label>
            Color:
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              disabled={!isConnected || tool === 'eraser'}
            />
          </label>
        </div>

        <div className="tool-group">
          <label>
            Size:
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              disabled={!isConnected}
            />
            <span>{lineWidth}px</span>
          </label>
        </div>

        <div className="tool-group">
          <button onClick={clearCanvas} disabled={!isConnected}>
            Clear
          </button>
          <button onClick={downloadCanvas}>
            Download
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
        {!isConnected && (
          <div className="canvas-overlay">
            <p>Connect to a peer to start drawing</p>
          </div>
        )}
      </div>
    </div>
  );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard;