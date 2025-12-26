import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Combobox({ options, value, onChange, placeholder = "Select..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 300 });

    // Safety check: ensure options is an array
    const safeOptions = Array.isArray(options) ? options : [];

    // Filter options based on search term (Name OR Code), limit to 10
    const filteredOptions = safeOptions.filter(option => {
        if (!option || !option.name) return false;
        const term = searchTerm.toLowerCase();
        const nameMatch = option.name.toLowerCase().includes(term);
        const codeMatch = option.code && String(option.code).toLowerCase().includes(term);
        return nameMatch || codeMatch;
    }).slice(0, 10);

    // Find selected item
    const selectedItem = safeOptions.find(o => o.id === value);

    // Sync searchTerm with selectedItem
    useEffect(() => {
        if (selectedItem) {
            setSearchTerm(selectedItem.name);
        } else {
            setSearchTerm('');
        }
    }, [selectedItem]);

    // Calculate dropdown position when opening - use fixed positioning
    useEffect(() => {
        if (isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 300)
            });
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            const dropdownEl = document.getElementById('combobox-portal-dropdown');
            if (wrapperRef.current?.contains(e.target)) return;
            if (dropdownEl?.contains(e.target)) return;
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (option) => {
        onChange(option.id);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Input Field */}
            <div
                className="flex items-center border rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary cursor-text"
                onClick={() => setIsOpen(true)}
            >
                <input
                    type="text"
                    className="flex-1 min-w-0 p-2 text-sm outline-none border-none font-medium text-gray-800 placeholder:font-normal placeholder:text-gray-400"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {value && (
                    <button
                        onClick={handleClear}
                        className="px-2 text-gray-400 hover:text-red-500"
                        title="Clear"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Portal Dropdown - Uses FIXED positioning for viewport-relative placement */}
            {isOpen && createPortal(
                <div
                    id="combobox-portal-dropdown"
                    style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        zIndex: 99999
                    }}
                >
                    <ul className="bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-green-100 transition-colors"
                                    style={{
                                        backgroundColor: option.id === value ? '#dcfce7' : undefined,
                                        fontWeight: option.id === value ? 'bold' : 'normal',
                                        color: option.id === value ? '#166534' : '#374151'
                                    }}
                                >
                                    <span className="text-sm truncate">{option.name}</span>
                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono flex-shrink-0">
                                        {option.code}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="p-3 text-center text-gray-400 text-sm">
                                No results found
                            </li>
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
}
