import React, { useState } from 'react';
import { Vehicle, VehicleStatus, Attachment } from '../types';
import { Truck, AlertTriangle, CheckCircle, Clock, X, MapPin, Fuel, User, Navigation, FileText, StickyNote, Paperclip, Send } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onUpdateVehicle }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [newNote, setNewNote] = useState('');

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.IN_TRANSIT: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case VehicleStatus.MAINTENANCE: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case VehicleStatus.IDLE: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.IN_TRANSIT: return <Truck className="w-3.5 h-3.5" />;
      case VehicleStatus.MAINTENANCE: return <AlertTriangle className="w-3.5 h-3.5" />;
      case VehicleStatus.IDLE: return <Clock className="w-3.5 h-3.5" />;
      default: return <CheckCircle className="w-3.5 h-3.5" />;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedVehicle) return;

    const note: Attachment = {
      id: `a-${Date.now()}`,
      type: 'NOTE',
      content: newNote,
      timestamp: new Date().toISOString()
    };

    const updatedVehicle = {
      ...selectedVehicle,
      attachments: [note, ...selectedVehicle.attachments]
    };

    onUpdateVehicle(updatedVehicle);
    setSelectedVehicle(updatedVehicle);
    setNewNote('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedVehicle) {
      const file = e.target.files[0];
      const doc: Attachment = {
        id: `a-${Date.now()}`,
        type: 'DOCUMENT',
        content: file.name,
        timestamp: new Date().toISOString()
      };

      const updatedVehicle = {
        ...selectedVehicle,
        attachments: [doc, ...selectedVehicle.attachments]
      };

      onUpdateVehicle(updatedVehicle);
      setSelectedVehicle(updatedVehicle);
    }
  };

  return (
    <>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-100">Fleet Inventory</h3>
          <span className="text-xs text-slate-400">{vehicles.length} Vehicles Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Fuel</th>
                <th className="px-6 py-4">Driver ID</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Truck className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{v.name}</div>
                        <div className="text-xs text-slate-500">{v.plate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(v.status)}`}>
                      {getStatusIcon(v.status)}
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    {v.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${v.fuelLevel < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${v.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono">{v.fuelLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {v.driverId ? (
                      <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">{v.driverId}</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setSelectedVehicle(v); setActiveTab('info'); }}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="bg-slate-950/50 border-b border-slate-800">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Truck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-100">{selectedVehicle.name}</h3>
                            <p className="text-xs text-slate-400 font-mono">{selectedVehicle.plate}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => setSelectedVehicle(null)}
                      className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="px-6 flex gap-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'info' 
                            ? 'text-indigo-400 border-indigo-500' 
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'docs' 
                            ? 'text-indigo-400 border-indigo-500' 
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                    >
                        Documents & Notes
                    </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 h-[400px] overflow-y-auto">
                  {activeTab === 'info' ? (
                      <div className="space-y-6">
                        {/* Status Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 block mb-1">Vehicle Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedVehicle.status)}`}>
                                    {getStatusIcon(selectedVehicle.status)}
                                    {selectedVehicle.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 block mb-1">Vehicle Type</span>
                                <span className="text-slate-200 font-medium">{selectedVehicle.type}</span>
                            </div>
                        </div>

                        {/* Location Info */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <span className="text-xs text-slate-500 block">Current Location</span>
                                    <span className="text-slate-200">{selectedVehicle.location}</span>
                                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                                        Coords: {selectedVehicle.coordinates.x}, {selectedVehicle.coordinates.y}
                                    </div>
                                </div>
                            </div>
                            
                            {selectedVehicle.destination && (
                                <div className="flex items-start gap-3">
                                    <Navigation className="w-5 h-5 text-slate-500 mt-0.5" />
                                    <div>
                                        <span className="text-xs text-slate-500 block">Destination</span>
                                        <span className="text-slate-200">{selectedVehicle.destination}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-800 my-2"></div>

                        {/* Driver & Fuel */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Assigned Driver</span>
                                    <span className="text-slate-200 font-medium">
                                        {selectedVehicle.driverId ? `Driver #${selectedVehicle.driverId}` : 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <Fuel className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-slate-500">Fuel Level</span>
                                        <span className="text-xs text-slate-300 font-mono">{selectedVehicle.fuelLevel}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${selectedVehicle.fuelLevel < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${selectedVehicle.fuelLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                  ) : (
                      <div className="flex flex-col h-full">
                          {/* Attachments List */}
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                              {selectedVehicle.attachments && selectedVehicle.attachments.length > 0 ? (
                                  selectedVehicle.attachments.map(att => (
                                      <div key={att.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex gap-3">
                                          <div className={`p-2 rounded-lg h-fit ${att.type === 'DOCUMENT' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                              {att.type === 'DOCUMENT' ? <FileText className="w-4 h-4" /> : <StickyNote className="w-4 h-4" />}
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-sm text-slate-200">{att.content}</p>
                                              <p className="text-xs text-slate-500 mt-1">{new Date(att.timestamp).toLocaleString()}</p>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center py-8 text-slate-500">
                                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                      <p className="text-sm">No notes or documents attached.</p>
                                  </div>
                              )}
                          </div>

                          {/* Input Area */}
                          <div className="pt-4 border-t border-slate-800">
                              <form onSubmit={handleAddNote} className="flex gap-2">
                                  <div className="relative flex-1">
                                      <input 
                                          type="text" 
                                          value={newNote}
                                          onChange={(e) => setNewNote(e.target.value)}
                                          placeholder="Add a note..."
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                      />
                                      <label className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-200 cursor-pointer rounded hover:bg-slate-800 transition-colors">
                                          <Paperclip className="w-4 h-4" />
                                          <input type="file" className="hidden" onChange={handleFileUpload} />
                                      </label>
                                  </div>
                                  <button 
                                      type="submit"
                                      disabled={!newNote.trim()}
                                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors"
                                  >
                                      <Send className="w-4 h-4" />
                                  </button>
                              </form>
                          </div>
                      </div>
                  )}
              </div>
              
              {/* Footer */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
                   <button 
                        onClick={() => setSelectedVehicle(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                   >
                        Close
                   </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default VehicleList;