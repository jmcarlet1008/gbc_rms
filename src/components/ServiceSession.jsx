
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TransactionTable } from './TransactionTable';
import { ReconciliationSummary } from './ReconciliationSummary';
import { CashValidator } from './CashValidator';
import { StorageService } from '../services/StorageService';

const SERVICE_TYPES = [
    'Sunday Morning',
    'Sunday Afternoon',
    'Prayer Meeting (Wed)'
];

export function ServiceSession({ members, serviceData, onUpdateServiceData }) {
    const { serviceType, date, transactions } = serviceData;
    const [actualCashCount, setActualCashCount] = useState(0);

    const selectedDate = date ? new Date(date) : null;

    // Filter members by type
    const membersList = members.filter(m => m.type === 'Member');
    const nonMembersList = members.filter(m => m.type === 'Non-Member');

    const isDateAllowed = (date) => {
        const day = date.getDay();
        if (serviceType.includes('Sunday')) {
            return day === 0;
        }
        if (serviceType.includes('Wednesday') || serviceType.includes('Wed')) {
            return day === 3;
        }
        return true;
    };

    const handleSave = () => {
        if (!date) {
            alert("Please select a date first.");
            return;
        }
        StorageService.saveServiceRecord(serviceType, date, transactions);
        alert("Saved record for " + serviceType + " on " + date);
    };

    const handleLoad = () => {
        if (!date) {
            alert("Please select a date to load.");
            return;
        }
        const loadedData = StorageService.getServiceRecord(serviceType, date);
        if (loadedData) {
            onUpdateServiceData({ ...serviceData, transactions: loadedData });
            alert("Record loaded successfully.");
        } else {
            alert("No record found for this date and service type.");
        }
    };

    const handleAddMemberTx = () => {
        const newTx = { id: crypto.randomUUID(), memberId: '', type: 'Member' };
        onUpdateServiceData({
            ...serviceData,
            transactions: [newTx, ...transactions]
        });
    };

    const handleAddNonMemberTx = () => {
        const newTx = { id: crypto.randomUUID(), memberId: '', type: 'Non-Member' };
        onUpdateServiceData({
            ...serviceData,
            transactions: [newTx, ...transactions]
        });
    };

    const handleAddGuestTx = () => {
        const newTx = { id: crypto.randomUUID(), guestName: '', type: 'Guest' };
        onUpdateServiceData({
            ...serviceData,
            transactions: [newTx, ...transactions]
        });
    };

    const handleUpdate = (index, field, value) => {
        const updated = [...transactions];
        updated[index] = { ...updated[index], [field]: value };
        onUpdateServiceData({ ...serviceData, transactions: updated });
    };

    const handleRemove = (index) => {
        const updated = transactions.filter((_, i) => i !== index);
        onUpdateServiceData({ ...serviceData, transactions: updated });
    };

    const memberTransactions = transactions.filter(t => t.type === 'Member');
    const nonMemberTransactions = transactions.filter(t => t.type === 'Non-Member');
    const guestTransactions = transactions.filter(t => t.type === 'Guest');

    const calculateTotal = (txs) => {
        return txs.reduce((sum, t) => {
            const rowSum = Object.keys(t).reduce((rSum, key) => {
                if (['id', 'memberId', 'tagId', 'guestName', 'type', 'GCASH'].includes(key)) return rSum;
                return rSum + (parseFloat(t[key]) || 0);
            }, 0);
            return sum + rowSum;
        }, 0);
    };

    const memberTotal = calculateTotal(memberTransactions);
    const nonMemberTotal = calculateTotal(nonMemberTransactions);
    const guestTotal = calculateTotal(guestTransactions);
    const grandTotal = memberTotal + nonMemberTotal + guestTotal;
    const totalGcash = transactions.reduce((sum, t) => sum + (parseFloat(t.GCASH) || 0), 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative z-30">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="flex flex-wrap gap-4 items-end flex-1">
                        <div className="w-full sm:w-48">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Service Type</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                    value={serviceType}
                                    onChange={(e) => onUpdateServiceData({ ...serviceData, serviceType: e.target.value, date: '' })}
                                >
                                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="w-full sm:w-40">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                            <div className="relative">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(d) => {
                                        const dateString = d ? d.toISOString().split('T')[0] : '';
                                        onUpdateServiceData({ ...serviceData, date: dateString });
                                    }}
                                    filterDate={isDateAllowed}
                                    placeholderText="Select Date"
                                    className="w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    dateFormat="MMM d, yyyy"
                                    isClearable
                                    popperPlacement="bottom-start"
                                    popperClassName="z-[50]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                onClick={handleLoad}
                            >
                                Load
                            </button>
                            <button
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                                onClick={handleSave}
                            >
                                Save Record
                            </button>
                        </div>
                    </div>

                    <div className="bg-indigo-50 px-6 py-4 rounded-xl border border-indigo-100 flex flex-col items-center md:items-end min-w-[140px]">
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Grand Total</div>
                        <div className="text-2xl font-black text-indigo-900 tracking-tight">
                            {grandTotal.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Tables - 3 Panels */}
            <div className="grid grid-cols-1 gap-6">
                {/* Member Giving - uses membersList */}
                <div className="min-h-[250px]">
                    <TransactionTable
                        title="Member Giving"
                        mode="member"
                        transactions={memberTransactions}
                        members={membersList}
                        onAddTransaction={handleAddMemberTx}
                        onUpdateTransaction={(idx, field, val) => {
                            const id = memberTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleUpdate(globalIdx, field, val);
                        }}
                        onRemoveTransaction={(idx) => {
                            const id = memberTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleRemove(globalIdx);
                        }}
                    />
                </div>

                {/* Non-Member Giving - uses nonMembersList */}
                <div className="min-h-[250px]">
                    <TransactionTable
                        title="Non-Member Giving"
                        mode="member"
                        transactions={nonMemberTransactions}
                        members={nonMembersList}
                        onAddTransaction={handleAddNonMemberTx}
                        onUpdateTransaction={(idx, field, val) => {
                            const id = nonMemberTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleUpdate(globalIdx, field, val);
                        }}
                        onRemoveTransaction={(idx) => {
                            const id = nonMemberTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleRemove(globalIdx);
                        }}
                    />
                </div>

                {/* Guest Giving - Free text */}
                <div className="min-h-[250px]">
                    <TransactionTable
                        title="Guest Giving"
                        mode="guest"
                        transactions={guestTransactions}
                        members={[]}
                        onAddTransaction={handleAddGuestTx}
                        onUpdateTransaction={(idx, field, val) => {
                            const id = guestTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleUpdate(globalIdx, field, val);
                        }}
                        onRemoveTransaction={(idx) => {
                            const id = guestTransactions[idx].id;
                            const globalIdx = transactions.findIndex(t => t.id === id);
                            handleRemove(globalIdx);
                        }}
                    />
                </div>
            </div>

            {/* Reconciliation Section - Fixed Grid & Removed Outlines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4 pb-8">
                <CashValidator
                    expectedCash={Math.max(0, grandTotal - totalGcash)}
                    onTotalChange={setActualCashCount}
                />
                <ReconciliationSummary
                    memberTotal={memberTotal}
                    nonMemberTotal={nonMemberTotal + guestTotal}
                    totalGcash={totalGcash}
                    actualCash={actualCashCount}
                />
            </div>
        </div>
    );
}
