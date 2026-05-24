import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, router } from '@inertiajs/react';

export default function DiagnosisReport({ auth, data, filters }) {
    
    // Using standard React state for GET queries is the most reliable method in Inertia
    const [searchData, setSearchData] = useState({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        report_type: filters?.report_type || 'icd',
    });
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        // Ensure this matches your exact route name in web.php
        router.get(route('reports.doctor.diagnosis'), searchData, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    // Safely calculate totals for the footer
    const calculateTotals = () => {
        let totals = {
            u1m: { m: 0, f: 0, t: 0 },
            '1m1y': { m: 0, f: 0, t: 0 },
            '1y5y': { m: 0, f: 0, t: 0 },
            '5y60': { m: 0, f: 0, t: 0 },
            o60y: { m: 0, f: 0, t: 0 },
            grand: { m: 0, f: 0, t: 0 },
        };

        if (data && data.length > 0) {
            data.forEach(row => {
                Object.keys(totals).forEach(key => {
                    totals[key].m += Number(row.stats[key]?.m) || 0;
                    totals[key].f += Number(row.stats[key]?.f) || 0;
                    totals[key].t += Number(row.stats[key]?.t) || 0;
                });
            });
        }
        return totals;
    };

    const footerTotals = calculateTotals();

    const getTitle = () => {
        if(searchData.report_type === 'opd') return "OPD MTUHA Morbidity Report";
        if(searchData.report_type === 'ipd') return "IPD MTUHA Morbidity Report";
        return "Global ICD-10 Morbidity Report";
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Morbidity Report</h2>}>
            <Head title="Diagnosis Report" />

            <div className="py-8">
                <div className="mx-auto w-full px-2 sm:px-4 lg:px-6">
                    
                    {/* Filters Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Report Type</label>
                                <select
                                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={searchData.report_type}
                                    onChange={e => setSearchData({...searchData, report_type: e.target.value})}
                                >
                                    <option value="icd">ICD-10 (All Contexts)</option>
                                    <option value="opd">Outpatient (OPD MTUHA)</option>
                                    <option value="ipd">Inpatient (IPD MTUHA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Start Date</label>
                                <input
                                    type="date"
                                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={searchData.start_date}
                                    onChange={e => setSearchData({...searchData, start_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">End Date</label>
                                <input
                                    type="date"
                                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={searchData.end_date}
                                    onChange={e => setSearchData({...searchData, end_date: e.target.value})}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow transition font-medium text-sm disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Generate Report'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Report Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-300 dark:border-gray-600 overflow-x-auto">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white uppercase">{getTitle()}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Generated: {new Date().toLocaleDateString()}</span>
                        </div>
                        
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border-collapse">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th rowSpan="2" className="px-2 py-2 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase w-10">No.</th>
                                    <th rowSpan="2" className="px-2 py-2 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase w-64">Diagnosis Description</th>
                                    
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">Age &lt; 1 Month</th>
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">1 Month - 1 Year</th>
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">1 Year - 5 Years</th>
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">5 Years - 60 Years</th>
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">Age &gt; 60 Years</th>
                                    <th colSpan="3" className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-500">Grand Total</th>
                                </tr>
                                <tr>
                                    {[...Array(6)].map((_, i) => (
                                        <React.Fragment key={`header-group-${i}`}>
                                            <th className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase w-8">M</th>
                                            <th className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase w-8">F</th>
                                            <th className="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center text-[10px] font-bold text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-600 uppercase w-10">Tot</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data && data.length > 0 ? (
                                    data.map((row, index) => (
                                        <tr key={`row-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-2 py-1 border-r border-gray-200 dark:border-gray-600 text-center text-xs text-gray-500 dark:text-gray-400">{index + 1}</td>
                                            <td className="px-2 py-1 border-r border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-800 dark:text-gray-200">
                                                {row.name}
                                                {row.code && <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-mono">({row.code})</span>}
                                            </td>

                                            {/* U 1M */}
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats.u1m.m}</td>
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats.u1m.f}</td>
                                            <td className="px-1 text-center text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-900">{row.stats.u1m.t}</td>

                                            {/* 1M - 1Y */}
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['1m1y'].m}</td>
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['1m1y'].f}</td>
                                            <td className="px-1 text-center text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-900">{row.stats['1m1y'].t}</td>

                                            {/* 1Y - 5Y */}
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['1y5y'].m}</td>
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['1y5y'].f}</td>
                                            <td className="px-1 text-center text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-900">{row.stats['1y5y'].t}</td>

                                            {/* 5Y - 60Y */}
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['5y60'].m}</td>
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats['5y60'].f}</td>
                                            <td className="px-1 text-center text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-900">{row.stats['5y60'].t}</td>

                                            {/* > 60Y */}
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats.o60y.m}</td>
                                            <td className="px-1 text-center text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{row.stats.o60y.f}</td>
                                            <td className="px-1 text-center text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-900">{row.stats.o60y.t}</td>

                                            {/* Grand */}
                                            <td className="px-1 text-center text-xs text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">{row.stats.grand.m}</td>
                                            <td className="px-1 text-center text-xs text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">{row.stats.grand.f}</td>
                                            <td className="px-1 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-gray-800">{row.stats.grand.t}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="20" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No data available for the selected period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-200 dark:bg-gray-700 border-t-2 border-gray-400">
                                <tr>
                                    <td colSpan="2" className="px-2 py-2 text-right font-bold text-xs uppercase text-gray-700 dark:text-gray-200">TOTALS:</td>
                                    {['u1m', '1m1y', '1y5y', '5y60', 'o60y', 'grand'].map((key) => (
                                        <React.Fragment key={`footer-${key}`}>
                                            <td className="px-1 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{footerTotals[key].m}</td>
                                            <td className="px-1 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{footerTotals[key].f}</td>
                                            <td className="px-1 text-center text-xs font-bold text-gray-900 dark:text-white bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500">{footerTotals[key].t}</td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}