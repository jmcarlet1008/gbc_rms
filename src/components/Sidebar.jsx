import React from 'react';

const MENU_ITEMS = [
    {
        id: 'members',
        label: 'Member',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        id: 'giving',
        label: 'Giving Records',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    }
];

export function Sidebar({ activeTab, onTabChange }) {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <img
                        src="/GBCLogo.png"
                        alt="GBC Logo"
                        className="w-8 h-8 object-contain shadow-sm rounded-lg"
                    />
                    <h1 className="font-bold text-gray-900 text-base leading-tight">
                        GBC Records<br />Management
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {MENU_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
