import React, { useState, useEffect } from 'react';

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

export function CashValidator({ expectedCash, onTotalChange }) {
    const [counts, setCounts] = useState(
        DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: '' }), {})
    );

    const calculateTotal = (currentCounts) => {
        return DENOMINATIONS.reduce((sum, d) => sum + (d * (parseInt(currentCounts[d]) || 0)), 0);
    };

    // Effect to notify parent of total changes
    useEffect(() => {
        if (onTotalChange) {
            onTotalChange(calculateTotal(counts));
        }
    }, [counts, onTotalChange]);

    const totalCounted = calculateTotal(counts);
    const diff = totalCounted - expectedCash;
    const isBalanced = diff === 0;

    const handleCountChange = (denom, value) => {
        setCounts(prev => ({
            ...prev,
            [denom]: value
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cash Count Validation
            </h3>

            <div className="flex flex-col gap-6">
                <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase tracking-wider">Denomination</th>
                                <th className="p-3 text-center font-bold text-gray-500 text-xs uppercase tracking-wider">Count</th>
                                <th className="p-3 text-right font-bold text-gray-500 text-xs uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {DENOMINATIONS.map(denom => (
                                <tr key={denom} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-2 pl-4 font-mono font-bold text-gray-700">₱ {denom}</td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="number"
                                            className="w-20 text-center py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                            min="0"
                                            placeholder="0"
                                            value={counts[denom]}
                                            onChange={(e) => handleCountChange(denom, e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 pr-4 text-right font-mono text-gray-600">
                                        ₱ {((parseInt(counts[denom]) || 0) * denom).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expected Cash</h4>
                        <div className="text-xl font-bold text-gray-900">{expectedCash.toLocaleString()}</div>
                        <p className="text-xs text-gray-400">Calculated from records</p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl space-y-1 border border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Actual Count</h4>
                        <div className="text-xl font-bold text-indigo-700">{totalCounted.toLocaleString()}</div>
                        <p className="text-xs text-indigo-400">Total from denominations</p>
                    </div>

                    <div className={`col-span-1 sm:col-span-2 p-4 rounded-xl flex items-center justify-between border ${isBalanced
                        ? 'bg-green-50 border-green-100 text-green-800'
                        : 'bg-red-50 border-red-100 text-red-800'}`}>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide opacity-80">Discrepancy</h4>
                            <div className="text-lg font-bold">
                                {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isBalanced ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
                            {isBalanced ? 'Balanced' : 'Not Balanced'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
