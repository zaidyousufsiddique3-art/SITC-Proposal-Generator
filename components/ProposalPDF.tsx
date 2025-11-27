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
    <div className="w-full min-h-screen flex bg-white page-break relative overflow-hidden">
        {/* Left Content Section (70%) */}
        <div className="w-[70%] p-16 flex flex-col justify-center relative">
            {/* Logo Top Left */}
            <div className="absolute top-16 left-16">
                {data.branding.companyLogo ? (
                    <img src={data.branding.companyLogo} className="h-24 object-contain" alt="Company Logo" />
                ) : (
                    <div className="h-24 w-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Logo</div>
                )}
            </div>

            <div className="mt-20">
                <h1 className="text-6xl font-display font-bold text-corporate-blue mb-6 tracking-tight leading-tight uppercase">
                    {data.proposalName}
                </h1>
                <div className="w-24 h-2 bg-corporate-gold mb-8"></div>
                <h2 className="text-2xl font-light text-gray-600 uppercase tracking-widest mb-2">Prepared For:</h2>
                <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-12">{data.customerName}</h2>

                <div className="text-gray-500 font-medium">
                    <p className="mb-1">{new Date(data.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>

        {/* Right Blue Patterned Section (30%) */}
        <div className="w-[30%] bg-corporate-blue relative overflow-hidden flex flex-col justify-end p-8 text-white">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #fff 20px, #fff 21px)' }}></div>
            <div className="relative z-10 text-right">
                <div className="font-bold text-xl mb-1">{data.branding.contactName}</div>
                <div className="text-sm opacity-80">{data.branding.contactEmail}</div>
                <div className="text-sm opacity-80">{data.branding.contactPhone}</div>
            </div>
        </div>
    </div>
);

const TermsPage: React.FC = () => (
    <div className="w-full min-h-screen bg-white page-break flex relative">
        {/* Left Blue Patterned Border */}
        <div className="w-16 bg-corporate-blue h-full absolute left-0 top-0 bottom-0 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 11px)' }}></div>
        </div>

        <div className="flex-1 pl-24 pr-16 py-16">
            <h2 className="text-4xl font-display font-bold text-corporate-blue uppercase tracking-tight mb-12 border-b-2 border-gray-100 pb-4">
                General Terms & Conditions:
            </h2>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-sans">
                <ul className="space-y-4">
                    {[
                        "Quoted rates are subject to availability & may change upon confirmation.",
                        "Individual transfers will be charged separately on request.",
                        "Early check-ins and late check-outs are subject to availability of the hotel during the check-in/Check-out.",
                        "Early check-in & late check out charge is applicable to confirm the service as per the discretion of the hotel.",
                        "Prices do not include any personal expenses, tips, room extras and telephone calls.",
                        "All images in this proposal are the most recent provided by the hotel & supplier. SITC holds no responsibility if they later seem inaccurate.",
                        "Payment Method: Upon confirmation, will require a 100% Payment based on the confirmed number of attendees for the events.",
                        "Cancellation policy: Non-Refundable.",
                        "The offer validity date is valid until Sep 05, 2025. After this date, the offer is subject to hotel availability."
                    ].map((term, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                            <span className="text-corporate-accent text-lg mt-[-2px]">•</span>
                            <span>{term}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const DestinationIntroPage: React.FC = () => (
    <div className="w-full min-h-screen bg-white page-break p-16 relative flex flex-col">
        <h2 className="text-4xl font-display font-bold text-corporate-blue uppercase tracking-tight mb-12">
            Destination Highlights
        </h2>

        <div className="flex-1 grid grid-cols-2 gap-8 items-center justify-center">
            <div className="h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative">
                {/* Placeholder for destination image 1 */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Image 1</div>
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative">
                {/* Placeholder for destination image 2 */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Image 2</div>
            </div>
        </div>

        {/* Bottom Left Emblem */}
        <div className="absolute bottom-12 left-12 w-24 h-24 border-4 border-corporate-blue/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-corporate-blue rounded-full opacity-10"></div>
        </div>
    </div>
);

const HotelOverviewPage: React.FC<{ hotel: HotelDetails, index: number }> = ({ hotel, index }) => (
    <div className="w-full min-h-screen bg-white page-break p-12 flex flex-col">
        <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8">
            <div>
                <h2 className="text-3xl font-display font-bold text-corporate-blue uppercase tracking-tight">{hotel.name}</h2>
                <div className="flex gap-1 text-corporate-gold mt-2 text-xl">
                    {'★'.repeat(5)} {/* Static 5 star for layout, or dynamic if data has it */}
                </div>
            </div>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Option {index + 1}</span>
        </div>

        <div className="flex gap-12 flex-1">
            {/* Left Column: Icons */}
            <div className="w-1/4 space-y-8 pt-8">
                <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-corporate-blue"><BedIcon /></div>
                    <span className="font-medium">Luxury Rooms</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-corporate-blue"><UtensilsIcon /></div>
                    <span className="font-medium">Fine Dining</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-corporate-blue"><MeetingIcon /></div>
                    <span className="font-medium">Events</span>
                </div>

                <div className="mt-12 pt-12 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2 font-bold uppercase">Location</p>
                    <p className="text-gray-700 text-sm mb-2">{hotel.location || 'City Center'}</p>
                    {hotel.website && (
                        <a href={hotel.website} className="text-corporate-accent text-sm font-bold hover:underline flex items-center gap-1">
                            Hotel Address - show map →
                        </a>
                    )}
                </div>
            </div>

            {/* Right Column: Images */}
            <div className="w-3/4 grid grid-cols-2 gap-4 h-[600px]">
                {/* Main large image */}
                <div className="col-span-2 h-[350px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    {hotel.images[0] ? <img src={hotel.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                </div>
                {/* Two smaller images */}
                <div className="h-[230px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    {hotel.images[1] ? <img src={hotel.images[1].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                </div>
                <div className="h-[230px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    {hotel.images[2] ? <img src={hotel.images[2].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                </div>
            </div>
        </div>
    </div>
);

const HotelFacilitiesPage: React.FC<{ hotel: HotelDetails }> = ({ hotel }) => (
    <div className="w-full min-h-screen bg-white page-break p-12 flex flex-col relative">
        <h3 className="text-2xl font-display font-bold text-corporate-blue uppercase tracking-tight mb-8">Facilities & Amenities</h3>

        <div className="grid grid-cols-2 gap-6 h-[600px] mb-8">
            <div className="h-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {hotel.images[3] ? <img src={hotel.images[3].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
            </div>
            <div className="h-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {hotel.images[4] ? <img src={hotel.images[4].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
            </div>
            <div className="col-span-2 h-[250px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {hotel.images[5] ? <img src={hotel.images[5].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
            </div>
        </div>

        {/* Bottom Left Pattern */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-corporate-blue/5 rounded-tr-full"></div>
    </div>
);

const PriceSummaryPage: React.FC<{ data: ProposalData }> = ({ data }) => {
    const { pricing } = data;
    const currency = pricing.currency;

    // Calculate Shared Costs
    let sharedGrand = 0;
    if (data.inclusions.flights) data.flightOptions.forEach(f => { if (f.includeInSummary !== false) sharedGrand += calculateFlightTotal(f.quotes, pricing.markups.flights, f.vatRule, pricing.vatPercent).grandTotal; });
    if (data.inclusions.transportation) data.transportation.forEach(t => { if (t.includeInSummary !== false) sharedGrand += calculatePriceBreakdown(t.netPricePerDay, pricing.markups.transportation, t.vatRule, pricing.vatPercent, t.quantity, t.days).grandTotal; });
    if (data.inclusions.activities) data.activities.forEach(a => { if (a.includeInSummary !== false) sharedGrand += calculatePriceBreakdown(a.pricePerPerson, pricing.markups.activities, a.vatRule, pricing.vatPercent, a.guests, a.days).grandTotal; });
    if (data.inclusions.customItems) data.customItems.forEach(c => { if (c.includeInSummary !== false) sharedGrand += calculatePriceBreakdown(c.unitPrice, pricing.markups.customItems, c.vatRule, pricing.vatPercent, c.quantity, c.days).grandTotal; });

    return (
        <div className="w-full min-h-screen bg-white page-break p-16 flex flex-col">
            <h2 className="text-4xl font-display font-bold text-corporate-blue uppercase tracking-tight mb-12 border-b-2 border-gray-100 pb-4">
                Investment Summary
            </h2>

            <div className="flex-1 space-y-16">
                {data.hotelOptions.length > 0 ? data.hotelOptions.map((h, idx) => {
                    let hotelGrand = 0;
                    const rows: any[] = [];

                    h.roomTypes.forEach(r => {
                        if (r.includeInSummary !== false) {
                            const res = calculatePriceBreakdown(r.netPrice, pricing.markups.hotels, h.vatRule, pricing.vatPercent, r.quantity, r.numNights);
                            hotelGrand += res.grandTotal;
                            rows.push({ desc: `Accommodation: ${h.name} - ${r.name}`, price: res.grandTotal / r.quantity, nights: r.numNights, qty: r.quantity, sub: res.grandTotal });
                        }
                    });
                    h.meetingRooms.forEach(m => {
                        if (m.includeInSummary !== false) {
                            const res = calculatePriceBreakdown(m.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, m.quantity, m.days);
                            hotelGrand += res.grandTotal;
                            rows.push({ desc: `Event: ${m.name}`, price: res.grandTotal / m.quantity, nights: m.days, qty: m.quantity, sub: res.grandTotal });
                        }
                    });
                    h.dining.forEach(d => {
                        if (d.includeInSummary !== false) {
                            const res = calculatePriceBreakdown(d.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, d.quantity, d.days);
                            hotelGrand += res.grandTotal;
                            rows.push({ desc: `Dining: ${d.name}`, price: res.grandTotal / d.quantity, nights: d.days, qty: d.quantity, sub: res.grandTotal });
                        }
                    });

                    const total = hotelGrand + sharedGrand;

                    return (
                        <div key={idx} className="break-inside-avoid">
                            <h3 className="text-xl font-bold text-corporate-blue mb-6 uppercase tracking-wider">Grand Total - Option {idx + 1}</h3>
                            <table className="w-full text-sm mb-6">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-200">
                                        <th className="text-left py-3 font-bold uppercase text-xs tracking-wider w-1/2">Service Description</th>
                                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider">Unit Price</th>
                                        <th className="text-center py-3 font-bold uppercase text-xs tracking-wider">Nights/Days</th>
                                        <th className="text-center py-3 font-bold uppercase text-xs tracking-wider">Quantity</th>
                                        <th className="text-right py-3 font-bold uppercase text-xs tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {rows.map((r, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="py-4 font-medium">{r.desc}</td>
                                            <td className="py-4 text-right">{formatCurrency(r.price, currency)}</td>
                                            <td className="py-4 text-center">{r.nights}</td>
                                            <td className="py-4 text-center">{r.qty}</td>
                                            <td className="py-4 text-right font-bold">{formatCurrency(r.sub, currency)}</td>
                                        </tr>
                                    ))}
                                    {sharedGrand > 0 && (
                                        <tr className="border-b border-gray-50 last:border-0">
                                            <td className="py-4 font-medium">Other Services (Flights, Transport, Activities)</td>
                                            <td className="py-4 text-right">-</td>
                                            <td className="py-4 text-center">-</td>
                                            <td className="py-4 text-center">1</td>
                                            <td className="py-4 text-right font-bold">{formatCurrency(sharedGrand, currency)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex justify-end">
                                <div className="bg-corporate-blue text-white px-8 py-4 rounded-lg flex items-center gap-8 shadow-lg">
                                    <span className="uppercase tracking-widest text-sm font-bold opacity-80">Total Amount</span>
                                    <span className="text-3xl font-bold">{formatCurrency(total, currency)}</span>
                                </div>
                            </div>
                        </div>
                    );
                }) : <div className="text-center text-gray-400 italic">No options configured.</div>}
            </div>
        </div>
    );
};

const ThankYouPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-white page-break relative flex overflow-hidden">
        {/* Left White Section (60%) */}
        <div className="w-[60%] flex flex-col justify-center pl-24 pr-12 relative z-10">
            <h1 className="text-6xl font-display font-bold text-corporate-blue mb-8 tracking-tight">Thank You</h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md mb-12">
                We appreciate the opportunity to propose these services for you. We look forward to creating an unforgettable experience.
            </p>

            <div className="flex gap-8 text-gray-400">
                {/* Social / Contact Icons Placeholder */}
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">🌐</div> www.sitc.com.sa</div>
                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">📞</div> {data.branding.contactPhone}</div>
            </div>
        </div>

        {/* Right Slanted Blue Section (40%) */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-corporate-blue transform -skew-x-12 origin-top-right translate-x-20 overflow-hidden flex items-center justify-center">
            <div className="transform skew-x-12 flex flex-col items-center text-white">
                {data.branding.companyLogo ? (
                    <img src={data.branding.companyLogo} className="h-32 object-contain brightness-0 invert opacity-80 mb-6" alt="Logo White" />
                ) : (
                    <div className="text-2xl font-bold opacity-50 mb-6">SITC</div>
                )}
            </div>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #fff 20px, #fff 21px)' }}></div>
        </div>
    </div>
);

export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
    return (
        <div className="print-container font-sans text-gray-900 bg-white">
            <CoverPage data={data} />
            <TermsPage />
            <DestinationIntroPage />
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => (
                <React.Fragment key={i}>
                    <HotelOverviewPage hotel={h} index={i} />
                    <HotelFacilitiesPage hotel={h} />
                </React.Fragment>
            ))}
            <PriceSummaryPage data={data} />
            <ThankYouPage data={data} />
        </div>
    );
};
