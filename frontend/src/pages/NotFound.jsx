import { Link } from 'react-router-dom';
import { Building2, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans text-center">
      <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 mb-6">
        <Building2 className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="mt-2 text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The real estate management screen or resource you requested could not be located.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
