
export enum VehicleStatus {
  IDLE = 'IDLE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR'
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY'
}

export interface Attachment {
  id: string;
  type: 'NOTE' | 'DOCUMENT';
  content: string; // The note text or file name
  timestamp: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  plate: string;
  status: VehicleStatus;
  fuelLevel: number; // 0-100
  driverId?: string;
  location: string; // Current location description
  destination?: string;
  coordinates: { x: number; y: number }; // For the mock map
  attachments: Attachment[];
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  status: DriverStatus;
  rating: number; // 1-5
  totalTrips: number;
  
  // Extended fields from CSV
  email?: string;
  phone?: string;
  age?: number;
  licenseState?: string;
  licenseExpiration?: string;
  trailerNumber?: string;
}

export interface Route {
  id: string;
  vehicleId: string;
  origin: string;
  destination: string;
  stops: string[];
  distance: number; // km
  estimatedTime: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export interface PurchaseOrder {
  id: string; // Mapped from "PO" or "ID"
  supplier: string; // Vendor_Name
  date: string; // po_date
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED' | 'Closed';
  totalAmount: number;
  items: number; // PurchaseOrderQuantity
  expectedDelivery: string; // Start_Date or Cancel_Date as proxy
  
  // Extended Fields from CSV
  buyer?: string;
  cancelDate?: string;
  commodityDescription?: string;
  dcName?: string;
  dcAddress?: string;
  departmentNumber?: string;
  fobPointAddress?: string;
  fobPointName?: string;
  facility?: string;
  hazardousMaterial?: string;
  incoterms?: string;
  paymentTerms?: string;
  poCartonNumber?: string;
  poType?: string;
  priority?: string;
  startDate?: string;
  vendorId?: string;
  remarks?: string;
}

export interface Shipment {
  id: string; // Shipment_ID
  trackingId: string;
  purchaseOrderId: string;
  
  // General Info
  vendorName: string;
  pickupLocation: string; // Pickup_Address
  deliveryAddress: string; // Delivery_Address
  freightType: 'Dry' | 'Refrigerated' | 'Frozen' | 'Hazardous';
  remarks?: string;

  // Details
  totalUnits: number;
  totalCartons: number;
  totalPallets: number;
  totalWeight: number; // lbs
  totalCubicFeet?: number;
  palletDimensions?: string;
  palletized: boolean;
  stackable: boolean;
  palletType: 'Standard' | 'Euro' | 'Plastic' | 'Oversized';

  // Special Instructions
  liftGate: boolean;
  limitedAccess: boolean;
  immediatePickup: boolean;
  residentialLocation: boolean;
  callForAppointment: boolean;
  insideDelivery: boolean;
  onTimeGuaranteed: boolean;
  temperatureControl: boolean;
  fragile: boolean;

  // System/Status
  status: 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'Closed' | 'ROUTED';
  estimatedArrival: string;
  carrier: string;
  origin: string; // Derived from pickup
  destination: string; // Derived from delivery
  
  // Extended from CSV
  agingDays?: number;
  shipmentCondition?: string;
  submittedDate?: string;
  submittedByUser?: string;
  fileAttachment?: string;
}

export interface ConfirmedShipment {
  id: string; // Confirmation_Number
  shipmentId: string; // ID from Confirmed_Shipments file
  
  // General Information
  expenseRecorded?: boolean;
  requestedPickupDate?: string;
  carrierEmail?: string;
  quoteNumberReference?: string;
  scheduledDeliveryDate?: string;
  freightCost?: number;
  estimatedDeliveryDate?: string;
  scacCode?: string;
  actualDeliveryDate?: string;
  cancelled?: boolean;
  asnStatus?: string;
  confirmationNumber?: string;
  
  // Location
  currentLocationAddress?: string;
  currentLocationCity?: string;
  currentLocationPostal?: string;
  currentLocationState?: string;
  currentLocationLatitude?: string;
  currentLocationLongitude?: string;

  // Shipping Information on Delivery
  driverName?: string;
  licenseNumber?: string;
  trailerNumber?: string;
  proNumber?: string;
  bolNumber?: string; // Bill of Lading
  trackingNumber?: string;
  cashOnDelivery?: boolean;
  freightTerms?: 'Prepaid' | 'Collect' | 'Third Party';
  transportStatus?: 'Available' | 'En Route' | 'Delivered' | 'In-Transit' | 'Planned';
  transportationMode?: 'Truck' | 'Rail' | 'Air' | 'Ocean';
  thirdPartyAccount?: string;
  sealNumber?: string;
  loadType?: string; // Less-than-Truckload etc

  // Basic Display
  deliveryDate: string;
  signedBy: string;
  condition: 'GOOD' | 'DAMAGED' | 'MISSING_ITEMS';
  notes?: string;
  
  // Addresses
  shipFromAddress?: string;
  shipToAddress?: string;
  dcAppointment?: string;
}

export interface Appointment {
  id: string;
  type: 'PICKUP' | 'WAREHOUSE';
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled' | 'Confirmed' | 'Created';
  dockNumber?: string;
  carrier?: string;
  scac?: string;
  cartons?: number;
  pallets?: number;
  address: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalyticsData {
  name: string;
  value: number;
  secondary?: number;
}
