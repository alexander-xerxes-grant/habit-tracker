import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Heatmap = () => {
  const heatmapRef = useRef(null);

  useEffect(() => {
    const container = d3.select(heatmapRef.current);
    container.selectAll('*').remove();

    const squareSize = 15;
    const padding = 2;
    const monthPadding = 15;
    const daysInWeek = 7;
    
    // Calculate month data including first day of week
    const months = Array.from({ length: 12 }, (_, i) => {
      const firstDay = new Date(2025, i, 1);
      const lastDay = new Date(2025, i + 1, 0);
      return {
        name: firstDay.toLocaleString('default', { month: 'short' }),
        days: lastDay.getDate(),
        firstDayOfWeek: firstDay.getDay(),
        startDay: Math.floor((firstDay - new Date(2025, 0, 1)) / (1000 * 60 * 60 * 24))
      };
    });

    console.log();

    // Calculate total width including month padding
    const totalWeeks = months.reduce((acc, month) => {
      return acc + Math.ceil((month.firstDayOfWeek + month.days) / 7);
    }, 0);
    
    const width = (totalWeeks * (squareSize + padding)) + (11 * monthPadding);
    const height = daysInWeek * (squareSize + padding);

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height + 30);

    const today = new Date();
    const yearStart = new Date(2025, 0, 1);
    const dayIndex = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24));

    // Calculate position considering month alignment
    const getPosition = (dayNumber) => {
      let monthIndex = 0;
      let daysAccumulated = 0;
      let monthsBeforeCurrent = 0;
      
      // Find current month
      while (monthIndex < months.length && daysAccumulated + months[monthIndex].days <= dayNumber) {
        daysAccumulated += months[monthIndex].days;
        monthsBeforeCurrent++;
        monthIndex++;
      }
      
      const currentMonth = months[monthIndex];
      const dayInMonth = dayNumber - daysAccumulated;
      const monthStartOffset = currentMonth.firstDayOfWeek;
      const adjustedDay = monthStartOffset + dayInMonth;
      
      // Calculate weeks for previous months
      let previousWeeks = 0;
      for (let i = 0; i < monthIndex; i++) {
        previousWeeks += Math.ceil((months[i].firstDayOfWeek + months[i].days) / 7);
      }
      
      const currentWeek = Math.floor(adjustedDay / 7);
      const dayOfWeek = adjustedDay % 7;
      
      return {
        x: (previousWeeks + currentWeek) * (squareSize + padding) + (monthsBeforeCurrent * monthPadding),
        y: dayOfWeek * (squareSize + padding)
      };
    };

    // Create day squares
    const daysInYear = 365;
    const data = Array.from({ length: daysInYear }, (_, i) => ({
      day: i,
      completed: false,
    }));

    svg
      .selectAll('.day-square')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'day-square')
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('x', d => getPosition(d.day).x)
      .attr('y', d => getPosition(d.day).y)
      .attr('fill', d => {
        if (d.day < dayIndex) return 'rgba(0, 0, 0, 0.2)';  // This line
        if (d.day === dayIndex) return 'rgba(0, 0, 0, 0.5)';
        return 'rgba(0, 0, 0, 0.05)';
      })
      .attr('stroke', d => (d.day === dayIndex ? 'red' : 'none'))
      .attr('stroke-width', d => (d.day === dayIndex ? 2 : 0))
      .on("click", function(event, d) {
        if (d.day > dayIndex) return;
        d.completed = !d.completed;
        d3.select(this).attr("fill", d.completed ? '#ba6306' : 'rgba(0, 0, 0, 0.2)'); // Change '#ebedf0' to 'rgba(0, 0, 0, 0.2)'
      })
      .on('mouseover', function() {
        tooltip.style("opacity", 1);
      })
      .on('mousemove', function(event, d) {
        const date = new Date(2025, 0, d.day + 1);
        tooltip
          .html(`<strong>Date:</strong> ${date.toDateString()}<br/>`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on('mouseleave', function() {
        tooltip.style("opacity", 0);
      });

    // Add month labels and separators
    let currentX = 0;
    months.forEach((month, i) => {
      const monthWeeks = Math.ceil((month.firstDayOfWeek + month.days) / 7);
      const monthWidth = monthWeeks * (squareSize + padding);
      
      svg
        .append('text')
        .attr('x', currentX + (monthWidth / 2))
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#6b7280')
        .text(month.name);
      
      if (i < months.length - 1) {
        svg
          .attr('x1', currentX + monthWidth + (monthPadding / 2))
          .attr('x2', currentX + monthWidth + (monthPadding / 2))
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', '#6b7280')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4');
      }
      
      currentX += monthWidth + monthPadding;
    });

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded shadow">
      <div ref={heatmapRef} className="heatmap-container"></div>
    </div>
  );
};

export default Heatmap;