import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10B981', '#2563EB', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

const MOCK_HISTORICAL_DATA = [
    { date: '2025-01-05', service: 'Sunday Morning', total: 15400, Tithes: 10000, Offering: 5400 },
    { date: '2025-01-05', service: 'Sunday Afternoon', total: 8200, Tithes: 5000, Offering: 3200 },
    { date: '2025-01-12', service: 'Sunday Morning', total: 16800, Tithes: 12000, Offering: 4800 },
    { date: '2025-01-12', service: 'Sunday Afternoon', total: 7500, Tithes: 4000, Offering: 3500 },
    { date: '2025-01-19', service: 'Sunday Morning', total: 18200, Tithes: 13000, Offering: 5200 },
];

export function AnalyticsDashboard() {
    const [filterService, setFilterService] = useState('All');

    // In a real app, 'data' would come from a persistent store/backend.
    // We'll use MOCK_HISTORICAL_DATA for tailored demo.

    const filteredData = useMemo(() => {
        if (filterService === 'All') return MOCK_HISTORICAL_DATA;
        return MOCK_HISTORICAL_DATA.filter(d => d.service === filterService);
    }, [filterService]);

    const totalGiving = filteredData.reduce((sum, d) => sum + d.total, 0);
    const avgGiving = totalGiving / (filteredData.length || 1);

    // Prepare Pie Data (Aggregated funds)
    const pieData = [
        { name: 'Tithes', value: filteredData.reduce((sum, d) => sum + d.Tithes, 0) },
        { name: 'Offering', value: filteredData.reduce((sum, d) => sum + d.Offering, 0) },
        // Add other funds if mock data had them
    ];

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Header & Filters */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800" style={{ margin: 0 }}>Analytics Dashboard</h2>
                <div className="flex gap-2">
                    <select
                        className="p-2 border rounded-md"
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                    >
                        <option value="All">All Services</option>
                        <option value="Sunday Morning">Sunday Morning</option>
                        <option value="Sunday Afternoon">Sunday Afternoon</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="card bg-white p-6 shadow-sm" style={{ borderLeft: '4px solid #10B981' }}>
                    <div className="text-secondary text-sm font-bold uppercase" style={{ color: '#059669' }}>Total Giving</div>
                    <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '2rem' }}>{totalGiving.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Selected Period</div>
                </div>
                <div className="card bg-white p-6 shadow-sm" style={{ borderLeft: '4px solid #2563EB' }}>
                    <div className="text-secondary text-sm font-bold uppercase" style={{ color: '#1D4ED8' }}>Average / Service</div>
                    <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '2rem' }}>{avgGiving.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-gray-400 mt-1">Consistency Metric</div>
                </div>
                <div className="card bg-white p-6 shadow-sm" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div className="text-secondary text-sm font-bold uppercase" style={{ color: '#B91C1C' }}>Services Recorded</div>
                    <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '2rem' }}>{filteredData.length}</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
                {/* Trend Chart */}
                <div className="card bg-white p-6 shadow-sm" style={{ height: '400px' }}>
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Giving Trends</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} />
                            <Line type="monotone" dataKey="Tithes" stroke="#2563EB" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Breakdown Chart */}
                <div className="card bg-white p-6 shadow-sm" style={{ height: '400px' }}>
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Fund Distribution</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80} // Reduced outer radius to fit better
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
