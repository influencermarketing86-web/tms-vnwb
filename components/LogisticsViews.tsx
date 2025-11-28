
import React, { useState } from 'react';
import { PurchaseOrder, Shipment, ConfirmedShipment, Appointment } from '../types';
import { MOCK_PURCHASE_ORDERS, MOCK_SHIPMENTS, MOCK_CONFIRMED_SHIPMENTS, MOCK_APPOINTMENTS } from '../constants';
import { FileText, Package, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck, Calendar, Plus, X, Search, Truck, Info, Settings, ClipboardList, Warehouse, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

// Utility for status badges
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    APPROVED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    FULFILLED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    PREPARING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IN_TRANSIT: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    DELAYED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ROUTED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    GOOD: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    DAMAGED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MISSING_ITEMS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Created: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
};

export const PurchaseOrderList: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    id: '',
    supplier: '',
    buyer: '',
    dcName: '',
    dcAddress: '',
    items: 0,
    expectedDelivery: '',
    paymentTerms: 'Net30',
    incoterms: 'DDP',
    status: 'PENDING',
    poType: 'Domestic',
    fobPointName: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenModal = () => {
    setFormData({
      id: Math.floor(10000000 + Math.random() * 90000000).toString(),
      supplier: '',
      buyer: '',
      dcName: 'CONNECTICUT DC',
      dcAddress: '',
      items: 0,
      expectedDelivery: '',
      paymentTerms: 'Net30',
      incoterms: 'DDP',
      status: 'PENDING',
      poType: 'Domestic',
      fobPointName: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: PurchaseOrder = {
      ...formData as PurchaseOrder,
      totalAmount: 0 // Default
    };
    setPurchaseOrders([newOrder, ...purchaseOrders]);
    setIsModalOpen(false);
  };

  const toggleExpand = (id: string) => {
      setExpandedPoId(expandedPoId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300">
                Total Orders: <span className="font-bold text-white">{purchaseOrders.length}</span>
            </div>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> New Purchase Order
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">DC / Location</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Terms</th>
                <th className="px-6 py-4">Exp. Delivery</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchaseOrders.map((po) => (
                <React.Fragment key={po.id}>
                    <tr 
                        onClick={() => toggleExpand(po.id)}
                        className={`transition-colors cursor-pointer group ${expandedPoId === po.id ? 'bg-slate-800/30' : 'hover:bg-slate-800/50'}`}
                    >
                    <td className="px-6 py-4 font-mono font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-500" />
                            {po.id}
                        </div>
                    </td>
                    <td className="px-6 py-4">{po.supplier}</td>
                    <td className="px-6 py-4 text-xs">{po.buyer || '-'}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col text-xs">
                        <span className="text-slate-300">{po.dcName || 'N/A'}</span>
                        <span className="text-slate-500 truncate max-w-[150px]">{po.dcAddress}</span>
                        {po.fobPointName && <span className="text-slate-600">FOB: {po.fobPointName}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4">{po.items}</td>
                    <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col">
                            <span>{po.paymentTerms || '-'}</span>
                            {po.incoterms && <span className="text-slate-500">{po.incoterms}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {po.expectedDelivery}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <StatusBadge status={po.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                        {expandedPoId === po.id ? (
                             <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                             <ChevronDown className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </td>
                    </tr>
                    {expandedPoId === po.id && (
                        <tr className="bg-slate-900/50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <td colSpan={9} className="p-0 border-b border-slate-800">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm border-l-4 border-indigo-500 bg-slate-950/30">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                                            <Truck className="w-4 h-4 text-indigo-400" />
                                            Logistics Details
                                        </h4>
                                        <div className="space-y-2 text-slate-400 text-xs">
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>Incoterms</span>
                                                <span className="text-slate-200 font-medium">{po.incoterms || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>FOB Point</span>
                                                <span className="text-slate-200 font-medium">{po.fobPointName || 'N/A'}</span>
                                            </div>
                                            <div className="pt-1">
                                                <span className="block mb-1">Detailed Ship To Address</span>
                                                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300">
                                                    {po.dcAddress || 'No address provided'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                            Financials & Items
                                        </h4>
                                        <div className="space-y-2 text-slate-400 text-xs">
                                             <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>Payment Terms</span>
                                                <span className="text-slate-200 font-medium">{po.paymentTerms}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>Total Item Count</span>
                                                <span className="text-slate-200 font-medium">{po.items.toLocaleString()} units</span>
                                            </div>
                                             <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>PO Type</span>
                                                <span className="text-slate-200 font-medium">{po.poType}</span>
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <span>PO Date</span>
                                                <span className="text-slate-200">{po.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                         <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                                            <Info className="w-4 h-4 text-amber-400" />
                                            Additional Info
                                        </h4>
                                         <div className="space-y-2 text-slate-400 text-xs">
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>Buyer Name</span>
                                                <span className="text-slate-200 font-medium">{po.buyer || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span>Cancel Date</span>
                                                <span className="text-rose-300 font-medium">{po.cancelDate || 'N/A'}</span>
                                            </div>
                                            {po.priority && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    High Priority Order
                                                </div>
                                            )}
                                            {po.remarks && (
                                                <div className="mt-2 bg-slate-900/50 p-2 rounded text-slate-400 italic">
                                                    "{po.remarks}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 sticky top-0 z-10 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                New Purchase Order
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">PO Number *</label>
                    <input
                      required
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({...formData, id: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">PO Date *</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Vendor Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. Acme Corp"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Buyer Name</label>
                    <input
                      type="text"
                      value={formData.buyer}
                      onChange={(e) => setFormData({...formData, buyer: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">DC Name</label>
                    <input
                      type="text"
                      value={formData.dcName}
                      onChange={(e) => setFormData({...formData, dcName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">DC Address</label>
                    <input
                      type="text"
                      value={formData.dcAddress}
                      onChange={(e) => setFormData({...formData, dcAddress: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Items</label>
                    <input
                      type="number"
                      value={formData.items}
                      onChange={(e) => setFormData({...formData, items: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Expected Delivery</label>
                    <input
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="Net30">Net30</option>
                        <option value="Net60">Net60</option>
                        <option value="Net90">Net90</option>
                        <option value="Immediate">Immediate</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Incoterms</label>
                    <select
                      value={formData.incoterms}
                      onChange={(e) => setFormData({...formData, incoterms: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="DDP">DDP</option>
                        <option value="EXW">EXW</option>
                        <option value="FOB">FOB</option>
                        <option value="CIF">CIF</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="FULFILLED">FULFILLED</option>
                        <option value="Closed">Closed</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">FOB Point Name</label>
                    <input
                      type="text"
                      value={formData.fobPointName}
                      onChange={(e) => setFormData({...formData, fobPointName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const ShipmentList: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Shipment>>({
    purchaseOrderId: '',
    trackingId: '',
    pickupLocation: 'Distribution Center A',
    deliveryAddress: '',
    vendorName: '',
    carrier: 'Nexus Fleet',
    estimatedArrival: '',
    freightType: 'Dry',
    totalUnits: 0,
    totalCartons: 0,
    totalPallets: 0,
    totalWeight: 0,
    totalCubicFeet: 0,
    palletDimensions: '48x40',
    palletized: true,
    stackable: false,
    palletType: 'Standard',
    liftGate: false,
    limitedAccess: false,
    immediatePickup: false,
    residentialLocation: false,
    callForAppointment: false,
    insideDelivery: false,
    onTimeGuaranteed: false,
    temperatureControl: false,
    fragile: false,
    remarks: ''
  });

  const handleOpenModal = () => {
    setFormData({
      purchaseOrderId: '',
      trackingId: `TRK-${Math.floor(Math.random() * 1000000)}`,
      pickupLocation: '',
      deliveryAddress: '',
      vendorName: '',
      carrier: 'Nexus Fleet',
      estimatedArrival: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      freightType: 'Dry',
      totalUnits: 0,
      totalCartons: 0,
      totalPallets: 0,
      totalWeight: 0,
      totalCubicFeet: 0,
      palletDimensions: '48x40x90',
      palletized: true,
      stackable: false,
      palletType: 'Standard',
      liftGate: false,
      limitedAccess: false,
      immediatePickup: false,
      residentialLocation: false,
      callForAppointment: false,
      insideDelivery: false,
      onTimeGuaranteed: false,
      temperatureControl: false,
      fragile: false,
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handlePOSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poId = e.target.value;
    const po = MOCK_PURCHASE_ORDERS.find(p => p.id === poId);
    
    setFormData(prev => ({
      ...prev,
      purchaseOrderId: poId,
      vendorName: po ? po.supplier : '',
      estimatedArrival: po ? po.expectedDelivery : prev.estimatedArrival,
      totalUnits: po ? po.items : 0,
      totalWeight: po ? po.items * 25 : 0, // Mock calculation
      pickupLocation: po ? po.fobPointName || prev.pickupLocation : prev.pickupLocation,
      deliveryAddress: po ? po.dcAddress : prev.deliveryAddress
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, strict validation would happen here.
    const newShipment: Shipment = {
      id: `SHP-${Math.floor(Math.random() * 10000)}`,
      origin: formData.pickupLocation || 'Unknown',
      destination: formData.deliveryAddress || 'Unknown',
      status: 'PREPARING',
      ...formData as Shipment
    };
    
    setShipments([newShipment, ...shipments]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
           {['IN_TRANSIT', 'ROUTED', 'Closed'].map(status => {
               const count = shipments.filter(s => s.status === status).length;
               return (
                  <div key={status} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center justify-between min-w-[140px]">
                      <div>
                          <p className="text-[10px] font-medium text-slate-500 uppercase">{status.replace('_', ' ')}</p>
                          <p className="text-xl font-bold text-slate-100">{count}</p>
                      </div>
                  </div>
               );
           })}
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Shipment ID
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Shipment ID</th>
                <th className="px-6 py-4">Vendor / Pickup</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Carrier</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Aging</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shipments.map((ship) => (
                <tr key={ship.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{ship.id}</span>
                        {ship.purchaseOrderId && (
                           <span className="text-xs text-indigo-400 flex items-center gap-1">
                             <FileText className="w-3 h-3" /> {ship.purchaseOrderId}
                           </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                         <span className="text-slate-200 font-medium">{ship.vendorName}</span>
                         <span className="text-xs text-slate-500">{ship.pickupLocation || ship.origin}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                         <span className="text-slate-300">{ship.deliveryAddress || ship.destination}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">{ship.carrier}</td>
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {ship.submittedDate || '-'}
                      </div>
                  </td>
                   <td className="px-6 py-4 text-xs">
                      {ship.agingDays ? `${ship.agingDays} days` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ship.status} />
                    {ship.shipmentCondition && <div className="text-[10px] text-slate-500 mt-1">Cond: {ship.shipmentCondition}</div>}
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-slate-500">
                         <span>{ship.totalUnits} Units</span>
                         <span>{ship.totalWeight} lbs</span>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Shipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 sticky top-0 z-10 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Create Shipment ID
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: GENERAL INFORMATION */}
              <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide mb-4 border-l-4 border-indigo-500 pl-3">General Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-1">
                          <label className="block text-xs font-semibold text-indigo-400 mb-1.5 uppercase">Purchase Order *</label>
                          <div className="relative">
                            <select
                                value={formData.purchaseOrderId}
                                onChange={handlePOSelect}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                            >
                                <option value="">Select PO...</option>
                                {MOCK_PURCHASE_ORDERS.map(po => (
                                <option key={po.id} value={po.id}>{po.id}</option>
                                ))}
                            </select>
                            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                          </div>
                      </div>

                      <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pickup Location *</label>
                          <input 
                             type="text"
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                             value={formData.pickupLocation}
                             onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                          />
                      </div>

                      <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Freight Type *</label>
                          <select 
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                             value={formData.freightType}
                             onChange={(e) => setFormData({...formData, freightType: e.target.value as any})}
                          >
                             <option value="Dry">Dry</option>
                             <option value="Refrigerated">Refrigerated</option>
                             <option value="Frozen">Frozen</option>
                             <option value="Hazardous">Hazardous</option>
                          </select>
                      </div>

                      <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Vendor Name</label>
                          <input
                            type="text"
                            value={formData.vendorName}
                            readOnly
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none cursor-not-allowed"
                          />
                      </div>

                      <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Delivery Address</label>
                          <input
                            type="text"
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                            placeholder="To Be Assigned"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                      </div>

                       <div className="col-span-1">
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Remarks</label>
                          <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                            rows={1}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                      </div>
                  </div>
              </div>

              {/* SECTION 2: DETAILS */}
              <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide mb-4 border-l-4 border-indigo-500 pl-3">Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Units *</label>
                          <input type="number" value={formData.totalUnits} onChange={(e) => setFormData({...formData, totalUnits: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Cubic Feet *</label>
                          <input type="number" value={formData.totalCubicFeet} onChange={(e) => setFormData({...formData, totalCubicFeet: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pallet Dimensions *</label>
                          <input type="text" value={formData.palletDimensions} onChange={(e) => setFormData({...formData, palletDimensions: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Cartons *</label>
                          <input type="number" value={formData.totalCartons} onChange={(e) => setFormData({...formData, totalCartons: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Pallets *</label>
                          <input type="number" value={formData.totalPallets} onChange={(e) => setFormData({...formData, totalPallets: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Palletized *</label>
                          <select value={formData.palletized ? 'Yes' : 'No'} onChange={(e) => setFormData({...formData, palletized: e.target.value === 'Yes'})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                             <option value="Yes">Yes</option>
                             <option value="No">No</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Weight *</label>
                          <input type="number" value={formData.totalWeight} onChange={(e) => setFormData({...formData, totalWeight: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Stackable</label>
                          <select value={formData.stackable ? 'Yes' : 'No'} onChange={(e) => setFormData({...formData, stackable: e.target.value === 'Yes'})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                             <option value="Yes">Yes</option>
                             <option value="No">No</option>
                          </select>
                      </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pallet Type *</label>
                          <select value={formData.palletType} onChange={(e) => setFormData({...formData, palletType: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                             <option value="Standard">Standard</option>
                             <option value="Euro">Euro</option>
                             <option value="Plastic">Plastic</option>
                             <option value="Oversized">Oversized</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* SECTION 3: SPECIAL INSTRUCTIONS */}
              <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide mb-4 border-l-4 border-indigo-500 pl-3">Special Instructions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Lift Gate', key: 'liftGate' },
                        { label: 'Limited Access', key: 'limitedAccess' },
                        { label: 'Immediate Pickup', key: 'immediatePickup' },
                        { label: 'Residential Location', key: 'residentialLocation' },
                        { label: 'Call for Delivery Appointment', key: 'callForAppointment' },
                        { label: 'Inside Delivery', key: 'insideDelivery' },
                        { label: 'On-Time Guaranteed', key: 'onTimeGuaranteed' },
                        { label: 'Temperature Control', key: 'temperatureControl' },
                        { label: 'Fragile', key: 'fragile' },
                      ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={!!(formData as any)[item.key]} 
                                onChange={(e) => setFormData({...formData, [item.key]: e.target.checked})}
                                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 bg-slate-800"
                              />
                              <span className="text-sm text-slate-300">{item.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Create Shipment ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const ConfirmedShipmentList: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
           <p className="text-sm text-slate-400">
               <CheckCircle2 className="w-4 h-4 inline mr-2 text-emerald-500" />
               This log contains all shipments that have been successfully delivered and signed for.
           </p>
       </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Confirmation #</th>
                <th className="px-6 py-4">Shipment ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">ASN Status</th>
                <th className="px-6 py-4">Load Type</th>
                <th className="px-6 py-4">Origin / Dest</th>
                <th className="px-6 py-4">Ref # / BOL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_CONFIRMED_SHIPMENTS.map((conf) => (
                <tr key={conf.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-200">{conf.id}</td>
                  <td className="px-6 py-4 text-indigo-400">{conf.shipmentId}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={conf.transportStatus || ''} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={conf.asnStatus || ''} />
                  </td>
                  <td className="px-6 py-4 text-xs">{conf.loadType || '-'}</td>
                  <td className="px-6 py-4 text-xs">
                     <div className="flex flex-col">
                         <span className="text-slate-300 truncate max-w-[150px]">{conf.shipFromAddress}</span>
                         <ArrowRight className="w-3 h-3 text-slate-600 my-0.5" />
                         <span className="text-slate-300 truncate max-w-[150px]">{conf.shipToAddress}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {conf.bolNumber || conf.proNumber || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AppointmentList: React.FC = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-2 text-slate-300">
                 <Clock className="w-5 h-5 text-indigo-400" />
                 <span className="text-sm font-medium">Active Appointments: {MOCK_APPOINTMENTS.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length}</span>
             </div>
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Appointment
            </button>
         </div>
  
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Appt ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location / Carrier</th>
                  <th className="px-6 py-4">Dock</th>
                  <th className="px-6 py-4">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MOCK_APPOINTMENTS.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-200">{appt.id}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${appt.type === 'WAREHOUSE' ? 'bg-violet-500/10 text-violet-400' : 'bg-sky-500/10 text-sky-400'}`}>
                            {appt.type === 'WAREHOUSE' ? <Warehouse className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                            {appt.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-slate-200 font-medium">{appt.date}</span>
                            <span className="text-xs text-slate-500">{appt.time}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col">
                            <span className="text-slate-300 truncate max-w-[200px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" /> {appt.address}
                            </span>
                            {appt.scac && <span className="text-slate-500 mt-1">SCAC: {appt.scac}</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {appt.dockNumber ? (
                            <span className="bg-slate-800 px-2 py-1 rounded font-mono text-xs text-slate-300">{appt.dockNumber}</span>
                        ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                        {appt.cartons ? `${appt.cartons} Cartons` : ''}
                        {appt.cartons && appt.pallets ? ' • ' : ''}
                        {appt.pallets ? `${appt.pallets} Pallets` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
