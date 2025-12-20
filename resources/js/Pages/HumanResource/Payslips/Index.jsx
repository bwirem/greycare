import React, { useEffect } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileInvoiceDollar, faEye } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, slips, filters }) {
    const { data, setData } = useForm({ 
        search: filters.search || "",
        period: filters.period || ""
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("humanresurces4.index"), { 
                search: data.search,
                period: data.period 
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search, data.period]);

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Employee Payslips</h2>}>
            <Head title="Payslips" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        {/* Search Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search Employee Name or ID..." 
                                    value={data.search} 
                                    onChange={e => setData("search", e.target.value)} 
                                    className="pl-10 rounded-md border-gray-300 w-full" 
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Filter by Period (e.g. Jan 2025)" 
                                    value={data.period} 
                                    onChange={e => setData("period", e.target.value)} 
                                    className="rounded-md border-gray-300 w-full" 
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Period</th>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Job Title</th>
                                        <th className="px-4 py-3 text-right">Net Pay</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {slips.data.map((slip) => (
                                        <tr key={slip.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-700">
                                                {slip.payroll_period?.name}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{slip.employee.first_name} {slip.employee.last_name}</div>
                                                <div className="text-xs text-gray-500">{slip.employee.employee_code}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{slip.job_title_snapshot}</td>
                                            <td className="px-4 py-4 text-right font-bold text-gray-800">
                                                {parseFloat(slip.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${slip.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {slip.is_paid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Link href={route("humanresurces4.show", slip.id)} className="text-blue-600 hover:text-blue-800">
                                                    <FontAwesomeIcon icon={faEye} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {slips.data.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-6 text-gray-500">No payslips found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={slips.links} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}