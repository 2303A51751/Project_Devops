import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Search, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { maintenanceAPI, unitsAPI } from '../services/api';
import { formatDate, getPriorityColor, exportToCSV } from '../utils/helpers';
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
  const [createForm, setCreateForm] = useState({
    unit: '', title: '', description: '', category: 'plumbing', priority: 'medium',
  });

  // Update Status Modal
  const [updateTarget, setUpdateTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [resolution, setResolution] = useState('');

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

  useEffect(() => { fetchRequests(); }, [statusFilter, priorityFilter, isTenant]);

  const openCreateModal = async () => {
    try {
      const res = await unitsAPI.getAll({ limit: 100 });
      setMyUnits(res.data?.data || []);
      const units = res.data?.data || [];
      setCreateForm({
        unit: units[0]?._id || '',
        title: '', description: '', category: 'plumbing', priority: 'medium',
      });
      setIsCreateOpen(true);
    } catch (err) {
      toast.error('Could not load units');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceAPI.create(createForm);
      toast.success('Maintenance request submitted');
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
      await maintenanceAPI.updateStatus(updateTarget._id, { status: newStatus, resolution });
      toast.success('Request status updated');
      setUpdateTarget(null);
      setResolution('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-600" /> Maintenance Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">Service requests, vendor dispatch, resolution logs, and cost tracking.</p>
        </div>
        <button onClick={openCreateModal} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
          <option value="all">All Priorities</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner text="Loading service tickets..." /> : (
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
                  {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{req.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{req.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium">{req.property?.title || 'Property'}</p>
                      <p className="text-[11px] text-slate-500">Unit #{req.unit?.unitNumber || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4 capitalize">{req.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        req.priority === 'emergency' || req.priority === 'high' ? 'bg-red-100 text-red-800' :
                        req.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>{req.priority}</span>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={req.status} size="xs" /></td>
                    <td className="py-3.5 px-4">{formatDate(req.createdAt)}</td>
                    <td className="py-3.5 px-4">{req.assignedTo?.name || '—'}</td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        {req.status !== 'resolved' && req.status !== 'rejected' && (
                          <button onClick={() => { setUpdateTarget(req); setNewStatus(req.status === 'pending' ? 'in_progress' : 'resolved'); setResolution(''); }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition">
                            Update
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan="8" className="py-10 text-center text-slate-400">No maintenance tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Submit Maintenance Request</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Affected Unit</label>
                <select required value={createForm.unit} onChange={e => setCreateForm({ ...createForm, unit: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  {myUnits.map(u => <option key={u._id} value={u._id}>{u.property?.title || 'Property'} — Unit #{u.unitNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Issue Title</label>
                <input type="text" required placeholder="e.g. Kitchen faucet leaking" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea rows="3" required value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="plumbing">Plumbing</option><option value="electrical">Electrical</option><option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option><option value="structural">Structural</option><option value="pest">Pest Control</option>
                    <option value="cleaning">Cleaning</option><option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
                  <select value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition">Submit Request</button>
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
              <button onClick={() => setUpdateTarget(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">Ticket: <span className="font-bold text-slate-900">{updateTarget.title}</span></p>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="assigned">Assigned</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option>
                </select>
              </div>
              {(newStatus === 'resolved' || newStatus === 'rejected') && (
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Resolution Notes</label>
                  <textarea rows="3" value={resolution} onChange={e => setResolution(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setUpdateTarget(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;

