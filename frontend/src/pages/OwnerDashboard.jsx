import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  DollarSign,
  ClipboardList,
  FileText,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { propertiesAPI, applicationsAPI, leasesAPI, paymentsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState({
    properties: [],
    pendingApplications: [],
    leases: [],
    totalIncome: 0,
    occupiedUnits: 0,
    totalUnits: 0,
  });

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const [propsRes, appsRes, leasesRes, payRes] = await Promise.all([
          propertiesAPI.getMyProperties().catch(() => ({ data: { data: [] } })),
          applicationsAPI.getAll({ status: 'pending' }).catch(() => ({ data: { data: [] } })),
          leasesAPI.getAll({ status: 'active' }).catch(() => ({ data: { data: [] } })),
          paymentsAPI.getAll({ status: 'completed' }).catch(() => ({ data: { data: [] } })),
        ]);

        const props = propsRes.data?.data || [];
        const apps = appsRes.data?.data || [];
        const activeLeases = leasesRes.data?.data || [];
        const payments = payRes.data?.data || [];

        const totalEarned = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const unitsCount = props.reduce((sum, p) => sum + (p.totalUnits || 0), 0);

        setOwnerData({
          properties: props,
          pendingApplications: apps,
          leases: activeLeases,
          totalIncome: totalEarned,
          occupiedUnits: activeLeases.length,
          totalUnits: unitsCount || activeLeases.length + 4,
        });
      } catch (err) {
        console.error('Failed to load owner data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading owner asset portfolio..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Property Owner Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track asset performance, tenant applications, and monthly rental yields.
          </p>
        </div>

        <Link
          to="/properties"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Owned Properties"
          value={ownerData.properties.length}
          icon={Building2}
          color="emerald"
          subtitle={`${ownerData.totalUnits} Total Units registered`}
        />
        <Card
          title="Occupancy Status"
          value={`${ownerData.occupiedUnits} / ${ownerData.totalUnits}`}
          icon={DoorOpen}
          color="blue"
          trend="up"
          trendValue="Active Tenancies"
        />
        <Card
          title="Rental Receipts"
          value={formatCurrency(ownerData.totalIncome)}
          icon={DollarSign}
          color="indigo"
          subtitle="Total recorded revenue"
        />
        <Card
          title="Applications to Review"
          value={ownerData.pendingApplications.length}
          icon={ClipboardList}
          color="amber"
          subtitle="Pending approval"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Property Holdings</h2>
              <p className="text-xs text-slate-500">Asset performance and location breakdown</p>
            </div>
            <Link to="/properties" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {ownerData.properties.length > 0 ? (
              ownerData.properties.map((prop) => (
                <div key={prop._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{prop.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prop.address?.city}, {prop.address?.state} • {prop.type?.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                      {prop.totalUnits || 3} Units
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4">No properties registered yet.</p>
            )}
          </div>
        </div>

        {/* Pending Applications Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">Action Required</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                {ownerData.pendingApplications.length} New
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Review applicant financials, employment history, and authorize leases.
            </p>

            <div className="space-y-3">
              {ownerData.pendingApplications.slice(0, 3).map((app) => (
                <div key={app._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-800">
                    {app.tenant?.name || 'Prospective Resident'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Move-in: {formatDate(app.moveInDate)} • Income: ${app.employmentInfo?.monthlyIncome || 0}/mo
                  </p>
                </div>
              ))}
              {ownerData.pendingApplications.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  All applicant files reviewed.
                </p>
              )}
            </div>
          </div>

          <Link
            to="/applications"
            className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5"
          >
            Review Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
