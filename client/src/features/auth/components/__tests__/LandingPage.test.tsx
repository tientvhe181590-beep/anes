import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../LandingPage';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('LandingPage', () => {
    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );
    };

    it('renders the first slide initially', () => {
        renderComponent();
        expect(screen.getByText('AI-Powered Workouts')).toBeInTheDocument();
    });

    it.skip('navigates to next slide on Next click', async () => {
        const user = userEvent.setup();
        renderComponent();
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);
        expect(await screen.findByText('Smart Nutrition')).toBeInTheDocument();
    });

    it.skip('skips to the last slide on Skip click', async () => {
        const user = userEvent.setup();
        renderComponent();
        const skipButton = screen.getByRole('button', { name: /skip/i });
        await user.click(skipButton);
        expect(await screen.findByText('Easy Tracking')).toBeInTheDocument();
    });

    it.skip('navigates to login on Login click', async () => {
        const user = userEvent.setup();
        renderComponent();
        // Skip to last slide
        const skipButton = screen.getByRole('button', { name: /skip/i });
        await user.click(skipButton);

        // Check that we are on the last slide
        await screen.findByText('Easy Tracking');

        const loginButton = await screen.findByRole('button', { name: /login/i });
        await user.click(loginButton);
        expect(navigateMock).toHaveBeenCalledWith('/login');
    });
});
