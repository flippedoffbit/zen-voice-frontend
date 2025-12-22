import Container from '../components/ui/Container';
import { useEffect } from 'react';

export default function ComplianceTermsPage () {
    useEffect(() => {
        console.log('[compliance] Terms page mounted');
    }, []);

    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-text-secondary text-lg">
                        These Terms govern your access to and use of ZenVoice. By using the service you agree to
                        these terms. Please read them carefully.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-border shadow-sm space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-2">Acceptance</h2>
                        <p className="text-text-secondary leading-relaxed">
                            By creating an account and using ZenVoice you accept these Terms and our Privacy
                            Policy. If you don’t agree, do not use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Accounts & conduct</h2>
                        <p className="text-text-secondary leading-relaxed">
                            You are responsible for your account, keeping credentials secure, and for any actions
                            performed through your account. You must not impersonate others or share accounts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">User content</h2>
                        <p className="text-text-secondary leading-relaxed">
                            You retain ownership of content you post, but you grant ZenVoice a license to host and
                            display that content as necessary to provide the service. You are responsible for the
                            content you share and must not post illegal or harmful material.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Moderation and enforcement</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may remove content or suspend accounts that violate these Terms or our Community
                            Guidelines. We may also cooperate with law enforcement when required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Disclaimers & liability</h2>
                        <p className="text-text-secondary leading-relaxed">
                            The service is provided "as is". To the maximum extent permitted by law, ZenVoice is
                            not liable for indirect, incidental, or consequential damages arising from use of the
                            platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Changes to Terms</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may update these Terms; material changes will be posted with an updated "Last
                            updated" date and, where appropriate, notified to users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-sm text-text-muted">Last updated: 20 December 2025</h2>
                    </section>
                </div>
            </Container>
        </div>
    );
}
