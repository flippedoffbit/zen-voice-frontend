import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Button from '../components/ui/Button';

describe('Button', () => {
    it('renders children and respects isLoading', () => {
        const html = renderToStaticMarkup(<Button>Click me</Button>);
        expect(html).toContain('Click me');

        const html2 = renderToStaticMarkup(<Button isLoading>Loading</Button>);
        expect(html2).toContain('Loading');
        expect(html2).toContain('disabled');
    });
});
