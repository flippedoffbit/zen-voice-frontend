import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from './constants/routes';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages (to be implemented)
import HomePage from './pages/HomePage';
import VoiceRoomsPage from './pages/VoiceRoomsPage';
import RoomPage from './pages/RoomPage';
import AboutPage from './pages/AboutPage';
import CompliancePage from './pages/CompliancePage';
import CompliancePrivacyPage from './pages/CompliancePrivacyPage';
import ComplianceTermsPage from './pages/ComplianceTermsPage';
import ComplianceGuidelinesPage from './pages/ComplianceGuidelinesPage';
import RechargePage from './pages/RechargePage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout
import RootLayout from './components/layout/RootLayout';

function App () {
    return (
        <>
            <Toaster position="top-center" />
            <Routes>
                <Route element={ <RootLayout /> }>
                    <Route path={ ROUTES.HOME } element={ <HomePage /> } />
                    <Route path={ ROUTES.VOICE } element={ <ProtectedRoute><VoiceRoomsPage /></ProtectedRoute> } />
                    <Route path={ ROUTES.ROOM } element={ <ProtectedRoute><RoomPage /></ProtectedRoute> } />
                    <Route path={ ROUTES.ABOUT } element={ <AboutPage /> } />
                    <Route path={ ROUTES.COMPLIANCE } element={ <CompliancePage /> } />
                    <Route path={ ROUTES.COMPLIANCE_PRIVACY } element={ <CompliancePrivacyPage /> } />
                    <Route path={ ROUTES.COMPLIANCE_TERMS } element={ <ComplianceTermsPage /> } />
                    <Route path={ ROUTES.COMPLIANCE_GUIDELINES } element={ <ComplianceGuidelinesPage /> } />
                    <Route path={ ROUTES.RECHARGE } element={ <RechargePage /> } />
                    <Route path={ ROUTES.CONTACT } element={ <ContactPage /> } />
                    <Route path={ ROUTES.PROFILE } element={ <ProtectedRoute><ProfilePage /></ProtectedRoute> } />
                    <Route path={ ROUTES.WALLET } element={ <ProtectedRoute><WalletPage /></ProtectedRoute> } />
                </Route>

                <Route path={ ROUTES.LOGIN } element={ <LoginPage /> } />
                <Route path={ ROUTES.SIGNUP } element={ <SignupPage /> } />

                <Route path="*" element={ <NotFoundPage /> } />
            </Routes>
        </>
    );
}

export default App;
