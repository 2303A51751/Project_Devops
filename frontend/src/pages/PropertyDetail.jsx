import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  ArrowLeft,
  MapPin,
  DoorOpen,
  Plus,
  Bed,
  Bath,
  Maximize2,
  User,
  Shield,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { propertiesAPI, unitsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'owner';

  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unit modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [unitForm, setUnitForm] = useState({
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
      const [propRes, unitsRes, statsRes] = await Promise.all([
        propertiesAPI.getById(id),
        unitsAPI.getByProperty(id),
        propertiesAPI.getStats(id).catch(() => ({ data: { data: null } })),
      ]);

      setProperty(propRes.data?.data || null);
      setUnits(unitsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error('Failed to load property details:', err);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await unitsAPI.update(editingUnit._id, unitForm);
        toast.success('Unit updated');
      } else {
        await unitsAPI.create({ ...unitForm, property: id });
        toast.success('Unit added to property');
      }
      setIsUnitModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving unit:', err);
      toast.error(err.response?.data?.message || 'Error saving unit');
    }
  };

  const handleDeleteUnit = async () => {
    if (!deleteTarget) return;
    try {
      await unitsAPI.delete(deleteTarget._id);
      toast.success('Unit deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting unit:', err);
      toast.error(err.response?.data?.message || 'Error deleting unit');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving property and unit breakdown..." />;
  }

  if (!property) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Property not found</h2>
        <Link to="/properties" className="mt-4 inline-block text-blue-600 text-sm font-semibold">
          Return to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{property.title}</h1>
              <StatusBadge status={property.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => {
                setEditingUnit(null);
                setUnitForm({
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
                setIsUnitModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Unit
            </button>
          )}
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-2">About Property</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">{property.description}</p>

          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amenities & Features</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {(property.amenities || ['Elevator', 'Fitness Center', 'Parking', 'Secure Entry']).map((a, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                {a}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <p className="text-slate-500 uppercase">Property Type</p>
              <p className="font-bold text-slate-800 capitalize mt-0.5">{property.type}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase">Year Built</p>
              <p className="font-bold text-slate-800 mt-0.5">{property.yearBuilt || 2020}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase">Parking Spaces</p>
              <p className="font-bold text-slate-800 mt-0.5">{property.parkingSpaces || 10} spots</p>
            </div>
          </div>
        </div>

        {/* Operational Stats Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-blue-400" />
              Units & Occupancy
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Units</span>
                <span className="font-bold text-white">{units.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Occupied Units</span>
                <span className="font-bold text-emerald-400">
                  {units.filter((u) => u.status === 'occupied').length}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Available Vacancies</span>
                <span className="font-bold text-blue-400">
                  {units.filter((u) => u.status === 'available').length}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Monthly Potential Rent</span>
                <span className="font-bold text-white">
                  {formatCurrency(units.reduce((sum, u) => sum + (u.monthlyRent || 0), 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Property assigned to: <span className="text-white font-semibold">{property.manager?.name || 'On-site Manager'}</span>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Rental Units Directory</h2>
          <span className="text-xs font-semibold text-slate-500">{units.length} registered units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4">Unit #</th>
                <th className="py-3 px-4">Floor</th>
                <th className="py-3 px-4">Layout</th>
                <th className="py-3 px-4">Area (sqft)</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tenant</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {units.map((unit) => (
                <tr key={unit._id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">#{unit.unitNumber}</td>
                  <td className="py-3 px-4">{unit.floor}</td>
                  <td className="py-3 px-4 font-medium">
                    {unit.bedrooms} BR / {unit.bathrooms} BA
                  </td>
                  <td className="py-3 px-4">{unit.area} sqft</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(unit.monthlyRent)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={unit.status} size="xs" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {unit.currentTenant?.name || '—'}
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingUnit(unit);
                          setUnitForm({
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
                          setIsUnitModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-blue-600 rounded transition"
                        title="Edit Unit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(unit)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                        title="Delete Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No units recorded for this property yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">
                {editingUnit ? `Edit Unit #${editingUnit.unitNumber}` : 'Add New Rental Unit'}
              </h2>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUnitSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Unit Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={unitForm.unitNumber}
                    onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Floor Level</label>
                  <input
                    type="number"
                    min="1"
                    value={unitForm.floor}
                    onChange={(e) => setUnitForm({ ...unitForm, floor: parseInt(e.target.value, 10) })}
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
                    value={unitForm.bedrooms}
                    onChange={(e) => setUnitForm({ ...unitForm, bedrooms: parseInt(e.target.value, 10) })}
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
                    value={unitForm.bathrooms}
                    onChange={(e) => setUnitForm({ ...unitForm, bathrooms: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={unitForm.area}
                    onChange={(e) => setUnitForm({ ...unitForm, area: parseInt(e.target.value, 10) })}
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
                    value={unitForm.monthlyRent}
                    onChange={(e) => setUnitForm({ ...unitForm, monthlyRent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Security Deposit ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitForm.securityDeposit}
                    onChange={(e) => setUnitForm({ ...unitForm, securityDeposit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Unit Status</label>
                <select
                  value={unitForm.status}
                  onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}
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
                  onClick={() => setIsUnitModalOpen(false)}
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
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteUnit}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PropertyDetail;
