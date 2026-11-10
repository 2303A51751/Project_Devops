/**
 * Generate a unique receipt number
 * Format: RCP-YYYYMMDD-XXXXXX (random alphanumeric)
 */
const generateReceiptNumber = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${dateStr}-${random}`;
};

/**
 * Calculate late fee based on days overdue and monthly rent
 * Policy: 5% of rent after 5 days, +1% per additional day, max 25%
 */
const calculateLateFee = (dueDate, paymentDate, monthlyRent) => {
  const due = new Date(dueDate);
  const paid = new Date(paymentDate);
  const diffMs = paid - due;
  const daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysLate <= 5) return 0;

  const baseFee = monthlyRent * 0.05;
  const additionalDays = daysLate - 5;
  const additionalFee = monthlyRent * 0.01 * additionalDays;
  const totalFee = baseFee + additionalFee;
  const maxFee = monthlyRent * 0.25;

  return Math.min(totalFee, maxFee);
};

/**
 * Format a number as USD currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Paginate results helper
 * @param {Object} query - Mongoose query
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Results per page
 */
const paginateResults = async (query, page = 1, limit = 10) => {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    query.skip(skip).limit(limit),
    query.model.countDocuments(query.getFilter()),
  ]);

  return {
    results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

module.exports = {
  generateReceiptNumber,
  calculateLateFee,
  formatCurrency,
  paginateResults,
};
