import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CompliancePrivacyPage from '../pages/CompliancePrivacyPage';
import ComplianceTermsPage from '../pages/ComplianceTermsPage';
import ComplianceGuidelinesPage from '../pages/ComplianceGuidelinesPage';

describe('Compliance pages smoke test', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('navigates to Privacy page and logs mount', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        render(
            <MemoryRouter initialEntries={ [ "/compliance/privacy" ] }>
                <CompliancePrivacyPage />
            </MemoryRouter>
        );

        expect(spy).toHaveBeenCalledWith('[compliance] Privacy page mounted');
    });

    it('navigates to Terms page and logs mount', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        render(
            <MemoryRouter initialEntries={ [ "/compliance/terms" ] }>
                <ComplianceTermsPage />
            </MemoryRouter>
        );

        expect(spy).toHaveBeenCalledWith('[compliance] Terms page mounted');
    });

    it('navigates to Guidelines page and logs mount', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        render(
            <MemoryRouter initialEntries={ [ "/compliance/guidelines" ] }>
                <ComplianceGuidelinesPage />
            </MemoryRouter>
        );

        expect(spy).toHaveBeenCalledWith('[compliance] Guidelines page mounted');
    });
});
