import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  Wrench,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Download,
  Building,
} from 'lucide-react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { leasesAPI, paymentsAPI, maintenanceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const TenantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState({
    activeLease: null,
    recentPayments: [],
    maintenanceRequests: [],
  });

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        const [leasesRes, paymentsRes, maintRes] = await Promise.all([
          leasesAPI.getMyLeases().catch(() => ({ data: { data: [] } })),
          paymentsAPI.getMyPayments().catch(() => ({ data: { data: [] } })),
          maintenanceAPI.getMyRequests().catch(() => ({ data: { data: [] } })),
        ]);

        const leases = leasesRes.data?.data || [];
        const payments = paymentsRes.data?.data || [];
        const requests = maintRes.data?.data || [];

        const active = leases.find((l) => l.status === 'active') || leases[0] || null;

        setTenantData({
          activeLease: active,
          recentPayments: payments.slice(0, 5),
          maintenanceRequests: requests.slice(0, 5),
        });
      } catch (err) {
        console.error('Failed to load tenant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving resident portal information..." />;
  }

  const lease = tenantData.activeLease;
  const pendingRent = lease ? lease.monthlyRent : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-600" />
            Resident Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your tenancy terms, rental payments, and home maintenance service.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/maintenance"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Request Repair
          </Link>
          <Link
            to="/browse"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Explore Units
          </Link>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Current Lease Status"
          value={lease ? 'Active' : 'No Lease'}
          icon={FileText}
          color="purple"
          subtitle={lease ? `Expires: ${formatDate(lease.endDate)}` : 'Browse available units'}
        />
        <Card
          title="Monthly Rent"
          value={lease ? formatCurrency(lease.monthlyRent) : '$0.00'}
          icon={CreditCard}
          color="blue"
          subtitle="Due 1st of each month"
        />
        <Card
          title="Security Deposit"
          value={lease ? formatCurrency(lease.securityDeposit) : '$0.00'}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`Escrow status: ${lease?.depositStatus || 'Held'}`}
        />
        <Card
          title="Service Requests"
          value={tenantData.maintenanceRequests.length}
          icon={Wrench}
          color="amber"
          subtitle={`${tenantData.maintenanceRequests.filter((r) => r.status === 'pending').length} pending review`}
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tenancy Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Tenancy Agreement
          </h2>

          {lease ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 uppercase font-medium">Property</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {lease.property?.title || 'Residential Property'}
                </p>
                <p className="text-slate-500">Unit #{lease.unit?.unitNumber || '101'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500">Start Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{formatDate(lease.startDate)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500">End Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{formatDate(lease.endDate)}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-blue-900 font-semibold mb-1">Agreement Terms</p>
                <p className="text-slate-600 leading-relaxed">
                  {lease.terms || 'Standard residential lease agreement. Quiet hours 10 PM - 8 AM.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No active lease found.</p>
              <Link
                to="/browse"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Browse Available Units
              </Link>
            </div>
          )}
        </div>

        {/* Payments History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Recent Payments
            </h2>
            <Link to="/payments" className="text-xs font-semibold text-blue-600 hover:underline">
              All
            </Link>
          </div>

          <div className="space-y-3">
            {tenantData.recentPayments.length > 0 ? (
              tenantData.recentPayments.map((p) => (
                <div key={p._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{formatCurrency(p.amount)}</p>
                    <p className="text-slate-500 mt-0.5">{formatDate(p.paymentDate || p.createdAt)} • {p.paymentMethod}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 capitalize">
                    {p.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No payment history recorded.</p>
            )}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Maintenance
            </h2>
            <Link to="/maintenance" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {tenantData.maintenanceRequests.length > 0 ? (
              tenantData.maintenanceRequests.map((req) => (
                <div key={req._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">{req.title}</p>
                    <StatusBadge status={req.status} size="xs" />
                  </div>
                  <p className="text-slate-500 mt-1 capitalize">
                    Priority: <span className="font-medium text-slate-700">{req.priority}</span> • {req.category}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No service requests submitted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
