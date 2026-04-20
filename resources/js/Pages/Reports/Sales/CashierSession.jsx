import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRedo, faPrint } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount, currencyCode = 'TZS') => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return `${currencyCode} 0.00`;
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    return parsedAmount.toLocaleString(locale, { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CashierSessionReport({ auth, reportData, users, stores, filters }) {
    const { data, setData, get, processing, reset } = useForm({
        user_id: filters.user_id || '',
        store_id: filters.store_id || '',
        start_date: filters.start_date || new Date().toISOString().slice(0, 10),
        end_date: filters.end_date || new Date().toISOString().slice(0, 10),
    });

    const handleInputChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.user_id) {
            alert('Please select a cashier.');
            return;
        }
        get(route('reports.sales.cashiersession'), { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        reset();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Cashier Session Report</h2>}
        >
            <Head title="Cashier Session Report" />

            <div className="py-12 print:py-0 print:m-0">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 print:max-w-none print:px-0">
                    
                    {/* Filters Section - Hidden when printing */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 mb-8 print:hidden border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cashier <span className="text-red-500">*</span></label>
                                <select name="user_id" value={data.user_id} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 sm:text-sm" required>
                                    <option value="">Select Cashier...</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store (Optional)</label>
                                <select name="store_id" value={data.store_id} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 sm:text-sm">
                                    <option value="">All Assigned Stores</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <input type="date" name="start_date" value={data.start_date} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                <input type="date" name="end_date" value={data.end_date} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 sm:text-sm" />
                            </div>
                            <div className="flex items-end space-x-2">
                                <button type="submit" disabled={processing || !data.user_id} className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Generate
                                </button>
                                <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors">
                                    <FontAwesomeIcon icon={faRedo} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Highly Polished Report Output Section */}
                    {reportData && data.user_id ? (
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 md:p-12 print:shadow-none print:p-0 border border-gray-200 dark:border-gray-700">
                                                     
                            {/* Data Sections */}
                            <div className="space-y-10 font-serif">
                                <ReportSectionTable 
                                    title="From Sales" 
                                    data={reportData.sections.sales} 
                                />
                                <ReportSectionTable 
                                    title="From Debtors" 
                                    data={reportData.sections.debtors} 
                                />
                                <ReportSectionTable 
                                    title="Totals (Sales + Debtors)" 
                                    data={reportData.sections.totals} 
                                    isGrandTotal={true}
                                />
                            </div>

                            {/* Document Footer */}
                            <div className="mt-16 pt-4 border-t border-gray-300 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-serif text-gray-500 dark:text-gray-400 print:mt-8">
                                <span className="italic">Printed on {new Date().toLocaleString()}</span>
                                <button onClick={handlePrint} className="print:hidden inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print Report
                                </button>
                            </div>
                            
                        </div>
                    ) : !processing && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-10 text-center text-gray-500 dark:text-gray-400 print:hidden border border-gray-200 dark:border-gray-700">
                            <FontAwesomeIcon icon={faFilter} className="text-4xl mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-lg">Please select a cashier and generate to view the Cash Box report.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ==========================================
// Reusable Layout Component
// ==========================================

const ReportSectionTable = ({ title, data, isGrandTotal = false }) => (
    <div className="break-inside-avoid shadow-sm rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        
        {/* Section Header */}
        <div className={`px-5 py-3 border-b border-gray-300 dark:border-gray-600 ${isGrandTotal ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
            <h4 className="text-lg font-bold uppercase tracking-wider">
                {title}
            </h4>
        </div>
        
        {/* Unified Data Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                        <th scope="col" className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-1/4 uppercase tracking-wider">Transaction</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-1/4 uppercase tracking-wider">Cash</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-1/4 uppercase tracking-wider">Advance PM</th>
                        <th scope="col" className="px-5 py-3 text-right font-bold text-gray-800 dark:text-gray-100 w-1/4 uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    
                    {/* Collected Row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">Collected</td>
                        <td className="px-5 py-3.5 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{formatCurrency(data.collected.cash)}</td>
                        <td className="px-5 py-3.5 text-right text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{formatCurrency(data.collected.advance)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800/30">{formatCurrency(data.collected.total)}</td>
                    </tr>
                    
                    {/* Refunds Row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">Refunds Done</td>
                        <td className="px-5 py-3.5 text-right text-red-600 dark:text-red-400 border-r border-gray-200 dark:border-gray-700">{formatCurrency(data.refunds.cash)}</td>
                        <td className="px-5 py-3.5 text-right text-red-600 dark:text-red-400 border-r border-gray-200 dark:border-gray-700">{formatCurrency(data.refunds.advance)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-red-700 dark:text-red-400 bg-red-50/30 dark:bg-red-900/10">{formatCurrency(data.refunds.total)}</td>
                    </tr>
                    
                    {/* Balance Row */}
                    <tr className={`font-bold ${isGrandTotal ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                        <td className="px-5 py-4 border-r border-gray-300 dark:border-gray-600 uppercase tracking-wide">Balance</td>
                        <td className="px-5 py-4 text-right border-r border-gray-300 dark:border-gray-600">{formatCurrency(data.balance.cash)}</td>
                        <td className="px-5 py-4 text-right border-r border-gray-300 dark:border-gray-600">{formatCurrency(data.balance.advance)}</td>
                        <td className="px-5 py-4 text-right text-lg">{formatCurrency(data.balance.total)}</td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
    </div>
);