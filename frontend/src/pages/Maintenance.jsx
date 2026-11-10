import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Image as ImageIcon,
  DollarSign,
  Eye,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { maintenanceAPI, unitsAPI } from '../services/api';
import { formatDate, formatCurrency, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';
  const canManage = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Create Request Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [myUnits, setMyUnits] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [createForm, setCreateForm] = useState({
    unit: '',
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
    images: [],
  });

  // Update Status Modal
  const [updateTarget, setUpdateTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [resolution, setResolution] = useState('');
  const [actualCost, setActualCost] = useState(0);

  // View Ticket Detail Modal
  const [viewDetailTarget, setViewDetailTarget] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const res = isTenant
        ? await maintenanceAPI.getMyRequests(params)
        : await maintenanceAPI.getAll(params);
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, isTenant]);

  const openCreateModal = async () => {
    try {
      const res = await unitsAPI.getAll({ limit: 100 });
      const units = res.data?.data || [];
      setMyUnits(units);
      setImageUrlInput('');
      setCreateForm({
        unit: units[0]?._id || '',
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
        images: [],
      });
      setIsCreateOpen(true);
    } catch (err) {
      toast.error('Could not load units');
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setCreateForm((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.unit) {
      toast.error('Please select an affected rental unit');
      return;
    }

    try {
      await maintenanceAPI.create(createForm);
      toast.success('Maintenance ticket submitted successfully');
      setIsCreateOpen(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting request');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updateTarget) return;
    try {
      await maintenanceAPI.updateStatus(updateTarget._id, {
        status: newStatus,
        resolution,
        actualCost: Number(actualCost) || 0,
      });
      toast.success('Ticket status updated');
      setUpdateTarget(null);
      setResolution('');
      setActualCost(0);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast.error('No maintenance records to export');
      return;
    }
    const headers = [
      'Ticket Title',
      'Property',
      'Unit',
      'Category',
      'Priority',
      'Status',
      'Created Date',
      'Tenant',
      'Assigned Manager',
      'Actual Cost',
      'Resolution',
    ];
    const data = requests.map((r) => [
      r.title || '',
      r.property?.title || '',
      r.unit?.unitNumber || '',
      r.category || '',
      r.priority || '',
      r.status || '',
      formatDate(r.createdAt),
      r.tenant?.name || '',
      r.assignedTo?.name || '',
      r.actualCost || 0,
      r.resolution || '',
    ]);
    exportToCSV('maintenance-tickets-report.csv', headers, data);
    toast.success('Maintenance report downloaded as CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            Maintenance Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Service requests, contractor dispatch, resolution logs, and repair expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-sky-600" /> Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Priorities</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="text-xs text-slate-500 ml-auto">
          Showing <span className="font-bold text-slate-800">{requests.length}</span> tickets
        </span>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading service tickets..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Ticket Title</th>
                  <th className="py-3 px-4">Property / Unit</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{req.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {req.description}
                      </p>
                      {req.images && req.images.length > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                          <ImageIcon className="w-3 h-3" /> {req.images.length} photo(s)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{req.property?.title || 'Property'}</p>
                      <p className="text-[11px] text-slate-500">Unit #{req.unit?.unitNumber || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium">{req.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          req.priority === 'emergency' || req.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : req.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">{formatDate(req.createdAt)}</td>
                    <td className="py-3.5 px-4">{req.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewDetailTarget(req)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        {canManage && req.status !== 'resolved' && req.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setUpdateTarget(req);
                              setNewStatus(req.status === 'pending' ? 'in_progress' : 'resolved');
                              setResolution(req.resolution || '');
                              setActualCost(req.actualCost || 0);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No maintenance tickets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {viewDetailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Ticket #{viewDetailTarget._id.slice(-6)}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {viewDetailTarget.title}
                </h3>
              </div>
              <button
                onClick={() => setViewDetailTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex flex-wrap gap-2 items-center">
                <StatusBadge status={viewDetailTarget.status} />
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    viewDetailTarget.priority === 'emergency' || viewDetailTarget.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : viewDetailTarget.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Priority: {viewDetailTarget.priority}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold capitalize">
                  {viewDetailTarget.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Property</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailTarget.property?.title || 'Property'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Rental Unit</span>
                  <span className="font-semibold text-slate-800">
                    Unit #{viewDetailTarget.unit?.unitNumber || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Submitted By</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailTarget.tenant?.name || 'Tenant'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Assigned Manager</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailTarget.assignedTo?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Issue Description
                </span>
                <p className="text-slate-600 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {viewDetailTarget.description}
                </p>
              </div>

              {/* Photos Gallery */}
              {viewDetailTarget.images && viewDetailTarget.images.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Attached Photographs ({viewDetailTarget.images.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {viewDetailTarget.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90"
                      >
                        <img
                          src={img}
                          alt="Ticket Attachment"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300';
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {viewDetailTarget.resolution && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-1">Resolution Details</span>
                  <p className="text-emerald-800 leading-relaxed whitespace-pre-wrap">
                    {viewDetailTarget.resolution}
                  </p>
                  {viewDetailTarget.actualCost > 0 && (
                    <p className="mt-2 font-semibold text-emerald-900">
                      Repair Cost: {formatCurrency(viewDetailTarget.actualCost)}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewDetailTarget(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Submit Maintenance Request</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Affected Unit
                </label>
                <select
                  required
                  value={createForm.unit}
                  onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {myUnits.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.property?.title || 'Property'} — Unit #{u.unitNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen faucet leaking"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Please describe what happened, location in the unit, and severity..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="pest">Pest Control</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Photos Attachment */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Attach Photo URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
                {createForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {createForm.images.map((img, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700"
                      >
                        Photo {idx + 1}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Update Ticket Status</h2>
              <button
                onClick={() => setUpdateTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                Ticket: <span className="font-bold text-slate-900">{updateTarget.title}</span>
              </p>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {(newStatus === 'resolved' || newStatus === 'rejected') && (
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Resolution Notes
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe actions taken, replaced components, vendor notes..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {newStatus === 'resolved' && (
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Actual Repair Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateTarget(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
