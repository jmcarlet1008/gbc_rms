import React from 'react';
import { Combobox } from './Combobox';

// Reduced funds list for better responsiveness
const FUNDS = ['Tithes', 'Offering', 'Mission', 'Building', 'CCM', 'Others'];

export function TransactionTable({
    mode = 'member', // 'member' or 'guest'
    transactions,
    members,
    onUpdateTransaction,
    onRemoveTransaction,
    onAddTransaction,
    title
}) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);

    // Reset to page 1 if transactions length changes significantly (optional, but good UX)
    // Actually typically if you filter, yes. But here we just add/remove. 
    // If we delete the last item on a page and it becomes empty, go back one page.
    const totalPages = Math.ceil(transactions.length / rowsPerPage);

    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [transactions.length, totalPages, currentPage]);

    const calculateRowTotal = (t) => {
        return FUNDS.reduce((sum, fund) => sum + (parseFloat(t[fund]) || 0), 0);
    };

    // Pagination Logic
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedTransactions = transactions.slice(startIndex, endIndex);

    // Handler wrappers to convert local index to global index
    const handleUpdate = (localIndex, field, value) => {
        const globalIndex = startIndex + localIndex;
        onUpdateTransaction(globalIndex, field, value);
    };

    const handleRemove = (localIndex) => {
        const globalIndex = startIndex + localIndex;
        onRemoveTransaction(globalIndex);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    {mode === 'member' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    {mode === 'guest' && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                    {title} <span className="text-gray-400 font-normal normal-case ml-1">({transactions.length})</span>
                </h3>
                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    onClick={() => {
                        onAddTransaction();
                        // Optional: Navigate to last page to see new entry?
                        // Usually adding appends to end, so maybe good to jump to last page.
                        // But let's leave default behavior first.
                    }}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Entry
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                        <tr>
                            <th className="p-3 text-left font-bold text-gray-500 uppercase tracking-wider w-40 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">Name</th>
                            {FUNDS.map(f => (
                                <th key={f} className="p-3 text-center font-bold text-gray-500 uppercase tracking-wider w-20 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">{f}</th>
                            ))}
                            <th className="p-3 text-center font-bold text-indigo-600 uppercase tracking-wider w-24 bg-indigo-50/30 border-b border-gray-100">GCash</th>
                            <th className="p-3 text-center font-bold text-gray-800 uppercase tracking-wider w-20 bg-gray-100/50 border-b border-gray-100">Total</th>
                            <th className="p-3 w-8 bg-gray-50/80 border-b border-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayedTransactions.map((t, localIndex) => {
                            // Filter available members logic preserved
                            const allSelectedIds = new Set(
                                transactions
                                    .map(tx => tx.memberId)
                                    .filter(Boolean)
                                    .map(id => String(id))
                            );

                            const availableMembers = members.filter(m => {
                                const memberId = String(m.id);
                                const currentTransactionMemberId = t.memberId ? String(t.memberId) : null;
                                return !allSelectedIds.has(memberId) || memberId === currentTransactionMemberId;
                            });

                            return (
                                <tr key={t.id || localIndex} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-2 pl-3">
                                        {mode === 'guest' ? (
                                            <input
                                                type="text"
                                                placeholder="Guest Name"
                                                value={t.guestName || ''}
                                                onChange={(e) => handleUpdate(localIndex, 'guestName', e.target.value)}
                                                className="w-full text-xs py-1.5 px-2 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded outline-none transition-all placeholder-gray-400 font-medium text-gray-800"
                                            />
                                        ) : (
                                            <div className="w-full">
                                                <Combobox
                                                    options={availableMembers}
                                                    value={t.memberId}
                                                    onChange={(val) => handleUpdate(localIndex, 'memberId', val)}
                                                    placeholder="Search Member..."
                                                />
                                            </div>
                                        )}
                                    </td>
                                    {FUNDS.map(fund => (
                                        <td key={fund} className="p-1.5">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full text-xs py-1.5 px-1 text-center bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-300 rounded outline-none transition-all font-mono text-gray-700 hover:bg-white hover:border-gray-200"
                                                placeholder="0"
                                                value={t[fund] || ''}
                                                onChange={(e) => handleUpdate(localIndex, fund, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-1.5 bg-indigo-50/10">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full text-xs py-1.5 px-1 text-center bg-indigo-50/50 border border-transparent focus:bg-white focus:border-indigo-400 rounded outline-none transition-all font-mono font-medium text-indigo-700 placeholder-indigo-200"
                                            placeholder="0"
                                            value={t.GCASH || ''}
                                            onChange={(e) => handleUpdate(localIndex, 'GCASH', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-center font-bold text-gray-900 bg-gray-50/30 font-mono">
                                        {calculateRowTotal(t).toLocaleString()}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            onClick={() => handleRemove(localIndex)}
                                            title="Remove Entry"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={FUNDS.length + 4} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span className="text-xs font-medium">No entries added yet</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {transactions.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1); // Reset to page 1 when changing density
                            }}
                            className="bg-white border border-gray-200 rounded px-2 py-1 outline-none text-gray-700"
                        >
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={40}>40</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span>
                            {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                className={`p-1 rounded hover:bg-gray-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                className={`p-1 rounded hover:bg-gray-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
