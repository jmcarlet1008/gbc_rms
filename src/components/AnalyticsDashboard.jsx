import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { StorageService } from '../services/StorageService';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const FUNDS = ['Tithes', 'Offering', 'Mission', 'Building', 'CCM', 'Others'];

export function AnalyticsDashboard() {
    const [filterService, setFilterService] = useState('All');
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        // Load data from storage
        const records = StorageService.getAllServiceRecords();
        setRawData(records);
    }, []);

    const processedData = useMemo(() => {
        let dataToUse = rawData;

        // 1. Filter if needed
        if (filterService !== 'All') {
            dataToUse = rawData.filter(d => d.serviceType === filterService);
        }

        return dataToUse.map(record => {
            // Calculate totals for this record if not already present
            // The record structure from StorageService.getAllServiceRecords() includes: { date, serviceType, ...txData }
            // But wait, the record data structure depends on how it was saved.
            // Based on ServiceSession.jsx, it saves: { serviceType, date, transactions: [], cashCounts: {} }
            // So we need to sum up transactions to get the totals.

            let recordTotal = 0;
            const fundTotals = {
                Tithes: 0, Offering: 0, Mission: 0, Building: 0, CCM: 0, Others: 0
            };

            if (record.transactions && Array.isArray(record.transactions)) {
                record.transactions.forEach(tx => {
                    FUNDS.forEach(fund => {
                        const amount = parseFloat(tx[fund]) || 0;
                        fundTotals[fund] += amount;
                        recordTotal += amount;
                    });
                });
            }

            return {
                ...record,
                total: recordTotal,
                ...fundTotals
            };
        });
    }, [rawData, filterService]);

    // --- SUPER NUMBERS CALCULATIONS ---

    const totalGiving = processedData.reduce((sum, d) => sum + d.total, 0);
    const servicesRecorded = processedData.length;

    // Averages (Specific Logic)
    // We need to calculate averages based on ALL data, not just filtered, because the user asked for "Average AM", "Average PM", etc. to be displayed.
    // However, if the user filters to "Sunday Morning", should we still show "Average PM"? 
    // Usually dashboard cards update to reflect the "current view", BUT specific labeled cards like "Avg AM" imply a fixed set.
    // Let's calculate them from `rawData` to be constant, unless filtered?
    // User request: "Total Giving, Average AM, Average PM, Average WPM, Services Recorded"
    // Let's calculate these globally from `rawData` so they serve as a dashboard overview.

    const calculateAverage = (type) => {
        const typeRecords = rawData.filter(d => d.serviceType === type);
        if (typeRecords.length === 0) return 0;

        // We need to sum the totals for these records
        let typeTotal = 0;
        typeRecords.forEach(record => {
            if (record.transactions) {
                record.transactions.forEach(tx => {
                    FUNDS.forEach(fund => {
                        typeTotal += (parseFloat(tx[fund]) || 0);
                    });
                });
            }
        });
        return typeTotal / typeRecords.length;
    };

    const avgAM = calculateAverage('Sunday Morning');
    const avgPM = calculateAverage('Sunday Afternoon');
    const avgWPM = calculateAverage('Prayer Meeting (Wed)');


    // --- GRAPHS DATA PREPARATION ---

    // 1. Trends (Line Chart) -> Group by Date
    // If multiple services on same date, usually we want to see them distinct or summed?
    // "Giving Trends" usually implies Total/Date.
    // Let's aggregate by Date.
    const trendData = useMemo(() => {
        const groups = {};
        processedData.forEach(d => {
            if (!groups[d.date]) {
                groups[d.date] = { date: d.date, total: 0, TithesOffering: 0 };
            }
            groups[d.date].total += d.total;
            groups[d.date].TithesOffering += (d.Tithes + d.Offering);
        });

        // Sort by date
        return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
    }, [processedData]);


    // 2. Fund Distribution (Pie Chart) -> specific categories
    // 1. Tithes & Offering (Combined)
    // 2. Mission
    // 3. Building
    // 4. CCM
    // 5. Others
    const pieData = useMemo(() => {
        const totals = {
            'Tithes & Offering': 0,
            'Mission': 0,
            'Building': 0,
            'CCM': 0,
            'Others': 0
        };

        processedData.forEach(d => {
            totals['Tithes & Offering'] += (d.Tithes + d.Offering);
            totals['Mission'] += d.Mission;
            totals['Building'] += d.Building;
            totals['CCM'] += d.CCM;
            totals['Others'] += d.Others;
        });

        // Convert to array for Recharts, filter out zero values to look cleaner
        return Object.keys(totals).map(key => ({
            name: key,
            value: totals[key]
        })).filter(item => item.value > 0);
    }, [processedData]);


    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Header & Filters */}
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Analytics Dashboard</h2>
                <div className="flex gap-2">
                    <select
                        className="p-2 border rounded-md text-sm bg-white shadow-sm"
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                    >
                        <option value="All">All Services</option>
                        <option value="Sunday Morning">Sunday Morning</option>
                        <option value="Sunday Afternoon">Sunday Afternoon</option>
                        <option value="Prayer Meeting (Wed)">Prayer Meeting</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards - Grid of 5 as requested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Giving */}
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <div className="text-xs font-bold uppercase text-emerald-600 mb-1">Total Giving</div>
                    <div className="text-2xl font-bold text-gray-900">₱{totalGiving.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Selected Period</div>
                </div>

                {/* 2. Avg AM */}
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <div className="text-xs font-bold uppercase text-blue-600 mb-1">Average AM</div>
                    <div className="text-2xl font-bold text-gray-900">₱{avgAM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Per Service</div>
                </div>

                {/* 3. Avg PM */}
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500">
                    <div className="text-xs font-bold uppercase text-indigo-600 mb-1">Average PM</div>
                    <div className="text-2xl font-bold text-gray-900">₱{avgPM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Per Service</div>
                </div>

                {/* 4. Avg WPM */}
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <div className="text-xs font-bold uppercase text-purple-600 mb-1">Average WPM</div>
                    <div className="text-2xl font-bold text-gray-900">₱{avgWPM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Per Service</div>
                </div>

                {/* 5. Services Recorded */}
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-gray-500">
                    <div className="text-xs font-bold uppercase text-gray-600 mb-1">Services Recorded</div>
                    <div className="text-2xl font-bold text-gray-900">{servicesRecorded}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Count</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-gray-800">Giving Trends</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Total Giving"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="TithesOffering"
                                name="Tithes & Offering"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Breakdown Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold mb-6 text-gray-800">Fund Distribution</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
