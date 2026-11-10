import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from '../utils/helpers';

describe('Frontend Helpers & Utilities', () => {
  it('formatCurrency should correctly format numbers as USD currency', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(2450.5)).toBe('$2,450.50');
  });

  it('formatDate should format valid ISO date strings', () => {
    const formatted = formatDate('2026-05-15T00:00:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('May');
  });

  it('getStatusColor should map statuses to corresponding Tailwind classes', () => {
    expect(getStatusColor('active')).toContain('emerald');
    expect(getStatusColor('available')).toContain('emerald');
    expect(getStatusColor('occupied')).toContain('blue');
    expect(getStatusColor('rejected')).toContain('red');
    expect(getStatusColor('pending')).toContain('amber');
  });

  it('getStatusBadge should humanize status keys', () => {
    expect(getStatusBadge('in_progress')).toBe('In Progress');
    expect(getStatusBadge('under_review')).toBe('Under Review');
    expect(getStatusBadge('active')).toBe('Active');
  });
});
