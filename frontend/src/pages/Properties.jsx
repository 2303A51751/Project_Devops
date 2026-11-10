import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Edit2,
  Trash2,
  DoorOpen,
  Eye,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { propertiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Properties = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'owner';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
    type: 'apartment',
    totalUnits: 1,
    status: 'active',
    parkingSpaces: 0,
    petPolicy: 'allowed',
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await propertiesAPI.getAll(params);
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const openCreateModal = () => {
    setEditingProperty(null);
    setFormData({
      title: '',
      description: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      type: 'apartment',
      totalUnits: 1,
      status: 'active',
      parkingSpaces: 0,
      petPolicy: 'allowed',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prop) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || '',
      description: prop.description || '',
      address: {
        street: prop.address?.street || '',
        city: prop.address?.city || '',
        state: prop.address?.state || '',
        zipCode: prop.address?.zipCode || '',
        country: prop.address?.country || 'USA',
      },
      type: prop.type || 'apartment',
      totalUnits: prop.totalUnits || 1,
      status: prop.status || 'active',
      parkingSpaces: prop.parkingSpaces || 0,
      petPolicy: prop.petPolicy || 'allowed',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await propertiesAPI.update(editingProperty._id, formData);
        toast.success('Property updated successfully');
      } else {
        await propertiesAPI.create(formData);
        toast.success('Property added successfully');
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      console.error('Error saving property:', err);
      toast.error(err.response?.data?.message || 'Error saving property');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await propertiesAPI.delete(deleteTarget._id);
      toast.success('Property removed');
      setDeleteTarget(null);
      fetchProperties();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete property');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Property Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, configure, and maintain real estate holdings and unit configurations.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center px-3 bg-slate-50 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title, address, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="house">House</option>
            <option value="townhouse">Townhouse</option>
            <option value="commercial">Commercial</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <LoadingSpinner text="Loading property listings..." />
      ) : properties.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No properties found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new property.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <StatusBadge status={prop.status} size="xs" />
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[11px] font-semibold text-white capitalize">
                    {prop.type}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center text-xs text-slate-500 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {prop.address?.street}, {prop.address?.city}, {prop.address?.state} {prop.address?.zipCode}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{prop.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{prop.description}</p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <DoorOpen className="w-4 h-4 text-blue-600" />
                  {prop.totalUnits || 3} Units
                </span>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/properties/${prop._id}`}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition"
                    title="View Property Units"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {canManage && (
                    <>
                      <button
                        onClick={() => openEditModal(prop)}
                        className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-md transition"
                        title="Edit Property"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prop)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">
                {editingProperty ? 'Edit Property Details' : 'Add New Property Portfolio'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Horizon Luxury Residences"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Architectural features, amenities, location highlights..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="house">House</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <p className="font-bold text-slate-800">Physical Address</p>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address (e.g. 450 Lexington Ave)"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Zip Code"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition"
                >
                  {editingProperty ? 'Save Changes' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Property Portfolio"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated units and historical records will be permanently removed.`}
        confirmText="Delete Property"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Properties;
