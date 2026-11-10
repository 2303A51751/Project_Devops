import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Plus, Download, Calendar, DollarSign, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { paymentsAPI, leasesAPI } from '../services/api';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

const Payments = () => {
  const { user } = useAuth();
  const isTenant = user?.role === 'tenant';
  const canRecord = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'manager';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leasesList, setLeasesList] = useState([]);

  const [formData, setFormData] = useState({
    lease: '', amount: 0, dueDate: '', paymentMethod: 'bank_transfer', notes: '',
  });

  // Receipt modal
  const [receiptData, setReceiptData] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = isTenant
        ? await paymentsAPI.getMyPayments(params)
        : await paymentsAPI.getAll(params);
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [statusFilter, isTenant]);

  const openRecordModal = async () => {
    try {
      const res = await leasesAPI.getAll({ status: 'active' });
      const leases = res.data?.data || [];
      setLeasesList(leases);
      if (leases.length > 0) {
        setFormData({
          lease: leases[0]._id,
          amount: leases[0].monthlyRent || 1800,
          dueDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'bank_transfer',
          notes: `Rent payment for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        });
      }
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Could not load active leases');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.create(formData);
      toast.success('Payment recorded successfully');
      setIsModalOpen(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording payment');
    }
  };

  const handleViewReceipt = async (payment) => {
    try {
      const res = await paymentsAPI.getReceipt(payment._id);
      setReceiptData(res.data?.data || payment);
    } catch {
      setReceiptData(payment);
    }
  };

  const handleExportCSV = () => {
    const rows = payments.map(p => ({
      'Receipt #': p.receiptNumber || 'N/A',
      Tenant: p.tenant?.name || '',
      Property: p.property?.title || '',
      Unit: p.unit?.unitNumber || '',
      Amount: p.amount,
      'Due Date': formatDate(p.dueDate),
      'Payment Date': formatDate(p.paymentDate),
      Method: p.paymentMethod,
      Status: p.status,
    }));
    exportToCSV(rows, 'payment_records');
  };

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" /> Rent & Payment Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">Financial transaction log with receipt generation and CSV export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {canRecord && (
            <button onClick={openRecordModal} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-medium">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-medium">Pending Dues</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 uppercase font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{payments.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner text="Loading payment records..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Property / Unit</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Paid On</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.receiptNumber || '—'}</td>
                    <td className="py-3 px-4">{p.tenant?.name || 'Resident'}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{p.property?.title || 'Property'}</p>
                      <p className="text-[11px] text-slate-500">Unit #{p.unit?.unitNumber || '—'}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4">{formatDate(p.dueDate)}</td>
                    <td className="py-3 px-4">{p.paymentDate ? formatDate(p.paymentDate) : '—'}</td>
                    <td className="py-3 px-4 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} size="xs" /></td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleViewReceipt(p)} className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan="9" className="py-10 text-center text-slate-400">No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Record Rent Payment</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Active Lease</label>
                <select required value={formData.lease} onChange={e => {
                  const l = leasesList.find(x => x._id === e.target.value);
                  setFormData({ ...formData, lease: e.target.value, amount: l?.monthlyRent || formData.amount });
                }} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {leasesList.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.tenant?.name} — {l.property?.title} Unit #{l.unit?.unitNumber} (${l.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Amount ($)</label>
                  <input type="number" min="0" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Due Date</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Payment Method</label>
                <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Notes</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6">
            <div className="text-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Payment Receipt</h2>
              <p className="text-xs text-slate-500">PropManageHub</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Receipt #</span><span className="font-bold">{receiptData.receiptNumber || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold text-emerald-600">{formatCurrency(receiptData.amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tenant</span><span className="font-medium">{receiptData.tenant?.name || 'Resident'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Property</span><span className="font-medium">{receiptData.property?.title || 'Property'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{formatDate(receiptData.paymentDate || receiptData.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="capitalize">{receiptData.paymentMethod?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="capitalize font-semibold">{receiptData.status}</span></div>
            </div>
            <button onClick={() => setReceiptData(null)} className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition">Close Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

