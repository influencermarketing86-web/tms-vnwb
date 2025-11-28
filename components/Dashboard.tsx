import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Activity, Truck, Users, Fuel, AlertCircle, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Vehicle, Driver, VehicleStatus } from '../types';
import FleetVisualization from './FleetVisualization';
import { generateFleetStatusReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, drivers }) => {
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Stats
  const activeVehicles = vehicles.filter(v => v.status === VehicleStatus.IN_TRANSIT).length;
  const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length;
  const idleVehicles = vehicles.filter(v => v.status === VehicleStatus.IDLE).length;

  // Mock Chart Data
  const fuelData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 1398 },
    { name: 'Wed', value: 9800 },
    { name: 'Thu', value: 3908 },
    { name: 'Fri', value: 4800 },
    { name: 'Sat', value: 3800 },
    { name: 'Sun', value: 4300 },
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    const text = await generateFleetStatusReport(vehicles, drivers);
    setReport(text);
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Fleet</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">{activeVehicles} / {vehicles.length}</h4>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+12% from last week</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg">
            <Truck className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Fuel Efficiency</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">7.2 <span className="text-sm text-slate-500 font-normal">km/L</span></h4>
            <div className="flex items-center gap-1 mt-2 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>-2% decrease</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Fuel className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Drivers</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">{drivers.filter(d => d.status === 'ON_DUTY').length}</h4>
            <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
              <span>Total roster: {drivers.length}</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Maintenance</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-1">{maintenanceVehicles}</h4>
            <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
              <span>Pending checks: 2</span>
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 h-[400px]">
             <FleetVisualization vehicles={vehicles} />
          </div>

          {/* Activity Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-100">Fuel Consumption Trend</h3>
              <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (AI Insights & Alerts) */}
        <div className="space-y-6">
          {/* AI Report Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Fleet Analyst
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Generate a real-time executive summary of your fleet's current status and potential bottlenecks.
            </p>
            
            {!report ? (
              <button 
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Analyzing...
                  </>
                ) : (
                  'Generate Report'
                )}
              </button>
            ) : (
              <div className="bg-slate-950/50 rounded-lg p-4 max-h-80 overflow-y-auto border border-slate-800">
                <div className="prose prose-invert prose-sm">
                   <ReactMarkdown>{report}</ReactMarkdown>
                </div>
                <button 
                  onClick={() => setReport(null)}
                  className="mt-4 text-xs text-indigo-400 hover:underline"
                >
                  Clear Report
                </button>
              </div>
            )}
          </div>

          {/* Recent Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-slate-100 mb-4">Live Alerts</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Maintenance Required</p>
                  <p className="text-xs text-slate-500">Truck A-104 engine warning triggered 20 mins ago.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Route Delayed</p>
                  <p className="text-xs text-slate-500">Traffic congestion on I-95 impacting delivery ETA.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Delivery Completed</p>
                  <p className="text-xs text-slate-500">Order #88392 marked as delivered by Sarah Connor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;