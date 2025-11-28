
import React, { useState } from 'react';
import { Driver, DriverStatus } from '../types';
import { User, Plus, Edit2, Star, Shield, Search, X, Check, Award, Phone, Mail, Calendar } from 'lucide-react';

interface DriverListProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
}

const DriverList: React.FC<DriverListProps> = ({ drivers, onAddDriver, onUpdateDriver }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    license: '',
    status: DriverStatus.AVAILABLE,
    rating: 5.0,
    totalTrips: 0,
    email: '',
    phone: '',
    age: 25,
    licenseState: '',
    licenseExpiration: '',
    trailerNumber: ''
  });

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData(driver);
    } else {
      setEditingDriver(null);
      setFormData({
        name: '',
        license: '',
        status: DriverStatus.AVAILABLE,
        rating: 5.0,
        totalTrips: 0,
        email: '',
        phone: '',
        age: 25,
        licenseState: '',
        licenseExpiration: '',
        trailerNumber: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDriver) {
      onUpdateDriver({ ...editingDriver, ...formData } as Driver);
    } else {
      const newDriver: Driver = {
        id: `d${Date.now()}`,
        ...formData as Omit<Driver, 'id'>
      };
      onAddDriver(newDriver);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.AVAILABLE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case DriverStatus.ON_DUTY: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case DriverStatus.OFF_DUTY: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search drivers by name or license..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add New Driver
        </button>
      </div>

      {/* Drivers Grid/Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Driver Profile</th>
                <th className="px-6 py-4">License</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Trailer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{driver.name}</div>
                        <div className="text-xs text-slate-500 font-mono">ID: {driver.id} {driver.age ? `• Age: ${driver.age}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-slate-300">{driver.license}</span>
                      </div>
                      {driver.licenseState && (
                          <span className="text-xs text-slate-500 pl-5.5">{driver.licenseState} • Exp: {driver.licenseExpiration || 'N/A'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        {driver.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <Phone className="w-3 h-3 text-indigo-400" /> {driver.phone}
                            </div>
                        )}
                        {driver.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <Mail className="w-3 h-3 text-indigo-400" /> <span className="truncate max-w-[150px]">{driver.email}</span>
                            </div>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {driver.trailerNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(driver)}
                      className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDrivers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No drivers found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-100">
                {editingDriver ? 'Edit Driver Profile' : 'Add New Driver'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Alex Mercer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Age</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">License Number</label>
                    <input
                      required
                      type="text"
                      value={formData.license}
                      onChange={(e) => setFormData({...formData, license: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                      placeholder="CDL-A-..."
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1.5">State</label>
                     <input
                      type="text"
                      value={formData.licenseState}
                      onChange={(e) => setFormData({...formData, licenseState: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-1.5">License Expiration</label>
                   <input
                      type="date"
                      value={formData.licenseExpiration}
                      onChange={(e) => setFormData({...formData, licenseExpiration: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="+1..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="driver@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Status</label>
                        <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as DriverStatus})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                        {Object.values(DriverStatus).map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-400 mb-1.5">Trailer Number</label>
                         <input
                            type="text"
                            value={formData.trailerNumber}
                            onChange={(e) => setFormData({...formData, trailerNumber: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                         />
                    </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingDriver ? 'Save Changes' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverList;
