import React, { useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/FinanceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye, faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons"; 
import "@fortawesome/fontawesome-svg-core/styles.css";

const DEBOUNCE_DELAY = 300;

export default function Index({ auth, sales, filters, billingGroups }) {
    
    // Initialize form state with filters
    const { data, setData, errors } = useForm({
        search: filters.search || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
        billinggroup_id: filters.billinggroup_id || "", 
    });

    const searchTimeoutRef = useRef(null);

    // Watch for changes in any filter and trigger a reload
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("billing3.salehistory"), {
                search: data.search,
                start_date: data.start_date,
                end_date: data.end_date,
                billinggroup_id: data.billinggroup_id,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, DEBOUNCE_DELAY);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [data.search, data.start_date, data.end_date, data.billinggroup_id]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(name, value);
    }, [setData]);

    // Helper function to build the export URL without empty parameters
    const getExportUrl = (format) => {
        const params = { format }; // Always include 'pdf' or 'excel'
        
        if (data.start_date) params.start_date = data.start_date;
        if (data.end_date) params.end_date = data.end_date;
        if (data.search) params.search = data.search;
        if (data.billinggroup_id) params.billinggroup_id = data.billinggroup_id;

        return route('billing3.export', params);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Sales History</h2>}
        >
            <Head title="Sales History" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            {/* Filter Section - All on the same row (wraps on small screens) */}
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                {/* Date Range */}
                                <input 
                                    type="date" 
                                    name="start_date" 
                                    value={data.start_date} 
                                    onChange={handleFormChange} 
                                    className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.start_date ? "border-red-500" : ""}`} 
                                />
                                <span className="text-gray-500 hidden sm:inline">to</span>
                                <input 
                                    type="date" 
                                    name="end_date" 
                                    value={data.end_date} 
                                    onChange={handleFormChange} 
                                    className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.end_date ? "border-red-500" : ""}`} 
                                />
                                
                                {/* Billing Group Dropdown */}
                                <select
                                    name="billinggroup_id"
                                    value={data.billinggroup_id}
                                    onChange={handleFormChange}
                                    className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-w-[180px] ${errors.billinggroup_id ? "border-red-500" : ""}`}
                                >
                                    <option value="">All Billing Groups</option>
                                    {billingGroups && billingGroups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Search Input */}
                                <div className="relative flex items-center flex-grow sm:flex-grow-0">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                                    <input 
                                        type="text" 
                                        name="search" 
                                        placeholder="Search by customer or invoice" 
                                        value={data.search} 
                                        onChange={handleFormChange} 
                                        className={`w-full rounded-md border-gray-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:w-64 md:w-80 ${errors.search ? "border-red-500" : ""}`} 
                                    />
                                </div>

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
                            </div>

                            {/* Sales Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">Total Due</th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">Total Paid</th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">Balance</th>
                                            <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sales.data.length > 0 ? (
                                            sales.data.map((sale) => (
                                                <tr key={sale.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">{sale.customer.customer_type === 'individual' ? `${sale.customer.first_name} ${sale.customer.surname}`.trim() : sale.customer.company_name}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">{parseFloat(sale.totaldue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">{parseFloat(sale.totalpaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">{parseFloat(sale.totaldue - sale.totalpaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                                                        <div className="flex items-center justify-center">
                                                            <Link href={route("billing3.preview", sale.id)} className="flex items-center rounded bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600" title="Preview Sale">
                                                                <FontAwesomeIcon icon={faEye} className="mr-1.5 h-3 w-3" /> Preview
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="whitespace-nowrap px-4 py-10 text-center text-sm text-gray-500">No sales found matching your criteria.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}