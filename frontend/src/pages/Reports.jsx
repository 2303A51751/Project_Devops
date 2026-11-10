import { useState, useEffect } from 'react';
import {
  BarChart3, Download, Building2, CreditCard, FileText, Wrench, Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { reportsAPI } from '../services/api';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const tabs = [
  { key: 'availability', label: 'Property Availability', icon: Building2 },
  { key: 'rent', label: 'Rent Collection', icon: CreditCard },
  { key: 'lease', label: 'Lease Expiry', icon: FileText },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
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
        case 'availability': res = await reportsAPI.propertyAvailability(params); break;
        case 'rent': res = await reportsAPI.rentCollection(params); break;
        case 'lease': res = await reportsAPI.leaseExpiry(params); break;
        case 'maintenance': res = await reportsAPI.maintenance(params); break;
      }
      setData(res.data?.data || {});
    } catch (err) {
      console.error('Report fetch error:', err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [activeTab, startDate, endDate]);

  const handleExport = () => {
    if (!data) return;
    let rows = [];
    switch (activeTab) {
      case 'availability':
        rows = (data.propertyWiseAvailability || []).map(p => ({
          Property: p.title || p.property, 'Total Units': p.totalUnits, Occupied: p.occupiedUnits, Available: p.availableUnits, 'Occupancy %': p.occupancyPercentage,
        }));
        break;
      case 'rent':
        rows = (data.monthlyCollectionTrends || []).map(t => ({
          Month: `${t._id?.year}-${String(t._id?.month).padStart(2,'0')}`, Collected: t.totalCollected, Expected: t.totalExpected, Payments: t.paymentCount,
        }));
        break;
      case 'lease':
        rows = (data.expiringWithin30Days || data.leases || []).map(l => ({
          Tenant: l.tenant?.name, Property: l.property?.title, Unit: l.unit?.unitNumber, Start: formatDate(l.startDate), End: formatDate(l.endDate), Status: l.status,
        }));
        break;
      case 'maintenance':
        rows = Object.entries(data.requestsByCategory || {}).map(([k,v]) => ({ Category: k, Count: v }));
        break;
    }
    exportToCSV(rows, `report_${activeTab}`);
    toast.success('CSV exported');
  };

  const renderAvailability = () => {
    if (!data) return null;
    const pieData = [
      { name: 'Occupied', value: data.occupiedUnits || 0 },
      { name: 'Available', value: data.availableUnits || 0 },
      { name: 'Other', value: Math.max(0, (data.totalUnits || 0) - (data.occupiedUnits || 0) - (data.availableUnits || 0)) },
    ].filter(d => d.value > 0);
    const propData = data.propertyWiseAvailability || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            ['Total Properties', data.totalProperties], ['Total Units', data.totalUnits],
            ['Occupied', data.occupiedUnits], ['Available', data.availableUnits],
            ['Occupancy Rate', `${data.overallOccupancyPercentage || 0}%`],
          ].map(([label, val]) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-medium">{label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{val}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Occupancy Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart></ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {pieData.map((d, i) => <span key={i} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />{d.name} ({d.value})</span>)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Property-Wise Availability</h3>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead><tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                  <th className="py-2 px-3">Property</th><th className="py-2 px-3">Total</th><th className="py-2 px-3">Occupied</th><th className="py-2 px-3">Available</th><th className="py-2 px-3">Occupancy %</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {propData.map((p, i) => (
                    <tr key={i}><td className="py-2 px-3 font-medium">{p.title || p.property}</td><td className="py-2 px-3">{p.totalUnits}</td><td className="py-2 px-3">{p.occupiedUnits}</td><td className="py-2 px-3">{p.availableUnits}</td><td className="py-2 px-3 font-bold">{p.occupancyPercentage}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRentCollection = () => {
    if (!data) return null;
    const trends = (data.monthlyCollectionTrends || []).map(t => ({
      month: `${t._id?.year}-${String(t._id?.month).padStart(2,'0')}`, collected: t.totalCollected || 0, expected: t.totalExpected || 0,
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Expected', formatCurrency(data.totalRentExpected || 0)],
            ['Collected', formatCurrency(data.totalRentCollected || 0)],
            ['Pending', formatCurrency(data.totalPendingRent || 0)],
            ['Overdue', formatCurrency(data.totalOverdueRent || 0)],
          ].map(([label, val]) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-medium">{label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Monthly Collection Trends</h3>
          <div className="h-72">
            {trends.length > 0 ? (
              <ResponsiveContainer><BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [formatCurrency(v)]} />
                <Legend />
                <Bar dataKey="collected" name="Collected" fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="expected" name="Expected" fill="#93c5fd" radius={[4,4,0,0]} />
              </BarChart></ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-sm text-slate-400">No collection data available</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderLeaseExpiry = () => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Active', data.activeLeasesCount || 0], ['Expired', data.expiredLeasesCount || 0],
            ['Expiring in 30d', (data.expiringWithin30Days || []).length],
            ['Expiring in 60d', (data.expiringWithin60Days || []).length],
          ].map(([label, val]) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-medium">{label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Leases Expiring Within 60 Days</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                <th className="py-2 px-3">Tenant</th><th className="py-2 px-3">Property</th><th className="py-2 px-3">Unit</th>
                <th className="py-2 px-3">Start</th><th className="py-2 px-3">End</th><th className="py-2 px-3">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(data.expiringWithin60Days || []).map((l, i) => (
                  <tr key={i}><td className="py-2 px-3 font-medium">{l.tenant?.name}</td><td className="py-2 px-3">{l.property?.title}</td><td className="py-2 px-3">#{l.unit?.unitNumber}</td>
                    <td className="py-2 px-3">{formatDate(l.startDate)}</td><td className="py-2 px-3 font-bold text-amber-700">{formatDate(l.endDate)}</td>
                    <td className="py-2 px-3"><StatusBadge status={l.status} size="xs" /></td></tr>
                ))}
                {(data.expiringWithin60Days || []).length === 0 && <tr><td colSpan="6" className="py-6 text-center text-slate-400">No leases expiring soon.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMaintenance = () => {
    if (!data) return null;
    const catData = Object.entries(data.requestsByCategory || {}).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const prioData = Object.entries(data.requestsByPriority || {}).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            ['Total', data.totalRequests || 0], ['Pending', data.pendingRequests || 0],
            ['In Progress', data.inProgressRequests || 0], ['Resolved', data.resolvedRequests || 0],
            ['High Priority', data.highPriorityRequests || 0],
          ].map(([label, val]) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-medium">{label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{val}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Requests by Category</h3>
            <div className="h-64">
              {catData.length > 0 ? (
                <ResponsiveContainer><BarChart data={catData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip /><Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart></ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-full text-sm text-slate-400">No category data</div>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Requests by Priority</h3>
            <div className="h-64">
              {prioData.length > 0 ? (
                <ResponsiveContainer><PieChart><Pie data={prioData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                  {prioData.map((_, i) => <Cell key={i} fill={COLORS[i + 3]} />)}
                </Pie><Tooltip /></PieChart></ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-full text-sm text-slate-400">No priority data</div>}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {prioData.map((d, i) => <span key={i} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i + 3] }} />{d.name} ({d.value})</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" /> Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Comprehensive operational intelligence computed from live database records.</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="flex gap-3 items-center text-xs">
        <label className="text-slate-500 font-medium">Date Range:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" />
        <span className="text-slate-400">to</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      </div>

      {loading ? <LoadingSpinner text="Computing report analytics..." /> : (
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

