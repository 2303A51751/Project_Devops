import { getStatusColor, getStatusBadge } from '../../utils/helpers';

const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${getStatusColor(status)} ${sizeClasses[size]} ${className}`}
    >
      {getStatusBadge(status)}
    </span>
  );
};

export default StatusBadge;
