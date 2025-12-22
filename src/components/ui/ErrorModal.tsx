
export default function ErrorModal ({ open, title = 'An error occurred', message, onClose }: { open: boolean; title?: string; message?: string; onClose: () => void; }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
                <h3 className="text-lg font-bold mb-2">{ title }</h3>
                <p className="text-sm text-text-secondary mb-4 whitespace-pre-wrap">{ message }</p>
                <div className="flex justify-end">
                    <button className="px-4 py-2 rounded-full bg-primary text-white" onClick={ onClose }>Close</button>
                </div>
            </div>
        </div>
    );
}
