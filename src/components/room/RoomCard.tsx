import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    listenerCount: number;
    isAdmin?: boolean;
}

export default function RoomCard ({ id, name, description, image, listenerCount, isAdmin }: RoomCardProps) {
    const fallbackImage = `https://ui-avatars.com/api/?name=${ encodeURIComponent(name) }&background=random&size=128`;

    return (
        <motion.div
            whileHover={ { y: -4 } }
            className="bg-white rounded-2xl border border-border p-4 shadow-card hover:shadow-card-hover transition-all"
        >
            <Link to={ `/voice/${ id }` } className="flex gap-4">
                <div className="flex-shrink-0">
                    <img
                        src={ image || fallbackImage }
                        alt={ name }
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover bg-surface-elevated"
                    />
                </div>
                <div className="flex-grow min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-text-primary truncate pr-2">{ name }</h3>
                            { isAdmin && (
                                <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                                    Admin
                                </span>
                            ) }
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary text-sm font-medium bg-surface-elevated px-2 py-1 rounded-lg">
                            <Users size={ 14 } />
                            <span>{ listenerCount }</span>
                        </div>
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-2 md:line-clamp-3 mb-2">
                        { description }
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                        <div className="online-dot" />
                        <span className="text-xs font-medium text-success uppercase tracking-wider">Live</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
