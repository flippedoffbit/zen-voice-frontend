import Container from '@/components/ui/Container';
import { Mic2, Gift, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
    {
        icon: <Mic2 className="text-accent" size={ 32 } />,
        title: 'Have Fun in Party Room',
        description: "Don't want to show your face? We support audio-only rooms where you can express yourself freely with just your voice!"
    },
    {
        icon: <Gift className="text-accent" size={ 32 } />,
        title: 'Explore to receive various gifts',
        description: 'We have animated gifts, festival gifts, and daily gifts to share with your favorite hosts and friends!'
    },
    {
        icon: <Users className="text-accent" size={ 32 } />,
        title: 'Looking for interesting friends',
        description: 'Seeking Connections: Use our platform to find amazing people who share your interests and build lasting friendships!'
    }
];

export default function FeaturesSection () {
    return (
        <section className="py-24 bg-white">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore the Fun with ZenRoom!</h2>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Unleashing Your Potential: Discover the Magic You Can Make on ZenRoom!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    { FEATURES.map((feature, index) => (
                        <motion.div
                            key={ index }
                            initial={ { opacity: 0, y: 20 } }
                            whileInView={ { opacity: 1, y: 0 } }
                            viewport={ { once: true } }
                            transition={ { delay: index * 0.1 } }
                            className="p-8 rounded-3xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all"
                        >
                            <div className="w-16 h-16 feature-icon-circle mb-6">
                                { feature.icon }
                            </div>
                            <h3 className="text-xl font-bold mb-4">{ feature.title }</h3>
                            <p className="text-text-secondary leading-relaxed">
                                { feature.description }
                            </p>
                        </motion.div>
                    )) }
                </div>
            </Container>
        </section>
    );
}
