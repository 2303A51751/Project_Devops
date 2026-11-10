import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  FileText,
  UserCheck,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { usersAPI, leasesAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const [usersRes, leasesRes] = await Promise.all([
          usersAPI.getAll({ role: 'tenant' }).catch(() => ({ data: { data: [] } })),
          leasesAPI.getAll({ status: 'active' }).catch(() => ({ data: { data: [] } })),
        ]);

        const allUsers = usersRes.data?.data || [];
        const tenantUsers = allUsers.filter((u) => u.role === 'tenant');
        setTenants(tenantUsers);
        setLeases(leasesRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load tenants:', err);
        toast.error('Failed to load tenant records');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Resident Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Roster of registered residents, contact information, and current lease associations.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search by tenant name, email, or telephone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Tenant Profiles</h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredTenants.length} tenants registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Current Tenancy</th>
                <th className="py-3 px-4">Lease Term</th>
                <th className="py-3 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenants.map((tenant) => {
                const lease = leases.find((l) => l.tenant?._id === tenant._id || l.tenant === tenant._id);
                return (
                  <tr key={tenant._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                          {tenant.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p>{tenant.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">ID: {tenant._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center text-slate-600">
                        <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center text-slate-500">
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {tenant.phone || '+1-555-0100'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {lease ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lease.property?.title || 'Residential'}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Unit #{lease.unit?.unitNumber || '101'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active lease</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {lease ? (
                        <span className="text-slate-600">
                          {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">
                    No residents matching search.
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

export default Tenants;
