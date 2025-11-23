
export enum ServiceType {
  StandardRooms = 'Standard Rooms',
  MeetingRooms = 'Meeting Rooms',
  Both = 'Standard Rooms + Meeting Rooms'
}

export enum FlightClass {
  Economy = 'Economy',
  Business = 'Business',
  First = 'First'
}

export enum VehicleType {
  Sedan = 'Sedan (Car with Driver)',
  SUV = 'SUV (Car with Driver)',
  Van = 'Van with Driver',
  Bus = 'Bus with Driver',
  Rental = 'Car Rental (Self Drive)',
  Luxury = 'Luxury Limo'
}

export enum MarkupType {
  Fixed = 'Fixed Amount',
  Percent = 'Percentage'
}

export type VatRule = 'domestic' | 'international';

export interface MarkupConfig {
  type: MarkupType;
  value: number;
}

export interface CategoryMarkups {
  hotels: MarkupConfig;
  meetings: MarkupConfig;
  flights: MarkupConfig;
  transportation: MarkupConfig;
  activities: MarkupConfig;
  customItems: MarkupConfig;
}

export interface PricingConfig {
  currency: string;
  enableVat: boolean;
  vatPercent: number;
  markups: CategoryMarkups;
  showPrices: boolean;
}

export interface Branding {
  clientLogo?: string; // Base64
  companyLogo?: string; // Base64 (Specific to this proposal)
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type ImageTag = 'interior' | 'rooms' | 'exterior';

export interface HotelImage {
  url: string;
  tag?: ImageTag;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  netPrice: number; 
  quantity: number;
  checkIn: string;  
  checkOut: string; 
  numNights: number; 
  includeInSummary?: boolean;
}

export interface MeetingDetails {
  id: string;
  name: string;
  price: number; // Unit Price per guest per day
  quantity: number; // Number of guests
  startDate?: string;
  endDate?: string;
  days: number;
  includeInSummary?: boolean;
}

export interface DiningDetails {
  id: string;
  name: string;
  price: number; // Unit Price per guest per day
  quantity: number; // Number of guests
  startDate?: string;
  endDate?: string;
  days: number;
  includeInSummary?: boolean;
}

export interface HotelDetails {
  id: string;
  name: string;
  currency?: string;
  location?: string;
  website?: string;
  images: HotelImage[];
  roomTypes: RoomType[];
  meetingRooms: MeetingDetails[];
  dining: DiningDetails[];
  vatRule: VatRule;
  included: boolean;
}

export interface FlightQuote {
  class: FlightClass | string;
  price: number;
  quantity: number; // NEW: Quantity per quote/class
}

export interface FlightLeg {
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  airline: string;
  flightNumber: string;
  flightClass?: FlightClass; 
  luggage: string;
}

export interface FlightDetails {
  id: string;
  routeDescription: string; 
  outbound: FlightLeg[]; 
  return: FlightLeg[];   
  quotes: FlightQuote[]; 
  // quantity: number; // DEPRECATED: Moved to quotes
  vatRule: VatRule; 
  included: boolean;
  includeInSummary?: boolean;
}

export interface TransportationDetails {
  id: string;
  type: VehicleType;
  model: string;
  description: string;
  startDate: string;
  endDate: string;
  days: number;
  netPricePerDay: number;
  quantity: number;
  image?: string;
  vatRule: VatRule;
  includeInSummary?: boolean;
}

export interface CustomItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  startDate?: string;
  endDate?: string;
  days: number;
  vatRule: VatRule;
  includeInSummary?: boolean;
}

export interface ActivityDetails {
  id: string;
  name: string;
  pricePerPerson: number;
  guests: number;
  startDate?: string;
  endDate?: string;
  days: number;
  image?: string;
  vatRule: VatRule;
  includeInSummary?: boolean;
}

export interface Inclusions {
  hotels: boolean;
  flights: boolean;
  transportation: boolean;
  customItems: boolean;
  activities: boolean;
}

export type UserRole = 'super_admin' | 'admin' | 'user' | 'owner'; // 'owner' kept for backward compatibility migration

export interface Company {
  id: string;
  name: string;
  domain: string; // e.g., 'sitc.sa'
  logo: string; // Base64
  created: number;
}

export interface User {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  companyId?: string; // Optional for Super Admin
  created: number;
  createdBy?: string; 
  mustChangePassword?: boolean; // NEW: For temporary passwords
}

export interface ProposalHistory {
  timestamp: number;
  action: string;
  userEmail: string;
  userRole?: string;
  details?: string;
}

export interface ProposalVersion {
  timestamp: number;
  savedBy: string;
  data: string; // JSON string of the ProposalData at that time
}

export interface GlobalSettings {
  defaultCompanyLogo: string;
}

export interface ProposalData {
  id: string; 
  companyId?: string; // Links proposal to a company
  lastModified: number;
  proposalName: string; // NEW: Required Proposal Name
  customerName: string;
  branding: Branding;
  pricing: PricingConfig;
  hotelOptions: HotelDetails[]; 
  flightOptions: FlightDetails[]; 
  transportation: TransportationDetails[];
  customItems: CustomItem[];
  activities: ActivityDetails[];
  inclusions: Inclusions;
  
  createdBy: string;
  sharedWith: string[];
  history: ProposalHistory[];
  versions: ProposalVersion[]; // NEW: Version Control
  isDeleted?: boolean; // NEW: Soft Delete
}
