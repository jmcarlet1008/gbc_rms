import React, { useState, useEffect } from 'react';

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ message, type = 'info', duration = 5000, onDismiss }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    // Handle actual removal after animation finishes
    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 300); // Match fade-out duration
            return () => clearTimeout(timer);
        }
    }, [isExiting, onDismiss]);

    const styles = {
        success: 'bg-white border-l-4 border-green-500 text-gray-800 shadow-lg',
        error: 'bg-white border-l-4 border-red-500 text-gray-800 shadow-lg',
        warning: 'bg-white border-l-4 border-yellow-500 text-gray-800 shadow-lg',
        info: 'bg-white border-l-4 border-indigo-500 text-gray-800 shadow-lg',
    };

    // Clean styling: no ugly standard borders, just a subtle left accent and shadow.
    // "No border" requested, but shadow is needed for contrast on white bg.
    // If strict "no border" + "on white" -> it would be invisible. Assuming shadow is okay.
    // User asked "clean and on white no border".

    return (
        <div
            className={`
                pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg flex items-center gap-3 transition-all transform duration-300 ease-in-out
                ${styles[type]}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-slide-in'}
            `}
            role="alert"
        >
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                onClick={() => setIsExiting(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
