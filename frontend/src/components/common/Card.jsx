import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Card = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  className = '',
  color = 'blue',
}) => {
  // Light pastel card styles
  const cardThemes = {
    blue: {
      card: 'bg-gradient-to-br from-white via-white to-sky-50/80 border-sky-200/80 hover:border-sky-300',
      icon: 'bg-sky-100 text-sky-600',
      val: 'text-slate-900',
    },
    emerald: {
      card: 'bg-gradient-to-br from-white via-white to-emerald-50/80 border-emerald-200/80 hover:border-emerald-300',
      icon: 'bg-emerald-100 text-emerald-600',
      val: 'text-slate-900',
    },
    amber: {
      card: 'bg-gradient-to-br from-white via-white to-amber-50/80 border-amber-200/80 hover:border-amber-300',
      icon: 'bg-amber-100 text-amber-600',
      val: 'text-slate-900',
    },
    purple: {
      card: 'bg-gradient-to-br from-white via-white to-purple-50/80 border-purple-200/80 hover:border-purple-300',
      icon: 'bg-purple-100 text-purple-600',
      val: 'text-slate-900',
    },
    rose: {
      card: 'bg-gradient-to-br from-white via-white to-rose-50/80 border-rose-200/80 hover:border-rose-300',
      icon: 'bg-rose-100 text-rose-600',
      val: 'text-slate-900',
    },
    red: {
      card: 'bg-gradient-to-br from-white via-white to-rose-50/80 border-rose-200/80 hover:border-rose-300',
      icon: 'bg-rose-100 text-rose-600',
      val: 'text-slate-900',
    },
    indigo: {
      card: 'bg-gradient-to-br from-white via-white to-indigo-50/80 border-indigo-200/80 hover:border-indigo-300',
      icon: 'bg-indigo-100 text-indigo-600',
      val: 'text-slate-900',
    },
    cyan: {
      card: 'bg-gradient-to-br from-white via-white to-cyan-50/80 border-cyan-200/80 hover:border-cyan-300',
      icon: 'bg-cyan-100 text-cyan-600',
      val: 'text-slate-900',
    },
    slate: {
      card: 'bg-white border-slate-200/80 hover:border-slate-300',
      icon: 'bg-slate-100 text-slate-600',
      val: 'text-slate-900',
    },
  };

  const currentTheme = cardThemes[color] || cardThemes.blue;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-rose-600';
    return 'text-slate-500';
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border p-5 transition-all duration-200 hover:shadow-md ${currentTheme.card} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <p className={`text-2xl font-black ${currentTheme.val}`}>{value}</p>
          {(trend || subtitle) && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {trend && (
                <>
                  {getTrendIcon()}
                  <span className={`text-xs font-bold ${getTrendColor()}`}>
                    {trendValue}
                  </span>
                </>
              )}
              {subtitle && (
                <span className="text-[11px] text-slate-500 font-medium">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shadow-xs flex-shrink-0 ${currentTheme.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
