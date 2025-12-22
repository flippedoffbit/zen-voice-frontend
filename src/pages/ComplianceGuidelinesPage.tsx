import Container from '../components/ui/Container';
import { useEffect } from 'react';

export default function ComplianceGuidelinesPage () {
    useEffect(() => {
        console.log('[compliance] Guidelines page mounted');
    }, []);

    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
                    <p className="text-text-secondary text-lg">
                        Our community thrives on respectful conversation and mutual respect. These guidelines help
                        keep ZenVoice a safe place for everyone.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-border shadow-sm space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-2">Be respectful</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Treat others with respect. Avoid hate speech, harassment, threats, or demeaning
                            language. Disagreements are fine—abuse is not.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">No illegal or harmful content</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Do not share illegal content, copyrighted material you do not own, or instructions
                            that facilitate harm. Content that encourages violence or self-harm is strictly
                            prohibited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Privacy & consent</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Respect other users' privacy. Do not share private conversations, personal or
                            identifying information about others without their explicit consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Reporting & enforcement</h2>
                        <p className="text-text-secondary leading-relaxed">
                            If you see a violation, report it using the in-app reporting tools. Our moderators
                            will review reports and can warn, mute, or ban accounts when needed. Appeals may be
                            submitted to <a className="text-primary underline" href="mailto:moderation@zenvoice.example">moderation@zenvoice.example</a>.
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
