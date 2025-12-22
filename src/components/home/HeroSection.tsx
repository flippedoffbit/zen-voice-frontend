import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { ROUTES } from '@/constants/routes';
import { Link } from 'react-router-dom';
import { Mic2, Heart, Gift, Star } from 'lucide-react';

export default function HeroSection () {
    return (
        <section className="hero-bg pt-16 pb-24 overflow-hidden">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text Content */ }
                    <div className="flex-1 text-center lg:text-left">
                        <motion.h1
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6"
                        >
                            Connect With Friends In <br />
                            <span className="text-primary">Fun Voice Chat Rooms!</span>
                        </motion.h1>
                        <motion.p
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 0.1 } }
                            className="text-lg text-text-secondary mb-10 max-w-xl mx-auto lg:mx-0"
                        >
                            Experience Unique Conversations: Engage in our dynamic voice chat rooms and expand your circle with intriguing people!
                        </motion.p>
                        <motion.div
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: 0.2 } }
                        >
                            <Link to={ ROUTES.VOICE }>
                                <Button variant="gradient" size="lg" className="text-lg px-10">
                                    Connect Now →
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Hero Image/Illustration */ }
                    <div className="flex-1 relative">
                        <motion.div
                            initial={ { opacity: 0, scale: 0.8 } }
                            animate={ { opacity: 1, scale: 1 } }
                            transition={ { delay: 0.3, duration: 0.5 } }
                            className="relative z-10"
                        >
                            <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-accent-light to-accent-muted rounded-full flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-accent/10 rounded-full animate-pulse" />
                                <Mic2 size={ 120 } className="text-accent" />

                                {/* Floating Elements */ }
                                <motion.div
                                    animate={ { y: [ 0, -10, 0 ] } }
                                    transition={ { repeat: Infinity, duration: 3 } }
                                    className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg text-accent"
                                >
                                    <Heart fill="currentColor" />
                                </motion.div>
                                <motion.div
                                    animate={ { y: [ 0, 10, 0 ] } }
                                    transition={ { repeat: Infinity, duration: 4, delay: 0.5 } }
                                    className="absolute top-1/2 -left-8 bg-white p-3 rounded-2xl shadow-lg text-primary"
                                >
                                    <Gift fill="currentColor" />
                                </motion.div>
                                <motion.div
                                    animate={ { scale: [ 1, 1.2, 1 ] } }
                                    transition={ { repeat: Infinity, duration: 2 } }
                                    className="absolute -bottom-4 left-1/4 bg-white p-3 rounded-2xl shadow-lg text-warning"
                                >
                                    <Star fill="currentColor" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Background Glow */ }
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-accent-light/30 blur-3xl rounded-full -z-10" />
                    </div>
                </div>
            </Container>
        </section>
    );
}
