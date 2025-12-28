import React from 'react';

export function ReconciliationSummary({
    memberTotal,
    nonMemberTotal,
    totalGcash,
    actualCash
}) {
    const grandTotal = memberTotal + nonMemberTotal;
    const expectedCash = Math.max(0, grandTotal - totalGcash);
    const diff = actualCash - expectedCash;
    const isBalanced = diff === 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reconciliation Breakdown
            </h3>

            <div className="flex flex-col gap-6">
                {/* Breakdown Column */}
                <div className="space-y-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Total Member Giving</span>
                        <span className="font-bold text-gray-800">{memberTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Total Non-Member Giving</span>
                        <span className="font-bold text-gray-800">{nonMemberTotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-base">
                        <span className="font-bold text-gray-900">Total Collection</span>
                        <span className="font-black text-indigo-700">{grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-indigo-600 font-medium text-sm">Less: GCash Payments</span>
                    <span className="font-bold text-indigo-800">{totalGcash.toLocaleString()}</span>
                </div>

                {/* Status Block */}
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isBalanced
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'}`}>

                    <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                            Reconciliation Status
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isBalanced ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {isBalanced ? 'OK' : 'ERROR'}
                        </span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500">
                            Cash in Hand vs Expected
                        </div>
                        <div className={`text-xl font-black ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                            {isBalanced ? 'BALANCED' : `DISCREPANCY`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
