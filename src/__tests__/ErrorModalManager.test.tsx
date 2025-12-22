import '../setupTests';
import { describe, it, expect } from 'vitest';

describe('ErrorModalManager', () => {
    it('shows modal when showError called', async () => {
        const { render, screen, waitFor } = await import('@testing-library/react');
        const { default: ErrorModalManager } = await import('../components/ErrorModalManager');
        const { showError, hideError } = await import('../utils/errorModal');

        const { container } = render(<ErrorModalManager />);
        showError({ title: 'Oops', message: 'Something broke' });
        await waitFor(() => {
            expect(container.innerHTML).toContain('Oops');
        });
        hideError();
    });
});
