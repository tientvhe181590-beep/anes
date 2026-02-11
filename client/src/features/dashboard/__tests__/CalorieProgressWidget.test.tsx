import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalorieProgressWidget } from '../components/CalorieProgressWidget';

describe('CalorieProgressWidget', () => {
  it('renders consumed and target calories', () => {
    render(<CalorieProgressWidget consumed={1200} target={2000} />);
    expect(screen.getByText('1200')).toBeDefined();
    expect(screen.getByText('/ 2000 kcal')).toBeDefined();
  });
});
