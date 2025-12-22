import { motion } from 'framer-motion';
import { Mic2, Star } from 'lucide-react';
import clsx from 'clsx';

interface SpeakerCircleProps {
    name: string;
    avatar?: string;
    isSpeaking?: boolean;
    isAdmin?: boolean;
    isMe?: boolean;
}

export default function SpeakerCircle ({ name, avatar, isSpeaking, isAdmin, isMe }: SpeakerCircleProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                {/* Speaking Glow */ }
                { isSpeaking && (
                    <motion.div
                        initial={ { scale: 0.8, opacity: 0 } }
                        animate={ { scale: 1.2, opacity: 1 } }
                        transition={ { repeat: Infinity, duration: 1.5, repeatType: 'reverse' } }
                        className="absolute inset-0 bg-primary/30 rounded-full blur-md"
                    />
                ) }

                {/* Avatar Circle */ }
                <div className={ clsx(
                    "w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center relative z-10 bg-surface-elevated overflow-hidden transition-all",
                    isSpeaking ? "border-primary shadow-glow-purple" : "border-white shadow-sm"
                ) }>
                    { avatar ? (
                        <img src={ avatar } alt={ name } className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-muted text-primary">
                            <Mic2 size={ 32 } />
                        </div>
                    ) }

                    {/* Speaking Waves Overlay */ }
                    { isSpeaking && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 items-end h-4">
                            { [ 1, 2, 3, 4 ].map((i) => (
                                <motion.div
                                    key={ i }
                                    animate={ { height: [ 4, 12, 4 ] } }
                                    transition={ { repeat: Infinity, duration: 0.5, delay: i * 0.1 } }
                                    className="w-1 bg-primary rounded-full"
                                />
                            )) }
                        </div>
                    ) }
                </div>

                {/* Admin Badge */ }
                { isAdmin && (
                    <div className="absolute -top-1 -right-1 bg-warning text-white p-1 rounded-full z-20 shadow-sm">
                        <Star size={ 14 } fill="currentColor" />
                    </div>
                ) }
            </div>

            <div className="text-center">
                <p className="font-bold text-sm md:text-base flex items-center gap-1 justify-center">
                    { isMe ? 'You (Me)' : name }
                    { isAdmin && <span className="text-warning">⭐</span> }
                </p>
                <p className={ clsx(
                    "text-xs font-medium",
                    isSpeaking ? "text-primary" : "text-text-muted"
                ) }>
                    { isSpeaking ? 'Speaking...' : 'Listening' }
                </p>
            </div>
        </div>
    );
}
