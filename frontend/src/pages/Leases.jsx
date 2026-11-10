import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Plus,
  RefreshCw,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Ban,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { leasesAPI, unitsAPI, propertiesAPI, usersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Leases = () => {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';
  const canManage = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';

  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Lease Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);

  const [createForm, setCreateForm] = useState({
    tenant: '',
    unit: '',
    startDate: '',
    endDate: '',
    monthlyRent: 1800,
    securityDeposit: 1800,
    terms: 'Standard 12-month residential lease agreement. No subletting allowed without owner approval.',
  });

  // Renew Lease Modal
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewRent, setRenewRent] = useState(0);

  // Terminate Dialog
  const [terminateTarget, setTerminateTarget] = useState(null);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = isTenant
        ? await leasesAPI.getMyLeases(params)
        : await leasesAPI.getAll(params);

      setLeases(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load leases:', err);
      toast.error('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, [statusFilter, isTenant]);

  const openCreateModal = async () => {
    try {
      const [unitsRes, usersRes] = await Promise.all([
        unitsAPI.getAvailable(),
        usersAPI.getAll({ role: 'tenant' }).catch(() => ({ data: { data: [] } })),
      ]);

      const units = unitsRes.data?.data || [];
      const users = (usersRes.data?.data || []).filter((u) => u.role === 'tenant');

      setAvailableUnits(units);
      setTenantsList(users);

      const now = new Date();
      const oneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      setCreateForm({
        tenant: users[0]?._id || '',
        unit: units[0]?._id || '',
        startDate: now.toISOString().split('T')[0],
        endDate: oneYear.toISOString().split('T')[0],
        monthlyRent: units[0]?.monthlyRent || 1800,
        securityDeposit: units[0]?.securityDeposit || 1800,
        terms: 'Standard 12-month residential lease agreement. Quiet hours 10 PM - 8 AM.',
      });

      setIsCreateOpen(true);
    } catch (err) {
      console.error('Failed to prepare create lease:', err);
      toast.error('Could not load available units/tenants');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await leasesAPI.create(createForm);
      toast.success('Lease agreement created successfully');
      setIsCreateOpen(false);
      fetchLeases();
    } catch (err) {
      console.error('Create lease error:', err);
      toast.error(err.response?.data?.message || 'Error creating lease');
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!renewTarget) return;

    try {
      await leasesAPI.renew(renewTarget._id, {
        newEndDate: renewEndDate,
        newRent: parseFloat(renewRent),
      });

      toast.success('Lease renewed successfully');
      setRenewTarget(null);
      fetchLeases();
    } catch (err) {
      console.error('Renew lease error:', err);
      toast.error(err.response?.data?.message || 'Error renewing lease');
    }
  };

  const handleTerminate = async () => {
    if (!terminateTarget) return;
    try {
      await leasesAPI.terminate(terminateTarget._id);
      toast.success('Lease terminated');
      setTerminateTarget(null);
      fetchLeases();
    } catch (err) {
      console.error('Terminate lease error:', err);
      toast.error(err.response?.data?.message || 'Error terminating lease');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Lease Agreements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Contractual covenants, duration terms, renewal tracking, and escrow status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All Lease Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="pending">Pending</option>
          </select>

          {canManage && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Issue Lease
            </button>
          )}
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Lease Contracts</h2>
          <span className="text-xs font-semibold text-slate-500">{leases.length} leases on file</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Property & Unit</th>
                <th className="py-3 px-4">Term Duration</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leases.map((lease) => {
                const isExpiringSoon =
                  lease.status === 'active' &&
                  new Date(lease.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={lease._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <p>{lease.tenant?.name || 'Resident'}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{lease.tenant?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">
                        {lease.property?.title || 'Residential Property'}
                      </p>
                      <p className="text-[11px] text-slate-500">Unit #{lease.unit?.unitNumber || '101'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">
                        {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                      </p>
                      {isExpiringSoon && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Expiring &lt;30 days
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(lease.monthlyRent)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p>{formatCurrency(lease.securityDeposit)}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{lease.depositStatus || 'held'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lease.status} size="xs" />
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {lease.status === 'active' && (
                          <>
                            <button
                              onClick={() => {
                                setRenewTarget(lease);
                                const d = new Date(lease.endDate);
                                d.setFullYear(d.getFullYear() + 1);
                                setRenewEndDate(d.toISOString().split('T')[0]);
                                setRenewRent(lease.monthlyRent);
                              }}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[11px] font-semibold transition"
                              title="Renew Lease"
                            >
                              Renew
                            </button>
                            <button
                              onClick={() => setTerminateTarget(lease)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-semibold transition"
                              title="Terminate Early"
                            >
                              Terminate
                            </button>
                          </>
                        )}
                        {lease.status !== 'active' && (
                          <span className="text-[11px] text-slate-400 italic">Closed</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {leases.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No lease contracts recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lease Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Issue New Residential Lease</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Tenant</label>
                <select
                  required
                  value={createForm.tenant}
                  onChange={(e) => setCreateForm({ ...createForm, tenant: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tenantsList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Available Rental Unit</label>
                <select
                  required
                  value={createForm.unit}
                  onChange={(e) => {
                    const u = availableUnits.find((unit) => unit._id === e.target.value);
                    setCreateForm({
                      ...createForm,
                      unit: e.target.value,
                      monthlyRent: u?.monthlyRent || createForm.monthlyRent,
                      securityDeposit: u?.securityDeposit || createForm.securityDeposit,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {availableUnits.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.property?.title} — Unit #{u.unitNumber} (${u.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Commencement Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Monthly Rent ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.monthlyRent}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, monthlyRent: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Security Deposit ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.securityDeposit}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, securityDeposit: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Contractual Clauses & Terms</label>
                <textarea
                  rows="3"
                  value={createForm.terms}
                  onChange={(e) => setCreateForm({ ...createForm, terms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Execute Lease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Lease Modal */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Renew Tenancy Agreement</h2>
              <button
                onClick={() => setRenewTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                Renewing lease for <span className="font-bold text-slate-900">{renewTarget.tenant?.name}</span> at {renewTarget.property?.title} (Unit #{renewTarget.unit?.unitNumber}).
              </p>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Extended Expiration Date
                </label>
                <input
                  type="date"
                  required
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Adjusted Monthly Rent ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={renewRent}
                  onChange={(e) => setRenewRent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Terminate Dialog */}
      <ConfirmDialog
        isOpen={!!terminateTarget}
        title="Early Lease Termination"
        message={`Are you sure you want to terminate the lease for "${terminateTarget?.tenant?.name}"? The unit status will revert to available upon termination.`}
        confirmText="Terminate Lease"
        confirmVariant="danger"
        onConfirm={handleTerminate}
        onCancel={() => setTerminateTarget(null)}
      />
    </div>
  );
};

export default Leases;
