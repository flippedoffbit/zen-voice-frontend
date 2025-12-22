import Container from '../components/ui/Container';
import { useEffect } from 'react';

export default function CompliancePrivacyPage () {
    useEffect(() => {
        console.log('[compliance] Privacy page mounted');
    }, []);

    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-text-secondary text-lg">
                        At ZenVoice we respect your privacy. This policy explains what information we collect, why
                        we collect it, and how you can control your information.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-border shadow-sm space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-2">Information we collect</h2>
                        <p className="text-text-secondary leading-relaxed mb-2">
                            We collect information you provide directly (account details, profile, messages you send in
                            rooms) and information collected automatically (device identifiers, IP address, usage
                            metrics). We also collect minimal telemetry needed to improve audio/video quality.
                        </p>
                        <ul className="list-disc pl-6 text-text-secondary">
                            <li>Account data: phone number, display name, profile picture</li>
                            <li>Usage & device data: session times, device information, logs</li>
                            <li>Content: messages you post in public rooms and any content you upload</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">How we use your data</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We use data to operate and improve the service, to provide and troubleshoot audio/video
                            features, personalize the experience, and to comply with legal obligations. We do
                            not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Sharing and disclosure</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may share data with trusted service providers (CDN, analytics, auth providers) and
                            when required by law. Aggregated or anonymized data may be used for research and product
                            improvements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Security & retention</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We use industry-standard security measures to protect your data. We retain personal data
                            only as long as necessary to provide the service or as required for legal reasons.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-2">Your rights</h2>
                        <p className="text-text-secondary leading-relaxed">
                            You can request access to, correction of, or deletion of your personal data. Contact us
                            at <a className="text-primary underline" href="mailto:privacy@zenvoice.example">privacy@zenvoice.example</a>.
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
