import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  User,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { applicationsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Applications = () => {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Review modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = isTenant
        ? await applicationsAPI.getMyApplications(params)
        : await applicationsAPI.getAll(params);

      setApplications(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load rental applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, isTenant]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;

    try {
      await applicationsAPI.updateStatus(reviewTarget._id, {
        status: reviewAction,
        reviewNotes,
      });

      toast.success(`Application marked as ${reviewAction}`);
      setReviewTarget(null);
      setReviewNotes('');
      fetchApplications();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update application');
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await applicationsAPI.withdraw(id);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (err) {
      console.error('Withdraw error:', err);
      toast.error('Failed to withdraw application');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Rental Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isTenant
              ? 'Track the submission review and verification status of your unit applications.'
              : 'Review prospective tenant background checks, employment, and issue lease contracts.'}
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
        >
          <option value="all">All Application Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Applications Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Application Records</h2>
          <span className="text-xs font-semibold text-slate-500">
            {applications.length} applications found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Applied Property & Unit</th>
                <th className="py-3 px-4">Target Move-in</th>
                <th className="py-3 px-4">Income & Employment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{app.tenant?.name || 'Prospective Resident'}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{app.tenant?.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">
                      {app.property?.title || 'Residential'}
                    </p>
                    <p className="text-[11px] text-slate-500">Unit #{app.unit?.unitNumber || '101'}</p>
                  </td>
                  <td className="py-3.5 px-4">{formatDate(app.moveInDate)}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">
                      ${app.employmentInfo?.monthlyIncome || 0} / month
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {app.employmentInfo?.employer || 'Unspecified'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} size="xs" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {!isTenant && app.status === 'pending' && (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setReviewTarget(app);
                            setReviewAction('approved');
                            setReviewNotes('');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewTarget(app);
                            setReviewAction('rejected');
                            setReviewNotes('');
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {isTenant && app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                      >
                        Withdraw
                      </button>
                    )}
                    {app.status !== 'pending' && (
                      <span className="text-[11px] text-slate-400 italic">Concluded</span>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    No rental applications recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900 capitalize">
                {reviewAction} Application
              </h2>
              <button
                onClick={() => setReviewTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                You are marking applicant <span className="font-bold text-slate-900">{reviewTarget.tenant?.name}</span> as <span className="font-bold uppercase">{reviewAction}</span>.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Reviewer Audit Notes
                </label>
                <textarea
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified income documentation and credit background."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm transition ${
                    reviewAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
