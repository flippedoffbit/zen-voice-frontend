import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import RoomCard from '@/components/room/RoomCard';
import Spinner from '@/components/ui/Spinner';
import { motion } from 'framer-motion';
import { getRooms, Room } from '@/api/rooms';

export default function VoiceRoomsPage () {
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const data = await getRooms();
                if (data.success) {
                    setRooms(data.rooms);
                }
            } catch (err: any) {
                setError(err.response?.data?.error?.message || 'Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 text-center">
                <p className="text-red-500">{ error }</p>
                <button
                    onClick={ () => window.location.reload() }
                    className="mt-4 text-primary font-semibold hover:underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="py-12 bg-background">
            <Container>
                <div className="mb-8">
                    <nav className="flex text-sm text-text-muted mb-4">
                        <ol className="flex items-center space-x-2">
                            <li>Home</li>
                            <li>/</li>
                            <li className="text-primary font-medium">Voice Room</li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-bold">Voice Room</h1>
                </div>

                { rooms.length === 0 ? (
                    <div className="py-12 text-center text-text-muted">
                        No active rooms found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        { rooms.map((room, index) => (
                            <motion.div
                                key={ room.id }
                                initial={ { opacity: 0, y: 20 } }
                                animate={ { opacity: 1, y: 0 } }
                                transition={ { delay: index * 0.05 } }
                            >
                                <RoomCard { ...room } />
                            </motion.div>
                        )) }
                    </div>
                ) }

                <div className="mt-12 text-center">
                    <button className="text-primary font-semibold hover:underline">
                        Load More...
                    </button>
                </div>
            </Container>
        </div>
    );
}
