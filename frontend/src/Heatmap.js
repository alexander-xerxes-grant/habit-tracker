import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ habitId, completedDates, onCompleteDay }) => {
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
        startDay: Math.floor(
          (firstDay - new Date(2025, 0, 1)) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Calculate total width including month padding
    const totalWeeks = months.reduce((acc, month) => {
      return acc + Math.ceil((month.firstDayOfWeek + month.days) / 7);
    }, 0);

    const width = totalWeeks * (squareSize + padding) + 11 * monthPadding;
    const height = daysInWeek * (squareSize + padding);

    // Append SVG
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height + 30);

    // Calculate "today" for reference
    const today = new Date();
    const yearStart = new Date(2025, 0, 1);
    let dayIndex = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24));
    // Make sure dayIndex isn't negative
    if (dayIndex < 0) dayIndex = 0;

    // We'll also define a "nowDayNumber" for comparing to each square
    const nowDayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

    // A helper to compute X/Y positions of each day
    const getPosition = (dayNumber) => {
      let monthIndex = 0;
      let daysAccumulated = 0;
      let monthsBeforeCurrent = 0;

      while (
        monthIndex < months.length &&
        daysAccumulated + months[monthIndex].days <= dayNumber
      ) {
        daysAccumulated += months[monthIndex].days;
        monthsBeforeCurrent++;
        monthIndex++;
      }

      const currentMonth = months[monthIndex];
      const dayInMonth = dayNumber - daysAccumulated;
      const monthStartOffset = currentMonth.firstDayOfWeek;
      const adjustedDay = monthStartOffset + dayInMonth;

      let previousWeeks = 0;
      for (let i = 0; i < monthIndex; i++) {
        previousWeeks += Math.ceil(
          (months[i].firstDayOfWeek + months[i].days) / 7
        );
      }

      const currentWeek = Math.floor(adjustedDay / 7);
      const dayOfWeek = adjustedDay % 7;

      return {
        x:
          (previousWeeks + currentWeek) * (squareSize + padding) +
          monthsBeforeCurrent * monthPadding,
        y: dayOfWeek * (squareSize + padding),
      };
    };

    // Create day squares for the entire year (0..364)
    const daysInYear = 365;
    const data = Array.from({ length: daysInYear }, (_, i) => ({
      day: i,
      completed: false,
    }));

    // Convert completedDates to "day numbers"
    const completedDayNumbers = completedDates.map((dateStr) => {
      const dt = new Date(dateStr);
      return Math.floor(dt.getTime() / 86400000);
    });

    // Create a tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Draw the squares
    svg
      .selectAll('.day-square')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'day-square')
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('x', (d) => getPosition(d.day).x)
      .attr('y', (d) => getPosition(d.day).y)

      // Decide fill color
      .attr('fill', (d) => {
        const thisSquareDate = new Date(2025, 0, d.day + 1);
        const thisSquareDayNumber = Math.floor(
          thisSquareDate.getTime() / 86400000
        );

        const isCompleted = completedDayNumbers.includes(thisSquareDayNumber);

        // 1) If thisSquareDayNumber is in the future, make it very light
        if (thisSquareDayNumber > nowDayNumber) {
          return 'rgba(0, 0, 0, 0.05)'; // Future
        }
        // 2) If it's in the past or today but not completed, use a grey color
        if (!isCompleted) {
          return 'rgba(0, 0, 0, 0.2)'; // Past/Today uncompleted
        }
        // 3) If it's completed, color it a distinct color
        return '#ba6306'; // Completed
      })

      // Stroke if it's "today"
      .attr('stroke', (d) => {
        const thisSquareDate = new Date(2025, 0, d.day + 1);
        const thisSquareDayNumber = Math.floor(
          thisSquareDate.getTime() / 86400000
        );
        return thisSquareDayNumber === nowDayNumber ? 'red' : 'none';
      })
      .attr('stroke-width', (d) => {
        const thisSquareDate = new Date(2025, 0, d.day + 1);
        const thisSquareDayNumber = Math.floor(
          thisSquareDate.getTime() / 86400000
        );
        return thisSquareDayNumber === nowDayNumber ? 2 : 0;
      })

      // Click event
      .on('click', function (event, d) {
        // 1) Convert the day index to an actual date
        const clickedDate = new Date(2025, 0, d.day + 1);
        const clickedDayNumber = Math.floor(clickedDate.getTime() / 86400000);

        // 2) If this day is in the future, do nothing
        if (clickedDayNumber > nowDayNumber) {
          return;
        }

        // 3) Otherwise, call parent callback to mark it completed
        onCompleteDay(clickedDate);

        // Optional immediate fill change
        d3.select(this).attr('fill', '#ba6306');

        tooltip
          .style('opacity', 0)
          .style('left', '-9999px')
          .style('top', '-9999px');
      })

      // Mouse hover events
      .on('mouseover', function () {
        tooltip.style('opacity', 1);
      })
      .on('mousemove', function (event, d) {
        const date = new Date(2025, 0, d.day + 1);
        tooltip
          .html(`<strong>Date:</strong> ${date.toDateString()}<br/>`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 20 + 'px');
      })
      // Updated "mouseleave" to forcibly hide the tooltip
      .on('mouseleave', function () {
        tooltip
          .style('opacity', 0)
          .style('left', '-9999px')
          .style('top', '-9999px');
      });

    // Add month labels
    let currentX = 0;
    months.forEach((month, i) => {
      const monthWeeks = Math.ceil((month.firstDayOfWeek + month.days) / 7);
      const monthWidth = monthWeeks * (squareSize + padding);

      svg
        .append('text')
        .attr('x', currentX + monthWidth / 2)
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#6b7280')
        .text(month.name);

      // optional: add lines between months if you want them
      if (i < months.length - 1) {
        // You might need to create a line, not set x1 on the svg itself
        // so let’s skip for clarity or adjust it properly.
      }

      currentX += monthWidth + monthPadding;
    });

  }, [completedDates]); // re-run whenever completedDates changes

  return (
    <div className="p-4 bg-gray-100 rounded shadow">
      <div ref={heatmapRef} className="heatmap-container"></div>
    </div>
  );
};

export default Heatmap;
