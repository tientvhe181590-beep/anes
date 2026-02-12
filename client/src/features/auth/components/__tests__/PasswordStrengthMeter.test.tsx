import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(
      <PasswordStrengthMeter level="weak" feedback="Too weak" visible={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders status region when visible', () => {
    render(
      <PasswordStrengthMeter level="good" feedback="Good password strength." visible={true} />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays the correct label for weak', () => {
    render(
      <PasswordStrengthMeter level="weak" feedback="Too weak" visible={true} />,
    );
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('displays the correct label for fair', () => {
    render(
      <PasswordStrengthMeter level="fair" feedback="Getting there" visible={true} />,
    );
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('displays the correct label for good', () => {
    render(
      <PasswordStrengthMeter level="good" feedback="Good password strength." visible={true} />,
    );
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('displays the correct label for strong', () => {
    render(
      <PasswordStrengthMeter level="strong" feedback="Excellent!" visible={true} />,
    );
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('displays feedback text', () => {
    render(
      <PasswordStrengthMeter level="fair" feedback="Add more variety." visible={true} />,
    );
    expect(screen.getByText('Add more variety.')).toBeInTheDocument();
  });

  it('renders 4 segment bars', () => {
    const { container } = render(
      <PasswordStrengthMeter level="strong" feedback="" visible={true} />,
    );
    // 4 segment divs inside the flex gap-1 container
    const segmentContainer = container.querySelector('.flex.gap-1');
    expect(segmentContainer?.children).toHaveLength(4);
  });
});
