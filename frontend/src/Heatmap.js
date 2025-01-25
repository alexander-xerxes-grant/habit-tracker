// src/Heatmap.js

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  createRippleEffect,
  createTooltip,
  updateTooltipPosition,
  ANIMATION_CONSTANTS,
} from './animation-utils';

/**
 * Heatmap Component
 * Displays a year-view calendar heatmap showing completed dates with animations
 *
 * @param {Array} completedDates - Array of dates when the habit was completed
 * @param {Function} onCompleteDay - Callback function when a day is marked complete
 */
const Heatmap = ({ completedDates, onCompleteDay }) => {
  // Reference to SVG element for D3 manipulations
  const svgRef = useRef(null);
  // Reference to tooltip element for position updates
  const tooltipRef = useRef(null);
  // State to prevent multiple animations from running simultaneously
  const [isAnimating, setIsAnimating] = useState(false);
  const isHovering = useRef(false);

  // Visual configuration constants
  const CELL_SIZE = 15; // Size of each day square
  const CELL_PADDING = 2; // Space between squares
  const MONTH_LABEL_HEIGHT = 20; // Space for month labels
  const DAYS_IN_WEEK = 7; // For calculating vertical layout

  // Handler for clicking on a day square
  const handleDayClick = useCallback((event, d) => {
    if (d <= new Date() && !isAnimating) {
      setIsAnimating(true);
      const allSquares = d3.selectAll('.day');
      
      createRippleEffect(
        event.currentTarget,
        allSquares,
        {
          ...ANIMATION_CONSTANTS,
          CLICK_DURATION: 1000  // Ensure this matches your desired duration
        },
        {
          onComplete: () => {
            // Ensure we're updating state and calling the callback
            onCompleteDay(d);
            setIsAnimating(false);
          }
        }
      );
    }
  }, [onCompleteDay, isAnimating]);

  // Handler for hovering over a day square
  const handleMouseOver = useCallback(
    (event, d) => {
      // Only proceed if we have a tooltip and aren't already hovering
      if (tooltipRef.current && !isHovering.current) {
        isHovering.current = true;

        updateTooltipPosition(tooltipRef.current, event, d.toDateString());

        if (!isAnimating) {
          const allSquares = d3.selectAll('.day');

          // Clean up any existing animations first
          allSquares.each(function () {
            d3.select(this).interrupt();
          });

          // Create a gentler ripple effect for hover
          createRippleEffect(event.currentTarget, allSquares, {
            ...ANIMATION_CONSTANTS,
            WAVE_SCALE: 1.05, // Subtle scale effect
            MAX_WAVE_DISTANCE: 50, // Limited spread
            WAVE_SPEED: 75, // Faster animation
            HOVER_DURATION: 300, // Shorter duration for hover
          });
        }
      }
    },
    [isAnimating]
  );

  const handleMouseOut = useCallback(() => {
    // Just reset hover state and tooltip
    isHovering.current = false;
    
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
      tooltipRef.current.style.transform = 'scale(0.8)';
    }
  }, []);

  // Main effect for setting up the heatmap visualization
  useEffect(() => {
    // Initialize tooltip if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
    }

    // Clear existing content for clean re-render
    if (svgRef.current) {
      svgRef.current.innerHTML = '';
    }

    // Calculate the date ranges for the current year
    const year = new Date().getFullYear();
    const months = d3.timeMonths(
      new Date(year, 0, 1),
      new Date(year + 1, 0, 1)
    );

    // Calculate SVG dimensions based on grid layout
    const width = 53 * (CELL_SIZE + CELL_PADDING); // 53 weeks maximum
    const height =
      DAYS_IN_WEEK * (CELL_SIZE + CELL_PADDING) + MONTH_LABEL_HEIGHT;

    // Create and configure the main SVG element
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Generate array of all days in the year
    const days = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));

    // Helper function to check if a date has been completed
    const isDateCompleted = (date) => {
      return completedDates.some(
        (completedDate) =>
          new Date(completedDate).toDateString() === date.toDateString()
      );
    };

    // Create the day squares
    svg
      .selectAll('.day')
      .data(days)
      .enter()
      .append('rect')
      .attr('class', 'day')
      .attr('width', CELL_SIZE)
      .attr('height', CELL_SIZE)
      .attr('rx', 2) // Rounded corners
      .attr('ry', 2)
      .attr('x', (d) => {
        const weekNum = d3.timeWeek.count(d3.timeYear(d), d);
        return weekNum * (CELL_SIZE + CELL_PADDING);
      })
      .attr('y', (d) => d.getDay() * (CELL_SIZE + CELL_PADDING))
      .attr('fill', (d) => (isDateCompleted(d) ? '#ba6306' : '#ebedf0'))
      .on('click', handleDayClick)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    // Add month labels at the bottom
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

    // Cleanup function to remove tooltip when component unmounts
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [completedDates, handleDayClick, handleMouseOver, handleMouseOut]);

  // Render the component
  return (
    <div className="heatmap-container w-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default Heatmap;
