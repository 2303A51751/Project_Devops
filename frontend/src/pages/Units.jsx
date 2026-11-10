import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Building2,
  Edit2,
  Trash2,
  User,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { unitsAPI, propertiesAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Units = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'owner';

  const [units, setUnits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedroomFilter, setBedroomFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    property: '',
    unitNumber: '',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    area: 750,
    monthlyRent: 1500,
    securityDeposit: 1500,
    status: 'available',
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (propertyFilter !== 'all') params.property = propertyFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (bedroomFilter !== 'all') params.bedrooms = bedroomFilter;

      const [unitsRes, propsRes] = await Promise.all([
        unitsAPI.getAll(params),
        propertiesAPI.getAll({ limit: 100 }),
      ]);

      setUnits(unitsRes.data?.data || []);
      setProperties(propsRes.data?.data || []);
      if (!formData.property && propsRes.data?.data?.length > 0) {
        setFormData((prev) => ({ ...prev, property: propsRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load units:', err);
      toast.error('Failed to load rental units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyFilter, statusFilter, bedroomFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await unitsAPI.update(editingUnit._id, formData);
        toast.success('Unit updated successfully');
      } else {
        await unitsAPI.create(formData);
        toast.success('Unit created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save unit error:', err);
      toast.error(err.response?.data?.message || 'Error saving unit');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await unitsAPI.delete(deleteTarget._id);
      toast.success('Unit removed');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Delete unit error:', err);
      toast.error(err.response?.data?.message || 'Error deleting unit');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-blue-600" />
            Rental Units Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete inventory of apartments, townhomes, and suites across portfolio.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingUnit(null);
              setFormData({
                property: properties[0]?._id || '',
                unitNumber: '',
                floor: 1,
                bedrooms: 1,
                bathrooms: 1,
                area: 750,
                monthlyRent: 1500,
                securityDeposit: 1500,
                status: 'available',
                description: '',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </button>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
        >
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
          <option value="reserved">Reserved</option>
        </select>

        <select
          value={bedroomFilter}
          onChange={(e) => setBedroomFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
        >
          <option value="all">All Bedrooms</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3+ Bedrooms</option>
        </select>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Registered Units</h2>
          <span className="text-xs font-semibold text-slate-500">{units.length} total units listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Unit #</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Layout</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Rent</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Current Resident</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {units.map((unit) => (
                <tr key={unit._id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">#{unit.unitNumber}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {unit.property?.title || 'Unknown Property'}
                  </td>
                  <td className="py-3.5 px-4">
                    {unit.bedrooms} Bed, {unit.bathrooms} Bath
                  </td>
                  <td className="py-3.5 px-4">{unit.area} sqft</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(unit.monthlyRent)}
                  </td>
                  <td className="py-3.5 px-4">{formatCurrency(unit.securityDeposit)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={unit.status} size="xs" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {unit.currentTenant?.name || '—'}
                  </td>
                  {canManage && (
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingUnit(unit);
                          setFormData({
                            property: unit.property?._id || properties[0]?._id,
                            unitNumber: unit.unitNumber,
                            floor: unit.floor || 1,
                            bedrooms: unit.bedrooms,
                            bathrooms: unit.bathrooms,
                            area: unit.area,
                            monthlyRent: unit.monthlyRent,
                            securityDeposit: unit.securityDeposit,
                            status: unit.status,
                            description: unit.description || '',
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-blue-600 rounded transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(unit)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400">
                    No rental units matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">
                {editingUnit ? `Edit Unit #${editingUnit.unitNumber}` : 'Add New Unit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Target Property</label>
                <select
                  required
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Unit #</label>
                  <input
                    type="text"
                    required
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Security Deposit ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Unit Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Unit Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Rental Unit"
        message={`Are you sure you want to delete unit #${deleteTarget?.unitNumber}?`}
        confirmText="Delete Unit"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Units;
