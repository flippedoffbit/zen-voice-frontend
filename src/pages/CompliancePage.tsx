import Container from '@/components/ui/Container';
import { Shield, FileText, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const POLICIES = [
    {
        icon: <Shield className="text-primary" />,
        title: 'Privacy Policy',
        description: 'How we collect, use, and protect your personal data.',
        link: ROUTES.COMPLIANCE_PRIVACY
    },
    {
        icon: <FileText className="text-accent" />,
        title: 'Terms of Service',
        description: 'The rules and guidelines for using our platform.',
        link: ROUTES.COMPLIANCE_TERMS
    },
    {
        icon: <Users className="text-warning" />,
        title: 'Community Guidelines',
        description: 'Our expectations for behavior within the ZenRoom community.',
        link: ROUTES.COMPLIANCE_GUIDELINES
    }
];

export default function CompliancePage () {
    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Compliance & Policies</h1>
                    <p className="text-text-secondary text-lg">
                        We are committed to transparency and providing a safe, secure environment for all our users.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    { POLICIES.map((policy, index) => (
                        <Link
                            key={ index }
                            to={ policy.link }
                            className="flex items-center gap-6 bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                            <div className="w-16 h-16 bg-surface-elevated rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                { policy.icon }
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold mb-1">{ policy.title }</h3>
                                <p className="text-text-secondary">{ policy.description }</p>
                            </div>
                            <ChevronRight className="text-text-muted group-hover:text-primary transition-colors" />
                        </Link>
                    )) }
                </div>

                <div className="mt-20 bg-white rounded-[2.5rem] p-12 border border-border shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Our Commitment to Safety</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h4 className="font-bold mb-3 text-primary">Moderation Tools</h4>
                            <p className="text-text-secondary leading-relaxed">
                                We provide room admins with powerful tools to manage their communities, including the ability to approve speakers, mute users, and ban disruptive participants.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 text-accent">Data Protection</h4>
                            <p className="text-text-secondary leading-relaxed">
                                Your privacy is our priority. We use industry-standard encryption and security measures to ensure your personal information and conversations remain private.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
