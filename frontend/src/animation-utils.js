import * as d3 from 'd3';

const ANIMATION_CONFIGS = {
  RIPPLE_DURATION: 1500,
  RIPPLE_RADIUS: 6,
  SCALE_FACTOR: 1.3,
  BASE_CELL_SIZE: 15,
  CELL_PADDING: 2,
};

const getDistance = (source, target) => {
  const weekDiff = d3.timeWeek.count(d3.timeYear(source), source) - 
                   d3.timeWeek.count(d3.timeYear(target), target);
  const dayDiff = source.getDay() - target.getDay();
  return Math.sqrt(weekDiff * weekDiff + dayDiff * dayDiff);
};

const getBasePosition = (date) => {
  const weekNum = d3.timeWeek.count(d3.timeYear(date), date);
  return {
    x: weekNum * (ANIMATION_CONFIGS.BASE_CELL_SIZE + ANIMATION_CONFIGS.CELL_PADDING),
    y: date.getDay() * (ANIMATION_CONFIGS.BASE_CELL_SIZE + ANIMATION_CONFIGS.CELL_PADDING)
  };
};

export const createRippleEffect = (clickedElement, allSquares, onComplete) => {
  const sourceDate = d3.select(clickedElement).datum();
  let animatingSquares = new Set();

  allSquares.each(function() {
    const square = d3.select(this);
    square.interrupt();
    const basePos = getBasePosition(square.datum());
    square
      .attr('width', ANIMATION_CONFIGS.BASE_CELL_SIZE)
      .attr('height', ANIMATION_CONFIGS.BASE_CELL_SIZE)
      .attr('x', basePos.x)
      .attr('y', basePos.y);
  });

  allSquares.each(function(targetDate) {
    const square = d3.select(this);
    const distance = getDistance(sourceDate, targetDate);
    
    if (distance <= ANIMATION_CONFIGS.RIPPLE_RADIUS) {
      animatingSquares.add(this);
      const delay = distance * 150;
      const intensity = 1 - (distance / ANIMATION_CONFIGS.RIPPLE_RADIUS);
      const scale = 1 + (ANIMATION_CONFIGS.SCALE_FACTOR - 1) * intensity;
      
      const basePos = getBasePosition(targetDate);
      const growAmount = ANIMATION_CONFIGS.BASE_CELL_SIZE * (scale - 1);
      const originalColor = square.attr('fill');
      const pulseColor = originalColor === '#ba6306' ? '#cf7311' : '#d3d5d8';

      square
        .transition()
        .delay(delay)
        .duration(ANIMATION_CONFIGS.RIPPLE_DURATION / 2)
        .attr('width', ANIMATION_CONFIGS.BASE_CELL_SIZE * scale)
        .attr('height', ANIMATION_CONFIGS.BASE_CELL_SIZE * scale)
        .attr('x', basePos.x - growAmount / 2)
        .attr('y', basePos.y - growAmount / 2)
        .attr('fill', pulseColor)
        .transition()
        .duration(ANIMATION_CONFIGS.RIPPLE_DURATION / 2)
        .attr('width', ANIMATION_CONFIGS.BASE_CELL_SIZE)
        .attr('height', ANIMATION_CONFIGS.BASE_CELL_SIZE)
        .attr('x', basePos.x)
        .attr('y', basePos.y)
        .attr('fill', originalColor)
        .on('end', function() {
          animatingSquares.delete(this);
          if (animatingSquares.size === 0) {
            onComplete();
          }
        });
    }
  });
};