
import React, { useState } from 'react';
import { LayoutDashboard, Truck, Users, Map, Settings, Box, FileText, Package, ClipboardCheck, CalendarClock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import VehicleList from './components/VehicleList';
import DriverList from './components/DriverList';
import AIChat from './components/AIChat';
import RoutePlanning from './components/RoutePlanning';
import { PurchaseOrderList, ShipmentList, ConfirmedShipmentList, AppointmentList } from './components/LogisticsViews';
import { INITIAL_VEHICLES, INITIAL_DRIVERS } from './constants';
import { Driver, Vehicle } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

  const handleAddDriver = (newDriver: Driver) => {
    setDrivers([...drivers, newDriver]);
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard vehicles={vehicles} drivers={drivers} />;
      case 'fleet':
        return <VehicleList vehicles={vehicles} onUpdateVehicle={handleUpdateVehicle} />;
      case 'drivers':
        return (
          <DriverList 
            drivers={drivers} 
            onAddDriver={handleAddDriver} 
            onUpdateDriver={handleUpdateDriver} 
          />
        );
      case 'routes':
        return <RoutePlanning vehicles={vehicles} />;
      case 'orders':
        return <PurchaseOrderList />;
      case 'shipments':
        return <ShipmentList />;
      case 'confirmed':
        return <ConfirmedShipmentList />;
      case 'appointments':
        return <AppointmentList />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh] text-slate-500">
            <div className="text-center">
              <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>This module is under development.</p>
              <p className="text-xs mt-2 opacity-60">
                 System Module: {activeTab}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nexus TMS</span>
          </div>

          <nav className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<Truck />} 
              label="Fleet Management" 
              active={activeTab === 'fleet'} 
              onClick={() => setActiveTab('fleet')} 
            />
            <SidebarItem 
              icon={<Users />} 
              label="Drivers" 
              active={activeTab === 'drivers'} 
              onClick={() => setActiveTab('drivers')} 
            />
            <SidebarItem 
              icon={<Map />} 
              label="Route Planning" 
              active={activeTab === 'routes'} 
              onClick={() => setActiveTab('routes')} 
            />
            <SidebarItem 
              icon={<CalendarClock />} 
              label="Appointments" 
              active={activeTab === 'appointments'} 
              onClick={() => setActiveTab('appointments')} 
            />
            <SidebarItem 
              icon={<FileText />} 
              label="Purchase Orders" 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')} 
            />
            <SidebarItem 
              icon={<Package />} 
              label="Shipment IDs" 
              active={activeTab === 'shipments'} 
              onClick={() => setActiveTab('shipments')} 
            />
            <SidebarItem 
              icon={<ClipboardCheck />} 
              label="Confirmed Shipments" 
              active={activeTab === 'confirmed'} 
              onClick={() => setActiveTab('confirmed')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <SidebarItem 
            icon={<Settings />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Nexus TMS</span>
          </div>
          <button className="p-2 text-slate-400">
             {/* Simple mobile menu trigger placeholder */}
             <div className="space-y-1.5">
               <span className="block w-6 h-0.5 bg-current"></span>
               <span className="block w-6 h-0.5 bg-current"></span>
               <span className="block w-6 h-0.5 bg-current"></span>
             </div>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-100">
                {activeTab === 'orders' ? 'Purchase Orders' : 
                 activeTab === 'shipments' ? 'Shipment IDs' :
                 activeTab === 'confirmed' ? 'Confirmed Shipments' :
                 activeTab === 'appointments' ? 'Appointments' :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-slate-400 mt-1">Overview of your logistics operations</p>
            </header>
            
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Chat Bot */}
      <AIChat vehicles={vehicles} drivers={drivers} />
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {/* Cast icon to ReactElement<any> to fix TypeScript error about 'size' prop */}
    {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
    {label}
  </button>
);

export default App;
