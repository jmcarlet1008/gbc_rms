import React from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ activeTab, onTabChange, children }) {
    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            <main className="flex-1 h-full overflow-hidden flex flex-col relative w-full">
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

