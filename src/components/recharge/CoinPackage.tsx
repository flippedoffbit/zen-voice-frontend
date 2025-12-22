import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CoinPackageProps {
    coins: number;
    price: number;
    bonus?: number;
    isSelected?: boolean;
    onClick: () => void;
}

export default function CoinPackage ({ coins, price, bonus, isSelected, onClick }: CoinPackageProps) {
    return (
        <motion.button
            whileHover={ { y: -4 } }
            whileTap={ { scale: 0.98 } }
            onClick={ onClick }
            className={ clsx(
                "relative p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-2",
                isSelected
                    ? "border-primary bg-primary-muted shadow-lg"
                    : "border-border bg-white hover:border-primary/30 shadow-sm"
            ) }
        >
            { bonus && (
                <div className="absolute -top-3 -right-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    +{ bonus } BONUS
                </div>
            ) }

            <div className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="text-2xl font-bold text-text-primary">{ coins.toLocaleString() }</span>
            </div>

            <div className="mt-2">
                <span className="text-lg font-bold text-primary">₹{ price }</span>
            </div>

            { isSelected && (
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            ) }
        </motion.button>
    );
}
