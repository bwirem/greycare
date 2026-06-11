import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons'; // Added PDF/Excel icons

const formatCurrency = (amount, currencyCode = 'TZS') => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return `${currencyCode} 0.00`;
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    return parsedAmount.toLocaleString(locale, { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function SalesSummaryReport({ auth, reportData, filters, billingGroups }) {
    
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || new Date(new Date().setDate(1)).toISOString().slice(0, 10), 
        end_date: filters.end_date || new Date().toISOString().slice(0, 10), 
        group_by: filters.group_by || 'day',
        billinggroup_id: filters.billinggroup_id || '', 
        ward_id: filters.ward_id || '',
    });

    const handleInputChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('reports.sales.summary'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Helper function to build export URLs cleanly without empty parameters
    const getExportUrl = (format) => {
        const params = { format };
        if (data.start_date) params.start_date = data.start_date;
        if (data.end_date) params.end_date = data.end_date;
        if (data.group_by) params.group_by = data.group_by;
        if (data.billinggroup_id) params.billinggroup_id = data.billinggroup_id;
        if (data.ward_id) params.ward_id = data.ward_id;
        return route('reports.sales.summary.export', params);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Sales Summary Report</h2>}
        >
            <Head title="Sales Summary Report" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                        
                        <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap items-end gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" name="start_date" id="start_date" value={data.start_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                            </div>
                            
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" name="end_date" id="end_date" value={data.end_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                            </div>
                            
                            <div>
                                <label htmlFor="group_by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group By</label>
                                <select name="group_by" id="group_by" value={data.group_by} onChange={handleInputChange} className="mt-1 block w-full min-w-[150px] rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="item_group">Item Group</option>
                                    <option value="product">Product</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="billinggroup_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Group</label>
                                <select 
                                    name="billinggroup_id" 
                                    id="billinggroup_id" 
                                    value={data.billinggroup_id} 
                                    onChange={handleInputChange} 
                                    className="mt-1 block w-full min-w-[200px] rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                    <option value="">All Billing Groups</option>
                                    {billingGroups && billingGroups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="ward_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ward
                                </label>
                                <select
                                    id="ward_id"
                                    name="ward_id"
                                    value={data.ward_id}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                    <option value="">All Patients</option>
                                    <option value="opd">OPD Patients</option>
                                    <option value="ipd">IPD Patients</option>
                                </select>
                            </div>

                            <button type="submit" disabled={processing} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                {processing ? 'Generating...' : 'Generate Report'}
                            </button>

                            {/* Export Buttons */}
                            <div className="flex items-center gap-2 ml-auto">
                                <a 
                                    href={getExportUrl('pdf')} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    title="Export to PDF"
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 h-4 w-4 text-red-600" />
                                    PDF
                                </a>

                                <a 
                                    href={getExportUrl('excel')} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    title="Export to Excel"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2 h-4 w-4 text-green-600" />
                                    Excel
                                </a>
                            </div>
                        </form>

                        {reportData && (
                            <div className="space-y-8">
                                <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
                                    {reportData.report_title}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Dues Amount</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{formatCurrency(reportData.total_dues_amount)}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales Amount</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{formatCurrency(reportData.total_sales_amount)}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{reportData.number_of_transactions}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Discount</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{formatCurrency(reportData.total_discount)}</p>
                                    </div>
                                </div>

                                {reportData.grouped_sales_data && reportData.grouped_sales_data.length > 0 && (
                                     <section>
                                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">{reportData.grouped_data_title}</h4>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                <thead className="bg-gray-100 dark:bg-gray-700/50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            {reportData.group_by_selected === 'item_group' ? 'Group Name' :
                                                             reportData.group_by_selected === 'product' ? 'Product Name' :
                                                             'Period'}
                                                        </th>
                                                        { (reportData.group_by_selected === 'item_group' || reportData.group_by_selected === 'product') &&
                                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Quantity</th>
                                                        }
                                                        { (reportData.group_by_selected === 'day' || reportData.group_by_selected === 'week' || reportData.group_by_selected === 'month') && (
                                                            <>
                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transactions</th>
                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Dues</th>
                                                            </>
                                                        )}
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Sales</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {reportData.grouped_sales_data.map((row, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{row.period_label}</td>
                                                            { (reportData.group_by_selected === 'item_group' || reportData.group_by_selected === 'product') &&
                                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{row.total_quantity}</td>
                                                            }
                                                            { (reportData.group_by_selected === 'day' || reportData.group_by_selected === 'week' || reportData.group_by_selected === 'month') && (
                                                                <>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{row.transactions}</td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{formatCurrency(row.total_dues)}</td>
                                                                </>
                                                            )}
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-300">{formatCurrency(row.total_sales)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}

                                {!reportData.grouped_sales_data?.length && !processing &&
                                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No sales data found for the selected criteria.</p>
                                }

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}