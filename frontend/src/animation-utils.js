import * as d3 from 'd3';

export const ANIMATION_CONSTANTS = {
  WAVE_SPEED: 200, // Controls how quickly the ripple spreads
  MAX_WAVE_DISTANCE: 100, // How far the ripple effect reaches
  WAVE_SCALE: 1.15, // How much squares grow during animation
  WAVE_DECAY: 0.85, // How quickly the effect diminishes with distance
  HOVER_DURATION: 1000, // How long hover animations last
  CLICK_DURATION: 1000, // How long click animations last
  CELL_SIZE: 15, // Size of each day square
  CELL_PADDING: 2, // Space between squares
};

const resetElementState = (element) => {
  const baseWidth = ANIMATION_CONSTANTS.CELL_SIZE;
  const baseHeight = ANIMATION_CONSTANTS.CELL_SIZE;

  // Calculate the original grid position
  const weekNum = d3.timeWeek.count(d3.timeYear(element.datum()), element.datum());
  const dayOfWeek = element.datum().getDay();
  const baseX = weekNum * (baseWidth + ANIMATION_CONSTANTS.CELL_PADDING);
  const baseY = dayOfWeek * (baseHeight + ANIMATION_CONSTANTS.CELL_PADDING);

  // Immediately reset to base state
  element
    .interrupt() // Stop any ongoing transitions
    .attr('width', baseWidth)
    .attr('height', baseHeight)
    .attr('x', baseX)
    .attr('y', baseY);
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
    
    // We'll track animations to ensure proper completion
    let activeAnimations = 0;
    let animationsComplete = 0;
    
    const checkAllComplete = () => {
      animationsComplete++;
      // Only trigger onComplete when all animations finish
      if (animationsComplete >= activeAnimations) {
        onComplete();
      }
    };
  
    // Animate surrounding squares
    allElements.each(function(squareDate) {
      if (this !== targetElement) {
        const square = d3.select(this);
        const distance = calculateDistance(targetDate, squareDate);
        
        if (distance <= config.MAX_WAVE_DISTANCE) {
          activeAnimations++;
          const delay = distance * config.WAVE_SPEED;
          const scaleAmount = config.WAVE_SCALE * Math.pow(config.WAVE_DECAY, distance);
          
          // Each animation contributes to completion tracking
          animateSquare(square, scaleAmount, delay, config.HOVER_DURATION)
            .on('end', checkAllComplete);
        }
      }
    });
  
    // Handle the target square
    activeAnimations++;
    return animateSquare(
      targetD3, 
      config.WAVE_SCALE * 1.2, 
      0, 
      config.CLICK_DURATION
    ).on('end', checkAllComplete);
  };

const animateSquare = (square, scale, delay, duration) => {
  // First, interrupt any ongoing transitions and reset state
  resetElementState(square);

  // Calculate base dimensions and position
  const baseWidth = ANIMATION_CONSTANTS.CELL_SIZE;
  const baseHeight = ANIMATION_CONSTANTS.CELL_SIZE;
  const weekNum = d3.timeWeek.count(
    d3.timeYear(square.datum()),
    square.datum()
  );
  const dayOfWeek = square.datum().getDay();
  const baseX = weekNum * (baseWidth + ANIMATION_CONSTANTS.CELL_PADDING);
  const baseY = dayOfWeek * (baseHeight + ANIMATION_CONSTANTS.CELL_PADDING);

  const originalColor = square.attr('fill');
  const isSquareFilled = originalColor === '#ba6306';
  const pulseColor = isSquareFilled ? '#ba6306' : '#cf7311';

  return square
    .transition()
    .delay(delay)
    .duration(duration / 2)
    .attr('width', baseWidth * scale)
    .attr('height', baseHeight * scale)
    .attr('x', baseX - (baseWidth * (scale - 1)) / 2)
    .attr('y', baseY - (baseHeight * (scale - 1)) / 2)
    .attr('fill', pulseColor)
    .transition()
    .duration(duration / 2)
    .attr('width', baseWidth)
    .attr('height', baseHeight)
    .attr('x', baseX)
    .attr('y', baseY)
    .attr('fill', originalColor)
    .on('interrupt', function () {
      // If interrupted, reset to base state
      resetElementState(d3.select(this));
    });
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
    zIndex: '1000',
  });

  document.body.appendChild(tooltip);
  return tooltip;
};

// This function handles tooltip positioning and content updates
export const updateTooltipPosition = (tooltip, event, content) => {
  const OFFSET_X = 10; // Offset from cursor to prevent flickering
  const OFFSET_Y = -25;

  tooltip.style.opacity = '1';
  tooltip.style.left = `${event.pageX + OFFSET_X}px`;
  tooltip.style.top = `${event.pageY + OFFSET_Y}px`;
  tooltip.textContent = content;
  tooltip.style.transform = 'scale(1)';
};
