import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Wrench,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { propertiesAPI, applicationsAPI, maintenanceAPI, leasesAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [managerData, setManagerData] = useState({
    properties: [],
    pendingApplications: [],
    openMaintenance: [],
    expiringLeases: [],
  });

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setLoading(true);
        const [propsRes, appsRes, maintRes, leasesRes] = await Promise.all([
          propertiesAPI.getAll({ limit: 50 }).catch(() => ({ data: { data: [] } })),
          applicationsAPI.getAll({ status: 'pending' }).catch(() => ({ data: { data: [] } })),
          maintenanceAPI.getAll({ status: 'pending' }).catch(() => ({ data: { data: [] } })),
          leasesAPI.getExpiring({ days: 30 }).catch(() => ({ data: { data: [] } })),
        ]);

        setManagerData({
          properties: propsRes.data?.data || [],
          pendingApplications: appsRes.data?.data || [],
          openMaintenance: maintRes.data?.data || [],
          expiringLeases: leasesRes.data?.data || [],
        });
      } catch (err) {
        console.error('Failed to load manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchManagerData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading property management operations..." />;
  }

  const totalUnits = managerData.properties.reduce((sum, p) => sum + (p.totalUnits || 3), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            Property Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch repairs, verify tenant applications, and monitor lease expiries.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/maintenance"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Dispatch Repairs
          </Link>
          <Link
            to="/applications"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Review Applications
          </Link>
        </div>
      </div>

      {/* Metrics Row: Light Yellow, Light Blue, Light Green, Light Purple */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Assigned Properties"
          value={managerData.properties.length}
          icon={Building2}
          color="amber"
          subtitle={`${totalUnits} Rental Units`}
        />
        <Card
          title="Pending Applications"
          value={managerData.pendingApplications.length}
          icon={ClipboardList}
          color="blue"
          subtitle="Verification required"
        />
        <Card
          title="Unassigned Repairs"
          value={managerData.openMaintenance.length}
          icon={Wrench}
          color="emerald"
          subtitle="Awaiting triage"
        />
        <Card
          title="Leases Expiring"
          value={managerData.expiringLeases.length}
          icon={AlertTriangle}
          color="purple"
          subtitle="Next 30 days window"
        />
      </div>

      {/* Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Maintenance Triage */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Maintenance Dispatch Queue</h2>
              <p className="text-xs text-slate-500">Service tickets requiring assignment or vendor dispatch</p>
            </div>
            <Link to="/maintenance" className="text-xs font-bold text-amber-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {managerData.openMaintenance.slice(0, 5).map((req) => (
              <div key={req._id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-900">{req.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    req.priority === 'emergency' || req.priority === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Property: {req.property?.title || 'Residential'} • Category: {req.category}
                </p>
              </div>
            ))}
            {managerData.openMaintenance.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No unassigned maintenance tickets.</p>
            )}
          </div>
        </div>

        {/* Pending Rental Applications */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Applicant Verifications</h2>
              <p className="text-xs text-slate-500">Prospective tenants seeking occupancy approval</p>
            </div>
            <Link to="/applications" className="text-xs font-bold text-sky-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {managerData.pendingApplications.slice(0, 5).map((app) => (
              <div key={app._id} className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-xs">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-900">{app.tenant?.name || 'Applicant'}</p>
                  <StatusBadge status={app.status} size="xs" />
                </div>
                <p className="text-slate-600 mt-1">
                  Employer: {app.employmentInfo?.employer || 'N/A'} • Move In: {formatDate(app.moveInDate)}
                </p>
              </div>
            ))}
            {managerData.pendingApplications.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No pending tenant applications.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
