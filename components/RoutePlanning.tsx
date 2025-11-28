
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Map as MapIcon, Navigation, Save, X, Sparkles, Truck, Trash2, CheckCircle2, Play, Pause, Square, Hash, FileText, Activity, Clock } from 'lucide-react';
import { Vehicle } from '../types';
import { MAP_NODES, MAP_LINKS, MOCK_PURCHASE_ORDERS } from '../constants';
import { optimizeRoute } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface RoutePlanningProps {
  vehicles: Vehicle[];
}

type SimulationStatus = 'idle' | 'playing' | 'paused';

const RoutePlanning: React.FC<RoutePlanningProps> = ({ vehicles }) => {
  const [routeName, setRouteName] = useState('');
  const [shipmentId, setShipmentId] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [poDetails, setPoDetails] = useState<{ supplier: string; address: string; date: string } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Simulation State
  const [simStatus, setSimStatus] = useState<SimulationStatus>('idle');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Refs for animation loop to avoid re-renders
  const progressRef = useRef(0); // Distance traveled in data units
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Handle Resize
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

  // Memoize Route Geometry for Simulation
  const routeGeometry = useMemo(() => {
    if (waypoints.length < 2) return null;
    const segments = [];
    let totalDistance = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = MAP_NODES.find(n => n.id === waypoints[i]);
      const end = MAP_NODES.find(n => n.id === waypoints[i+1]);
      if (start && end) {
        const dist = Math.hypot(end.x - start.x, end.y - start.y);
        segments.push({
          start,
          end,
          length: dist,
          cumulativeStart: totalDistance
        });
        totalDistance += dist;
      }
    }
    return { segments, totalDistance };
  }, [waypoints]);

  // Calculate Route Metrics (Distance & Time)
  const routeMetrics = useMemo(() => {
    if (!routeGeometry) return null;
    
    // Scale factor: assume 1 coordinate unit approx equals 2.4 km based on map scale
    const distanceKm = Math.round(routeGeometry.totalDistance * 2.4);
    
    // Assume average speed of 85 km/h for the truck
    const avgSpeed = 85; 
    const timeHours = distanceKm / avgSpeed;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    
    return {
        distance: distanceKm,
        duration: `${hours}h ${minutes}m`
    };
  }, [routeGeometry]);

  // Main D3 Drawing (Static Map + Route)
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Ensure groups exist
    let roadGroup = svg.select<SVGGElement>(".road-group");
    if (roadGroup.empty()) {
        svg.selectAll("*").remove(); // Hard reset if structure missing
        roadGroup = svg.append("g").attr("class", "road-group");
        svg.append("g").attr("class", "route-group");
        svg.append("g").attr("class", "node-group");
        svg.append("g").attr("class", "vehicle-group");
    }

    const width = dimensions.width;
    const height = dimensions.height;

    // Scales
    const xScale = d3.scaleLinear().domain([0, 1000]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, 800]).range([50, height - 50]);

    // Draw Background Roads
    const roadSelection = roadGroup.selectAll("line").data(MAP_LINKS);
    roadSelection.enter()
      .append("line")
      .merge(roadSelection as any)
      .attr("x1", d => xScale(MAP_NODES.find(n => n.id === d.source)!.x))
      .attr("y1", d => yScale(MAP_NODES.find(n => n.id === d.source)!.y))
      .attr("x2", d => xScale(MAP_NODES.find(n => n.id === d.target)!.x))
      .attr("y2", d => yScale(MAP_NODES.find(n => n.id === d.target)!.y))
      .attr("stroke", "#334155")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);
    roadSelection.exit().remove();

    // Draw Active Route
    const routeGroup = svg.select(".route-group");
    let routeData: any[] = [];
    if (waypoints.length > 1) {
      for (let i = 0; i < waypoints.length - 1; i++) {
        const source = MAP_NODES.find(n => n.id === waypoints[i]);
        const target = MAP_NODES.find(n => n.id === waypoints[i+1]);
        if (source && target) routeData.push({ source, target, id: `${source.id}-${target.id}` });
      }
    }
    
    const routeSelection = routeGroup.selectAll("line").data(routeData, (d: any) => d.id);
    routeSelection.enter()
      .append("line")
      .attr("stroke-dasharray", function() { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .merge(routeSelection as any)
      .attr("x1", d => xScale(d.source.x))
      .attr("y1", d => yScale(d.source.y))
      .attr("x2", d => xScale(d.target.x))
      .attr("y2", d => yScale(d.target.y))
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .transition().duration(500)
      .attr("stroke-dashoffset", 0);
    
    routeSelection.exit().remove();

    // Draw Nodes
    const nodeGroup = svg.select(".node-group");
    const nodeSelection = nodeGroup.selectAll<SVGGElement, typeof MAP_NODES[0]>("g").data(MAP_NODES, d => d.id);
    
    const nodeEnter = nodeSelection.enter().append("g")
      .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
          // Handled via merge selection
      });

    nodeSelection.attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`);

    // Node Visuals
    nodeSelection.each(function(d) {
        const g = d3.select(this);
        g.selectAll("*").remove(); 
        
        const isSelected = waypoints.includes(d.id);
        const index = waypoints.indexOf(d.id);
        
        // Halo
        if (isSelected) {
            g.append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", () => {
                if (index === 0) return "#10b981";
                if (index === waypoints.length - 1 && waypoints.length > 1) return "#ef4444";
                return "#6366f1";
            })
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,3")
            .attr("opacity", 0.6);
        }

        // Main Circle
        g.append("circle")
        .attr("r", isSelected ? 14 : 6)
        .attr("fill", () => {
            if (index === 0) return "#10b981";
            if (index === waypoints.length - 1 && waypoints.length > 1) return "#ef4444";
            if (index > -1) return "#6366f1";
            return "#1e293b";
        })
        .attr("stroke", isSelected ? "#ffffff" : "#475569")
        .attr("stroke-width", isSelected ? 3 : 2);

        // Badge Number
        if (index > -1) {
            g.append("text")
            .text(index + 1)
            .attr("y", 4)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("pointer-events", "none");
        }

        // Label
        g.append("text")
        .text(d.id)
        .attr("y", isSelected ? -24 : -16)
        .attr("text-anchor", "middle")
        .attr("fill", isSelected ? "#f8fafc" : "#94a3b8")
        .attr("font-size", isSelected ? "12px" : "10px")
        .attr("font-weight", isSelected ? "700" : "500")
        .attr("pointer-events", "none");
    });
    
    nodeEnter.merge(nodeSelection as any).on("click", (event, d) => {
        if (simStatus === 'idle') {
           handleNodeClick(d.id);
        }
    });

  }, [waypoints, dimensions, simStatus]);

  // Animation Loop Effect
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const vehicleGroup = svg.select(".vehicle-group");
    const width = dimensions.width;
    const height = dimensions.height;
    
    if (width === 0 || !routeGeometry) return;

    const xScale = d3.scaleLinear().domain([0, 1000]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([0, 800]).range([50, height - 50]);

    // Draw/Update Vehicle Marker based on status
    let vehicle = vehicleGroup.select<SVGGElement>(".simulation-marker");
    
    if (simStatus !== 'idle') {
        if (vehicle.empty()) {
            // Create Vehicle
            const startNode = routeGeometry.segments[0].start;
            vehicle = vehicleGroup.append("g")
                .attr("class", "simulation-marker")
                .attr("transform", `translate(${xScale(startNode.x)}, ${yScale(startNode.y)})`);
            
            // Pulse Animation Ring
            vehicle.append("circle")
                .attr("r", 15)
                .attr("fill", "#f59e0b")
                .attr("opacity", 0.4)
                .append("animate")
                .attr("attributeName", "r")
                .attr("from", "15")
                .attr("to", "25")
                .attr("dur", "1.5s")
                .attr("repeatCount", "indefinite");
            
            vehicle.select("circle")
                .append("animate")
                .attr("attributeName", "opacity")
                .attr("from", "0.4")
                .attr("to", "0")
                .attr("dur", "1.5s")
                .attr("repeatCount", "indefinite");

            // Main Marker Body
            vehicle.append("circle")
                .attr("r", 12)
                .attr("fill", "#f59e0b")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 2)
                .attr("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.3))");

            // Truck Icon (SVG Path)
            const iconGroup = vehicle.append("g")
                .attr("transform", "translate(-7, -7) scale(0.6)");

            // Cargo Box
            iconGroup.append("rect")
                .attr("x", 1).attr("y", 3)
                .attr("width", 15).attr("height", 13)
                .attr("rx", 2)
                .attr("fill", "#ffffff");
            
            // Cab
            iconGroup.append("path")
                .attr("d", "M16 8h4a1 1 0 0 1 1 1v4h-5V8z")
                .attr("fill", "#ffffff");
            
            // Wheels
            iconGroup.append("circle").attr("cx", 5.5).attr("cy", 18.5).attr("r", 2.5).attr("fill", "#ffffff");
            iconGroup.append("circle").attr("cx", 18.5).attr("cy", 18.5).attr("r", 2.5).attr("fill", "#ffffff");
        }
    } else {
        vehicle.remove();
        return; 
    }

    // Animation Function
    const animate = (time: number) => {
        if (lastTimeRef.current === 0) {
            lastTimeRef.current = time;
        }
        
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        if (simStatus === 'playing') {
            const pixelsPerSecond = 100 * simSpeed; 
            const deltaDist = (pixelsPerSecond * deltaTime) / 1000;
            
            progressRef.current += deltaDist;

            if (progressRef.current >= routeGeometry.totalDistance) {
                progressRef.current = routeGeometry.totalDistance;
                setSimStatus('paused'); // Pause at destination
            }
        }

        // Update Position
        const currentDist = progressRef.current;
        const segment = routeGeometry.segments.find(s => 
            currentDist >= s.cumulativeStart && currentDist <= s.cumulativeStart + s.length
        ) || routeGeometry.segments[routeGeometry.segments.length - 1];

        if (segment) {
            const segmentProgress = Math.max(0, currentDist - segment.cumulativeStart);
            const ratio = Math.min(1, segmentProgress / segment.length);
            
            const curX = segment.start.x + (segment.end.x - segment.start.x) * ratio;
            const curY = segment.start.y + (segment.end.y - segment.start.y) * ratio;
            
            vehicle.attr("transform", `translate(${xScale(curX)}, ${yScale(curY)})`);
        }

        if (simStatus === 'playing') {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    if (simStatus === 'playing') {
        requestRef.current = requestAnimationFrame(animate);
    } else {
        // Redraw position for pause state
        lastTimeRef.current = 0; 
        
        const currentDist = progressRef.current;
        const segment = routeGeometry.segments.find(s => 
            currentDist >= s.cumulativeStart && currentDist <= s.cumulativeStart + s.length
        ) || routeGeometry.segments[routeGeometry.segments.length - 1];

        if (segment) {
            const segmentProgress = Math.max(0, currentDist - segment.cumulativeStart);
            const ratio = Math.min(1, segmentProgress / segment.length);
            const curX = segment.start.x + (segment.end.x - segment.start.x) * ratio;
            const curY = segment.start.y + (segment.end.y - segment.start.y) * ratio;
            vehicle.attr("transform", `translate(${xScale(curX)}, ${yScale(curY)})`);
        }
    }

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

  }, [simStatus, simSpeed, dimensions, routeGeometry]);

  // Handlers
  const handleNodeClick = (nodeId: string) => {
    setWaypoints(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
    setSaved(false);
  };

  const handleOptimize = async () => {
    if (waypoints.length < 2) return;
    setIsOptimizing(true);
    setOptimizationResult(null);
    const result = await optimizeRoute(waypoints);
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  const handleSave = () => {
    if (!routeName || !selectedVehicle || waypoints.length < 2) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearRoute = () => {
    setWaypoints([]);
    setOptimizationResult(null);
    setSaved(false);
    handleStop();
  };

  const handlePlay = () => {
      // If we are at the end, restart
      if (routeGeometry && progressRef.current >= routeGeometry.totalDistance) {
          progressRef.current = 0;
      }
      setSimStatus('playing');
  };

  const handlePause = () => {
      setSimStatus('paused');
  };

  const handleStop = () => {
      setSimStatus('idle');
      progressRef.current = 0;
  };

  const handleSpeedChange = (newSpeed: number) => {
      setSimSpeed(newSpeed);
  };

  const handlePOSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poId = e.target.value;
    setPurchaseOrder(poId);
    
    const selectedPO = MOCK_PURCHASE_ORDERS.find(p => p.id === poId);
    if (selectedPO) {
      setPoDetails({
        supplier: selectedPO.supplier,
        address: selectedPO.dcAddress || selectedPO.dcName || 'Unknown Address',
        date: selectedPO.expectedDelivery
      });
      // Optionally auto-fill route name if empty
      if (!routeName) {
        setRouteName(`Route for ${poId}`);
      }
    } else {
      setPoDetails(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel: Controls */}
      <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
        {/* Route Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-indigo-400" />
            Route Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Route Name</label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                disabled={simStatus !== 'idle'}
                placeholder="e.g. West Coast Delivery Run"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Shipment ID</label>
                  <div className="relative">
                      <input
                        type="text"
                        value={shipmentId}
                        onChange={(e) => setShipmentId(e.target.value)}
                        disabled={simStatus !== 'idle'}
                        placeholder="SHP-..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                      />
                      <Hash className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Purchase Order</label>
                  <div className="relative">
                      <select
                        value={purchaseOrder}
                        onChange={handlePOSelect}
                        disabled={simStatus !== 'idle'}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 appearance-none"
                      >
                        <option value="">Select PO...</option>
                        {MOCK_PURCHASE_ORDERS.map(po => (
                            <option key={po.id} value={po.id}>{po.id}</option>
                        ))}
                      </select>
                      <FileText className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
               </div>
            </div>

            {poDetails && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Supplier:</span>
                        <span className="text-slate-300 font-medium">{poDetails.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Delivery:</span>
                        <span className="text-slate-300 text-right max-w-[60%] truncate" title={poDetails.address}>{poDetails.address}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Expected:</span>
                        <span className="text-slate-300">{new Date(poDetails.date).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign Vehicle</label>
              <div className="relative">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  disabled={simStatus !== 'idle'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                  ))}
                </select>
                <Truck className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Waypoints List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-slate-400" />
              Waypoints
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{waypoints.length}</span>
            </h3>
            {waypoints.length > 0 && simStatus === 'idle' && (
              <button onClick={clearRoute} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          
          {/* Metrics Summary */}
          {routeMetrics && (
            <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Distance</p>
                        <p className="text-sm font-bold text-slate-200">{routeMetrics.distance} km</p>
                    </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Est. Time</p>
                        <p className="text-sm font-bold text-slate-200">{routeMetrics.duration}</p>
                    </div>
                </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
            {waypoints.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                <p className="text-sm">Click cities on the map to add stops</p>
              </div>
            ) : (
              waypoints.map((point, idx) => (
                <div key={`${point}-${idx}`} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800 group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 
                    idx === waypoints.length - 1 ? 'bg-rose-500/20 text-rose-400' : 
                    'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm text-slate-200 font-medium flex-1">{point}</span>
                  {simStatus === 'idle' && (
                    <button 
                        onClick={() => handleNodeClick(point)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* AI Optimization & Simulation Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
             {/* Optimization Button */}
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || waypoints.length < 2 || simStatus !== 'idle'}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isOptimizing ? (
                  <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Optimizing...
                  </>
              ) : (
                  <>
                  <Sparkles className="w-4 h-4" />
                  Optimize Route
                  </>
              )}
            </button>

            {/* Simulation Controls */}
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Simulation</span>
                    <div className="flex gap-1">
                        {[1, 2, 5].map(s => (
                             <button
                                key={s}
                                onClick={() => handleSpeedChange(s)}
                                className={`text-[10px] px-2 py-0.5 rounded ${simSpeed === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                             >
                                {s}x
                             </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {simStatus === 'playing' ? (
                        <button
                            onClick={handlePause}
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Pause className="w-4 h-4 fill-current" /> Pause
                        </button>
                    ) : (
                        <button
                            onClick={handlePlay}
                            disabled={waypoints.length < 2}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Play className="w-4 h-4 fill-current" /> {simStatus === 'paused' ? 'Resume' : 'Start'}
                        </button>
                    )}
                    
                    <button
                        onClick={handleStop}
                        disabled={simStatus === 'idle'}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-md"
                        title="Stop & Reset"
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </div>

            {optimizationResult && simStatus === 'idle' && (
              <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300 max-h-40 overflow-y-auto border border-slate-700/50">
                <div className="prose prose-invert prose-xs">
                   <ReactMarkdown>{optimizationResult}</ReactMarkdown>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={!routeName || !selectedVehicle || waypoints.length < 2 || simStatus !== 'idle'}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                saved 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Route Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Route Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Interactive Map */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative flex flex-col">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 shadow-xl flex justify-between items-center min-w-[200px]">
          <div>
             <h3 className="text-sm font-semibold text-slate-200">Interactive Map</h3>
             <p className="text-xs text-slate-400">
                {simStatus !== 'idle' ? "Simulating active route..." : "Select nodes to build your route"}
             </p>
          </div>
          {simStatus === 'playing' && (
             <div className="ml-4 flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
             </div>
          )}
        </div>
        
        <div ref={containerRef} className="flex-1 bg-slate-950 relative">
          <svg ref={svgRef} width="100%" height="100%" className={`${simStatus !== 'idle' ? 'cursor-default' : 'cursor-crosshair'} w-full h-full`} />
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700 text-xs flex gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-300">Waypoint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">End</span>
          </div>
           {simStatus !== 'idle' && (
            <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-300">Vehicle</span>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
