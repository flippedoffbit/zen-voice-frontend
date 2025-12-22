import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SocketAuthHandler from '../SocketAuthHandler';
import ServiceStatusBanner from '../../ServiceStatusBanner';

export default function RootLayout () {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <ServiceStatusBanner />
            <SocketAuthHandler />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
