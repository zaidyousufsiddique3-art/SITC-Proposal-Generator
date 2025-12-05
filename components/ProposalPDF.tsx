import React from 'react';
import { ProposalData, HotelDetails, MarkupType, VatRule, FlightDetails, FlightLeg, MarkupConfig, FlightQuote, TransportationDetails, ActivityDetails, CustomItem } from '../types';
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
        const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(q.price, markup, vatRule, vatPercent, q.quantity, 1);
        legSubTotal += subTotal;
        legVat += vatAmount;
        legGrandTotal += grandTotal;
    });

    return { subTotal: legSubTotal, vatAmount: legVat, grandTotal: legGrandTotal };
};

// --- Components ---

const CoverPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full h-screen flex bg-white page-break relative overflow-hidden print:flex print:h-screen print:overflow-hidden">
        {/* Left Content Section (60%) */}
        <div className="w-[60%] pl-24 pr-12 flex flex-col justify-center relative z-10">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-corporate-blue mb-4 leading-tight">
                    {data.customerName}
                </h1>
                <div className="text-xl text-gray-500 font-medium flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-corporate-gold inline-block"></span>
                    {(() => {
                        let start = '';
                        let end = '';

                        if (data.flightOptions.length > 0) {
                            start = data.flightOptions[0].outbound[0]?.departureDate;
                            end = data.flightOptions[0].return[0]?.departureDate;
                        } else if (data.hotelOptions.length > 0) {
                            start = data.hotelOptions[0].roomTypes[0]?.checkIn;
                            end = data.hotelOptions[0].roomTypes[0]?.checkOut;
                        }

                        if (start && end) {
                            const s = new Date(start);
                            const e = new Date(end);
                            return `${s.getDate()}th - ${e.getDate()}th ${s.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
                        }
                        return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    })()}
                </div>
            </div>
        </div>

        {/* Right Blue Section (40%) with Angled Edge */}
        <div className="absolute top-0 right-0 w-[45%] h-full bg-corporate-blue transform -skew-x-12 origin-top-right translate-x-20 overflow-hidden flex items-center justify-center">
            {/* Un-skew the content */}
            <div className="transform skew-x-12 flex flex-col items-center justify-center h-full pr-20">
                <img src="/assets/sitc_logo.png" className="w-64 object-contain brightness-0 invert" alt="SITC Logo" />
                <div className="text-white text-center mt-6">
                    <div className="font-bold text-2xl tracking-wider mb-1">SITC</div>
                    <div className="text-sm opacity-80 tracking-widest uppercase">Saudi International Travel Company</div>
                </div>
            </div>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #fff 20px, #fff 21px)' }}></div>
        </div>
    </div>
);

const TermsPage: React.FC = () => (
    <div className="w-full min-h-screen bg-white page-break flex relative flex-col p-16">
        <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-2">GENERAL TERMS & CONDITIONS</h2>
        <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-xs text-gray-600 leading-relaxed font-sans">
            <div>
                <h4 className="font-bold text-corporate-blue mb-2">1. Booking Confirmation</h4>
                <p className="mb-4">All bookings are subject to availability at the time of confirmation. Prices are subject to change without prior notice until the final booking is secured.</p>

                <h4 className="font-bold text-corporate-blue mb-2">2. Payment Policy</h4>
                <p className="mb-4">Full payment is required 14 days prior to arrival to guarantee the reservation. We accept bank transfers and major credit cards.</p>

                <h4 className="font-bold text-corporate-blue mb-2">3. Cancellation Policy</h4>
                <p>Cancellations made more than 30 days before arrival will incur no charges. Cancellations between 14-30 days will be charged 50%. Cancellations within 14 days are non-refundable.</p>
            </div>
            <div>
                <h4 className="font-bold text-corporate-blue mb-2">4. Flight Changes</h4>
                <p className="mb-4">Flight schedules are subject to change by the airline. We are not responsible for delays or cancellations by the carrier.</p>

                <h4 className="font-bold text-corporate-blue mb-2">5. Travel Documents</h4>
                <p className="mb-4">Passengers are responsible for ensuring they have valid passports and visas for travel.</p>

                <h4 className="font-bold text-corporate-blue mb-2">6. Liability</h4>
                <p>We act only as agents for the passenger in regard to travel, whether by railroad, motorcar, motorcoach, boat, or airplane, and assume no liability for injury, damage, loss, accident, delay, or irregularity.</p>
            </div>
        </div>
    </div>
);

// Removed DestinationIntroPage as it was not in the requirements list (Screenshots 1-15 do not show it, or it was replaced).
// Screenshot 3 is Hotel Option 1 (Visuals).
// Screenshot 4 is Hotel Option 1 (Details & Costs).

const HotelVisualsPage: React.FC<{ hotel: HotelDetails, index: number }> = ({ hotel, index }) => (
    <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
        <div className=" p-4 inline-block mb-8">
            <h2 className="text-3xl font-bold text-corporate-blue uppercase tracking-tight">
                {hotel.name}
            </h2>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 h-[600px]">
            {/* Main large image (Left) */}
            <div className="h-full bg-gray-100 overflow-hidden relative">
                {hotel.images[0] ? <img src={hotel.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Image 1</div>}
            </div>
            {/* Right Column: 2 Stacked Images */}
            <div className="flex flex-col gap-4 h-full">
                <div className="flex-1 bg-gray-100 overflow-hidden relative">
                    {hotel.images[1] ? <img src={hotel.images[1].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Image 2</div>}
                </div>
                <div className="flex-1 bg-gray-100 overflow-hidden relative">
                    {hotel.images[2] ? <img src={hotel.images[2].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Image 3</div>}
                </div>
            </div>
        </div>
        <div className="w-full h-2 bg-corporate-gold mt-8"></div>
    </div>
);

const HotelDetailsPage: React.FC<{ hotel: HotelDetails, index: number, pricing: any }> = ({ hotel, index, pricing }) => {
    const currency = pricing.currency;
    let hotelGrand = 0;
    const rows: any[] = [];

    hotel.roomTypes.forEach(r => {
        const res = calculatePriceBreakdown(r.netPrice, pricing.markups.hotels, hotel.vatRule, pricing.vatPercent, r.quantity, r.numNights);
        hotelGrand += res.grandTotal;
        rows.push({ desc: `Accommodation: ${r.name}`, price: res.grandTotal / r.quantity, nights: r.numNights, qty: r.quantity, sub: res.grandTotal });
    });
    hotel.meetingRooms.forEach(m => {
        const res = calculatePriceBreakdown(m.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, m.quantity, m.days);
        hotelGrand += res.grandTotal;
        rows.push({ desc: `Meeting room: ${m.name}`, price: res.grandTotal / m.quantity, nights: m.days, qty: m.quantity, sub: res.grandTotal });
    });
    hotel.dining.forEach(d => {
        const res = calculatePriceBreakdown(d.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, d.quantity, d.days);
        hotelGrand += res.grandTotal;
        rows.push({ desc: `Dining: ${d.name}`, price: res.grandTotal / d.quantity, nights: d.days, qty: d.quantity, sub: res.grandTotal });
    });

    return (
        <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
            <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Property Details</h2>
            <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

            <h3 className="text-xl font-bold text-corporate-gold mb-6">Grand Total - Option {index + 1}</h3>

            <div className=" p-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-corporate-blue text-white">
                            <th className="text-left py-4 px-4 font-bold uppercase text-xs">Service Description</th>
                            <th className="text-center py-4 px-4 font-bold uppercase text-xs">Unit price</th>
                            <th className="text-center py-4 px-4 font-bold uppercase text-xs">Nights</th>
                            <th className="text-center py-4 px-4 font-bold uppercase text-xs">Quantity</th>
                            <th className="text-center py-4 px-4 font-bold uppercase text-xs">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="text-corporate-blue">
                        {rows.map((r, i) => (
                            <tr key={i} className="border-b border-gray-200">
                                <td className="py-4 px-4 font-medium">{r.desc}</td>
                                <td className="py-4 px-4 text-center">{formatCurrency(r.price, currency)}</td>
                                <td className="py-4 px-4 text-center">{r.nights}</td>
                                <td className="py-4 px-4 text-center">{r.qty}</td>
                                <td className="py-4 px-4 text-center font-bold">{formatCurrency(r.sub, currency)}</td>
                            </tr>
                        ))}
                        <tr className="bg-corporate-blue text-white">
                            <td colSpan={4} className="py-4 px-4 text-right font-bold uppercase">Final total</td>
                            <td className="py-4 px-4 text-center font-bold">{formatCurrency(hotelGrand, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};





const FlightPage: React.FC<{ flight: FlightDetails, index: number, pricing: any }> = ({ flight, index, pricing }) => {
    const currency = pricing.currency;
    const { grandTotal } = calculateFlightTotal(flight.quotes, pricing.markups.flights, flight.vatRule, pricing.vatPercent);

    return (
        <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
            <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Flight Itinerary</h2>
            <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

            <h3 className="text-xl font-bold text-corporate-gold mb-6">Grand Total - Option {index + 1}</h3>

            <div className=" p-6">
                <div className="border-l-4 border-corporate-gold pl-4 mb-6">
                    <h4 className="font-bold text-corporate-blue text-lg">{flight.routeDescription || 'Flight Route'}</h4>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-8">
                    {/* Outbound */}
                    <div>
                        <h5 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">OUTBOUND</h5>
                        {flight.outbound.map((leg, i) => (
                            <div key={i} className="mb-6 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-corporate-blue text-lg">{leg.airline} <span className="text-sm font-normal text-gray-500">({leg.flightNumber})</span></div>
                                    <div className="text-xs text-gray-400">{leg.duration}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-bold text-corporate-blue">{leg.from}</div>
                                        <div className="text-xs text-gray-500">{leg.departureDate} @ {leg.departureTime}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-corporate-blue">{leg.to}</div>
                                        <div className="text-xs text-gray-500">{leg.arrivalDate} @ {leg.arrivalTime}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Return */}
                    <div>
                        <h5 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">RETURN</h5>
                        {flight.return.map((leg, i) => (
                            <div key={i} className="mb-6 last:mb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-corporate-blue text-lg">{leg.airline} <span className="text-sm font-normal text-gray-500">({leg.flightNumber})</span></div>
                                    <div className="text-xs text-gray-400">{leg.duration}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-bold text-corporate-blue">{leg.from}</div>
                                        <div className="text-xs text-gray-500">{leg.departureDate} @ {leg.departureTime}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-corporate-blue">{leg.to}</div>
                                        <div className="text-xs text-gray-500">{leg.arrivalDate} @ {leg.arrivalTime}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#f8fafc] p-6 rounded-lg">
                    <h5 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">TOTAL COST ESTIMATE</h5>
                    {flight.quotes.map((q, i) => {
                        const res = calculatePriceBreakdown(q.price, pricing.markups.flights, flight.vatRule, pricing.vatPercent, q.quantity, 1);
                        return (
                            <div key={i} className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-gray-600 font-medium">{q.class} Class <span className="text-xs opacity-70">({q.quantity} Seats)</span></span>
                                <span className="font-bold text-corporate-blue">{formatCurrency(res.grandTotal, currency)}</span>
                            </div>
                        );
                    })}
                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                        <span className="font-bold text-corporate-blue">Total</span>
                        <span className="font-bold text-corporate-blue text-xl">{formatCurrency(grandTotal, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransportationPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
        <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Transportation</h2>
        <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

        <div className="space-y-8">
            {data.transportation.map((t, i) => {
                const res = calculatePriceBreakdown(t.netPricePerDay, data.pricing.markups.transportation, t.vatRule, data.pricing.vatPercent, t.quantity, t.days);
                return (
                    <div key={i} className="flex gap-8 items-start">
                        <div className="w-1/2  p-2">
                            {t.image ? <img src={t.image} className="w-full h-64 object-cover" /> : <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">Vehicle Image</div>}
                        </div>
                        <div className="w-1/2  p-6 flex flex-col justify-center h-full min-h-[250px]">
                            <h3 className="text-xl font-bold text-corporate-blue mb-2">{t.model}</h3>
                            <p className="text-gray-500 text-sm mb-6">{t.type} • {t.description}</p>

                            <div className="bg-[#f8fafc] p-4 rounded text-center">
                                <div className="text-2xl font-bold text-corporate-blue mb-1">{formatCurrency(res.grandTotal, data.pricing.currency)}</div>
                                <div className="text-xs text-gray-400">{t.quantity} Vehicle(s) • {t.days} Day(s)</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const AdditionalServicesPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
        <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Additional Services</h2>
        <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

        <div className=" p-6">
            {data.customItems.map((item, i) => {
                const res = calculatePriceBreakdown(item.unitPrice, data.pricing.markups.customItems, item.vatRule, data.pricing.vatPercent, item.quantity, item.days);
                return (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                        <div>
                            <h4 className="font-bold text-corporate-blue">{item.description}</h4>
                            <div className="text-xs text-gray-400">{item.days} Days • {item.quantity} Units</div>
                        </div>
                        <div className="font-bold text-corporate-blue">{formatCurrency(res.grandTotal, data.pricing.currency)}</div>
                    </div>
                );
            })}
            {data.activities.map((item, i) => {
                const res = calculatePriceBreakdown(item.pricePerPerson, data.pricing.markups.activities, item.vatRule, data.pricing.vatPercent, item.guests, item.days);
                return (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                        <div>
                            <h4 className="font-bold text-corporate-blue">{item.name}</h4>
                            <div className="text-xs text-gray-400">{item.days} Days • {item.guests} Guests</div>
                        </div>
                        <div className="font-bold text-corporate-blue">{formatCurrency(res.grandTotal, data.pricing.currency)}</div>
                    </div>
                );
            })}
        </div>
    </div>
);

// Investment Summary Pages (Screenshots 11-14)
// We need separate summary pages for each option if they exist.
// Actually, the screenshots show "Investment Summary" with "Accommodation Option 1", "Accommodation Option 2", "Flight Option 1", "Flight Option 2".
// This suggests we might want to group them or have them on separate pages.
// Screenshot 11: Investment Summary - Accommodation Option 1
// Screenshot 12: Investment Summary - Accommodation Option 2
// Screenshot 13: Investment Summary - Flight Option 1
// Screenshot 14: Investment Summary - Flight Option 2

const InvestmentSummaryPage: React.FC<{ title: string, rows: any[], total: number, currency: string }> = ({ title, rows, total, currency }) => (
    <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
        <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Investment Summary</h2>
        <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

        <h3 className="text-xl font-bold text-corporate-gold mb-6">{title}</h3>

        <div className=" p-2">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-corporate-blue text-white">
                        <th className="text-left py-4 px-4 font-bold uppercase text-xs">Service Description</th>
                        <th className="text-center py-4 px-4 font-bold uppercase text-xs">Unit Price</th>
                        <th className="text-center py-4 px-4 font-bold uppercase text-xs">Nights/Days</th>
                        <th className="text-center py-4 px-4 font-bold uppercase text-xs">Quantity</th>
                        <th className="text-center py-4 px-4 font-bold uppercase text-xs">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="text-corporate-blue">
                    {rows.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200">
                            <td className="py-4 px-4 font-medium">{r.desc}</td>
                            <td className="py-4 px-4 text-center">{formatCurrency(r.price, currency)}</td>
                            <td className="py-4 px-4 text-center">{r.nights}</td>
                            <td className="py-4 px-4 text-center">{r.qty}</td>
                            <td className="py-4 px-4 text-center font-bold">{formatCurrency(r.sub, currency)}</td>
                        </tr>
                    ))}
                    <tr className="bg-[#f8fafc]">
                        <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-500 uppercase text-xs">Sub Total</td>
                        <td className="py-4 px-4 text-center font-bold text-gray-500">{formatCurrency(total / 1.15, currency)}</td> {/* Approx VAT reverse for display if needed, or just show subtotal */}
                    </tr>
                    <tr className="bg-[#f8fafc]">
                        <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-500 uppercase text-xs">VAT (15%)</td>
                        <td className="py-4 px-4 text-center font-bold text-gray-500">{formatCurrency(total - (total / 1.15), currency)}</td>
                    </tr>
                    <tr className="bg-[#f0f9ff]">
                        <td colSpan={4} className="py-4 px-4 text-right font-bold text-corporate-blue uppercase">Grand Total</td>
                        <td className="py-4 px-4 text-center font-bold text-corporate-blue text-lg">{formatCurrency(total, currency)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const FlightSummaryPage: React.FC<{ title: string, flight: FlightDetails, pricing: any }> = ({ title, flight, pricing }) => {
    const currency = pricing.currency;
    const { grandTotal } = calculateFlightTotal(flight.quotes, pricing.markups.flights, flight.vatRule, pricing.vatPercent);

    return (
        <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
            <h2 className="text-3xl font-bold text-corporate-blue uppercase mb-8">Investment Summary</h2>
            <div className="w-full h-0.5 bg-corporate-gold mb-12"></div>

            <h3 className="text-xl font-bold text-corporate-gold mb-6">{title}</h3>

            <div className=" p-6">
                <div className="bg-[#f8fafc] p-6 rounded-lg">
                    <h5 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">TOTAL COST ESTIMATE</h5>
                    {flight.quotes.map((q, i) => {
                        const res = calculatePriceBreakdown(q.price, pricing.markups.flights, flight.vatRule, pricing.vatPercent, q.quantity, 1);
                        return (
                            <div key={i} className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-gray-600 font-medium">{q.class} Class <span className="text-xs opacity-70">({q.quantity} Seats)</span></span>
                                <span className="font-bold text-corporate-blue">{formatCurrency(res.grandTotal, currency)}</span>
                            </div>
                        );
                    })}
                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                        <span className="font-bold text-corporate-blue">Total</span>
                        <span className="font-bold text-corporate-blue text-xl">{formatCurrency(grandTotal, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ClosingPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-corporate-blue relative flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #fff 20px, #fff 21px)' }}></div>

        <div className="relative z-10 text-center">
            <h1 className="text-6xl font-bold mb-6">Thank You</h1>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-16 leading-relaxed">
                We appreciate the opportunity to propose these services for you. We look forward to creating an unforgettable experience.
            </p>

            <div className="w-16 h-1 bg-corporate-gold mx-auto mb-8"></div>

            <div className="p-6 inline-block bg-corporate-blue/50 backdrop-blur-sm">
                <div className="font-bold text-xl">{data.branding.contactName}</div>
                <div className="opacity-80">{data.branding.contactEmail}</div>
                <div className="opacity-80 mt-2">www.sitc.com.sa</div>
            </div>
        </div>
    </div>
);

export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
    return (
        <div className="print-container font-sans text-gray-900 bg-white">
            <CoverPage data={data} />
            <TermsPage />

            {/* Hotel Options */}
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => (
                <React.Fragment key={`hotel-${i}`}>
                    <HotelVisualsPage hotel={h} index={i} />
                    <HotelDetailsPage hotel={h} index={i} pricing={data.pricing} />
                </React.Fragment>
            ))}

            {/* Flight Options */}
            {data.inclusions.flights && data.flightOptions.map((f, i) => (
                <FlightPage key={`flight-${i}`} flight={f} index={i} pricing={data.pricing} />
            ))}

            {/* Transportation */}
            {data.inclusions.transportation && data.transportation.length > 0 && (
                <TransportationPage data={data} />
            )}

            {/* Additional Services */}
            {(data.inclusions.customItems || data.inclusions.activities) && (data.customItems.length > 0 || data.activities.length > 0) && (
                <AdditionalServicesPage data={data} />
            )}

            {/* Investment Summaries - Hotels */}
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => {
                // Calculate rows for summary
                const rows: any[] = [];
                let total = 0;
                h.roomTypes.forEach(r => {
                    if (r.includeInSummary !== false) {
                        const res = calculatePriceBreakdown(r.netPrice, data.pricing.markups.hotels, h.vatRule, data.pricing.vatPercent, r.quantity, r.numNights);
                        total += res.grandTotal;
                        rows.push({ desc: `Accommodation: ${h.name} - ${r.name}`, price: res.grandTotal / r.quantity, nights: r.numNights, qty: r.quantity, sub: res.grandTotal });
                    }
                });
                h.meetingRooms.forEach(m => {
                    if (m.includeInSummary !== false) {
                        const res = calculatePriceBreakdown(m.price, data.pricing.markups.meetings, h.vatRule, data.pricing.vatPercent, m.quantity, m.days);
                        total += res.grandTotal;
                        rows.push({ desc: `Event: ${m.name}`, price: res.grandTotal / m.quantity, nights: m.days, qty: m.quantity, sub: res.grandTotal });
                    }
                });
                h.dining.forEach(d => {
                    if (d.includeInSummary !== false) {
                        const res = calculatePriceBreakdown(d.price, data.pricing.markups.meetings, h.vatRule, data.pricing.vatPercent, d.quantity, d.days);
                        total += res.grandTotal;
                        rows.push({ desc: `Dining: ${d.name}`, price: res.grandTotal / d.quantity, nights: d.days, qty: d.quantity, sub: res.grandTotal });
                    }
                });

                return (
                    <InvestmentSummaryPage
                        key={`summary-hotel-${i}`}
                        title={`Accommodation Option ${i + 1}`}
                        rows={rows}
                        total={total}
                        currency={data.pricing.currency}
                    />
                );
            })}

            {/* Investment Summaries - Flights */}
            {data.inclusions.flights && data.flightOptions.map((f, i) => (
                <FlightSummaryPage key={`summary-flight-${i}`} title={`Flight Option ${i + 1}`} flight={f} pricing={data.pricing} />
            ))}

            <ClosingPage data={data} />
        </div>
    );
};
