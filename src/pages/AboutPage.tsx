import Container from '@/components/ui/Container';
import { motion } from 'framer-motion';
import { Mic2, Heart, Shield, Zap } from 'lucide-react';

const VALUES = [
    {
        icon: <Heart className="text-accent" />,
        title: 'Authentic Connection',
        description: 'We believe in the power of voice to create real, human connections that text can never match.'
    },
    {
        icon: <Shield className="text-primary" />,
        title: 'Safe Environment',
        description: 'Our platform is built with safety first, providing tools for moderators to keep conversations healthy.'
    },
    {
        icon: <Zap className="text-warning" />,
        title: 'Real-time Interaction',
        description: 'Experience the thrill of live conversation with zero latency, making you feel like you are in the same room.'
    }
];

export default function AboutPage () {
    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.div
                        initial={ { opacity: 0, scale: 0.9 } }
                        animate={ { opacity: 1, scale: 1 } }
                        className="w-20 h-20 bg-gradient-to-br from-accent-gradient-start to-accent-gradient-end rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-glow-magenta"
                    >
                        <Mic2 size={ 40 } />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About ZenRoom</h1>
                    <p className="text-xl text-text-secondary leading-relaxed">
                        ZenRoom is dedicated to creating meaningful voice connections between people around the world. We believe in the power of authentic conversation to bring joy, knowledge, and friendship.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    { VALUES.map((value, index) => (
                        <motion.div
                            key={ index }
                            initial={ { opacity: 0, y: 20 } }
                            whileInView={ { opacity: 1, y: 0 } }
                            viewport={ { once: true } }
                            transition={ { delay: index * 0.1 } }
                            className="bg-white p-8 rounded-[2rem] shadow-card border border-border"
                        >
                            <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center mb-6">
                                { value.icon }
                            </div>
                            <h3 className="text-xl font-bold mb-4">{ value.title }</h3>
                            <p className="text-text-secondary leading-relaxed">
                                { value.description }
                            </p>
                        </motion.div>
                    )) }
                </div>

                <div className="bg-primary text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Vision</h2>
                        <p className="text-lg text-primary-muted leading-relaxed mb-8">
                            To become the world's most loved voice-first social platform, where everyone feels heard, valued, and connected. We're building a space where your voice is your identity, and your stories are the bridge to new friendships.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Mic2 size={ 24 } />
                            </div>
                            <div>
                                <p className="font-bold">The ZenRoom Team</p>
                                <p className="text-sm text-primary-muted">Building the future of social audio</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative background elements */ }
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full translate-x-1/4 translate-y-1/4" />
                </div>
            </Container>
        </div>
    );
}
