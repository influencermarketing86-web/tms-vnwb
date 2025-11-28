import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MAP_NODES, MAP_LINKS, INITIAL_VEHICLES } from '../constants';
import { Vehicle, VehicleStatus } from '../types';

interface FleetVisualizationProps {
  vehicles: Vehicle[];
}

const FleetVisualization: React.FC<FleetVisualizationProps> = ({ vehicles }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    
    // Scale mapping logic
    // Map abstract coords (0-1000) to actual viewbox
    const xScale = d3.scaleLinear().domain([0, 1000]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, 800]).range([50, height - 50]);

    // Draw Links (Roads)
    svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(MAP_LINKS)
      .enter()
      .append("line")
      .attr("x1", d => xScale(MAP_NODES.find(n => n.id === d.source)!.x))
      .attr("y1", d => yScale(MAP_NODES.find(n => n.id === d.source)!.y))
      .attr("x2", d => xScale(MAP_NODES.find(n => n.id === d.target)!.x))
      .attr("y2", d => yScale(MAP_NODES.find(n => n.id === d.target)!.y))
      .attr("stroke", "#334155") // slate-700
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5"); // Dashed roads

    // Draw Nodes (Cities)
    const nodes = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(MAP_NODES)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);

    nodes.append("circle")
      .attr("r", 6)
      .attr("fill", "#0ea5e9") // sky-500
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2);

    nodes.append("text")
      .text(d => d.id)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-weight", "600");

    // Draw Vehicles
    const vehicleGroup = svg.append("g").attr("class", "vehicles");

    const vehicleSelection = vehicleGroup
      .selectAll("g")
      .data(vehicles.filter(v => v.status !== VehicleStatus.MAINTENANCE))
      .enter()
      .append("g")
      .attr("class", "vehicle-node");

    // Vehicle Icon (Simple triangle or circle with pulse)
    vehicleSelection.append("circle")
      .attr("r", 8)
      .attr("fill", d => d.status === VehicleStatus.IN_TRANSIT ? "#10b981" : "#f59e0b") // Green for transit, Amber for idle
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);
    
    // Add vehicle label on hover
    vehicleSelection.append("title")
      .text(d => `${d.name} (${d.status})`);

    // Animation Loop
    // To make it interesting, we'll interpolate positions between nodes for "IN_TRANSIT" vehicles
    // Since we don't have real-time GPS, we will just place them at their static coords for now,
    // but add a "pulse" effect to show it's "live".
    
    vehicleSelection.attr("transform", d => `translate(${xScale(d.coordinates.x)},${yScale(d.coordinates.y)})`);

    // Pulse animation
    const pulse = () => {
      vehicleSelection.select("circle")
        .transition()
        .duration(2000)
        .attr("r", 12)
        .attr("fill-opacity", 0.4)
        .transition()
        .duration(2000)
        .attr("r", 8)
        .attr("fill-opacity", 0.8)
        .on("end", pulse);
    };
    pulse();

  }, [vehicles, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 relative">
       <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
         Live Network View
       </div>
      <svg ref={svgRef} width="100%" height="100%" className="w-full h-full cursor-crosshair" />
    </div>
  );
};

export default FleetVisualization;
