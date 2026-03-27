import { useState } from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setIsVisible(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const updatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top;

    if (position === 'bottom') {
      y = rect.bottom;
    } else if (position === 'left') {
      x = rect.left;
      y = rect.top + rect.height / 2;
    } else if (position === 'right') {
      x = rect.right;
      y = rect.top + rect.height / 2;
    }

    setCoords({ x, y });
  };

  const getTooltipStyle = () => {
    const offset = 10;
    let style = { left: coords.x, top: coords.y };

    if (position === 'top') {
      style.transform = 'translate(-50%, calc(-100% - ' + offset + 'px))';
    } else if (position === 'bottom') {
      style.transform = 'translate(-50%, ' + offset + 'px)';
    } else if (position === 'left') {
      style.transform = 'translate(calc(-100% - ' + offset + 'px), -50%)';
    } else if (position === 'right') {
      style.transform = 'translate(' + offset + 'px, -50%)';
    }

    return style;
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && content && (
        <div className="tooltip" style={getTooltipStyle()}>
          {content}
        </div>
      )}
    </>
  );
}
