import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faVial, 
    faExclamationTriangle, 
    faRedo, 
    faCheckCircle, 
    faTimesCircle, 
    faBan 
} from '@fortawesome/free-solid-svg-icons';

export default function RequestsIndex({ requests, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');

    // 1. Handle Flash Messages
    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Lab Test Requests</h2>}>
            <Head title="Lab Requests" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* --- Toolbar --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600">
                            Manage pending sample collections.
                            <br/>
                            <span className="text-red-600 font-bold text-xs mr-2"><FontAwesomeIcon icon={faExclamationTriangle} /> Redraws</span> 
                            require immediate attention.
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient Name or ID..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton>
                                <FontAwesomeIcon icon={faSearch} />
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* --- Data Table --- */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Test Panel</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">Payment</th>                                    
                                    <th className="px-6 py-3 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">
                                            No pending sample requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => {
                                        
                                        // --- LOGIC CHECKS ---
                                        const isRejected = req.status === 'sample_rejected';
                                        
                                        // Check payment status from the request or parent visit/bill
                                        // Ensure your backend sends 'payment_status' or you check 'req.bill_item?.status'
                                        const isPaid = req.payment_status === 'paid' || req.payment_status === 'waived';
                                        
                                        // If it is a Redraw (Rejected), we allow collection regardless of payment (usually)
                                        // If it is New, we check for Payment.
                                        const canCollect = isRejected || isPaid;

                                        // Row Background logic
                                        let rowClass = "hover:bg-blue-50";
                                        if (isRejected) rowClass = "bg-red-50 hover:bg-red-100";
                                        else if (!isPaid) rowClass = "bg-gray-50 opacity-90"; // Dim unpaid rows slightly

                                        return (
                                            <tr key={req.id} className={`transition-colors duration-150 ${rowClass}`}>
                                                
                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(req.created_at).toLocaleString([], {
                                                        year: 'numeric', month: 'short', day: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>

                                                {/* Patient */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900">
                                                        {req.patient?.first_name} {req.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {req.patientcode}
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-medium">
                                                        {req.visit?.billing_group?.name || 'Cash'}
                                                    </div>
                                                </td>

                                                {/* Test Panel & Status Indicators */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {req.panel?.name}
                                                    </div>
                                                    
                                                    {/* Rejected Badge */}
                                                    {isRejected && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800 border border-red-300 shadow-sm">
                                                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                                            Redraw Needed
                                                        </div>
                                                    )}
                                                    
                                                    {/* New Request Badge */}
                                                    {req.status === 'Requested' && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                            New Request
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Payment Status */}
                                                <td className="px-6 py-4 text-center">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Unpaid
                                                        </span>
                                                    )}
                                                </td>                                                

                                                {/* Action Button */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {canCollect ? (
                                                        <Link 
                                                            href={route('laboratory0.create', req.id)}
                                                            className={`inline-flex items-center px-3 py-1.5 rounded text-xs uppercase font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                                isRejected 
                                                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                                                            }`}
                                                        >
                                                            {isRejected ? (
                                                                <>
                                                                    <FontAwesomeIcon icon={faRedo} className="mr-2" /> Re-Collect
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FontAwesomeIcon icon={faVial} className="mr-2" /> Collect
                                                                </>
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <button 
                                                            disabled 
                                                            className="inline-flex items-center px-3 py-1.5 rounded text-xs uppercase font-bold bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                                            title="Patient must pay before collection"
                                                        >
                                                            <FontAwesomeIcon icon={faBan} className="mr-2" /> Locked
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Pagination --- */}
                    <div className="mt-4">
                        {requests.links && <Pagination links={requests.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}