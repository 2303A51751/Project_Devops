import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Download,
  Calendar,
  DollarSign,
  Printer,
  FileCheck,
  CheckCircle2,
  X,
  Building2,
} from 'lucide-react';
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
    lease: '',
    amount: 0,
    dueDate: '',
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  // Receipt Modal State
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

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, isTenant]);

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
      toast.success('Rent payment recorded successfully');
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

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceiptFile = () => {
    if (!receiptData) return;
    const content = `
=====================================================
            PROPMANAGEHUB OFFICIAL RECEIPT
=====================================================
Receipt Number:  ${receiptData.receiptNumber || 'N/A'}
Date of Payment: ${formatDate(receiptData.paymentDate || receiptData.createdAt)}
Due Date:        ${formatDate(receiptData.dueDate)}

Resident Name:   ${receiptData.tenant?.name || 'Resident'}
Resident Email:  ${receiptData.tenant?.email || 'N/A'}

Property:        ${receiptData.property?.title || 'Residential'}
Rental Unit:     Unit #${receiptData.unit?.unitNumber || '—'}

Amount Paid:     ${formatCurrency(receiptData.amount)}
Payment Method:  ${(receiptData.paymentMethod || 'online').toUpperCase()}
Transaction ID:  ${receiptData.transactionId || 'TXN-' + Date.now()}
Payment Status:  ${(receiptData.status || 'completed').toUpperCase()}

Notes:           ${receiptData.notes || 'Monthly rental settlement'}
=====================================================
Authorized Property Operations & Financial Escrow
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${receiptData.receiptNumber || 'Payment'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt file downloaded');
  };

  const handleExportCSV = () => {
    const rows = payments.map((p) => ({
      'Receipt #': p.receiptNumber || 'N/A',
      Resident: p.tenant?.name || '',
      Email: p.tenant?.email || '',
      Property: p.property?.title || '',
      Unit: p.unit?.unitNumber || '',
      Amount: p.amount,
      'Due Date': formatDate(p.dueDate),
      'Payment Date': p.paymentDate ? formatDate(p.paymentDate) : 'Pending',
      Method: p.paymentMethod,
      Status: p.status,
      'Transaction ID': p.transactionId || '',
    }));
    exportToCSV(rows, `payment_records_${new Date().toISOString().split('T')[0]}`);
    toast.success('Payment ledger exported to CSV');
  };

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            Rent & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial transaction records, auto-generated digital receipts, and ledger auditing.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-sky-600" /> Export CSV
          </button>
          {canRecord && (
            <button
              onClick={openRecordModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards in Light Green, Light Yellow, and Light Blue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Light Green */}
        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <p className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">Total Rent Collected</p>
          <p className="text-2xl font-black text-emerald-950 mt-1">{formatCurrency(totalCollected)}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Verified bank & digital settlements</p>
        </div>

        {/* Light Yellow */}
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[11px] text-amber-800 uppercase font-bold tracking-wider">Outstanding Pending Balance</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{formatCurrency(totalPending)}</p>
          <p className="text-[11px] text-amber-700 mt-1">Awaiting tenant payment clearance</p>
        </div>

        {/* Light Blue */}
        <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-200/80 shadow-xs">
          <p className="text-[11px] text-sky-800 uppercase font-bold tracking-wider">Ledger Transactions</p>
          <p className="text-2xl font-black text-sky-950 mt-1">{payments.length}</p>
          <p className="text-[11px] text-sky-700 mt-1">Total recorded transaction receipts</p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
        >
          <option value="all">All Payment Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Compiling financial transaction records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Property & Unit</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Paid On</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.receiptNumber || '—'}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{p.tenant?.name || 'Resident'}</p>
                      <p className="text-[11px] text-slate-400">{p.tenant?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900">{p.property?.title || 'Property'}</p>
                      <p className="text-[11px] text-slate-500">Unit #{p.unit?.unitNumber || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="py-3.5 px-4">{formatDate(p.dueDate)}</td>
                    <td className="py-3.5 px-4">{p.paymentDate ? formatDate(p.paymentDate) : '—'}</td>
                    <td className="py-3.5 px-4 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewReceipt(p)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-slate-400">
                      No payment records found.
                    </td>
                  </tr>
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
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Active Lease</label>
                <select
                  required
                  value={formData.lease}
                  onChange={(e) => {
                    const l = leasesList.find((x) => x._id === e.target.value);
                    setFormData({
                      ...formData,
                      lease: e.target.value,
                      amount: l?.monthlyRent || formData.amount,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {leasesList.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.tenant?.name} — {l.property?.title} Unit #{l.unit?.unitNumber} (${l.monthlyRent}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Downloadable / Printable Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Receipt Document Header */}
            <div className="p-6 bg-slate-900 text-white text-center relative">
              <button
                onClick={() => setReceiptData(null)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold uppercase tracking-wider">Official Payment Receipt</h2>
              <p className="text-xs text-slate-400 mt-0.5">PropManageHub Financial Settlement System</p>
              <div className="mt-3 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                Receipt #{receiptData.receiptNumber || 'REC-' + Date.now().toString().slice(-6)}
              </div>
            </div>

            {/* Receipt Details Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-baseline pb-3 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(receiptData.amount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Resident</p>
                  <p className="font-bold text-slate-800 mt-0.5">{receiptData.tenant?.name || 'Resident'}</p>
                  <p className="text-slate-500 text-[11px]">{receiptData.tenant?.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">Property & Unit</p>
                  <p className="font-bold text-slate-800 mt-0.5">{receiptData.property?.title || 'Residential Residence'}</p>
                  <p className="text-slate-500 text-[11px]">Unit #{receiptData.unit?.unitNumber || '101'}</p>
                </div>
              </div>

              <div className="space-y-2 pb-3 border-b border-slate-100 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-medium text-slate-800">{formatDate(receiptData.paymentDate || receiptData.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-800 capitalize">{(receiptData.paymentMethod || 'bank_transfer').replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-slate-800">{receiptData.transactionId || 'TXN-' + Date.now()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled & Authorized
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadReceiptFile}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.txt)
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
