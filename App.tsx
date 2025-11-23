
import React, { useState, useEffect } from 'react';
import { ProposalPDF } from './components/ProposalPDF';
import { AuthScreen } from './components/AuthComponents';
import { FormInput, FormSelect, FormCheckbox, FileUploader, SectionHeader, Button, DateRangePicker } from './components/InputComponents';
import { ProposalData, HotelDetails, FlightDetails, FlightClass, TransportationDetails, VehicleType, CustomItem, ActivityDetails, Inclusions, CategoryMarkups, MarkupType, FlightLeg, User, UserRole, ProposalHistory, MarkupConfig, RoomType, HotelImage, ImageTag, MeetingDetails, DiningDetails, FlightQuote, Company } from './types';
import { BedIcon, PlaneIcon, BusIcon, ActivityIcon, CustomIcon, PalmLogo, SaveIcon, EditIcon, TrashIcon, CopyIcon, HomeIcon, UserIcon, UsersIcon, LockIcon, UtensilsIcon, MeetingIcon, SITCLogo } from './components/Icons';
import { getGlobalSettings, saveGlobalSettings, getUsers, createSubUser, createCompanyAdmin, deleteUser, validatePassword, changePassword, updateUser, getCompanies, saveCompany, updateCompany, deleteCompany, adminResetUserPassword, validatePhone } from './services/authService';

// --- Defaults & Init ---

const MEETING_ROOM_OPTIONS = [
    { label: 'Select Room', value: '' },
    { label: 'Ballroom A', value: 'Ballroom A' },
    { label: 'Ballroom B', value: 'Ballroom B' },
    { label: 'Conference Hall 1', value: 'Conference Hall 1' },
    { label: 'Conference Hall 2', value: 'Conference Hall 2' },
    { label: 'Boardroom', value: 'Boardroom' },
    { label: 'Grand Hall', value: 'Grand Hall' },
    { label: 'Meeting Room 101', value: 'Meeting Room 101' },
    { label: 'Meeting Room 102', value: 'Meeting Room 102' },
    { label: 'Other (Custom)', value: 'Other' }
];

const DINING_OPTIONS = [
    { label: 'Select Type', value: '' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Coffee Break', value: 'Coffee Break' },
    { label: 'Snack', value: 'Snack' },
    { label: 'Buffet', value: 'Buffet' },
    { label: 'Set Menu', value: 'Set Menu' },
    { label: 'Other (Custom)', value: 'Other' }
];

const initialMarkup = { type: MarkupType.Percent, value: 10 };

const defaultMarkups: CategoryMarkups = {
  hotels: { ...initialMarkup },
  meetings: { ...initialMarkup },
  flights: { ...initialMarkup },
  transportation: { ...initialMarkup },
  activities: { ...initialMarkup },
  customItems: { ...initialMarkup }
};

const initialRoomType: RoomType = {
  id: 'rt_1',
  name: 'Standard Room',
  description: '',
  netPrice: 0,
  quantity: 1,
  checkIn: '',
  checkOut: '',
  numNights: 1,
  includeInSummary: true
};

const initialHotel: HotelDetails = {
  id: '',
  name: '',
  currency: 'SAR',
  location: '',
  website: '',
  vatRule: 'domestic',
  included: true,
  images: [],
  roomTypes: [{...initialRoomType}],
  meetingRooms: [],
  dining: []
};

const initialFlightLeg: FlightLeg = {
  from: '',
  to: '',
  departureDate: '',
  departureTime: '',
  arrivalDate: '',
  arrivalTime: '',
  duration: '',
  airline: '',
  flightNumber: '',
  flightClass: FlightClass.Economy,
  luggage: '23kg'
};

const initialFlight: FlightDetails = {
  id: '',
  routeDescription: '',
  outbound: [{ ...initialFlightLeg }],
  return: [{ ...initialFlightLeg }],
  quotes: [
    { class: FlightClass.Economy, price: 0, quantity: 1 },
    { class: FlightClass.Business, price: 0, quantity: 1 }
  ],
  vatRule: 'international',
  included: true,
  includeInSummary: true
};

const defaultProposalData: ProposalData = {
  id: '',
  lastModified: 0,
  proposalName: '',
  customerName: '',
  branding: {
    companyLogo: '' 
  },
  pricing: {
    currency: 'SAR',
    enableVat: true,
    vatPercent: 15,
    markups: defaultMarkups,
    showPrices: true
  },
  hotelOptions: [],
  flightOptions: [],
  transportation: [],
  customItems: [],
  activities: [],
  inclusions: {
    hotels: true,
    flights: true,
    transportation: true,
    customItems: true,
    activities: false, 
  },
  createdBy: '',
  sharedWith: [],
  history: [],
  versions: []
};

const App: React.FC = () => {
  // --- App State ---
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'form' | 'preview'>('dashboard');
  const [subMode, setSubMode] = useState<'all_proposals' | 'my_proposals' | 'company_users' | 'companies' | 'global_settings' | 'account_settings'>('my_proposals');
  const [step, setStep] = useState(0);
  const [savedProposals, setSavedProposals] = useState<ProposalData[]>([]);
  const [formData, setFormData] = useState<ProposalData>(defaultProposalData);
  
  // Super Admin / Company State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({ name: '', domain: '', logo: '' });
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // User Management State
  const [newUser, setNewUser] = useState<Partial<User>>({ firstName: '', lastName: '', email: '', password: '', dob: '', phone: '' });
  const [userMsg, setUserMsg] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserPass, setEditUserPass] = useState('');

  // Sharing state
  const [shareEmail, setShareEmail] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);

  // Password Change State
  const [passData, setPassData] = useState({ current: '', new: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // --- Init ---
  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = () => {
      const saved = localStorage.getItem('sitc_proposals');
      if (saved) {
        try {
          let parsed = JSON.parse(saved);
          setSavedProposals(parsed);
        } catch (e) {
          console.error("Failed to parse saved proposals", e);
        }
      }
      setCompanies(getCompanies());
  };

  // --- Handlers ---
  const handleLogout = () => {
    setUser(null);
    setViewMode('dashboard');
    setSubMode('my_proposals');
  };

  const saveToStorage = (proposals: ProposalData[]) => {
    try {
      localStorage.setItem('sitc_proposals', JSON.stringify(proposals));
      setSavedProposals(proposals);
    } catch (e) {
      alert("Storage quota exceeded. Try deleting old proposals.");
    }
  };

  const handleCreateNew = () => {
    if (!user) return;
    
    const userCompany = companies.find(c => c.id === user.companyId);
    const settings = getGlobalSettings();
    setFormData({
      ...defaultProposalData,
      id: Date.now().toString(),
      companyId: user.companyId,
      lastModified: Date.now(),
      branding: { 
          ...defaultProposalData.branding, 
          companyName: userCompany?.name || 'SITC', 
          companyLogo: userCompany?.logo || settings.defaultCompanyLogo,
          contactName: `${user.firstName} ${user.lastName}`, 
          contactEmail: user.email, 
          contactPhone: user.phone 
      },
      hotelOptions: [{...initialHotel, id: Date.now().toString()}],
      flightOptions: [{...initialFlight, id: (Date.now()+1).toString()}],
      createdBy: user.email,
      history: [{
        timestamp: Date.now(),
        action: 'created',
        userEmail: user.email,
        userRole: user.role,
        details: 'Initial creation'
      }],
      versions: []
    });
    setStep(0);
    setViewMode('form');
  };

  const handleEdit = (proposal: ProposalData) => {
    setFormData(proposal);
    setStep(0);
    setViewMode('form');
  };

  const handleDuplicate = (proposal: ProposalData) => {
    const newProposal = {
      ...proposal,
      id: Date.now().toString(),
      lastModified: Date.now(),
      proposalName: `${proposal.proposalName} (Copy)`,
      createdBy: user?.email || '',
      history: [{
        timestamp: Date.now(),
        action: 'created',
        userEmail: user?.email || '',
        userRole: user?.role,
        details: `Duplicated from ${proposal.id}`
      }],
      versions: []
    };
    const updatedList = [newProposal, ...savedProposals];
    saveToStorage(updatedList);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      const updatedList = savedProposals.map(p => {
          if (p.id === id) {
              return { ...p, isDeleted: true };
          }
          return p;
      });
      saveToStorage(updatedList);
    }
  };

  const handleSaveProposal = (isDraft: boolean) => {
    if (!user) return;
    
    if (!formData.proposalName) {
        alert("Please enter a Proposal Name in the Branding section (Step 1).");
        setStep(0);
        return;
    }

    let currentVersions = [...formData.versions];
    const existing = savedProposals.find(p => p.id === formData.id);
    
    if (existing) {
        const snapshot = JSON.stringify(existing);
        currentVersions.push({
            timestamp: Date.now(),
            savedBy: user.email,
            data: snapshot
        });
        if (currentVersions.length > 10) currentVersions.shift();
    }

    const historyEntry: ProposalHistory = {
      timestamp: Date.now(),
      action: isDraft ? 'saved_draft' : 'generated',
      userEmail: user.email,
      userRole: user.role,
      details: isDraft ? 'Draft saved' : 'Proposal generated'
    };

    const updatedProposal = { 
      ...formData, 
      lastModified: Date.now(),
      history: [...formData.history, historyEntry],
      versions: currentVersions
    };

    const existingIndex = savedProposals.findIndex(p => p.id === updatedProposal.id);
    let newList;
    if (existingIndex >= 0) {
      newList = [...savedProposals];
      newList[existingIndex] = updatedProposal;
    } else {
      newList = [updatedProposal, ...savedProposals];
    }
    
    saveToStorage(newList);
    setFormData(updatedProposal);
    
    if (isDraft) {
        alert("Draft saved successfully.");
    } else {
        setViewMode('preview');
    }
  };

  // --- Admin / Company Functions ---

  const handleCreateCompany = () => {
      if (!newCompany.name || !newCompany.domain) {
          setUserMsg("Company Name and Domain are required.");
          return;
      }
      try {
          const company: Company = {
              id: `comp_${Date.now()}`,
              name: newCompany.name!,
              domain: newCompany.domain!,
              logo: newCompany.logo || '',
              created: Date.now()
          };
          saveCompany(company);
          setNewCompany({ name: '', domain: '', logo: '' });
          refreshData();
          setUserMsg("Company created successfully.");
      } catch (e: any) {
          setUserMsg(e.message);
      }
  };

  const handleUpdateCompany = () => {
      if (!editingCompany) return;
      try {
          updateCompany(editingCompany.id, editingCompany);
          setEditingCompany(null);
          refreshData();
          alert("Company updated.");
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDeleteCompany = (id: string) => {
      if (confirm("Delete company? This will affect all associated users and proposals.")) {
          deleteCompany(id);
          refreshData();
      }
  };

  const handleCreateUser = (role: 'admin' | 'user') => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
        setUserMsg("Please fill all required fields.");
        return;
    }
    
    const passErr = validatePassword(newUser.password);
    if (passErr) {
        setUserMsg(passErr);
        return;
    }

    try {
        if (role === 'admin') {
            if (!newUser.companyId) {
                setUserMsg("Please select a company for this Admin.");
                return;
            }
            createCompanyAdmin(user!.email, newUser.companyId, newUser as User);
        } else {
            createSubUser(user!.email, newUser as User);
        }
        setUserMsg("User created successfully.");
        setNewUser({ firstName: '', lastName: '', email: '', password: '', dob: '', phone: '', companyId: '' });
        refreshData();
    } catch (e: any) {
        setUserMsg(e.message);
    }
  };

  const handleDeleteUser = (email: string) => {
      if (confirm(`Delete user ${email}?`)) {
          try {
              deleteUser(email);
              setEditingUser(null);
              refreshData();
          } catch (e: any) {
              alert(e.message);
          }
      }
  };

  const handleUpdateUser = () => {
      if (!editingUser) return;
      try {
          const updates: Partial<User> = { email: editingUser.email, firstName: editingUser.firstName, lastName: editingUser.lastName };
          
          if (editingUser.phone) {
             updates.phone = editingUser.phone;
          }

          if (editUserPass) {
             const passErr = validatePassword(editUserPass);
             if (passErr) throw new Error(passErr);
             
             if (user?.role === 'super_admin') {
                 adminResetUserPassword(editingUser.email, editUserPass);
             } else {
                 updates.password = editUserPass;
                 updateUser(editingUser.email, updates);
             }
          } else {
             updateUser(editingUser.email, updates);
          }
          
          alert("User updated.");
          setEditingUser(null);
          setEditUserPass('');
          refreshData();
      } catch(e: any) {
          alert(e.message);
      }
  };

  // --- Render Helpers ---
  const renderEditCompanyModal = () => {
      if (!editingCompany) return null;
      return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-ai-card w-full max-w-lg rounded-2xl border border-slate-600 shadow-2xl flex flex-col">
               <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Edit Company</h3>
                  <button onClick={() => setEditingCompany(null)} className="text-gray-400 hover:text-white">Close</button>
               </div>
               <div className="p-6 space-y-4">
                   <FormInput label="Company Name" value={editingCompany.name} onChange={e => setEditingCompany({...editingCompany, name: e.target.value})} />
                   <FormInput label="Domain" value={editingCompany.domain} onChange={e => setEditingCompany({...editingCompany, domain: e.target.value})} />
                   <FileUploader label="Company Logo" currentImage={editingCompany.logo} onFileSelect={b64 => setEditingCompany({...editingCompany, logo: b64})} />
                   <div className="pt-4 border-t border-slate-700 flex justify-end items-center gap-4">
                       <Button variant="secondary" onClick={() => setEditingCompany(null)}>Cancel</Button>
                       <Button onClick={handleUpdateCompany}>Save Changes</Button>
                   </div>
               </div>
           </div>
        </div>
      );
  };
  
  const renderCompanyManagement = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderEditCompanyModal()}
          <div className="glass p-6 rounded-xl">
              <SectionHeader title="Create Company" />
              {userMsg && <div className="mb-4 p-2 bg-blue-500/20 text-blue-200 text-sm rounded">{userMsg}</div>}
              <FormInput label="Company Name" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} placeholder="e.g. Agency A" />
              <FormInput label="Domain (e.g. sitc.sa)" value={newCompany.domain} onChange={e => setNewCompany({...newCompany, domain: e.target.value})} placeholder="Do not include @" />
              <FileUploader label="Company Logo" currentImage={newCompany.logo} onFileSelect={b64 => setNewCompany({...newCompany, logo: b64})} />
              <Button onClick={handleCreateCompany} className="mt-4">Create Company</Button>
          </div>
          <div className="glass p-6 rounded-xl">
              <SectionHeader title="Existing Companies" />
              <div className="space-y-4 max-h-96 overflow-y-auto">
                  {companies.map(c => (
                      <div key={c.id} className="p-4 bg-slate-800/50 rounded flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              {c.logo ? <img src={c.logo} className="w-8 h-8 object-contain bg-white rounded p-0.5"/> : <div className="w-8 h-8 bg-gray-600 rounded"></div>}
                              <div>
                                  <div className="font-bold text-white">{c.name}</div>
                                  <div className="text-xs text-gray-400">@{c.domain}</div>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setEditingCompany(c)} className="text-blue-400 hover:text-blue-300 text-xs uppercase font-bold">Edit</button>
                              <button onClick={() => handleDeleteCompany(c.id)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold">Delete</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderUserManagement = () => {
      const isSuper = user?.role === 'super_admin';
      const myCompanyId = user?.companyId;
      
      const allUsers = getUsers();
      const visibleUsers = isSuper 
          ? allUsers 
          : allUsers.filter(u => u.companyId === myCompanyId && u.role === 'user'); 

      return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-6 rounded-xl">
                 <SectionHeader title={isSuper ? "Create Company Admin" : "Create Sub User"} />
                 {userMsg && <div className="mb-4 p-2 bg-blue-500/20 text-blue-200 text-sm rounded">{userMsg}</div>}
                 
                 {isSuper && (
                     <FormSelect 
                        label="Assign to Company" 
                        options={[{label: 'Select Company', value: ''}, ...companies.map(c => ({label: c.name, value: c.id}))]}
                        value={newUser.companyId || ''}
                        onChange={e => setNewUser({...newUser, companyId: e.target.value})}
                     />
                 )}
                 
                 <div className="grid grid-cols-2 gap-4">
                    <FormInput label="First Name" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
                    <FormInput label="Last Name" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormInput label="DOB" type="date" value={newUser.dob || ''} onChange={e => setNewUser({...newUser, dob: e.target.value})} />
                    <FormInput label="Phone (e.g. +966...)" value={newUser.phone || ''} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                 </div>
                 <FormInput label="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                 <FormInput label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                 
                 <Button onClick={() => handleCreateUser(isSuper ? 'admin' : 'user')} className="mt-4">
                     {isSuper ? 'Create Admin' : 'Create User'}
                 </Button>
              </div>

              <div className="glass p-6 rounded-xl">
                 <SectionHeader title="Users Directory" />
                 <div className="space-y-3 max-h-96 overflow-y-auto">
                    {visibleUsers.map((u, i) => {
                        if (u.role === 'super_admin' && user?.email !== u.email) return null;
                        return (
                           <div key={i} className="p-3 bg-slate-800/50 rounded flex justify-between items-center border-l-2 border-slate-600">
                              <div>
                                  <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                                  <div className="text-xs text-gray-400">{u.email} <span className="text-ai-accent ml-2 capitalize">({u.role})</span></div>
                                  {isSuper && u.companyId && <div className="text-[10px] text-gray-500">{companies.find(c => c.id === u.companyId)?.name}</div>}
                              </div>
                              {u.email !== user?.email && (
                                  <button onClick={() => { setEditingUser(u); setEditUserPass(''); }} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-500">Manage</button>
                              )}
                           </div>
                        );
                    })}
                 </div>
              </div>
          </div>
      );
  };

  const renderEditUserModal = () => {
    if (!editingUser) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
         <div className="bg-ai-card w-full max-w-lg rounded-2xl border border-slate-600 shadow-2xl flex flex-col">
             <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Manage User</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">Close</button>
             </div>
             <div className="p-6 space-y-4">
                 <FormInput label="Email Address" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormInput label="First Name" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} />
                    <FormInput label="Last Name" value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} />
                 </div>
                 <FormInput label="Phone" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} />
                 <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                     <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1 block">
                        {user?.role === 'super_admin' ? 'Set Temporary Password (Force Reset)' : 'Set New Password'}
                     </label>
                     <input type="password" placeholder="Leave blank to keep current" className="bg-ai-bg/50 border border-gray-600 rounded-lg p-3 w-full text-white" value={editUserPass} onChange={e => setEditUserPass(e.target.value)} />
                 </div>
                 <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                     <button onClick={() => handleDeleteUser(editingUser.email)} className="text-red-400 hover:text-red-300 text-sm font-bold flex items-center gap-2"><TrashIcon/> Delete User</button>
                     <Button onClick={handleUpdateUser}>Save Changes</Button>
                 </div>
             </div>
         </div>
      </div>
    );
  };

  // Step Renders
  const renderBrandingStep = () => ( <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> <SectionHeader title="Proposal Details & Branding" icon={<PalmLogo className="w-6 h-6" />} /> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> <FormInput label="Proposal Name (Required)" value={formData.proposalName} onChange={(e) => setFormData({...formData, proposalName: e.target.value})} placeholder="e.g. London Group Nov 2025" /> <FormInput label="Customer / Client Name" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} placeholder="e.g. Acme Corp" /> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"> <FileUploader label="Client Logo" currentImage={formData.branding.clientLogo} onFileSelect={(b64) => setFormData({...formData, branding: {...formData.branding, clientLogo: b64}})} /> <div className="opacity-75 pointer-events-none filter"> <label className="text-xs uppercase tracking-wider font-bold text-ai-accent mb-1">Company Logo (Auto-filled)</label> <div className="p-4 border border-gray-600 rounded bg-slate-800 text-center text-sm text-gray-400 h-32 flex items-center justify-center"> {formData.branding.companyLogo ? <img src={formData.branding.companyLogo} className="h-24 mx-auto object-contain"/> : <span>No Logo</span>} </div> </div> </div> <div className="mt-6 p-4 bg-slate-800/50 rounded border border-slate-600"> <h4 className="font-bold text-ai-accent mb-3 text-sm">Contact Details (Auto-filled)</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <FormInput label="Company Name" value={formData.branding.companyName || ''} onChange={(e) => setFormData({...formData, branding: {...formData.branding, companyName: e.target.value}})} /> <FormInput label="Prepared By" value={formData.branding.contactName || ''} onChange={(e) => setFormData({...formData, branding: {...formData.branding, contactName: e.target.value}})} /> <FormInput label="Email" value={formData.branding.contactEmail || ''} onChange={(e) => setFormData({...formData, branding: {...formData.branding, contactEmail: e.target.value}})} /> <FormInput label="Phone" value={formData.branding.contactPhone || ''} onChange={(e) => setFormData({...formData, branding: {...formData.branding, contactPhone: e.target.value}})} /> </div> </div> </div> );
  const renderPricingConfigStep = () => ( <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> <SectionHeader title="Pricing & Markup" icon={<span className="text-xl">💰</span>} /> <div className="mb-6 p-4 bg-indigo-900/20 rounded border border-indigo-500/30 grid grid-cols-1 md:grid-cols-2 gap-4"> <FormSelect label="Currency" options={['SAR', 'USD', 'EUR', 'GBP', 'AED'].map(c => ({label: c, value: c}))} value={formData.pricing.currency} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, currency: e.target.value}})} /> <div className="md:mt-6"><FormCheckbox label="Show Prices in Proposal" checked={formData.pricing.showPrices} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, showPrices: e.target.checked}})} /></div> </div> <div className="mb-6"> <h4 className="font-bold text-ai-accent mb-4 border-b border-gray-700 pb-2">Service Markups</h4> {(Object.entries(formData.pricing.markups) as [string, MarkupConfig][]).map(([cat, config]) => ( <div key={cat} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-4 p-3 bg-slate-800/50 rounded border border-slate-700"> <div className="col-span-12 md:col-span-4 font-bold text-white capitalize">{cat}</div> <div className="col-span-12 md:col-span-4"> <FormSelect label="Type" options={[{label: 'Percentage %', value: MarkupType.Percent}, {label: 'Fixed Amount', value: MarkupType.Fixed}]} value={config.type} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, markups: {...formData.pricing.markups, [cat]: { ...config, type: e.target.value}}}})} className="mb-0" /> </div> <div className="col-span-12 md:col-span-4"> <FormInput label="Value" type="number" value={config.value} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, markups: {...formData.pricing.markups, [cat]: { ...config, value: parseFloat(e.target.value)}}}})} className="mb-0" /> </div> </div> ))} </div> <div className="p-4 bg-slate-800/50 rounded border border-slate-600"> <h4 className="font-bold text-ai-accent mb-2">VAT Settings</h4> <div className="flex flex-col md:flex-row md:items-center gap-6"> <FormCheckbox label="Enable VAT" checked={formData.pricing.enableVat} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, enableVat: e.target.checked}})} /> {formData.pricing.enableVat && <div className="w-32"><FormInput label="VAT %" type="number" value={formData.pricing.vatPercent} onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, vatPercent: parseFloat(e.target.value)}})} className="mb-0"/></div>} </div> </div> </div> );
  
  // Hotel Logic
  const addHotel = () => { setFormData({ ...formData, hotelOptions: [...formData.hotelOptions, { ...initialHotel, id: Date.now().toString() }] }); };
  const removeHotel = (index: number) => { const h = [...formData.hotelOptions]; h.splice(index, 1); setFormData({ ...formData, hotelOptions: h }); };
  const updateHotel = (index: number, field: keyof HotelDetails, value: any) => { const h = [...formData.hotelOptions]; h[index] = { ...h[index], [field]: value }; setFormData({ ...formData, hotelOptions: h }); };
  const updateHotelImageTag = (index: number, imgIdx: number, tag: string) => { const h = [...formData.hotelOptions]; h[index].images[imgIdx].tag = tag === 'none' ? undefined : (tag as ImageTag); setFormData({ ...formData, hotelOptions: h }); };
  const addHotelImage = (index: number, url: string) => { const h = [...formData.hotelOptions]; h[index].images.push({ url, tag: undefined }); setFormData({ ...formData, hotelOptions: h }); };
  const removeHotelImage = (index: number, imgIdx: number) => { const h = [...formData.hotelOptions]; h[index].images.splice(imgIdx, 1); setFormData({ ...formData, hotelOptions: h }); };
  const addRoomType = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].roomTypes.push({ ...initialRoomType, id: Date.now().toString(), includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };
  
  // Date Update Logics
  const updateRoomTypeDates = (hotelIndex: number, roomIndex: number, checkIn: string, checkOut: string) => {
      const h = [...formData.hotelOptions];
      const updatedRoom = { ...h[hotelIndex].roomTypes[roomIndex], checkIn, checkOut };
      if (checkIn && checkOut) {
          const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
          updatedRoom.numNights = diff > 0 ? diff : 0;
      }
      h[hotelIndex].roomTypes[roomIndex] = updatedRoom;
      setFormData({ ...formData, hotelOptions: h });
  };
  
  const updateRoomType = (hotelIndex: number, roomIndex: number, field: keyof RoomType, value: any) => { const h = [...formData.hotelOptions]; let updatedRoom = { ...h[hotelIndex].roomTypes[roomIndex], [field]: value }; h[hotelIndex].roomTypes[roomIndex] = updatedRoom; setFormData({ ...formData, hotelOptions: h }); };
  const removeRoomType = (hotelIndex: number, roomIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].roomTypes.splice(roomIndex, 1); setFormData({ ...formData, hotelOptions: h }); };
  const addMeeting = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].meetingRooms.push({ id: Date.now().toString(), name: '', price: 0, quantity: 1, days: 1, startDate: '', endDate: '', includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };
  
  const updateMeetingDates = (hotelIndex: number, mIndex: number, startDate: string, endDate: string) => {
      const h = [...formData.hotelOptions];
      let meeting = { ...h[hotelIndex].meetingRooms[mIndex], startDate, endDate };
      if (startDate && endDate) {
          const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
          meeting.days = diff > 0 ? diff : 1;
      }
      h[hotelIndex].meetingRooms[mIndex] = meeting;
      setFormData({ ...formData, hotelOptions: h });
  };

  const updateMeeting = (hotelIndex: number, mIndex: number, field: keyof MeetingDetails, value: any) => { const h = [...formData.hotelOptions]; let meeting = { ...h[hotelIndex].meetingRooms[mIndex], [field]: value }; h[hotelIndex].meetingRooms[mIndex] = meeting; setFormData({ ...formData, hotelOptions: h }); };
  const removeMeeting = (hotelIndex: number, mIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].meetingRooms.splice(mIndex, 1); setFormData({ ...formData, hotelOptions: h }); };
  
  const addDining = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].dining.push({ id: Date.now().toString(), name: '', price: 0, quantity: 1, days: 1, includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };
  
  const updateDiningDates = (hotelIndex: number, dIndex: number, startDate: string, endDate: string) => {
      const h = [...formData.hotelOptions];
      let dining = { ...h[hotelIndex].dining[dIndex], startDate, endDate };
      if (startDate && endDate) {
          const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
          dining.days = diff > 0 ? diff : 1;
      }
      h[hotelIndex].dining[dIndex] = dining;
      setFormData({ ...formData, hotelOptions: h });
  };
  
  const updateDining = (hotelIndex: number, dIndex: number, field: keyof DiningDetails, value: any) => { 
      const h = [...formData.hotelOptions]; 
      let dining = { ...h[hotelIndex].dining[dIndex], [field]: value }; 
      h[hotelIndex].dining[dIndex] = dining; 
      setFormData({ ...formData, hotelOptions: h }); 
  };
  const removeDining = (hotelIndex: number, dIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].dining.splice(dIndex, 1); setFormData({ ...formData, hotelOptions: h }); };

  const renderHotelStep = () => (
      <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center"><SectionHeader title="Accommodation" icon={<BedIcon />} /><Button variant="secondary" onClick={addHotel}>+ Add Another Hotel</Button></div>
          {formData.hotelOptions.map((hotel, index) => (
             <div key={hotel.id} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 relative">
                 <button onClick={() => removeHotel(index)} className="absolute top-4 right-4 text-red-400 text-xs hover:text-red-300 flex items-center gap-1"><TrashIcon /> Remove Hotel</button>
                 <h3 className="text-xl font-bold text-white mb-4">Hotel Option {index + 1}</h3>
                 {/* Hotel Fields */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                     <div className="md:col-span-2"><FormInput label="Hotel Name" value={hotel.name} onChange={(e) => updateHotel(index, 'name', e.target.value)} /></div>
                     <div className="md:col-span-1"><FormInput label="Website URL (Optional)" value={hotel.website || ''} onChange={(e) => updateHotel(index, 'website', e.target.value)} placeholder="https://..." /></div>
                     <div className="md:col-span-3"><FormInput label="Location / Address (Optional)" value={hotel.location || ''} onChange={(e) => updateHotel(index, 'location', e.target.value)} placeholder="e.g. King Fahd Rd, Riyadh" /></div>
                     <div className="md:col-span-1"> <FormSelect label="VAT Rule" options={[{label: 'Domestic', value: 'domestic'}, {label: 'International', value: 'international'}]} value={hotel.vatRule} onChange={(e) => updateHotel(index, 'vatRule', e.target.value)} /> </div>
                 </div>

                 {/* Room Types */}
                 <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 mb-6">
                     <h4 className="font-bold text-ai-secondary mb-3 uppercase text-sm tracking-wider flex items-center gap-2"><BedIcon/> Room Configuration</h4>
                     {hotel.roomTypes.map((rt, rtIdx) => (
                         <div key={rt.id} className="flex flex-col gap-4 mb-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                             <div className="flex flex-col md:flex-row gap-4 items-end">
                                 <div className="flex-[2] w-full"><FormInput label="Room Type Name" value={rt.name} onChange={e => updateRoomType(index, rtIdx, 'name', e.target.value)} placeholder="e.g. Deluxe Room" className="mb-0" /></div>
                                 <div className="flex-1 w-full"><FormInput label={`Net Price (${formData.pricing.currency})`} type="number" value={rt.netPrice} onChange={e => updateRoomType(index, rtIdx, 'netPrice', parseFloat(e.target.value))} className="mb-0" /></div>
                                 <div className="w-24"><FormInput label="Qty" type="number" value={rt.quantity} onChange={e => updateRoomType(index, rtIdx, 'quantity', parseInt(e.target.value))} className="mb-0" /></div>
                             </div>
                             <div className="flex flex-col md:flex-row gap-4 items-end">
                                 <div className="flex-[2] w-full">
                                    <DateRangePicker 
                                        label="Stay Dates"
                                        startDate={rt.checkIn}
                                        endDate={rt.checkOut}
                                        onChange={(s, e) => updateRoomTypeDates(index, rtIdx, s, e)}
                                    />
                                 </div>
                                 <div className="text-xs text-gray-400 mb-3 w-20 text-center font-bold">{rt.numNights} Nights</div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <div className="pt-2"><FormCheckbox label="Sum" checked={rt.includeInSummary !== false} onChange={e => updateRoomType(index, rtIdx, 'includeInSummary', e.target.checked)} /></div>
                                    <button onClick={() => removeRoomType(index, rtIdx)} className="p-2.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 mb-2.5"><TrashIcon/></button>
                                 </div>
                             </div>
                         </div>
                     ))}
                     <Button variant="secondary" onClick={() => addRoomType(index)} className="text-xs">+ Add Another Room Type</Button>
                 </div>

                 {/* Meeting Rooms Block */}
                 <div className="mb-6 p-4 bg-slate-900/50 rounded border border-slate-700">
                     <h4 className="font-bold text-ai-secondary mb-3 uppercase text-sm flex items-center gap-2"><MeetingIcon/> Meeting Rooms</h4>
                     {hotel.meetingRooms.map((m, mIdx) => {
                         const isStandard = MEETING_ROOM_OPTIONS.some(o => o.value === m.name && o.value !== 'Other');
                         const dropdownValue = isStandard ? m.name : 'Other';

                         return (
                             <div key={m.id} className="mb-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                                 {/* Row 1: Main Inputs */}
                                 <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                                     <div className="flex-[2] flex gap-2 w-full">
                                         <FormSelect 
                                            label="Room Name" 
                                            options={MEETING_ROOM_OPTIONS} 
                                            value={dropdownValue} 
                                            onChange={e => updateMeeting(index, mIdx, 'name', e.target.value === 'Other' ? '' : e.target.value)} 
                                            className="mb-0" 
                                         />
                                         {!isStandard && (
                                            <FormInput 
                                                label="Custom Name" 
                                                value={m.name} 
                                                onChange={e => updateMeeting(index, mIdx, 'name', e.target.value)} 
                                                placeholder="Enter Name"
                                                className="mb-0"
                                            />
                                         )}
                                     </div>
                                     <div className="w-32"><FormInput label="Unit Price" type="number" value={m.price} onChange={e => updateMeeting(index, mIdx, 'price', parseFloat(e.target.value))} className="mb-0" /></div>
                                     <div className="w-24"><FormInput label="Guests" type="number" value={m.quantity} onChange={e => updateMeeting(index, mIdx, 'quantity', parseInt(e.target.value))} className="mb-0" /></div>
                                 </div>

                                 {/* Row 2: Dates & Actions */}
                                 <div className="flex flex-col md:flex-row gap-4 items-end">
                                     <div className="flex-[2] w-full">
                                        <DateRangePicker 
                                            label="Meeting Dates"
                                            startDate={m.startDate || ''}
                                            endDate={m.endDate || ''}
                                            onChange={(s, e) => updateMeetingDates(index, mIdx, s, e)}
                                            className="mb-0"
                                        />
                                     </div>
                                     <div className="w-24 text-center pb-3 text-sm font-bold text-gray-400">{m.days} Days</div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <div className="pt-2"><FormCheckbox label="Sum" checked={m.includeInSummary !== false} onChange={e => updateMeeting(index, mIdx, 'includeInSummary', e.target.checked)} /></div>
                                        <button onClick={() => removeMeeting(index, mIdx)} className="p-2.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 mb-2.5"><TrashIcon/></button>
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                     <Button variant="secondary" onClick={() => addMeeting(index)} className="text-xs">+ Add Meeting Room</Button>
                 </div>

                 {/* Dining Block */}
                 <div className="p-4 bg-slate-900/50 rounded border border-slate-700">
                     <h4 className="font-bold text-ai-secondary mb-3 uppercase text-sm flex items-center gap-2"><UtensilsIcon/> Dining (Optional)</h4>
                     {hotel.dining.map((d, dIdx) => {
                         const isStandard = DINING_OPTIONS.some(o => o.value === d.name && o.value !== 'Other');
                         const dropdownValue = isStandard ? d.name : 'Other';
                         const hasDates = !!(d.startDate || d.endDate);

                         return (
                             <div key={d.id} className="mb-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                                 {/* Row 1: Main Inputs */}
                                 <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
                                     <div className="flex-[2] flex gap-2 w-full">
                                         <FormSelect 
                                            label="Dining Type" 
                                            options={DINING_OPTIONS} 
                                            value={dropdownValue} 
                                            onChange={e => updateDining(index, dIdx, 'name', e.target.value === 'Other' ? '' : e.target.value)} 
                                            className="mb-0" 
                                         />
                                         {!isStandard && (
                                            <FormInput 
                                                label="Custom Type" 
                                                value={d.name} 
                                                onChange={e => updateDining(index, dIdx, 'name', e.target.value)} 
                                                placeholder="Enter Type"
                                                className="mb-0"
                                            />
                                         )}
                                     </div>
                                     <div className="w-32"><FormInput label="Unit Price" type="number" value={d.price} onChange={e => updateDining(index, dIdx, 'price', parseFloat(e.target.value))} className="mb-0" /></div>
                                     <div className="w-24"><FormInput label="Guests" type="number" value={d.quantity} onChange={e => updateDining(index, dIdx, 'quantity', parseInt(e.target.value))} className="mb-0" /></div>
                                 </div>

                                 {/* Row 2: Dates (Optional) & Actions */}
                                 <div className="flex flex-col md:flex-row gap-4 items-end">
                                     <div className="flex-[2] w-full">
                                        <DateRangePicker 
                                            label="Dates (Opt)"
                                            startDate={d.startDate || ''}
                                            endDate={d.endDate || ''}
                                            onChange={(s, e) => updateDiningDates(index, dIdx, s, e)}
                                            className="mb-0"
                                        />
                                     </div>
                                     <div className="w-24">
                                        {hasDates ? (
                                             <div className="text-center pb-3 text-sm font-bold text-gray-400">{d.days} Days</div>
                                        ) : (
                                            <FormInput label="Days" type="number" value={d.days} onChange={e => updateDining(index, dIdx, 'days', parseInt(e.target.value))} className="mb-0" />
                                        )}
                                     </div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <div className="pt-2"><FormCheckbox label="Sum" checked={d.includeInSummary !== false} onChange={e => updateDining(index, dIdx, 'includeInSummary', e.target.checked)} /></div>
                                        <button onClick={() => removeDining(index, dIdx)} className="p-2.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 mb-2.5"><TrashIcon/></button>
                                     </div>
                                 </div>
                             </div>
                         );
                     })}
                     <Button variant="secondary" onClick={() => addDining(index)} className="text-xs">+ Add Dining</Button>
                 </div>

                 {/* Images */}
                 <div className="mt-6 p-4 bg-black/20 rounded border border-gray-700">
                     <h4 className="font-bold text-gray-400 text-xs uppercase mb-3">Hotel Gallery</h4>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         {hotel.images.map((img, imgIdx) => (
                             <div key={imgIdx} className="relative group aspect-square bg-slate-900 rounded overflow-hidden">
                                 <img src={img.url} className="w-full h-full object-cover" />
                                 <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1">
                                     <select className="w-full bg-transparent text-[10px] text-white border-none p-0" value={img.tag || 'none'} onChange={e => updateHotelImageTag(index, imgIdx, e.target.value)}><option value="none">No Tag</option><option value="exterior">Exterior</option><option value="rooms">Rooms</option><option value="interior">Interior</option></select>
                                 </div>
                                 <button onClick={() => removeHotelImage(index, imgIdx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><TrashIcon/></button>
                             </div>
                         ))}
                         <div className="aspect-square border-2 border-dashed border-gray-600 rounded flex items-center justify-center"><FileUploader label="" onFileSelect={(url) => addHotelImage(index, url)} /></div>
                     </div>
                 </div>
             </div>
          ))}
      </div>
  );

  const addFlight = () => { setFormData({ ...formData, flightOptions: [...formData.flightOptions, { ...initialFlight, id: Date.now().toString() }] }); };
  const removeFlight = (index: number) => { const f = [...formData.flightOptions]; f.splice(index, 1); setFormData({ ...formData, flightOptions: f }); };
  const updateFlight = (index: number, field: keyof FlightDetails, value: any) => { const f = [...formData.flightOptions]; f[index] = { ...f[index], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
  const addFlightLeg = (flightIndex: number, legType: 'outbound' | 'return') => { const f = [...formData.flightOptions]; f[flightIndex][legType].push({ ...initialFlightLeg }); setFormData({ ...formData, flightOptions: f }); };
  const removeFlightLeg = (flightIndex: number, legType: 'outbound' | 'return', legIdx: number) => { const f = [...formData.flightOptions]; if (f[flightIndex][legType].length > 1) { f[flightIndex][legType].splice(legIdx, 1); setFormData({ ...formData, flightOptions: f }); } };
  const updateFlightLeg = (flightIndex: number, legType: 'outbound' | 'return', legIdx: number, field: keyof FlightLeg, value: any) => { const f = [...formData.flightOptions]; f[flightIndex][legType][legIdx] = { ...f[flightIndex][legType][legIdx], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
  const addFlightQuote = (index: number) => { const f = [...formData.flightOptions]; f[index].quotes.push({ class: 'Economy', price: 0, quantity: 1 }); setFormData({ ...formData, flightOptions: f }); };
  const updateFlightQuote = (fIndex: number, qIndex: number, field: keyof FlightQuote, value: any) => { const f = [...formData.flightOptions]; f[fIndex].quotes[qIndex] = { ...f[fIndex].quotes[qIndex], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
  const removeFlightQuote = (fIndex: number, qIndex: number) => { const f = [...formData.flightOptions]; f[fIndex].quotes.splice(qIndex, 1); setFormData({ ...formData, flightOptions: f }); };
  
  // Helper to add item with default includeInSummary: true
  const addItem = <T,>(listKey: 'transportation' | 'customItems' | 'activities', item: T) => { setFormData({ ...formData, [listKey]: [...formData[listKey], { ...item, includeInSummary: true }] }); };
  
  const updateItemDates = (listKey: 'transportation' | 'customItems' | 'activities', index: number, startDate: string, endDate: string) => {
      const list = [...formData[listKey]] as any[];
      const updatedItem = { ...list[index], startDate, endDate };
      if (startDate && endDate) {
          const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
          updatedItem.days = diff > 0 ? diff : 1;
      } else {
          updatedItem.days = 1; // Default
      }
      list[index] = updatedItem;
      setFormData({ ...formData, [listKey]: list });
  };

  const updateItem = <T,>(listKey: 'transportation' | 'customItems' | 'activities', index: number, field: keyof T, value: any) => { const list = [...formData[listKey]] as any[]; const updatedItem = { ...list[index], [field]: value }; list[index] = updatedItem; setFormData({ ...formData, [listKey]: list }); };
  const removeItem = (listKey: 'transportation' | 'customItems' | 'activities', index: number) => { const list = [...formData[listKey]]; list.splice(index, 1); setFormData({ ...formData, [listKey]: list }); };

  const renderFlightStep = () => ( 
    <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto space-y-8"> 
        <div className="flex justify-between items-center">
            <SectionHeader title="Flight Options" icon={<PlaneIcon />} />
            <div className="flex items-center gap-4">
                <FormCheckbox label="Skip Flights" checked={!formData.inclusions.flights} onChange={e => setFormData({...formData, inclusions: {...formData.inclusions, flights: !e.target.checked}})} />
                {formData.inclusions.flights && <Button variant="secondary" onClick={addFlight}>+ Add Flight Option</Button>}
            </div>
        </div> 
        {formData.inclusions.flights && formData.flightOptions.map((flight, index) => ( 
            <div key={flight.id} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 relative"> 
                <h3 className="text-xl font-bold text-white mb-4 flex justify-between items-center">
                    Flight Option {index + 1} 
                    <div className="flex items-center gap-4">
                        <div className="pt-2"><FormCheckbox label="Include Sum" checked={flight.includeInSummary !== false} onChange={e => updateFlight(index, 'includeInSummary', e.target.checked)} /></div>
                        <button onClick={() => removeFlight(index)} className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1"><TrashIcon /> Remove</button>
                    </div>
                </h3> 
                <div className="mb-6"><FormInput label="Route Description" value={flight.routeDescription} onChange={e => updateFlight(index, 'routeDescription', e.target.value)} placeholder="e.g. Riyadh to London" /></div> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> 
                    <div className="p-4 bg-slate-900/50 rounded border border-slate-700"> 
                        <h4 className="font-bold text-ai-secondary mb-3 text-xs uppercase">Outbound Journey</h4> 
                        {flight.outbound.map((leg, i) => ( 
                            <div key={i} className="mb-4 border-l-2 border-gray-600 pl-3 relative"> 
                                {flight.outbound.length > 1 && <button onClick={() => removeFlightLeg(index, 'outbound', i)} className="absolute right-0 top-0 text-red-400 text-[10px] hover:text-white">Remove Leg</button>} 
                                <div className="grid grid-cols-2 gap-2 mb-2"> <FormInput label="From" value={leg.from} onChange={e => updateFlightLeg(index, 'outbound', i, 'from', e.target.value)} className="mb-0"/> <FormInput label="To" value={leg.to} onChange={e => updateFlightLeg(index, 'outbound', i, 'to', e.target.value)} className="mb-0"/> </div> 
                                <div className="grid grid-cols-2 gap-2 mb-2"> <FormInput label="Airline" value={leg.airline} onChange={e => updateFlightLeg(index, 'outbound', i, 'airline', e.target.value)} className="mb-0"/> <FormInput label="Flight #" value={leg.flightNumber} onChange={e => updateFlightLeg(index, 'outbound', i, 'flightNumber', e.target.value)} className="mb-0"/> </div> 
                                <div className="grid grid-cols-2 gap-2"> <FormInput label="Date" type="date" value={leg.departureDate} onChange={e => updateFlightLeg(index, 'outbound', i, 'departureDate', e.target.value)} className="mb-0"/> <FormInput label="Time" type="time" value={leg.departureTime} onChange={e => updateFlightLeg(index, 'outbound', i, 'departureTime', e.target.value)} className="mb-0"/> <FormInput label="Arr Date" type="date" value={leg.arrivalDate} onChange={e => updateFlightLeg(index, 'outbound', i, 'arrivalDate', e.target.value)} className="mb-0"/> <FormInput label="Arr Time" type="time" value={leg.arrivalTime} onChange={e => updateFlightLeg(index, 'outbound', i, 'arrivalTime', e.target.value)} className="mb-0"/> </div> <FormInput label="Duration" value={leg.duration} onChange={e => updateFlightLeg(index, 'outbound', i, 'duration', e.target.value)} placeholder="e.g. 6h 30m" className="mt-2 mb-0"/> 
                            </div> 
                        ))} 
                        <Button variant="secondary" onClick={() => addFlightLeg(index, 'outbound')} className="text-xs">+ Add Connection</Button> 
                    </div> 
                    <div className="p-4 bg-slate-900/50 rounded border border-slate-700"> 
                        <h4 className="font-bold text-ai-secondary mb-3 text-xs uppercase">Return Journey</h4> 
                        {flight.return.map((leg, i) => ( 
                            <div key={i} className="mb-4 border-l-2 border-gray-600 pl-3 relative"> 
                                {flight.return.length > 1 && <button onClick={() => removeFlightLeg(index, 'return', i)} className="absolute right-0 top-0 text-red-400 text-[10px] hover:text-white">Remove Leg</button>} 
                                <div className="grid grid-cols-2 gap-2 mb-2"> <FormInput label="From" value={leg.from} onChange={e => updateFlightLeg(index, 'return', i, 'from', e.target.value)} className="mb-0"/> <FormInput label="To" value={leg.to} onChange={e => updateFlightLeg(index, 'return', i, 'to', e.target.value)} className="mb-0"/> </div> 
                                <div className="grid grid-cols-2 gap-2 mb-2"> <FormInput label="Airline" value={leg.airline} onChange={e => updateFlightLeg(index, 'return', i, 'airline', e.target.value)} className="mb-0"/> <FormInput label="Flight #" value={leg.flightNumber} onChange={e => updateFlightLeg(index, 'return', i, 'flightNumber', e.target.value)} className="mb-0"/> </div> 
                                <div className="grid grid-cols-2 gap-2"> <FormInput label="Date" type="date" value={leg.departureDate} onChange={e => updateFlightLeg(index, 'return', i, 'departureDate', e.target.value)} className="mb-0"/> <FormInput label="Time" type="time" value={leg.departureTime} onChange={e => updateFlightLeg(index, 'return', i, 'departureTime', e.target.value)} className="mb-0"/> <FormInput label="Arr Date" type="date" value={leg.arrivalDate} onChange={e => updateFlightLeg(index, 'return', i, 'arrivalDate', e.target.value)} className="mb-0"/> <FormInput label="Arr Time" type="time" value={leg.arrivalTime} onChange={e => updateFlightLeg(index, 'return', i, 'arrivalTime', e.target.value)} className="mb-0"/> </div> <FormInput label="Duration" value={leg.duration} onChange={e => updateFlightLeg(index, 'return', i, 'duration', e.target.value)} placeholder="e.g. 6h 30m" className="mt-2 mb-0"/> 
                            </div> 
                        ))} 
                        <Button variant="secondary" onClick={() => addFlightLeg(index, 'return')} className="text-xs">+ Add Connection</Button> 
                    </div> 
                </div> 
                <div className="mb-6 p-4 bg-slate-900/50 rounded border border-slate-700">
                    <h4 className="font-bold text-ai-accent mb-2 text-sm uppercase">Price Quotes</h4>
                    {flight.quotes.map((q, qIdx) => (
                        <div key={qIdx} className="flex items-end gap-4 mb-2">
                            <div className="flex-1"><FormInput label="Class / Type" value={q.class} onChange={e => updateFlightQuote(index, qIdx, 'class', e.target.value)} className="mb-0"/></div>
                            <div className="w-24"><FormInput label="Qty" type="number" value={q.quantity} onChange={e => updateFlightQuote(index, qIdx, 'quantity', parseInt(e.target.value))} className="mb-0"/></div>
                            <div className="flex-1 flex gap-2 items-end">
                                <FormInput label={`Net Price (${formData.pricing.currency})`} type="number" value={q.price} onChange={e => updateFlightQuote(index, qIdx, 'price', parseFloat(e.target.value))} className="mb-0 w-full"/>
                                <button onClick={() => removeFlightQuote(index, qIdx)} className="p-3 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 mb-[1px]"><TrashIcon/></button>
                            </div>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={() => addFlightQuote(index)} className="text-xs mt-2">+ Add Quote</Button>
                </div> 
                <div className="mt-4"><FormSelect label="VAT Rule" options={[{label: 'Domestic', value: 'domestic'}, {label: 'International', value: 'international'}]} value={flight.vatRule} onChange={e => updateFlight(index, 'vatRule', e.target.value)} /></div> 
            </div> 
        ))} 
    </div> 
  );
  
  const renderTransportationStep = () => ( 
    <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> 
        <div className="flex justify-between items-center mb-6"> 
            <SectionHeader title="Transportation" icon={<BusIcon />} /> 
            <FormCheckbox label="Skip Transportation" checked={!formData.inclusions.transportation} onChange={(e) => setFormData({...formData, inclusions: {...formData.inclusions, transportation: !e.target.checked}})} /> 
        </div> 
        {formData.inclusions.transportation && formData.transportation.map((item, idx) => (
            <div key={idx} className="mb-6 p-4 bg-slate-800/50 rounded border border-slate-700 relative group">
                <button onClick={() => removeItem('transportation', idx)} className="absolute top-2 right-2 text-red-400 text-xs">REMOVE</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Type" options={Object.values(VehicleType).map(v => ({ label: v, value: v }))} value={item.type} onChange={(e) => updateItem('transportation', idx, 'type', e.target.value)} />
                    <FormInput label="Vehicle Name (Model)" value={item.model} onChange={(e) => updateItem('transportation', idx, 'model', e.target.value)} placeholder="e.g. Viano 2025 Model" />
                    <div className="col-span-1 md:col-span-2"><FormInput label="Route/Desc" value={item.description} onChange={(e) => updateItem('transportation', idx, 'description', e.target.value)} /></div>
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <DateRangePicker 
                            label="Service Dates"
                            startDate={item.startDate}
                            endDate={item.endDate}
                            onChange={(s, e) => updateItemDates('transportation', idx, s, e)}
                        />
                        <div className="text-center pt-8 text-sm font-bold text-gray-400">{item.days} Days</div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1"><FormInput label={`Net Price/Day`} type="number" value={item.netPricePerDay} onChange={(e) => updateItem('transportation', idx, 'netPricePerDay', parseFloat(e.target.value))} /></div>
                        <div className="w-24"><FormInput label="Qty" type="number" value={item.quantity} onChange={(e) => updateItem('transportation', idx, 'quantity', parseInt(e.target.value))} /></div>
                        <div className="mb-4"><FormCheckbox label="Include Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('transportation', idx, 'includeInSummary', e.target.checked)} /></div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <FileUploader label="Vehicle Image" currentImage={item.image} onFileSelect={(b64) => updateItem('transportation', idx, 'image', b64)} />
                        <FormSelect label="VAT Rule" options={[{label: 'Domestic', value: 'domestic'}, {label: 'International', value: 'international'}]} value={item.vatRule} onChange={(e) => updateItem('transportation', idx, 'vatRule', e.target.value)} />
                    </div>
                </div>
            </div>
        ))} 
        {formData.inclusions.transportation && <Button variant="secondary" onClick={() => addItem<TransportationDetails>('transportation', { id: Date.now().toString(), type: VehicleType.Sedan, model: '', description: '', startDate: '', endDate: '', days: 1, netPricePerDay: 0, quantity: 1, vatRule: 'domestic' })}>+ Add Vehicle</Button>} 
    </div> 
  );

  const renderCustomStep = () => ( 
    <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> 
        <SectionHeader title="Custom Services" icon={<CustomIcon />} /> 
        {formData.customItems.map((item, idx) => (
            <div key={idx} className="mb-4 p-4 bg-slate-800/50 rounded border border-slate-700 relative">
                <button onClick={() => removeItem('customItems', idx)} className="absolute top-2 right-2 text-red-400 text-xs">REMOVE</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2"><FormInput label="Description" value={item.description} onChange={(e) => updateItem('customItems', idx, 'description', e.target.value)} /></div>
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <DateRangePicker 
                            label="Service Dates"
                            startDate={item.startDate || ''}
                            endDate={item.endDate || ''}
                            onChange={(s, e) => updateItemDates('customItems', idx, s, e)}
                        />
                        <div className="text-center pt-8 text-sm font-bold text-gray-400">{item.days} Days</div>
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-4 items-end">
                        <FormInput label="Net Unit Price" type="number" value={item.unitPrice} onChange={(e) => updateItem('customItems', idx, 'unitPrice', parseFloat(e.target.value))} className="mb-0"/>
                        <FormInput label="Quantity" type="number" value={item.quantity} onChange={(e) => updateItem('customItems', idx, 'quantity', parseInt(e.target.value))} className="mb-0"/>
                        <div className="mb-1"><FormCheckbox label="Include Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('customItems', idx, 'includeInSummary', e.target.checked)} /></div>
                    </div>
                    <FormSelect label="VAT Rule" options={[{label: 'Domestic', value: 'domestic'}, {label: 'International', value: 'international'}]} value={item.vatRule} onChange={(e) => updateItem('customItems', idx, 'vatRule', e.target.value)} />
                </div>
            </div>
        ))} 
        <Button variant="secondary" onClick={() => addItem<CustomItem>('customItems', { id: Date.now().toString(), description: '', unitPrice: 0, quantity: 1, vatRule: 'domestic', days: 1 })}>+ Add Item</Button> 
    </div> 
  );

  const renderActivitiesStep = () => ( 
    <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> 
        <SectionHeader title="Activities" icon={<ActivityIcon />} /> 
        {formData.activities.map((item, idx) => (
            <div key={idx} className="mb-4 p-4 bg-slate-800/50 rounded border border-slate-700 relative">
                <button onClick={() => removeItem('activities', idx)} className="absolute top-2 right-2 text-red-400 text-xs">REMOVE</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Name" value={item.name} onChange={(e) => updateItem('activities', idx, 'name', e.target.value)} />
                    <FormSelect label="VAT Rule" options={[{label: 'Domestic', value: 'domestic'}, {label: 'International', value: 'international'}]} value={item.vatRule} onChange={(e) => updateItem('activities', idx, 'vatRule', e.target.value)} />
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <DateRangePicker 
                            label="Activity Dates"
                            startDate={item.startDate || ''}
                            endDate={item.endDate || ''}
                            onChange={(s, e) => updateItemDates('activities', idx, s, e)}
                        />
                        <div className="text-center pt-8 text-sm font-bold text-gray-400">{item.days} Days</div>
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-4 items-end">
                        <FormInput label="Net Price/Person" type="number" value={item.pricePerPerson} onChange={(e) => updateItem('activities', idx, 'pricePerPerson', parseFloat(e.target.value))} className="mb-0"/>
                        <FormInput label="Guests" type="number" value={item.guests} onChange={(e) => updateItem('activities', idx, 'guests', parseInt(e.target.value))} className="mb-0"/>
                        <div className="mb-1"><FormCheckbox label="Include Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('activities', idx, 'includeInSummary', e.target.checked)} /></div>
                    </div>
                    <div className="col-span-1 md:col-span-2"><FileUploader label="Image" currentImage={item.image} onFileSelect={(b64) => updateItem('activities', idx, 'image', b64)} /></div>
                </div>
            </div>
        ))} 
        <Button variant="secondary" onClick={() => addItem<ActivityDetails>('activities', { id: Date.now().toString(), name: '', pricePerPerson: 0, guests: 1, vatRule: 'domestic', days: 1 })}>+ Add Activity</Button> 
    </div> 
  );
  
  const renderInclusionsStep = () => ( <div className="glass p-6 rounded-xl w-full max-w-4xl mx-auto"> <SectionHeader title="Inclusions Check" icon={<PalmLogo className="w-6 h-6" />} /> <p className="text-sm text-gray-400 mb-4">Final check of what will appear on the generated proposal.</p> <div className="space-y-4"> {Object.keys(formData.inclusions).map((key) => ( <label key={key} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded border border-slate-600 cursor-pointer"> <input type="checkbox" checked={formData.inclusions[key as keyof Inclusions]} onChange={(e) => setFormData({...formData, inclusions: {...formData.inclusions, [key]: e.target.checked}})} className="w-5 h-5 text-ai-accent rounded bg-slate-900 border-gray-500" /> <span className="capitalize font-semibold text-white">{key.replace(/([A-Z])/g, ' $1').trim()}</span> </label> ))} </div> </div> );

  const Steps = [renderBrandingStep(), renderPricingConfigStep(), renderHotelStep(), renderFlightStep(), renderTransportationStep(), renderCustomStep(), renderActivitiesStep(), renderInclusionsStep()];

  if (!user) {
    return <AuthScreen onLogin={(u) => {
        setUser(u);
        setSubMode('my_proposals'); 
    }} />;
  }
  
  const isSuper = user.role === 'super_admin';
  const isAdmin = user.role === 'admin';
  
  // Header Logic (15.1, 15.2)
  const companyLogo = !isSuper && user.companyId 
      ? companies.find(c => c.id === user.companyId)?.logo 
      : null;

  const renderDashboard = () => {
    let displayedProposals: ProposalData[] = [];
    const activeProposals = savedProposals.filter(p => !p.isDeleted);

    if (subMode === 'my_proposals') {
       displayedProposals = activeProposals.filter(p => p.createdBy === user.email || p.sharedWith.includes(user.email));
    } else if (subMode === 'all_proposals') {
       if (isSuper) {
           displayedProposals = activeProposals;
       } else if (isAdmin) {
           displayedProposals = activeProposals.filter(p => p.companyId === user.companyId);
       }
    }

    return (
     <div className="w-full max-w-7xl mx-auto p-6">
        {renderEditUserModal()}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           {/* Header Branding */}
           {isSuper ? (
               // Super User: No Logo, Text Only
               <div className="flex items-center gap-4">
                   <h1 className="text-3xl font-display font-bold text-white tracking-tight">Travel Proposal Portal</h1>
               </div>
           ) : (
               // Admin/User: Company Logo
               <div className="flex items-center gap-4">
                  {companyLogo ? (
                      <img src={companyLogo} className="h-16 w-auto object-contain bg-white/10 rounded p-1 backdrop-blur-sm border border-white/20" alt="Company Logo" />
                  ) : (
                      <SITCLogo className="w-24 h-auto opacity-50 grayscale" />
                  )}
                  <div>
                    <h1 className="text-4xl font-display font-bold text-white">Portal</h1>
                  </div>
               </div>
           )}

           <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                 {/* 15.1 Super User Name Display */}
                 <span className="text-sm font-bold text-white">{user.firstName} {user.lastName}</span>
                <span className="text-xs text-gray-400">{user.email}</span>
                <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 mt-1">Log Out</button>
             </div>
             <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-xl text-ai-accent">
                <UserIcon />
             </div>
           </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-700 pb-1 overflow-x-auto">
             <button onClick={() => setSubMode('my_proposals')} className={`pb-2 px-4 font-bold whitespace-nowrap ${subMode === 'my_proposals' ? 'text-ai-accent border-b-2 border-ai-accent' : 'text-gray-400 hover:text-white'}`}>My Proposals</button>
             
             {(isSuper || isAdmin) && (
                 <button onClick={() => setSubMode('all_proposals')} className={`pb-2 px-4 font-bold whitespace-nowrap ${subMode === 'all_proposals' ? 'text-ai-accent border-b-2 border-ai-accent' : 'text-gray-400 hover:text-white'}`}>
                    {isSuper ? 'All Company Proposals' : 'Company Proposals'}
                 </button>
             )}
             
             {isSuper && (
                 <button onClick={() => setSubMode('companies')} className={`pb-2 px-4 font-bold whitespace-nowrap ${subMode === 'companies' ? 'text-ai-accent border-b-2 border-ai-accent' : 'text-gray-400 hover:text-white'}`}>Manage Companies</button>
             )}
             
             {(isSuper || isAdmin) && (
                <button onClick={() => setSubMode('company_users')} className={`pb-2 px-4 font-bold whitespace-nowrap ${subMode === 'company_users' ? 'text-ai-accent border-b-2 border-ai-accent' : 'text-gray-400 hover:text-white'}`}>User Management</button>
             )}

             <button onClick={() => setSubMode('account_settings')} className={`pb-2 px-4 font-bold whitespace-nowrap ${subMode === 'account_settings' ? 'text-ai-accent border-b-2 border-ai-accent' : 'text-gray-400 hover:text-white'}`}>Account Settings</button>
        </div>
        
        {(subMode === 'my_proposals' || subMode === 'all_proposals') && (
          <>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white">
                 {subMode === 'my_proposals' ? 'My Proposals' : (isSuper ? 'All System Proposals' : 'Team Proposals')}
               </h2>
               <Button onClick={handleCreateNew} className="bg-ai-accent text-slate-900">+ Create Proposal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedProposals.length === 0 && <div className="text-gray-500 col-span-3 text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-gray-700">No proposals found.</div>}
              {displayedProposals.map((p) => (
                  <div key={p.id} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 hover:border-ai-accent/50 transition shadow-lg flex flex-col relative group">
                    {sharingId === p.id && (
                       <div className="absolute inset-0 bg-slate-900/95 z-10 flex flex-col items-center justify-center p-4 rounded-xl animate-fadeIn">
                          <h4 className="text-white font-bold mb-2">Share Proposal</h4>
                          <FormInput label="Enter Email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full mb-2" />
                          <div className="flex gap-2">
                             <button onClick={() => setSharingId(null)} className="text-xs text-gray-400">Cancel</button>
                          </div>
                       </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white truncate w-48">{p.proposalName || p.customerName || 'Untitled'}</h3>
                          <div className="text-sm text-gray-400 truncate">{p.customerName}</div>
                          <div className="flex flex-col mt-2">
                            <span className="text-xs text-gray-500">Created: {new Date(Number(p.id)).toLocaleDateString()}</span>
                            {p.createdBy !== user.email && <span className="text-[10px] text-ai-accent uppercase tracking-wide mt-1 font-bold">By: {p.createdBy}</span>}
                            {isSuper && p.companyId && <span className="text-[10px] text-gray-500 uppercase mt-1">Comp: {companies.find(c => c.id === p.companyId)?.name}</span>}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-ai-accent/10 text-ai-accent rounded text-xs font-bold">{p.pricing.currency}</span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-700 mt-auto">
                        <button onClick={() => handleEdit(p)} className="flex-1 py-2 bg-ai-accent text-slate-900 rounded font-bold flex justify-center items-center gap-2 text-sm hover:brightness-110 transition-all"><EditIcon/> Edit</button>
                        <button onClick={() => handleDuplicate(p)} className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600" title="Duplicate"><CopyIcon/></button>
                        {(isSuper || isAdmin || p.createdBy === user.email) && (
                          <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50" title="Delete"><TrashIcon/></button>
                        )}
                    </div>
                  </div>
              ))}
            </div>
          </>
        )}

        {subMode === 'companies' && isSuper && renderCompanyManagement()}
        {subMode === 'company_users' && (isSuper || isAdmin) && renderUserManagement()}
        
        {subMode === 'account_settings' && (
           <div className="glass p-6 rounded-xl max-w-md mx-auto">
              <SectionHeader title="Change Password" icon={<LockIcon />} />
              {passMsg.text && <div className={`mb-4 p-3 rounded text-sm ${passMsg.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{passMsg.text}</div>}
              <FormInput label="Current Password" type="password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} />
              <FormInput label="New Password" type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
              <Button onClick={() => { try { changePassword(user.email, passData.current, passData.new); setPassMsg({type:'success', text:'Updated'}); } catch(e:any) { setPassMsg({type:'error', text:e.message}); }}}>Update Password</Button>
           </div>
        )}
     </div>
    );
  };

  if (viewMode === 'dashboard') return <div className="min-h-screen bg-ai-bg bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white">{renderDashboard()}</div>;

  if (viewMode === 'preview') return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="sticky top-0 z-50 bg-white shadow-md p-4 no-print flex justify-between items-center">
           <div className="flex gap-4">
               <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-corporate-blue"><HomeIcon/> Dashboard</button>
               <button onClick={() => setViewMode('form')} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-corporate-blue"><EditIcon/> Edit Proposal</button>
           </div>
           <h1 className="text-xl font-bold text-corporate-blue flex items-center gap-2">{formData.proposalName}</h1>
           <button onClick={() => window.print()} className="px-6 py-2 bg-corporate-blue text-white rounded font-bold hover:bg-sky-900 transition-colors">Print / Download PDF</button>
        </div>
        <div className="mt-8"><ProposalPDF data={formData} /></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-ai-bg bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black flex flex-col items-center justify-center p-2 md:p-8">
      <div className="w-full max-w-4xl glass rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col h-[90vh] md:h-auto">
        <div className="h-1 w-full bg-slate-800"><div className="h-full bg-gradient-to-r from-ai-accent to-purple-500 transition-all duration-500" style={{ width: `${((step + 1) / Steps.length) * 100}%` }}></div></div>
        
        <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-2 md:gap-4"><button onClick={() => setViewMode('dashboard')} className="text-gray-400 hover:text-white flex items-center gap-2"><HomeIcon /> Back</button></div>
           <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Step {step + 1} of {Steps.length}</span>
              <Button onClick={() => handleSaveProposal(true)} className="bg-green-600 text-white gap-2 h-8 text-sm"><SaveIcon/> Save Draft</Button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">{Steps[step]}</div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-between items-center">
           <Button variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Previous</Button>
           {step < Steps.length - 1 ? <Button onClick={() => setStep(s => Math.min(Steps.length - 1, s + 1))}>Next Step</Button> : <Button onClick={() => handleSaveProposal(false)} className="bg-ai-accent text-slate-900">Generate Proposal</Button>}
        </div>
      </div>
    </div>
  );
};

export default App;
