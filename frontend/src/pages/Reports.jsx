import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Building2,
  CreditCard,
  FileText,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { reportsAPI } from '../services/api';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const tabs = [
  { key: 'availability', label: '1. Property Availability', icon: Building2 },
  { key: 'rent', label: '2. Rent Collection', icon: CreditCard },
  { key: 'lease', label: '3. Lease Expiry Radar', icon: FileText },
  { key: 'maintenance', label: '4. Maintenance Operations', icon: Wrench },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      let res;
      switch (activeTab) {
        case 'availability':
          res = await reportsAPI.propertyAvailability(params);
          break;
        case 'rent':
          res = await reportsAPI.rentCollection(params);
          break;
        case 'lease':
          res = await reportsAPI.leaseExpiry(params);
          break;
        case 'maintenance':
          res = await reportsAPI.maintenance(params);
          break;
      }
      setReportData(res.data?.data || null);
    } catch (err) {
      console.error('Report fetch error:', err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate]);

  const handleExport = () => {
    if (!reportData) return;
    let rows = [];
    switch (activeTab) {
      case 'availability':
        rows = (reportData.propertyBreakdown || []).map((p) => ({
          Property: p.property?.title,
          Type: p.property?.type,
          City: p.property?.address?.city,
          'Total Units': p.totalUnits,
          Occupied: p.occupied,
          Available: p.available,
          Maintenance: p.maintenance,
          'Occupancy %': `${p.occupancyRate}%`,
        }));
        break;
      case 'rent':
        rows = (reportData.propertyCollection || []).map((p) => ({
          Property: p.property?.title,
          Expected: p.expected,
          Collected: p.collected,
          'Payment Count': p.paymentCount,
        }));
        break;
      case 'lease':
        rows = (reportData.expiringIn60Days || reportData.expiringIn30Days || []).map((l) => ({
          Tenant: l.tenant?.name,
          Email: l.tenant?.email,
          Property: l.property?.title,
          Unit: l.unit?.unitNumber,
          Rent: l.monthlyRent,
          Start: formatDate(l.startDate),
          End: formatDate(l.endDate),
          Status: l.status,
        }));
        break;
      case 'maintenance':
        rows = (reportData.propertyStats || []).map((s) => ({
          Property: s.property?.title,
          Total: s.total,
          Pending: s.pending,
          Resolved: s.resolved,
          'Total Cost ($)': s.totalCost,
        }));
        break;
    }
    exportToCSV(rows, `report_${activeTab}_${new Date().toISOString().split('T')[0]}`);
    toast.success('Report exported to CSV successfully');
  };

  // ==========================================
  // RENDER REPORT 1: PROPERTY AVAILABILITY
  // ==========================================
  const renderAvailability = () => {
    if (!reportData) return null;
    const summary = reportData.summary || {};
    const breakdown = reportData.propertyBreakdown || [];
    const vacantList = reportData.vacantProperties || [];

    const pieData = [
      { name: 'Occupied Units', value: summary.occupiedUnits || 0 },
      { name: 'Available Units', value: summary.availableUnits || 0 },
      { name: 'Under Maintenance', value: summary.maintenanceUnits || 0 },
      { name: 'Reserved', value: summary.reservedUnits || 0 },
    ].filter((d) => d.value > 0);

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Properties</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalProperties || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Rental Units</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{summary.totalUnits || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Occupied Units</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{summary.occupiedUnits || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Available Units</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{summary.availableUnits || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Overall Occupancy</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{summary.occupancyRate || 0}%</p>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Occupancy Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">Ratio of occupied vs vacant units</p>
            </div>
            <div className="h-60 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">No unit records</p>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Property-Wise Availability Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Granular metrics across each real estate holding</p>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <th className="py-2.5 px-3">Property Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Occupied</th>
                    <th className="py-2.5 px-3">Available</th>
                    <th className="py-2.5 px-3">Occupancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {breakdown.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.property?.title}</td>
                      <td className="py-2.5 px-3 capitalize">{p.property?.type}</td>
                      <td className="py-2.5 px-3">{p.totalUnits}</td>
                      <td className="py-2.5 px-3 font-medium text-emerald-600">{p.occupied}</td>
                      <td className="py-2.5 px-3 font-medium text-amber-600">{p.available}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-600">{p.occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vacant Properties Alert Section */}
        {vacantList.length > 0 && (
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Vacant Properties Alert ({vacantList.length} properties with 0% occupancy)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {vacantList.map((vp, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200">
                  <p className="font-bold text-slate-800">{vp.property?.title}</p>
                  <p className="text-slate-500">{vp.property?.address?.city}, {vp.property?.address?.state}</p>
                  <p className="text-amber-700 font-semibold mt-1">{vp.available} vacant units ready to rent</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER REPORT 2: RENT COLLECTION
  // ==========================================
  const renderRentCollection = () => {
    if (!reportData) return null;
    const summary = reportData.summary || {};
    const trends = (reportData.monthlyTrends || []).map((t) => ({
      month: t.month,
      collected: t.collected || 0,
    }));
    const propertyCollection = reportData.propertyCollection || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Expected Monthly</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(summary.totalExpectedMonthly || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Collected This Month</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(summary.totalCollectedThisMonth || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Pending Rent</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(summary.totalPending || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Overdue Rent</p>
            <p className="text-2xl font-black text-red-600 mt-1">{formatCurrency(summary.totalOverdue || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Collection Rate</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{summary.collectionRate || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Collection History (Last 12 Months)</h3>
            <p className="text-xs text-slate-500 mb-4">Actual revenue cash flow trends</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Bar dataKey="collected" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Property-Wise Collection Performance</h3>
            <p className="text-xs text-slate-500 mb-4">Collection efficiency across each building</p>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-3">Collected</th>
                    <th className="py-2.5 px-3">Payments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propertyCollection.map((pc, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{pc.property?.title}</td>
                      <td className="py-2.5 px-3">{formatCurrency(pc.expected)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{formatCurrency(pc.collected)}</td>
                      <td className="py-2.5 px-3">{pc.paymentCount} payments</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER REPORT 3: LEASE EXPIRY
  // ==========================================
  const renderLeaseExpiry = () => {
    if (!reportData) return null;
    const summary = reportData.summary || {};
    const in30 = reportData.expiringIn30Days || [];
    const in60 = reportData.expiringIn60Days || [];
    const expired = reportData.expiredLeases || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Leases</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Active Leases</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{summary.active || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Expiring &le; 30 Days</p>
            <p className="text-2xl font-black text-red-600 mt-1">{summary.expiringIn30Days || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Expiring &le; 60 Days</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{summary.expiringIn60Days || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Expired Leases</p>
            <p className="text-2xl font-black text-slate-400 mt-1">{summary.expired || 0}</p>
          </div>
        </div>

        {/* Leases Expiring in 30 Days */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Immediate Action Required: Expiring Within 30 Days
          </h3>
          <p className="text-xs text-slate-500 mb-4">Residents requiring renewal notices or move-out coordination</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                  <th className="py-2.5 px-3">Resident</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Monthly Rent</th>
                  <th className="py-2.5 px-3">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {in30.map((l, i) => (
                  <tr key={i} className="hover:bg-red-50/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{l.tenant?.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{l.tenant?.email}</td>
                    <td className="py-2.5 px-3">{l.property?.title}</td>
                    <td className="py-2.5 px-3 font-bold">#{l.unit?.unitNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{formatCurrency(l.monthlyRent)}</td>
                    <td className="py-2.5 px-3 font-bold text-red-600">{formatDate(l.endDate)}</td>
                  </tr>
                ))}
                {in30.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No leases expiring in the next 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leases Expiring in 60 Days */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-amber-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Upcoming Expiring Leases (31 &ndash; 60 Days Window)
          </h3>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                  <th className="py-2.5 px-3">Resident</th>
                  <th className="py-2.5 px-3">Property & Unit</th>
                  <th className="py-2.5 px-3">Rent</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">Expiration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {in60.map((l, i) => (
                  <tr key={i} className="hover:bg-amber-50/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{l.tenant?.name}</td>
                    <td className="py-2.5 px-3">{l.property?.title} — #{l.unit?.unitNumber}</td>
                    <td className="py-2.5 px-3">{formatCurrency(l.monthlyRent)}</td>
                    <td className="py-2.5 px-3">{formatDate(l.startDate)}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">{formatDate(l.endDate)}</td>
                  </tr>
                ))}
                {in60.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No leases expiring in the 31&ndash;60 day window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER REPORT 4: MAINTENANCE
  // ==========================================
  const renderMaintenance = () => {
    if (!reportData) return null;
    const summary = reportData.summary || {};
    const byCategory = reportData.byCategory || {};
    const byPriority = reportData.byPriority || {};
    const propertyStats = reportData.propertyStats || [];

    const catData = Object.entries(byCategory).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    const prioData = Object.entries(byPriority).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Requests</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Open / In Progress</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{summary.open || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Resolved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{summary.resolved || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Emergency / High</p>
            <p className="text-2xl font-black text-red-600 mt-1">{(byPriority.emergency || 0) + (byPriority.high || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Repair Spend</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{formatCurrency(summary.totalActualCost || summary.totalEstimatedCost || 0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Requests by Maintenance Category</h3>
            <p className="text-xs text-slate-500 mb-4">System equipment breakdown</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Property-Wise Maintenance Statistics</h3>
            <p className="text-xs text-slate-500 mb-4">Tickets logged and repair costs per property</p>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3">Total Tickets</th>
                    <th className="py-2.5 px-3">Pending</th>
                    <th className="py-2.5 px-3">Resolved</th>
                    <th className="py-2.5 px-3">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propertyStats.map((ps, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{ps.property?.title}</td>
                      <td className="py-2.5 px-3 font-bold">{ps.total}</td>
                      <td className="py-2.5 px-3 font-medium text-amber-600">{ps.pending}</td>
                      <td className="py-2.5 px-3 font-medium text-emerald-600">{ps.resolved}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{formatCurrency(ps.totalCost || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Executive Intelligence & Auditing Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory real estate analytics computed dynamically from MongoDB collections.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Export Report (CSV)
        </button>
      </div>

      {/* Tab Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-slate-400" /> Date Filter:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-slate-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner text="Computing real-time MongoDB database aggregations..." />
      ) : (
        <>
          {activeTab === 'availability' && renderAvailability()}
          {activeTab === 'rent' && renderRentCollection()}
          {activeTab === 'lease' && renderLeaseExpiry()}
          {activeTab === 'maintenance' && renderMaintenance()}
        </>
      )}
    </div>
  );
};

export default Reports;
