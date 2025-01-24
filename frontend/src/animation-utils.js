import * as d3 from 'd3';

export const ANIMATION_CONSTANTS = {
  WAVE_SPEED: 200, // Controls how quickly the ripple spreads
  MAX_WAVE_DISTANCE: 100, // How far the ripple effect reaches
  WAVE_SCALE: 1.15, // How much squares grow during animation
  WAVE_DECAY: 0.85, // How quickly the effect diminishes with distance
  HOVER_DURATION: 1000, // How long hover animations last
  CLICK_DURATION: 1000, // How long click animations last
};

export const calculateDistance = (square1, square2) => {
  const x1 = d3.timeWeek.count(d3.timeYear(square1), square1);
  const y1 = square1.getDay();
  const x2 = d3.timeWeek.count(d3.timeYear(square2), square2);
  const y2 = square2.getDay();

  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const createRippleEffect = (
  targetElement,
  allElements,
  config = ANIMATION_CONSTANTS,
  { onComplete = () => {} } = {}
) => {
  const targetD3 = d3.select(targetElement);
  const targetDate = targetD3.datum();

  // Animate all surrounding squares
  allElements.each(function (squareDate) {
    if (this !== targetElement) {
      const square = d3.select(this);
      const distance = calculateDistance(targetDate, squareDate);

      if (distance <= config.MAX_WAVE_DISTANCE) {
        const delay = distance * config.WAVE_SPEED;
        const scaleAmount =
          config.WAVE_SCALE * Math.pow(config.WAVE_DECAY, distance);

        animateSquare(square, scaleAmount, delay, config.HOVER_DURATION);
      }
    }
  });

  // Animate the clicked/hovered square
  const clickAnimation = animateSquare(
    targetD3,
    config.WAVE_SCALE * 1.2,
    0,
    config.CLICK_DURATION
  );

  clickAnimation.on('end', onComplete);
  return clickAnimation;
};


// Handle the animation of individual squares
const animateSquare = (square, scale, delay, duration) => {
    // Store the original dimensions and position
  // Store the original dimensions and position
  const originalWidth = parseFloat(square.attr('width'));
  const originalHeight = parseFloat(square.attr('height'));
  const originalX = parseFloat(square.attr('x'));
  const originalY = parseFloat(square.attr('y'));
  const originalColor = square.attr('fill');
  
  // Determine colors for the animation
  const isSquareFilled = originalColor === '#ba6306';
  const pulseColor = isSquareFilled ? '#ba6306' : '#cf7311';

  // Create a two-part animation: scale up, then scale down
  return square
    .transition()
    .delay(delay)
    .duration(duration / 2)
    // First half: scale up and change color
    .attr('width', originalWidth * scale)
    .attr('height', originalHeight * scale)
    .attr('x', originalX - (originalWidth * (scale - 1)) / 2)
    .attr('y', originalY - (originalHeight * (scale - 1)) / 2)
    .attr('fill', pulseColor)
    // Second half: return to original size and color
    .transition()
    .duration(duration / 2)
    .attr('width', originalWidth)
    .attr('height', originalHeight)
    .attr('x', originalX)
    .attr('y', originalY)
    .attr('fill', originalColor);
};

// This function creates and styles our tooltip
export const createTooltip = () => {
  const tooltip = document.createElement('div');
  
  // Apply styles to make the tooltip look and behave properly
  Object.assign(tooltip.style, {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '14px',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'all 0.2s ease-in-out',
    zIndex: '1000'
  });
  
  document.body.appendChild(tooltip);
  return tooltip;
};

// This function handles tooltip positioning and content updates
export const updateTooltipPosition = (tooltip, event, content) => {
  const OFFSET_X = 10;  // Offset from cursor to prevent flickering
  const OFFSET_Y = -25;
  
  tooltip.style.opacity = '1';
  tooltip.style.left = `${event.pageX + OFFSET_X}px`;
  tooltip.style.top = `${event.pageY + OFFSET_Y}px`;
  tooltip.textContent = content;
  tooltip.style.transform = 'scale(1)';
};
