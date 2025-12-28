import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/StorageService';

// Funds to display in columns
const FUNDS = ['Tithes', 'Offering', 'Mission', 'Building', 'CCM', 'Others'];

export function MonthlySummary() {
    // State for month selection
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [records, setRecords] = useState([]);

    // Load data on mount
    useEffect(() => {
        const allRecords = StorageService.getAllServiceRecords();
        setRecords(allRecords);
    }, []);

    // Filter relevant records
    const monthlyData = useMemo(() => {
        return records.filter(r => r.date.startsWith(selectedMonth));
    }, [records, selectedMonth]);

    // Aggregate Data Logic
    // We need to group by Date -> then list services
    // Output structure: Sorted by Date Ascending
    const groupedByDate = useMemo(() => {
        const groups = {};
        monthlyData.forEach(record => {
            if (!groups[record.date]) {
                groups[record.date] = [];
            }

            // Calculate totals for this service record
            const fundTotals = {};
            FUNDS.forEach(f => fundTotals[f] = 0);
            let gcashTotal = 0;
            let grandTotal = 0;

            if (record.transactions) {
                record.transactions.forEach(tx => {
                    FUNDS.forEach(f => {
                        const val = parseFloat(tx[f]) || 0;
                        fundTotals[f] += val;
                        grandTotal += val;
                    });
                    const gcashVal = parseFloat(tx.GCASH) || 0;
                    gcashTotal += gcashVal;
                });
            }

            groups[record.date].push({
                serviceType: record.serviceType,
                ...fundTotals,
                GCASH: gcashTotal,
                TOTAL: grandTotal
            });
        });

        // Convert to array and sort by date
        return Object.keys(groups).sort().map(date => ({
            date,
            services: groups[date]
        }));
    }, [monthlyData]);

    // Calculate Grand Totals for the Month
    const monthTotals = useMemo(() => {
        const totals = {};
        FUNDS.forEach(f => totals[f] = 0);
        totals['GCASH'] = 0;
        totals['TOTAL'] = 0;

        groupedByDate.forEach(group => {
            group.services.forEach(svc => {
                FUNDS.forEach(f => totals[f] += svc[f]);
                totals['GCASH'] += svc.GCASH;
                totals['TOTAL'] += svc.TOTAL;
            });
        });
        return totals;
    }, [groupedByDate]);


    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mt-6">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Monthly Giving Summary</h2>
                    <p className="text-sm text-gray-500">Breakdown of collections by service.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-sm hover:bg-indigo-100 transition-colors print:hidden"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Report
                    </button>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Service</th>
                            {FUNDS.map(f => (
                                <th key={f} className="px-4 py-3 font-semibold text-right">{f}</th>
                            ))}
                            <th className="px-4 py-3 font-semibold text-right text-indigo-600">GCash</th>
                            <th className="px-6 py-3 font-semibold text-right text-gray-900">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {groupedByDate.length === 0 ? (
                            <tr>
                                <td colSpan={FUNDS.length + 4} className="px-6 py-12 text-center text-gray-400">
                                    No records found for this month.
                                </td>
                            </tr>
                        ) : (
                            groupedByDate.map((group) => (
                                <React.Fragment key={group.date}>
                                    {group.services.map((svc, idx) => (
                                        <tr key={`${group.date}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Only show date on the first row of the group */}
                                            <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">
                                                {idx === 0 ? new Date(group.date).toLocaleDateString('en-US', { day: 'numeric' }) : ''}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {/* Map full service names to short codes if desired, or just show them */}
                                                {svc.serviceType.replace('Sunday Morning', 'AM').replace('Sunday Afternoon', 'PM').replace('Prayer Meeting (Wed)', 'WPM')}
                                            </td>
                                            {FUNDS.map(f => (
                                                <td key={f} className="px-4 py-3 text-right font-mono text-gray-600">
                                                    {svc[f] > 0 ? `₱${svc[f].toLocaleString()}` : '-'}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-right font-mono text-indigo-600 font-medium">
                                                {svc.GCASH > 0 ? `₱${svc.GCASH.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-bold text-gray-900">
                                                ₱{svc.TOTAL.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Optional: Separator or Subtotal for day? User just asked for end month total usually. */}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                    {/* Grand Total Footer */}
                    {groupedByDate.length > 0 && (
                        <tfoot className="bg-gray-50/80 border-t-2 border-gray-100 font-bold text-gray-900">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-right uppercase tracking-wider text-xs text-gray-500">
                                    Monthly Total
                                </td>
                                {FUNDS.map(f => (
                                    <td key={f} className="px-4 py-4 text-right font-mono text-red-600">
                                        ₱{monthTotals[f].toLocaleString()}
                                    </td>
                                ))}
                                <td className="px-4 py-4 text-right font-mono text-red-600">
                                    ₱{monthTotals['GCASH'].toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-red-600 text-base">
                                    ₱{monthTotals['TOTAL'].toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
