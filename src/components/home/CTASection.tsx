import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function CTASection () {
    return (
        <section className="py-20 bg-accent-muted">
            <Container>
                <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-xl border border-accent-light relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to join the conversation?</h2>
                        <p className="text-text-secondary mb-10 max-w-xl mx-auto">
                            Join thousands of users already connecting and sharing their voices. Your next great conversation is just a click away.
                        </p>
                        <Link to={ ROUTES.SIGNUP }>
                            <Button variant="gradient" size="lg" className="px-12">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>

                    {/* Decorative elements */ }
                    <div className="absolute top-0 left-0 w-32 h-32 bg-accent-light/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-navy/10 rounded-full translate-x-1/3 translate-y-1/3" />
                </div>
            </Container>
        </section>
    );
}
