import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { unitsAPI, propertiesAPI, applicationsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const BrowseProperties = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [bedrooms, setBedrooms] = useState('all');

  // Apply Modal
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [applicationForm, setApplicationForm] = useState({
    moveInDate: '',
    employer: '',
    position: '',
    monthlyIncome: '',
    previousAddress: '',
    message: '',
  });

  const fetchAvailableUnits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bedrooms !== 'all') params.bedrooms = bedrooms;

      const res = await unitsAPI.getAvailable(params);
      let list = res.data?.data || [];

      // Client side filter by search term or property type if provided
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        list = list.filter(
          (u) =>
            u.property?.title?.toLowerCase().includes(s) ||
            u.property?.address?.city?.toLowerCase().includes(s) ||
            u.property?.address?.state?.toLowerCase().includes(s) ||
            u.unitNumber?.includes(s)
        );
      }

      if (selectedType !== 'all') {
        list = list.filter((u) => u.property?.type === selectedType);
      }

      setUnits(list);
    } catch (err) {
      console.error('Failed to load available units:', err);
      toast.error('Failed to load available units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableUnits();
  }, [searchTerm, selectedType, bedrooms]);

  const handleApplyClick = (unit) => {
    if (!isAuthenticated) {
      toast.error('Please sign in or register to submit an application');
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      toast.error('Only tenant resident accounts can apply for units');
      return;
    }
    setSelectedUnit(unit);
    setApplicationForm({
      moveInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      employer: '',
      position: '',
      monthlyIncome: '',
      previousAddress: '',
      message: 'Looking forward to residing in this unit.',
    });
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    setSubmitting(true);
    try {
      await applicationsAPI.create({
        unit: selectedUnit._id,
        moveInDate: applicationForm.moveInDate,
        employmentInfo: {
          employer: applicationForm.employer,
          position: applicationForm.position,
          monthlyIncome: parseFloat(applicationForm.monthlyIncome) || 0,
        },
        previousAddress: applicationForm.previousAddress,
        message: applicationForm.message,
      });

      toast.success('Rental application submitted successfully!');
      setApplyModalOpen(false);
      navigate('/applications');
    } catch (err) {
      console.error('Application submit error:', err);
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <div className="p-1.5 bg-sky-100 text-sky-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          Available Units Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore and apply for verified available properties with immediate move-in readiness.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center px-3 bg-slate-50 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by city, title, or property address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="house">House</option>
            <option value="townhouse">Townhouse</option>
            <option value="commercial">Commercial</option>
          </select>

          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
          </select>
        </div>
      </div>

      {/* Units Listing Cards */}
      {loading ? (
        <LoadingSpinner text="Searching available vacant units..." />
      ) : units.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No available units found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or check back shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <div
              key={unit._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600/90 backdrop-blur-md rounded text-[11px] font-bold text-white">
                    Unit #{unit.unitNumber}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md rounded text-[11px] font-bold text-white">
                    Available
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-xs font-bold text-white">
                    {formatCurrency(unit.monthlyRent)} / mo
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {unit.property?.address?.city}, {unit.property?.address?.state}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {unit.property?.title || 'Residential Residence'}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-blue-600" />
                      {unit.bedrooms} BR
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-blue-600" />
                      {unit.bathrooms} BA
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                      {unit.area} sqft
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                    {unit.description || 'Modern unit with premium appliances and spacious open plan living layout.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleApplyClick(unit)}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  Apply for Unit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rental Application Modal */}
      {applyModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submit Rental Application</h2>
                <p className="text-xs text-slate-500">
                  Unit #{selectedUnit.unitNumber} at {selectedUnit.property?.title} ({formatCurrency(selectedUnit.monthlyRent)}/mo)
                </p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Target Move-in Date
                </label>
                <input
                  type="date"
                  required
                  value={applicationForm.moveInDate}
                  onChange={(e) => setApplicationForm({ ...applicationForm, moveInDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Employer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Company or Organization"
                    value={applicationForm.employer}
                    onChange={(e) => setApplicationForm({ ...applicationForm, employer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Systems Engineer"
                    value={applicationForm.position}
                    onChange={(e) => setApplicationForm({ ...applicationForm, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Gross Monthly Income ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 7500"
                  value={applicationForm.monthlyIncome}
                  onChange={(e) => setApplicationForm({ ...applicationForm, monthlyIncome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Current / Previous Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, City, State, Zip"
                  value={applicationForm.previousAddress}
                  onChange={(e) =>
                    setApplicationForm({ ...applicationForm, previousAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Applicant Statement / Message
                </label>
                <textarea
                  rows="3"
                  value={applicationForm.message}
                  onChange={(e) => setApplicationForm({ ...applicationForm, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProperties;
