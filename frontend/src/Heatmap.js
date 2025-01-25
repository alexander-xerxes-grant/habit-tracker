import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { createRippleEffect } from './animation-utils';

const Heatmap = ({ completedDates, onCompleteDay }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const CELL_SIZE = 15;
  const CELL_PADDING = 2;
  const MONTH_LABEL_HEIGHT = 20;
  const DAYS_IN_WEEK = 7;

  const handleDayClick = useCallback((event, d) => {
    if (d <= new Date() && !isAnimating) {
      setIsAnimating(true);
      createRippleEffect(
        event.currentTarget,
        d3.selectAll('.day'),
        () => {
          onCompleteDay(d);
          setIsAnimating(false);
        }
      );
    }
  }, [onCompleteDay, isAnimating]);

  const createTooltip = useCallback(() => {
    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '14px',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.2s',
      zIndex: '1000'
    });
    document.body.appendChild(tooltip);
    return tooltip;
  }, []);

  const handleMouseOver = useCallback((event, d) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.opacity = '1';
    tooltipRef.current.style.left = `${event.pageX + 10}px`;
    tooltipRef.current.style.top = `${event.pageY - 25}px`;
    tooltipRef.current.textContent = d.toDateString();
  }, []);

  const handleMouseOut = useCallback(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.opacity = '0';
  }, []);

  useEffect(() => {
    if (!tooltipRef.current) {
      tooltipRef.current = createTooltip();
    }

    if (svgRef.current) {
      svgRef.current.innerHTML = '';
    }

    const year = new Date().getFullYear();
    const months = d3.timeMonths(
      new Date(year, 0, 1),
      new Date(year + 1, 0, 1)
    );

    const width = 53 * (CELL_SIZE + CELL_PADDING);
    const height = DAYS_IN_WEEK * (CELL_SIZE + CELL_PADDING) + MONTH_LABEL_HEIGHT;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const days = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));

    const isDateCompleted = (date) => {
      return completedDates.some(
        (completedDate) =>
          new Date(completedDate).toDateString() === date.toDateString()
      );
    };

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
      .attr('y', (d) => d.getDay() * (CELL_SIZE + CELL_PADDING))
      .attr('fill', (d) => (isDateCompleted(d) ? '#ba6306' : '#ebedf0'))
      .on('click', handleDayClick)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

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

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [completedDates, handleDayClick, handleMouseOver, handleMouseOut, createTooltip]);

  return (
    <div className="heatmap-container w-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default Heatmap;