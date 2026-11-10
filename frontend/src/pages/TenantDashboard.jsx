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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            Resident Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your tenancy terms, rental payments, and home maintenance service.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/maintenance"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Request Repair
          </Link>
          <Link
            to="/browse"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shadow-xs transition"
          >
            Explore Units
          </Link>
        </div>
      </div>

      {/* Top Cards: Light Purple, Light Blue, Light Green, Light Yellow */}
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
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Tenancy Agreement
          </h2>

          {lease ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
                <p className="text-purple-700 uppercase font-bold text-[10px] tracking-wider">Property</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {lease.property?.title || 'Residential Property'}
                </p>
                <p className="text-slate-600 font-medium">Unit #{lease.unit?.unitNumber || '101'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Start Date</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(lease.startDate)}</p>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <p className="text-slate-500 font-medium">End Date</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(lease.endDate)}</p>
                </div>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                <p className="text-sky-900 font-bold mb-1">Agreement Terms</p>
                <p className="text-slate-600 leading-relaxed">
                  {lease.terms || 'Standard residential lease agreement. Quiet hours 10 PM - 8 AM.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No active lease found.</p>
              <Link
                to="/browse"
                className="mt-3 inline-block px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
              >
                Browse Available Units
              </Link>
            </div>
          )}
        </div>

        {/* Payments History */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Recent Payments
            </h2>
            <Link to="/payments" className="text-xs font-bold text-sky-600 hover:underline">
              All
            </Link>
          </div>

          <div className="space-y-3">
            {tenantData.recentPayments.length > 0 ? (
              tenantData.recentPayments.map((p) => (
                <div key={p._id} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{formatCurrency(p.amount)}</p>
                    <p className="text-slate-500 mt-0.5">{formatDate(p.paymentDate || p.createdAt)} • {p.paymentMethod}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
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
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Maintenance
            </h2>
            <Link to="/maintenance" className="text-xs font-bold text-sky-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {tenantData.maintenanceRequests.length > 0 ? (
              tenantData.maintenanceRequests.map((req) => (
                <div key={req._id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800">{req.title}</p>
                    <StatusBadge status={req.status} size="xs" />
                  </div>
                  <p className="text-slate-500 mt-1 capitalize">
                    Priority: <span className="font-semibold text-slate-700">{req.priority}</span> • {req.category}
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
