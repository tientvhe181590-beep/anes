import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StreakWidget } from '../components/StreakWidget';

describe('StreakWidget', () => {
  it('renders streak days correctly', () => {
    render(<StreakWidget streakDays={5} />);
    expect(screen.getByText('5 Days')).toBeDefined();
    expect(screen.getByText('Current Streak')).toBeDefined();
  });
});
