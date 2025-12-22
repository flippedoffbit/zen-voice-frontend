import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage () {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <FeaturesSection />
            <CTASection />
        </div>
    );
}
