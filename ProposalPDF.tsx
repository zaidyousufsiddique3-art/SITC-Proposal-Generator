
import React from 'react';
import { ProposalData, HotelDetails, MarkupType, VatRule, HotelImage, FlightDetails, FlightLeg, MarkupConfig, FlightQuote, TransportationDetails, ActivityDetails, CustomItem } from '../types';
import { PalmLogo, BusIcon, ActivityIcon, PlaneIcon, BedIcon, MeetingIcon, UtensilsIcon } from './Icons';

// --- Logic Helpers ---

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

// Pricing Breakdown Helper
const calculatePriceBreakdown = (net: number, markup: MarkupConfig, vatRule: VatRule, vatPercent: number = 15, quantity: number = 1, days: number = 1) => {
    let markupAmount = 0;
    const totalNet = net * quantity * days;

    if (markup.type === MarkupType.Fixed) {
        // Fixed markup usually per unit, so multiply by quantity/days if applicable? 
        // Requirement implies markup is config. Let's assume Fixed is total or per unit? 
        // Standard practice: Fixed amount per unit.
        markupAmount = markup.value * quantity * days;
    } else {
        markupAmount = totalNet * (markup.value / 100);
    }

    const basePrice = totalNet + markupAmount;
    let subTotal = 0; 
    let vatAmount = 0;
    let grandTotal = 0;

    if (vatRule === 'domestic') {
        subTotal = basePrice;
        vatAmount = subTotal * (vatPercent / 100);
        grandTotal = subTotal + vatAmount;
    } else {
        // International: VAT on markup only
        const vatOnMarkup = markupAmount * (vatPercent / 100);
        subTotal = basePrice; // Sell price before VAT (technically includes markup)
        vatAmount = vatOnMarkup;
        grandTotal = subTotal + vatAmount;
    }

    return { subTotal, vatAmount, grandTotal };
};

// Flight Specific Helper
const calculateFlightTotal = (quotes: FlightQuote[], markup: MarkupConfig, vatRule: VatRule, vatPercent: number) => {
    let legSubTotal = 0;
    let legVat = 0;
    let legGrandTotal = 0;

    quotes.forEach(q => {
        // q.price is Net Price per seat
        // q.quantity is Number of seats
        const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(q.price, markup, vatRule, vatPercent, q.quantity, 1);
        legSubTotal += subTotal;
        legVat += vatAmount;
        legGrandTotal += grandTotal;
    });

    return { subTotal: legSubTotal, vatAmount: legVat, grandTotal: legGrandTotal };
};

// --- Components ---

interface LegDisplayProps {
    leg: FlightLeg;
}
const LegDisplay: React.FC<LegDisplayProps> = ({ leg }) => (
    <div className="flex gap-4 mb-4 last:mb-0 relative pl-4 border-l-2 border-gray-200 break-inside-avoid">
        <div className="absolute -left-[5px] top-1 w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
                {/* 16.1 / 8: Bold & Larger Airline Name */}
                <div className="text-2xl font-bold text-gray-800">{leg.airline} <span className="text-sm font-normal text-gray-500">({leg.flightNumber})</span></div>
                <div className="text-xs text-gray-400">{leg.duration}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="font-bold text-corporate-blue">{leg.from}</div>
                    <div className="text-gray-500">{leg.departureDate} @ {leg.departureTime}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-corporate-blue">{leg.to}</div>
                    <div className="text-gray-500">{leg.arrivalDate} @ {leg.arrivalTime}</div>
                </div>
            </div>
        </div>
    </div>
);

// --- Sections ---

const CoverPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-12 bg-corporate-light page-break relative overflow-hidden">
     {/* Decorative Elements */}
     <div className="absolute top-0 left-0 w-full h-4 bg-corporate-blue"></div>
     <div className="absolute bottom-0 right-0 w-64 h-64 bg-corporate-gold/10 rounded-full -mr-32 -mb-32"></div>
     <div className="absolute top-20 left-10 w-32 h-32 border-4 border-corporate-blue/10 rounded-full"></div>

     <div className="mb-12 relative z-10">
        {data.branding.companyLogo ? (
            <img src={data.branding.companyLogo} className="h-40 mx-auto object-contain mb-8 drop-shadow-md" alt="Company Logo" />
        ) : (
            <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center text-gray-400">No Logo</div>
        )}
        <div className="w-24 h-1 bg-corporate-gold mx-auto rounded-full"></div>
     </div>
     
     <h1 className="text-5xl font-display font-bold text-corporate-blue mb-4 tracking-tight leading-tight max-w-4xl">{data.proposalName}</h1>
     <h2 className="text-2xl font-light text-gray-600 mb-8 max-w-2xl mx-auto">{data.customerName}</h2>
     
     <div className="mt-12 p-8 bg-white shadow-xl rounded-2xl border border-gray-100 max-w-md w-full relative z-10">
         <div className="flex flex-col gap-4">
             <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Date</span>
                 <span className="font-semibold text-gray-700">{new Date(data.lastModified).toLocaleDateString()}</span>
             </div>
             <div className="flex justify-between border-b border-gray-100 pb-2">
                 <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Prepared By</span>
                 <span className="font-semibold text-gray-700">{data.branding.contactName}</span>
             </div>
             {data.branding.contactEmail && (
                 <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Email</span>
                    <span className="font-semibold text-gray-700">{data.branding.contactEmail}</span>
                 </div>
             )}
         </div>
     </div>
  </div>
);

const TermsPage: React.FC = () => (
    <div className="w-full min-h-screen bg-white p-12 page-break flex">
        {/* Left Panel - No Logo as per Requirement 16.2/1.2 */}
        <div className="w-1/4 border-r-2 border-gray-100 pr-8 flex flex-col justify-center items-center">
            {/* Logo REMOVED intentionally */}
            <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center text-gray-300 text-xs text-center p-4">
                Terms & Conditions
            </div>
        </div>
        <div className="w-3/4 pl-12 text-gray-600 text-sm leading-relaxed">
            <h2 className="text-2xl font-bold text-corporate-blue mb-8">Terms & Conditions</h2>
            <div className="space-y-6">
                <p><strong>1. Booking Confirmation:</strong> All bookings are subject to availability at the time of confirmation. Prices are subject to change without prior notice until the final booking is secured.</p>
                <p><strong>2. Payment Policy:</strong> Full payment is required 14 days prior to arrival to guarantee the reservation. We accept bank transfers and major credit cards.</p>
                <p><strong>3. Cancellation Policy:</strong> Cancellations made more than 30 days before arrival will incur no charges. Cancellations between 14-30 days will be charged 50%. Cancellations within 14 days are non-refundable.</p>
                <p><strong>4. Flight Changes:</strong> Flight schedules are subject to change by the airline. We are not responsible for delays or cancellations by the carrier.</p>
                <p><strong>5. Travel Documents:</strong> Passengers are responsible for ensuring they have valid passports and visas for travel.</p>
                <p><strong>6. Liability:</strong> We act only as agents for the passenger in regard to travel, whether by railroad, motorcar, motorcoach, boat, or airplane, and assume no liability for injury, damage, loss, accident, delay, or irregularity.</p>
            </div>
        </div>
    </div>
);

const HotelSection: React.FC<{ hotel: HotelDetails, index: number, pricing: any }> = ({ hotel, index, pricing }) => {
    // Determine Image Layout
    const images = hotel.images;

    const renderPrice = (label: string, subLabel: string, amount: number) => {
        if (!pricing.showPrices) return null;
        return (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div className="font-bold text-gray-700">{label}</div>
                    <div className="text-xs text-gray-400">{subLabel}</div>
                </div>
                <div className="font-bold text-corporate-blue text-lg">{formatCurrency(amount, pricing.currency)}</div>
            </div>
        );
    };

    return (
      <div className="w-full min-h-screen bg-slate-50 p-10 page-break flex flex-col">
        <div className="flex justify-between items-end border-b-2 border-corporate-blue/20 pb-4 mb-8">
           <h2 className="text-3xl font-bold text-corporate-blue flex items-center gap-3">
             <span className="bg-corporate-blue text-white w-10 h-10 flex items-center justify-center rounded-lg text-xl">{index + 1}</span>
             {hotel.name}
           </h2>
        </div>

        {/* 9. Image Sizing: Larger, Object Contain */}
        {images.length > 0 && (
            <div className="grid grid-cols-2 gap-6 mb-8 break-inside-avoid">
                 {images.slice(0, 4).map((img, i) => (
                     <div key={i} className={`rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white ${i === 0 ? 'col-span-2' : ''}`}>
                         <img 
                            src={img.url} 
                            className={`w-full object-contain ${i === 0 ? 'max-h-[500px]' : 'max-h-[300px]'}`} 
                            alt="Hotel" 
                        />
                     </div>
                 ))}
            </div>
        )}

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-5 flex flex-col gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Property Details</h3>
                   {hotel.location && <div className="text-sm text-gray-600 mb-2"><strong>Location:</strong> {hotel.location}</div>}
                   {hotel.website && <div className="text-sm text-blue-500 underline mb-2"><a href={hotel.website} target="_blank" rel="noreferrer">Visit Website</a></div>}
               </div>

               {pricing.showPrices && (
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Room Rates</h3>
                       <div className="space-y-4">
                           {hotel.roomTypes.map((rt, i) => {
                               // Calculate Per Room Grand Total
                               const { grandTotal } = calculatePriceBreakdown(rt.netPrice, pricing.markups.hotels, hotel.vatRule, pricing.vatPercent, 1, rt.numNights);
                               const totalForLine = grandTotal * rt.quantity;
                               return renderPrice(rt.name, `${rt.quantity} Room(s) x ${rt.numNights} Night(s)`, totalForLine);
                           })}
                       </div>
                   </div>
               )}
            </div>

            <div className="col-span-7 space-y-6">
                {/* Meeting Rooms (First) */}
                {hotel.meetingRooms.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid">
                         <div className="flex items-center gap-2 mb-4">
                            <MeetingIcon />
                            <h3 className="text-lg font-bold text-gray-800">Meeting Rooms</h3>
                         </div>
                         <div className="space-y-4">
                             {hotel.meetingRooms.map((m, i) => {
                                 const { grandTotal } = calculatePriceBreakdown(m.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, m.quantity, m.days);
                                 return (
                                     <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                                         <div className="flex justify-between">
                                             <div className="font-bold text-gray-700">{m.name}</div>
                                             {pricing.showPrices && <div className="font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</div>}
                                         </div>
                                         <div className="text-xs text-gray-500 mt-1">
                                             {m.startDate} to {m.endDate} ({m.days} Days) • {m.quantity} Guests
                                         </div>
                                         <div className="text-xs text-gray-400 mt-1 italic">
                                            {formatCurrency(m.price, pricing.currency)}/guest/day
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                )}

                {/* Dining (Below Meeting Rooms) */}
                {hotel.dining.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid">
                         <div className="flex items-center gap-2 mb-4">
                            <UtensilsIcon />
                            <h3 className="text-lg font-bold text-gray-800">Dining Options</h3>
                         </div>
                         <div className="space-y-4">
                             {hotel.dining.map((d, i) => {
                                 const { grandTotal } = calculatePriceBreakdown(d.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, d.quantity, d.days);
                                 return (
                                     <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                                         <div className="flex justify-between">
                                             <div className="font-bold text-gray-700">{d.name}</div>
                                             {pricing.showPrices && <div className="font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</div>}
                                         </div>
                                         <div className="text-xs text-gray-500 mt-1">
                                             {d.startDate ? `${d.startDate} to ${d.endDate} (${d.days} Days)` : `${d.days} Days`} • {d.quantity} Guests
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
};

const FlightSection: React.FC<{ flights: FlightDetails[], pricing: any }> = ({ flights, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break flex flex-col">
        <div className="flex justify-between items-center border-b-2 border-corporate-blue/20 pb-4 mb-8">
           <div className="flex items-center gap-3">
               <div className="bg-corporate-blue text-white w-10 h-10 flex items-center justify-center rounded-lg"><PlaneIcon /></div>
               <h2 className="text-3xl font-bold text-corporate-blue">Flight Itinerary</h2>
           </div>
        </div>

        {flights.map((flight, idx) => {
            // 16.1 Flight Pricing Calculation Per Quote
            const quotesBreakdown = flight.quotes.map(q => {
                 const { grandTotal } = calculatePriceBreakdown(q.price, pricing.markups.flights, flight.vatRule, pricing.vatPercent, q.quantity, 1);
                 return { ...q, grandTotal };
            });

            return (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 break-inside-avoid">
                    <h3 className="text-xl font-bold text-gray-700 mb-6 border-l-4 border-corporate-gold pl-3">{flight.routeDescription || `Option ${idx+1}`}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Outbound</h4>
                            <div className="space-y-4">
                                {flight.outbound.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Return</h4>
                            <div className="space-y-4">
                                {flight.return.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                            </div>
                        </div>
                    </div>

                    {pricing.showPrices && (
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                             <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase">Total Cost Estimate</h4>
                             <div className="space-y-2">
                                 {quotesBreakdown.map((q, i) => (
                                     <div key={i} className="flex justify-between items-center text-sm">
                                         <span>{q.class} Class <span className="text-gray-400">({q.quantity} Seats)</span></span>
                                         <span className="font-bold text-corporate-blue">{formatCurrency(q.grandTotal, pricing.currency)}</span>
                                     </div>
                                 ))}
                                 <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center font-bold text-lg">
                                     <span>Total</span>
                                     <span className="text-corporate-blue">
                                         {formatCurrency(quotesBreakdown.reduce((acc, curr) => acc + curr.grandTotal, 0), pricing.currency)}
                                     </span>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

// 6. Center Aligned Transportation
const TransportSection: React.FC<{ transport: TransportationDetails[], pricing: any }> = ({ transport, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break flex flex-col items-center">
        <div className="w-full text-center border-b-2 border-corporate-blue/20 pb-4 mb-12">
            <h2 className="text-3xl font-bold text-corporate-blue inline-flex items-center gap-3">
               <BusIcon /> Transportation
            </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 w-full max-w-4xl">
             {transport.map((item, i) => {
                 const { grandTotal } = calculatePriceBreakdown(item.netPricePerDay, pricing.markups.transportation, item.vatRule, pricing.vatPercent, item.quantity, item.days);
                 return (
                     <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden break-inside-avoid text-center">
                         {item.image && (
                             <div className="w-full bg-gray-100 flex items-center justify-center p-4">
                                 <img src={item.image} className="max-h-[400px] w-auto max-w-[90%] object-contain" alt={item.model} />
                             </div>
                         )}
                         <div className="p-8">
                             <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.model}</h3>
                             <p className="text-gray-500 mb-4">{item.type} • {item.description}</p>
                             <div className="inline-block bg-slate-50 rounded-lg px-8 py-4 border border-slate-100">
                                 {pricing.showPrices && (
                                     <div className="text-3xl font-bold text-corporate-blue mb-1">
                                         {formatCurrency(grandTotal, pricing.currency)}
                                     </div>
                                 )}
                                 <div className="text-xs text-gray-400 font-medium">
                                     {item.quantity} Vehicle(s) × {item.days} Day(s)
                                 </div>
                             </div>
                         </div>
                     </div>
                 );
             })}
        </div>
    </div>
);

const ActivitiesSection: React.FC<{ activities: ActivityDetails[], pricing: any }> = ({ activities, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break">
        <div className="flex items-center gap-3 border-b-2 border-corporate-blue/20 pb-4 mb-8">
            <div className="bg-corporate-blue text-white w-10 h-10 flex items-center justify-center rounded-lg"><ActivityIcon /></div>
            <h2 className="text-3xl font-bold text-corporate-blue">Activities & Tours</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
            {activities.map((act, i) => {
                const { grandTotal } = calculatePriceBreakdown(act.pricePerPerson, pricing.markups.activities, act.vatRule, pricing.vatPercent, act.guests, act.days);
                return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid flex flex-col">
                        {act.image && (
                            <div className="h-48 w-full bg-gray-100">
                                <img src={act.image} className="w-full h-full object-cover" alt={act.name} />
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{act.name}</h3>
                            <div className="text-sm text-gray-500 mb-4">
                                {act.startDate} to {act.endDate} ({act.days} Days) • {act.guests} Guests
                            </div>
                            {pricing.showPrices && (
                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Total Price</span>
                                    <span className="text-xl font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const CustomSection: React.FC<{ items: CustomItem[], pricing: any }> = ({ items, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break">
        <div className="flex items-center gap-3 border-b-2 border-corporate-blue/20 pb-4 mb-8">
            <h2 className="text-3xl font-bold text-corporate-blue">Additional Services</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
             {items.map((item, i) => {
                 const { grandTotal } = calculatePriceBreakdown(item.unitPrice, pricing.markups.customItems, item.vatRule, pricing.vatPercent, item.quantity, item.days);
                 return (
                     <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                         <div>
                             <div className="font-bold text-gray-700 text-lg">{item.description}</div>
                             <div className="text-sm text-gray-400">{item.days} Days • {item.quantity} Units</div>
                         </div>
                         {pricing.showPrices && <div className="text-xl font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</div>}
                     </div>
                 );
             })}
        </div>
    </div>
);

// 2. Summary Page - Single Page Fit
const SummaryPage: React.FC<{ data: ProposalData }> = ({ data }) => {
    const { pricing } = data;
    const currency = pricing.currency;

    let totalSub = 0;
    let totalVat = 0;
    let totalGrand = 0;

    const addTotal = (sub: number, vat: number, grand: number) => {
        totalSub += sub;
        totalVat += vat;
        totalGrand += grand;
    };

    const renderLineItem = (label: string, formula: string, sub: number, vat: number, grand: number) => {
        addTotal(sub, vat, grand);
        return (
            <div className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0">
                <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{label}</span>
                    <span className="text-xs text-gray-400 font-mono">{formula}</span>
                </div>
                <div className="font-bold text-gray-800">{formatCurrency(grand, currency)}</div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-white p-12 page-break flex flex-col justify-center">
             <div className="max-w-3xl mx-auto w-full border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                 <div className="bg-corporate-blue p-6 text-center">
                     <h2 className="text-3xl font-display font-bold text-white">Price Summary</h2>
                     <p className="text-white/70 text-sm mt-1">Consolidated Breakdown</p>
                 </div>
                 
                 <div className="p-8 space-y-8 bg-slate-50/50">
                     {/* Hotels */}
                     {data.hotelOptions.length > 0 && (
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Accommodation</h4>
                             {data.hotelOptions.map(h => {
                                 const roomItems = h.roomTypes.filter(r => r.includeInSummary !== false).map((r, i) => {
                                      const res = calculatePriceBreakdown(r.netPrice, pricing.markups.hotels, h.vatRule, pricing.vatPercent, r.quantity, r.numNights);
                                      return renderLineItem(`${h.name} - ${r.name}`, `${r.quantity} Room(s) × ${r.numNights} Night(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                                 });
                                 const meetingItems = h.meetingRooms.filter(m => m.includeInSummary !== false).map((m, i) => {
                                      const res = calculatePriceBreakdown(m.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, m.quantity, m.days);
                                      return renderLineItem(`Meeting: ${m.name}`, `${m.days} Day(s) × ${m.quantity} Guest(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                                 });
                                 const diningItems = h.dining.filter(d => d.includeInSummary !== false).map((d, i) => {
                                      const res = calculatePriceBreakdown(d.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, d.quantity, d.days);
                                      return renderLineItem(`Dining: ${d.name}`, `${d.days} Day(s) × ${d.quantity} Guest(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                                 });
                                 return [...roomItems, ...meetingItems, ...diningItems];
                             })}
                         </div>
                     )}

                     {/* Flights */}
                     {data.inclusions.flights && data.flightOptions.length > 0 && (
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Flights</h4>
                             {data.flightOptions.map(f => 
                                 f.includeInSummary !== false && f.quotes.map(q => {
                                     const res = calculatePriceBreakdown(q.price, pricing.markups.flights, f.vatRule, pricing.vatPercent, q.quantity, 1);
                                     return renderLineItem(`${f.routeDescription} (${q.class})`, `${q.quantity} Seat(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                                 })
                             )}
                         </div>
                     )}
                     
                     {/* Transport */}
                     {data.inclusions.transportation && data.transportation.length > 0 && (
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Transportation</h4>
                             {data.transportation.map(t => {
                                 if (t.includeInSummary === false) return null;
                                 const res = calculatePriceBreakdown(t.netPricePerDay, pricing.markups.transportation, t.vatRule, pricing.vatPercent, t.quantity, t.days);
                                 return renderLineItem(`${t.type} - ${t.model}`, `${t.quantity} Car(s) × ${t.days} Day(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                             })}
                         </div>
                     )}

                     {/* Activities & Custom */}
                     {(data.activities.length > 0 || data.customItems.length > 0) && (
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Activities & Extras</h4>
                             {data.activities.map(a => {
                                 if (a.includeInSummary === false) return null;
                                 const res = calculatePriceBreakdown(a.pricePerPerson, pricing.markups.activities, a.vatRule, pricing.vatPercent, a.guests, a.days);
                                 return renderLineItem(a.name, `${a.guests} Guest(s) × ${a.days} Day(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                             })}
                             {data.customItems.map(c => {
                                 if (c.includeInSummary === false) return null;
                                 const res = calculatePriceBreakdown(c.unitPrice, pricing.markups.customItems, c.vatRule, pricing.vatPercent, c.quantity, c.days);
                                 return renderLineItem(c.description, `${c.quantity} Unit(s) × ${c.days} Day(s)`, res.subTotal, res.vatAmount, res.grandTotal);
                             })}
                         </div>
                     )}
                 </div>

                 {/* Grand Totals */}
                 <div className="bg-gray-800 p-8 text-white">
                     <div className="flex justify-between items-center mb-2 text-gray-400">
                         <span>Sub Total</span>
                         <span>{formatCurrency(totalSub, currency)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-6 text-gray-400">
                         <span>VAT (Inclusive where applicable)</span>
                         <span>{formatCurrency(totalVat, currency)}</span>
                     </div>
                     <div className="h-px bg-gray-600 mb-6"></div>
                     <div className="flex justify-between items-center text-4xl font-bold text-corporate-gold">
                         <span>Grand Total</span>
                         <span>{formatCurrency(totalGrand, currency)}</span>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
  return (
    <div className="print-container font-sans text-gray-900 bg-white">
      <CoverPage data={data} />
      <TermsPage />
      {data.inclusions.hotels && data.hotelOptions.map((h, i) => <HotelSection key={i} hotel={h} index={i} pricing={data.pricing} />)}
      {data.inclusions.flights && data.flightOptions.length > 0 && <FlightSection flights={data.flightOptions} pricing={data.pricing} />}
      {data.inclusions.transportation && data.transportation.length > 0 && <TransportSection transport={data.transportation} pricing={data.pricing} />}
      {data.inclusions.activities && data.activities.length > 0 && <ActivitiesSection activities={data.activities} pricing={data.pricing} />}
      {data.inclusions.customItems && data.customItems.length > 0 && <CustomSection items={data.customItems} pricing={data.pricing} />}
      <SummaryPage data={data} />
    </div>
  );
};
