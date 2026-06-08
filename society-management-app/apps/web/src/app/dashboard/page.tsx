'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Check, 
  Bell, 
  User, 
  Shield, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  LayoutDashboard,
  Megaphone,
  UserCheck,
  Compass,
  CornerDownRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Interfaces for our full-fidelity client state matches
interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  societyId?: string;
  permissions?: string[];
}

interface Bill {
  id: string;
  invoiceNumber: string;
  period: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  dueDate: string;
}

interface Complaint {
  id: string;
  ticketNumber: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  raisedBy: string;
  createdAt: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  target: string;
}

interface FlatUnit {
  id: string;
  flatNumber: string;
  wing: string;
  building: string;
  type: string;
  ownership: string;
  occupancy: string;
  area: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'portal' | 'billing' | 'ticketing' | 'notices' | 'structure'>('portal');

  // Interactive Modal Form States
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [newCategory, setNewCategory] = useState('Plumbing');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Primary Workspace States with LocalStorage Persistence fallbacks
  const [bills, setBills] = useState<Bill[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [flats, setFlats] = useState<FlatUnit[]>([]);

  // Feedback notifications
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  // Initialize and load persistent data
  useEffect(() => {
    // 1. Resolve User Session Profile
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Map permissions based on roles for UI capability gating
        const userPerms = whenGetUserPermissions(parsed.role);
        setCurrentUser({
          email: parsed.email || 'guest@society.com',
          firstName: parsed.firstName || (parsed.role === 'SUPER_ADMIN' ? 'Albus' : 'Remus'),
          lastName: parsed.lastName || (parsed.role === 'SUPER_ADMIN' ? 'Dumbledore' : 'Lupin'),
          role: parsed.role || 'GUEST',
          permissions: userPerms
        });
      } catch (e) {
        console.error('Invalid user session', e);
      }
    } else {
      // Default offline developer fallback
      setCurrentUser({
        email: 'admin@society.com',
        firstName: 'Remus',
        lastName: 'Lupin',
        role: 'SOCIETY_ADMIN',
        permissions: whenGetUserPermissions('SOCIETY_ADMIN')
      });
    }

    // 2. Load lists with fallback to static constants matches database seed
    const storedBills = localStorage.getItem('web_bills');
    if (storedBills) {
      setBills(JSON.parse(storedBills));
    } else {
      const initialBills: Bill[] = [
        { id: 'b1', invoiceNumber: 'INV-2026-101', period: 'June 2026', amount: 1700, status: 'UNPAID', dueDate: '25 Jun 2026' },
        { id: 'b2', invoiceNumber: 'INV-2026-102', period: 'May 2026', amount: 1700, status: 'PAID', dueDate: '25 May 2026' },
        { id: 'b3', invoiceNumber: 'INV-2026-103', period: 'April 2026', amount: 1700, status: 'PAID', dueDate: '25 Apr 2026' }
      ];
      setBills(initialBills);
      localStorage.setItem('web_bills', JSON.stringify(initialBills));
    }

    const storedComplaints = localStorage.getItem('web_complaints');
    if (storedComplaints) {
      setComplaints(JSON.parse(storedComplaints));
    } else {
      const initialComplaints: Complaint[] = [
        {
          id: 'c1',
          ticketNumber: 'TKT-309',
          category: 'Plumbing',
          priority: 'HIGH',
          subject: 'Water leakage from ceiling in kitchen',
          description: 'Leaking water near main water control hub of floor 1 in Wing A1.',
          status: 'OPEN',
          raisedBy: 'Jayesh Panchal (F-101)',
          createdAt: '08 Jun 2026'
        },
        {
          id: 'c2',
          ticketNumber: 'TKT-312',
          category: 'Electrical',
          priority: 'URGENT',
          subject: 'Corridor lights blinking in Wing B2',
          description: 'Multiple tube fixtures have burned transformer starters on the 2nd floor.',
          status: 'OPEN',
          raisedBy: 'Harry Potter (Tenant)',
          createdAt: '07 Jun 2026'
        }
      ];
      setComplaints(initialComplaints);
      localStorage.setItem('web_complaints', JSON.stringify(initialComplaints));
    }

    const storedNotices = localStorage.getItem('web_notices');
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    } else {
      const initialNotices: Notice[] = [
        {
          id: 'n1',
          title: 'Monsoon Preparedness Circular',
          content: 'All residents are requested to ensure balcony drain channels are clear prior to high rainfall sequences in the upcoming monsoon cycle.',
          date: '08 Jun 2026',
          target: 'ALL'
        },
        {
          id: 'n2',
          title: 'Annual General Meeting (AGM) 2026',
          content: 'General committee operations will review budgets, ledger balance, and billing rules on June 21, 2026 at the clubhouse foyer.',
          date: '07 Jun 2026',
          target: 'ALL'
        }
      ];
      setNotices(initialNotices);
      localStorage.setItem('web_notices', JSON.stringify(initialNotices));
    }

    // Static housing units matching seed
    const initialFlats: FlatUnit[] = [
      { id: 'f1', flatNumber: '101', wing: 'A1', building: 'Building A', type: '2BHK', ownership: 'Owned', occupancy: 'SelfOccupied', area: '950 SqFt' },
      { id: 'f2', flatNumber: '102', wing: 'A1', building: 'Building A', type: '2BHK', ownership: 'Rented', occupancy: 'TenantOccupied', area: '950 SqFt' },
      { id: 'f3', flatNumber: '103', wing: 'A1', building: 'Building A', type: '2BHK', ownership: 'Vacant', occupancy: 'Vacant', area: '950 SqFt' },
      { id: 'f4', flatNumber: '104', wing: 'A2', building: 'Building A', type: '3BHK', ownership: 'Owned', occupancy: 'SelfOccupied', area: '1200 SqFt' },
      { id: 'f5', flatNumber: '101', wing: 'B1', building: 'Building B', type: '2BHK', ownership: 'Owned', occupancy: 'SelfOccupied', area: '950 SqFt' },
      { id: 'f6', flatNumber: '102', wing: 'B2', building: 'Building B', type: '2BHK', ownership: 'Vacant', occupancy: 'Vacant', area: '950 SqFt' }
    ];
    setFlats(initialFlats);

  }, []);

  function whenGetUserPermissions(role: string): string[] {
    switch (role) {
      case 'SUPER_ADMIN':
        return ['society.create', 'society.delete', 'settings.manage', 'payment.view', 'complaint.resolve'];
      case 'SOCIETY_ADMIN':
        return ['building.create', 'wing.create', 'flat.create', 'maintenance.generate', 'notice.create', 'complaint.resolve', 'payment.view'];
      case 'OWNER':
        return ['flat.view', 'complaint.create', 'notice.view', 'payment.view'];
      default: // TENANT
        return ['flat.view', 'complaint.create', 'notice.view'];
    }
  }

  // Trigger feedback banner helper
  const showToast = (message: string) => {
    setActionDoneMsg(message);
    setTimeout(() => {
      setActionDoneMsg(null);
    }, 4000);
  };

  // Perform safe logouts and security clearance
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  // Pay unique invoice
  const handlePayInvoice = (id: string, invNum: string) => {
    const updated = bills.map(b => b.id === id ? { ...b, status: 'PAID' as const } : b);
    setBills(updated);
    localStorage.setItem('web_bills', JSON.stringify(updated));
    showToast(`Payment processed for ${invNum}. Invoice status set to PAID.`);
  };

  // Create complaint ticket
  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDescription) {
      alert('Subject and Details are essential blocks.');
      return;
    }

    const newTicket: Complaint = {
      id: 'c_' + Date.now(),
      ticketNumber: 'TKT-' + (300 + complaints.length + 1),
      category: newCategory,
      priority: newPriority,
      subject: newSubject,
      description: newDescription,
      status: 'OPEN',
      raisedBy: `${currentUser?.firstName} ${currentUser?.lastName} (${currentUser?.role})`,
      createdAt: new Date().toLocaleDateString('en-GB') || '08 Jun 2026'
    };

    const updated = [newTicket, ...complaints];
    setComplaints(updated);
    localStorage.setItem('web_complaints', JSON.stringify(updated));

    // Clear inputs
    setNewCategory('Plumbing');
    setNewPriority('MEDIUM');
    setNewSubject('');
    setNewDescription('');
    setShowComplaintModal(false);

    showToast(`Ticket ${newTicket.ticketNumber} successfully raised.`);
  };

  // Resolve complaint ticket
  const handleResolveComplaint = (id: string, tktNum: string) => {
    const updated = complaints.map(c => c.id === id ? { ...c, status: 'RESOLVED' as const } : c);
    setComplaints(updated);
    localStorage.setItem('web_complaints', JSON.stringify(updated));
    showToast(`Ticket ${tktNum} marked as RESOLVED.`);
  };

  // Publish circular
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) {
      alert('Title and bulletin directives are mandatory.');
      return;
    }

    const newNotice: Notice = {
      id: 'n_' + Date.now(),
      title: newNoticeTitle,
      content: newNoticeContent,
      date: new Date().toLocaleDateString('en-GB') || '08 Jun 2026',
      target: 'ALL'
    };

    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem('web_notices', JSON.stringify(updated));

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setShowNoticeForm(false);

    showToast(`Announced circular: "${newNotice.title}" successfully broadcasted.`);
  };

  // Role verification checks
  const canBillingView = currentUser?.permissions?.includes('payment.view') || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SOCIETY_ADMIN';
  const canPublishNotice = currentUser?.permissions?.includes('notice.create') || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SOCIETY_ADMIN';
  const canResolveComplaint = currentUser?.permissions?.includes('complaint.resolve') || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SOCIETY_ADMIN';

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col font-sans text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Banner Message */}
      {actionDoneMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 border border-emerald-500/30 text-emerald-300 py-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{actionDoneMsg}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                CS
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Green Heights Co-op 
                  <span className="text-[10px] bg-emerald-400/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    Active
                  </span>
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold text-[9px]">Housing Workspace Hub</p>
              </div>
            </div>

            {/* Profile Action details */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                  {currentUser?.role}
                </span>
              </div>

              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <User className="h-4.5 w-4.5" />
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold font-mono"
                title="Secure logout session"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          
          <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wildest">Primary Workspace</span>
          
          <button
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'portal' 
                ? 'bg-emerald-400 text-slate-950 font-extrabold' 
                : 'hover:bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Workspace Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'billing' 
                ? 'bg-emerald-400 text-slate-950 font-extrabold' 
                : 'hover:bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Billing & Ledgers</span>
          </button>

          <button
            onClick={() => setActiveTab('ticketing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'ticketing' 
                ? 'bg-emerald-400 text-slate-950 font-extrabold' 
                : 'hover:bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            <span>Complaints Helpdesk</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'notices' 
                ? 'bg-emerald-400 text-slate-950 font-extrabold' 
                : 'hover:bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Megaphone className="h-4.5 w-4.5" />
            <span>Circular Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'structure' 
                ? 'bg-emerald-400 text-slate-950 font-extrabold' 
                : 'hover:bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Housing Footprint</span>
          </button>

          {/* Quick Context panel */}
          <div className="mt-8 bg-slate-900/50 rounded-2xl border border-slate-800/80 p-4 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#10b981] flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> SECURITY GATEWAY
            </span>
            <div className="text-[11px] text-slate-400 space-y-2">
              <p>LoggedIn profile has permission verification active.</p>
              <div className="border-t border-slate-850 pt-2 font-mono">
                <span className="text-slate-500 font-sans block text-[9px] uppercase tracking-wider">Approved Token Key:</span>
                <span className="text-emerald-400 block break-all text-[9.5px]">HS_AUTH_SECURE_TOKEN_ACT...</span>
              </div>
            </div>
          </div>

        </aside>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 bg-[#090e1a]/80 rounded-2xl border border-slate-800 p-6 min-h-[600px]">
          
          {/* 1. PORTAL HUB TAB */}
          {activeTab === 'portal' && (
            <div className="space-y-6">
              
              {/* Authorized Welcome Banner */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                
                <span className="text-xs font-bold text-emerald-400 font-mono tracking-widest uppercase">Member Portal Desk</span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Welcome to Web Operations, {currentUser?.firstName}!
                </h2>
                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                  housing audits, maintenance distribution models, building blueprints, and resident tickets are integrated concurrently under standard rules.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                  <div>
                    <span className="block text-xs text-slate-500">Authorized Profile:</span>
                    <span className="text-xs font-bold text-slate-200">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Workspace Role:</span>
                    <span className="text-xs font-bold text-emerald-400">{currentUser?.role}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Flat Area Scope:</span>
                    <span className="text-xs font-bold text-slate-200">Buildings A & B</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Verification Scheme:</span>
                    <span className="text-xs font-mono font-bold text-slate-400">Offline-Fallback Ready</span>
                  </div>
                </div>
              </div>

              {/* STAGE METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pending Dues card */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance Dues Status</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-500">
                      ₹{bills.filter(b => b.status === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0)}
                    </span>
                    <span className="text-xs text-slate-400">Unresolved Ledger</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1.5">Standard fixed rate rules apply</span>
                </div>

                {/* Open Complaints card */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Unresolved Tickets</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-red-400">
                      {complaints.filter(c => c.status === 'OPEN').length} Tickets
                    </span>
                    <span className="text-xs text-slate-400">Active plumbing/electrical</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1.5">Assigned to facilities team</span>
                </div>

                {/* Active circular announcements */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Broadcasts</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400">
                      {notices.length} Banners
                    </span>
                    <span className="text-xs text-slate-400">Circular Notices active</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1.5">Shared broad communication desk</span>
                </div>

              </div>

              {/* PERMISSION CHECKLIST */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">
                  Account Permissions & Verified Handshakes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {currentUser?.permissions?.map((perm, ix) => (
                    <div key={ix} className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center gap-2.5">
                      <div className="h-5 w-5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="font-semibold text-slate-200">{perm}</span>
                    </div>
                  ))}
                  {(!currentUser?.permissions || currentUser.permissions.length === 0) && (
                    <p className="text-slate-400 col-span-full">No explicit module permission handshakes found for current role.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 2. BILLING HUB TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">Finance & Invoice Ledger</h2>
                  <p className="text-xs text-slate-400">Review status logs of standard monthly cooperative dues</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-semibold">
                  Standard fixed rate: ₹1,700/month
                </div>
              </div>

              {canBillingView ? (
                <div className="grid grid-cols-1 gap-4">
                  {bills.map((bill) => (
                    <div 
                      key={bill.id} 
                      className={`bg-[#0f172a] border rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all ${
                        bill.status === 'UNPAID' ? 'border-amber-500/30 bg-amber-500/[0.01]' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-100">{bill.period}</span>
                          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {bill.invoiceNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Due Date parameter: {bill.dueDate}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Due</span>
                          <span className={`text-base font-black ${bill.status === 'UNPAID' ? 'text-amber-500' : 'text-emerald-400'}`}>
                            ₹{bill.amount}
                          </span>
                        </div>

                        <div>
                          {bill.status === 'UNPAID' ? (
                            <button
                              onClick={() => handlePayInvoice(bill.id, bill.invoiceNumber)}
                              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition-all active:scale-95"
                            >
                              Pay Invoice
                            </button>
                          ) : (
                            <span className="inline-flex gap-1.5 items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> PAID
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/15 p-6 rounded-xl text-center space-y-3">
                  <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Access Verification Blocked</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your current assigned credential permission set does not possess the [payment.view] descriptor criteria.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* 3. COMPLAINTS TICKETING TAB */}
          {activeTab === 'ticketing' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">Resident Complaints Helpdesk</h2>
                  <p className="text-xs text-slate-400">Lodge or view resolution logs of estate mechanical issue tickets</p>
                </div>
                
                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" /> Raise complaint
                </button>
              </div>

              {/* LIST OF LOGGED COMPLAINT TICKETS */}
              <div className="grid grid-cols-1 gap-5">
                {complaints.map((ticket) => (
                  <div key={ticket.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-blue-400 font-mono tracking-wider">{ticket.ticketNumber}</span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="text-xs bg-slate-800/80 border border-slate-700/50 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                            {ticket.category}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white">{ticket.subject}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Priority level indicator */}
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase ${
                          ticket.priority === 'URGENT' ? 'bg-red-500/25 text-red-400' :
                          ticket.priority === 'HIGH' ? 'bg-amber-500/25 text-amber-400' :
                          ticket.priority === 'MEDIUM' ? 'bg-blue-500/25 text-blue-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {ticket.priority} priority
                        </span>

                        {/* Status tracker */}
                        <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full ${
                          ticket.status === 'OPEN' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300">{ticket.description}</p>

                    <div className="flex justify-between items-center border-t border-slate-850 pt-3 text-[11px] text-slate-500 flex-wrap gap-2">
                      <div>
                        <span>Logged by: <strong className="text-slate-400">{ticket.raisedBy}</strong></span>
                        <span className="mx-2">·</span>
                        <span>Date: {ticket.createdAt}</span>
                      </div>

                      {ticket.status === 'OPEN' && (
                        <div>
                          {canResolveComplaint ? (
                            <button
                              onClick={() => handleResolveComplaint(ticket.id, ticket.ticketNumber)}
                              className="text-emerald-400 hover:text-emerald-300 hover:underline font-bold"
                            >
                              Mark ticket completed
                            </button>
                          ) : (
                            <span className="text-slate-500 italic">Scheduled for facility vendors</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 4. CIRCULAR NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">Circular Announcement Desk</h2>
                  <p className="text-xs text-slate-400">Publish or read notice bulletin banners broadcasted to estate</p>
                </div>
                {canPublishNotice && (
                  <button
                    onClick={() => setShowNoticeForm(!showNoticeForm)}
                    className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4" /> {showNoticeForm ? 'Cancel Publish' : 'Broadcast announcement'}
                  </button>
                )}
              </div>

              {/* Notice form publisher modal */}
              {showNoticeForm && (
                <form onSubmit={handleAddNotice} className="bg-[#0f172a] border border-emerald-500/20 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-emerald-400">Broadcast Circular Bulletin</h3>
                  
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400 font-semibold uppercase">Circular Heading</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monsoon Preparedness, High wind safety rules"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-155 placeholder-slate-500 block w-full rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400 font-semibold uppercase">Details & Guidelines</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Fulfill clean guidance directives..."
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-155 placeholder-slate-500 block w-full rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2.5 px-4 rounded-lg w-full"
                  >
                    Publish Bulletins Now
                  </button>
                </form>
              )}

              {/* LIST OF NOTICES BULLETINS */}
              <div className="grid grid-cols-1 gap-5">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-400"></div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                      <span className="font-bold text-emerald-400 uppercase tracking-wildest text-[9.5px]">Broadcast circular</span>
                      <span>Published: {notice.date}</span>
                    </div>
                    <h3 className="text-base font-black text-white">{notice.title}</h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">{notice.content}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 5. PHYSICAL HOUSING STRUCTURE FOOTPRINT TAB */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-black text-white">Housing Blueprint footprint</h2>
                <p className="text-xs text-slate-400">Explore database registry list of buildings, wings, and configured flat status</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex gap-4 text-xs tracking-wider font-semibold text-emerald-400">
                <span>Total Seed Footprint: 2 Towers</span>
                <span>·</span>
                <span>4 Wings (A1, A2, B1, B2)</span>
                <span>·</span>
                <span>40 database records</span>
              </div>

              {/* FLATS UNITS INVENTORY LIST */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-[#0f172a] text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3.5">Unit Location</th>
                      <th className="px-4 py-3.5">Structure Footprint</th>
                      <th className="px-4 py-3.5">Type Specs</th>
                      <th className="px-4 py-3.5">Ownership status</th>
                      <th className="px-4 py-3.5">Occupancy details</th>
                      <th className="px-4 py-3.5 text-right">Carpet configuration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-950/40 divide-y divide-slate-800">
                    {flats.map((flat) => (
                      <tr key={flat.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-bold text-white">Flat {flat.flatNumber}</td>
                        <td className="px-4 py-3 text-slate-300">
                          <span className="flex items-center gap-1">
                            {flat.building} <CornerDownRight className="h-3 w-3 text-slate-500" /> Wing {flat.wing}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-semibold">{flat.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9.5px] ${
                            flat.ownership === 'Owned' ? 'bg-emerald-500/10 text-emerald-400' :
                            flat.ownership === 'Rented' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {flat.ownership}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{flat.occupancy}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400">{flat.area}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* RAISING COMPLAINT TICKET MODAL */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-base font-extrabold text-white">Raise Complaint Ticket</h3>
              <button 
                onClick={() => setShowComplaintModal(false)}
                className="text-slate-400 hover:text-white transition-all text-sm font-semibold font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddComplaint} className="space-y-4">
              
              {/* Category selection */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-semibold uppercase">Category</label>
                <div className="flex gap-2.5">
                  {['Plumbing', 'Electrical', 'Security'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                        newCategory === cat 
                          ? 'bg-emerald-400 text-slate-950 border-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority level options */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400 font-semibold uppercase">Priority Severity</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setNewPriority(prio)}
                      className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold rounded border transition-all ${
                        newPriority === prio 
                          ? 'bg-emerald-400 text-slate-950 border-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-xs text-slate-400 font-semibold uppercase">Short Subject Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leak from faucet"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 block w-full rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Details explanation text area */}
              <div className="space-y-1">
                <label className="block text-xs text-slate-400 font-semibold uppercase">Details explanation</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Elaborate details so support teams are prepared..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 block w-full rounded-lg text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="text-slate-400 hover:text-white transition-all text-xs font-bold font-mono py-2 px-4"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2 px-4 rounded-lg transition-all"
                >
                  Raise Ticket Now
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FOOTER LABEL */}
      <footer className="bg-[#0f172a] border-t border-slate-800 text-center py-4 text-[10px] text-slate-500">
        © 2026 Cooperative Housing Society Management Hub Inc. All rights reserved. Configured for high-performance browser access.
      </footer>

    </div>
  );
}
