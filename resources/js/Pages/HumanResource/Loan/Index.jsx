import React, { useEffect } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import HumanResourceLayout from "@/Layouts/HumanResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faStopCircle, faListAlt, faHandHoldingUsd } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import Modal from '@/Components/CustomModal';

export default function Index({ auth, loans, filters, flash }) {
    const { data, setData } = useForm({ 
        search: filters.search || "", 
        status: filters.status || "" 
    });
    
    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route("humanresurces2.index"), { search: data.search, status: data.status }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search, data.status]);

    const handleStop = (id) => {
        if(confirm("Stop this loan deduction? It will be marked inactive.")) {
            router.post(route('humanresurces2.stop', id));
        }
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Loans & Advances</h2>}>
            <Head title="Loans" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash.success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">{flash.success}</div>}
                    
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search Employee..." 
                                        value={data.search} 
                                        onChange={e => setData("search", e.target.value)} 
                                        className="pl-10 rounded-md border-gray-300 w-full" 
                                    />
                                </div>
                                <select 
                                    value={data.status} 
                                    onChange={e => setData("status", e.target.value)} 
                                    className="rounded-md border-gray-300"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed/Stopped</option>
                                </select>
                            </div>
                            <Link href={route("humanresurces2.create")} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Loan
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Reference</th>
                                        <th className="px-4 py-3 text-left">Principal</th>
                                        <th className="px-4 py-3 text-left">Balance</th>
                                        <th className="px-4 py-3 text-left">Installment</th>
                                        <th className="px-4 py-3 text-left">Source</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loans.data.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{loan.employee.first_name} {loan.employee.last_name}</div>
                                                <div className="text-xs text-gray-500">{loan.employee.employee_code}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{loan.loan_reference || '-'}</td>
                                            <td className="px-4 py-4 font-mono">{parseFloat(loan.principal_amount).toLocaleString()}</td>
                                            <td className="px-4 py-4 font-mono font-bold text-orange-700">{parseFloat(loan.current_balance).toLocaleString()}</td>
                                            <td className="px-4 py-4 font-mono text-sm">{parseFloat(loan.monthly_installment).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-sm">{loan.financier ? loan.financier.name : 'Company'}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${loan.is_active && loan.current_balance > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {loan.is_active && loan.current_balance > 0 ? 'Active' : 'Completed'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center space-x-2">
                                                <Link href={route("humanresurces2.edit", loan.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <Link href={route("humanresurces2.schedule", loan.id)} className="text-purple-600 hover:text-purple-800" title="View Schedule">
                                                    <FontAwesomeIcon icon={faListAlt} />
                                                </Link>
                                                {loan.is_active && (
                                                    <button onClick={() => handleStop(loan.id)} className="text-red-500 hover:text-red-700" title="Stop Deduction">
                                                        <FontAwesomeIcon icon={faStopCircle} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {loans.data.length === 0 && (
                                        <tr><td colSpan="8" className="text-center py-6 text-gray-500">No loans found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={loans.links} />
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}