import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ completedDates, onCompleteDay }) => {
  // References for SVG container and tooltip
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  // Configuration constants
  const CELL_SIZE = 15;
  const CELL_PADDING = 2;
  const MONTH_LABEL_HEIGHT = 20;
  const DAYS_IN_WEEK = 7;

  const WAVE_SPEED = 125;
  const MAX_WAVE_DISTANCE = 100;
  const WAVE_SCALE = 1.15;
  const WAVE_DECAY = 0.85;

  const calculateDistance = (square1, square2) => {
    // Get center points of squares in grid coordinates
    const x1 = d3.timeWeek.count(d3.timeYear(square1), square1);
    const y1 = square1.getDay();
    const x2 = d3.timeWeek.count(d3.timeYear(square2), square2);
    const y2 = square2.getDay();

    // Use standard distance formula but weighted to account for grid spacing
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  useEffect(() => {
    // Clear previous content
    if (svgRef.current) {
      svgRef.current.innerHTML = '';
    }

    // Create tooltip if it doesn't exist
    if (!tooltip) {
      const newTooltip = document.createElement('div');
      newTooltip.style.position = 'absolute';
      newTooltip.style.backgroundColor = 'white';
      newTooltip.style.padding = '5px';
      newTooltip.style.border = '1px solid #ccc';
      newTooltip.style.borderRadius = '4px';
      newTooltip.style.pointerEvents = 'none';
      newTooltip.style.opacity = '0';
      document.body.appendChild(newTooltip);
      setTooltip(newTooltip);
    }

    // Calculate the year's data
    const year = new Date().getFullYear();
    const months = d3.timeMonths(
      new Date(year, 0, 1),
      new Date(year + 1, 0, 1)
    );

    // Calculate dimensions
    const width = 53 * (CELL_SIZE + CELL_PADDING); // 53 weeks max in a year
    const height =
      DAYS_IN_WEEK * (CELL_SIZE + CELL_PADDING) + MONTH_LABEL_HEIGHT;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Create date squares
    const days = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));

    // Helper function to check if a date is completed
    const isDateCompleted = (date) => {
      const result = completedDates.some((completedDate) => {
        const completedDateObj = new Date(completedDate);
        const isCompleted =
          completedDateObj.toDateString() === date.toDateString();
        if (isCompleted) {
          console.log('Found completed date:', {
            input: date.toDateString(),
            matched: completedDateObj.toDateString(),
            originalValue: completedDate,
          });
        }
        return isCompleted;
      });
      return result;
    };

    // Add day cells
    svg
      .selectAll('.day')
      .data(days)
      .enter()
      .append('rect')
      .attr('class', 'day')
      .attr('width', CELL_SIZE)
      .attr('height', CELL_SIZE)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('x', (d) => {
        const weekNum = d3.timeWeek.count(d3.timeYear(d), d);
        return weekNum * (CELL_SIZE + CELL_PADDING);
      })
      .attr('y', (d) => {
        return d.getDay() * (CELL_SIZE + CELL_PADDING);
      })
      .attr('fill', (d) => (isDateCompleted(d) ? '#ba6306' : '#ebedf0'))
      .attr('transform-origin', (d) => {
        const weekNum = d3.timeWeek.count(d3.timeYear(d), d);
        const x = weekNum * (CELL_SIZE + CELL_PADDING) + CELL_SIZE / 2;
        const y = d.getDay() * (CELL_SIZE + CELL_PADDING) + CELL_SIZE / 2;
        return `${x} ${y}`;
      })
      .on('click', (event, d) => {
        if (d <= new Date()) {
          svg.selectAll('.day').each(function (squareDate) {
            // Changed to regular function
            const currentElement = this; // Store reference to current DOM element
            if (currentElement !== event.currentTarget) {
              // Compare actual DOM elements
              const square = d3.select(currentElement); // Select using stored reference
              const distance = calculateDistance(d, squareDate);

              if (distance <= MAX_WAVE_DISTANCE) {
                const delay = distance * WAVE_SPEED;
                const scaleAmount = WAVE_SCALE * Math.pow(WAVE_DECAY, distance);

                const squareWidth = CELL_SIZE;
                const squareHeight = CELL_SIZE;
                const squareX = parseFloat(square.attr('x'));
                const squareY = parseFloat(square.attr('y'));

                // Get current fill colour to determine animation colour
                const isSquareFilled = square.attr('fill') === '#ba6306';
                const originalColor = square.attr('fill');

                // Pulse the square
                const pulseColor = isSquareFilled ? '#ba6306' : '#cf7311';

                square
                  .transition()
                  .delay(delay)
                  .duration(300)
                  .attr('width', squareWidth * scaleAmount)
                  .attr('height', squareHeight * scaleAmount)
                  .attr('x', squareX - (squareWidth * (scaleAmount - 1)) / 2)
                  .attr('y', squareY - (squareHeight * (scaleAmount - 1)) / 2)
                  .attr('fill', pulseColor)
                  .transition()
                  .duration(300)
                  .attr('width', squareWidth)
                  .attr('height', squareHeight)
                  .attr('x', squareX)
                  .attr('y', squareY)
                  .attr('fill', originalColor);
              }
            }
          });

          const clickedSquare = d3.select(event.currentTarget);
          const originalWidth = CELL_SIZE;
          const originalHeight = CELL_SIZE;
          const originalX = parseFloat(clickedSquare.attr('x'));
          const originalY = parseFloat(clickedSquare.attr('y'));

          // Determine if the square is currently filled
          const isCurrentlyFilled = clickedSquare.attr('fill') === '#ba6306';

          if (!isCurrentlyFilled) {
            // Case 1: Square is empty - fill immediately then pulse
            clickedSquare.attr('fill', '#ba6306');
            clickedSquare
              .transition()
              .duration(1000)
              .attr('width', originalWidth * 1.2)
              .attr('height', originalHeight * 1.2)
              .attr('x', originalX - originalWidth * 0.1)
              .attr('y', originalY - originalHeight * 0.1)
              .transition()
              .duration(1000)
              .attr('width', originalWidth)
              .attr('height', originalHeight)
              .attr('x', originalX)
              .attr('y', originalY)
              .on('end', () => {
                onCompleteDay(d);
              });
          } else {
            // Case 2: Square is filled - pulse while filled, then empty
            clickedSquare
              .transition()
              .duration(1000)
              .attr('width', originalWidth * 1.2)
              .attr('height', originalHeight * 1.2)
              .attr('x', originalX - originalWidth * 0.1)
              .attr('y', originalY - originalHeight * 0.1)
              .transition()
              .duration(1000)
              .attr('width', originalWidth)
              .attr('height', originalHeight)
              .attr('x', originalX)
              .attr('y', originalY)
              .on('end', () => {
                // Only change color after animation completes
                clickedSquare.attr('fill', '#ebedf0');
                onCompleteDay(d);
              });
          }
        }
      })
      .on('mouseover', (event, d) => {
        if (tooltip) {
          tooltip.style.opacity = '1';
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY - 25}px`;
          tooltip.textContent = d.toDateString();
          tooltip.style.transform = 'scale(0.5)';
        }
      })
      .on('mouseout', () => {
        if (tooltip) {
          tooltip.style.opacity = '0';
        }
      });

    // Add month labels
    svg
      .selectAll('.month')
      .data(months)
      .enter()
      .append('text')
      .attr('class', 'month')
      .attr('x', (d) => {
        const weekNum = d3.timeWeek.count(d3.timeYear(d), d);
        return weekNum * (CELL_SIZE + CELL_PADDING);
      })
      .attr('y', height - 5)
      .text((d) => d.toLocaleString('default', { month: 'short' }))
      .attr('font-size', '12px')
      .attr('fill', '#666');

    // Cleanup function
    return () => {
      if (tooltip) {
        tooltip.remove();
        setTooltip(null);
      }
    };
  }, [completedDates, onCompleteDay, tooltip]);

  return (
    <div className="heatmap-container w-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default Heatmap;
