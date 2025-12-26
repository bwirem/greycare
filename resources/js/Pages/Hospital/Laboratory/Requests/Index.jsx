import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faVial, faExclamationTriangle, faRedo, 
    faCheckCircle, faTimesCircle, faBan, 
    faIdCard, faBuilding, faHandHoldingHeart,
    faProcedures // <--- 1. Added Bed Icon for Admission
} from '@fortawesome/free-solid-svg-icons';

export default function RequestsIndex({ requests, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lab Sample Collection Queue</h2>}>
            <Head title="Lab Requests" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* --- Toolbar --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600">
                            Manage pending sample collections.
                            <br/>
                            <span className="text-red-600 font-bold text-xs mr-2"><FontAwesomeIcon icon={faExclamationTriangle} /> Redraws</span> 
                            require immediate priority.
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
                                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">Payment / Status</th>                                    
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
                                        
                                        // --- 1. DETERMINE CATEGORY & FLAGS ---
                                        const isRejected = req.status === 'sample_rejected';
                                        
                                        // Check Admission Status (from Patient Model)
                                        const isAdmitted = req.patient?.is_admitted; // <--- 2. Capture Admission Status

                                        // Robust Payment Logic
                                        const billingGroup = req.visit?.billingGroup;
                                        let category = req.patient?.payment_category || 'Cash';

                                        if (!req.patient?.payment_category && billingGroup) {
                                            if (billingGroup.isexemption) category = 'Exemption';
                                            else if (billingGroup.isinsurance) category = 'Insurance';
                                        }

                                        const isCash      = category === 'Cash';
                                        const isInsurance = category === 'Insurance';
                                        const isExemption = category === 'Exemption';
                                        const isCorporate = category === 'Invoice'; 

                                        // --- 2. PAYMENT STATUS ---
                                        const isPaid = req.payment_status === 'paid';
                                        const isWaived = req.payment_status === 'waived' || isExemption;
                                        

                                        // --- 3. ACCESS CONTROL ---
                                        // Unlock if: Paid OR Waived OR Insurance OR Corporate OR Rejected OR ADMITTED
                                        // Admitted patients usually pay bill upon discharge
                                        const canCollect = !isCash || isPaid || isWaived || isRejected || isAdmitted; // <--- 3. Updated Logic

                                        // Row Background
                                        let rowClass = "hover:bg-blue-50";
                                        if (isRejected) rowClass = "bg-red-50 hover:bg-red-100";
                                        else if (isAdmitted) rowClass = "bg-orange-50 hover:bg-orange-100"; // Optional: Slight highlight for admitted
                                        else if (!canCollect) rowClass = "bg-gray-50 opacity-80"; 

                                        return (
                                            <tr key={req.id} className={`transition-colors duration-150 ${rowClass}`}>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(req.created_at).toLocaleString([], {
                                                        year: 'numeric', month: 'short', day: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900">
                                                        {req.patient?.first_name} {req.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {req.patientcode}
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-bold mt-1">
                                                        {billingGroup?.name || category}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {req.panel?.name}
                                                    </div>
                                                    
                                                    {isRejected && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-800 border border-red-300 shadow-sm animate-pulse">
                                                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                                            Redraw Needed
                                                        </div>
                                                    )}
                                                    
                                                    {req.status === 'Requested' && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                            New Request
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Payment / Admission Status Badge */}
                                                <td className="px-6 py-4 text-center">
                                                    {isAdmitted ? (
                                                        // <--- 4. New Admitted Badge (Priority Display)
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                            <FontAwesomeIcon icon={faProcedures} className="mr-1" /> ADMITTED
                                                        </span>
                                                    ) : isPaid ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> PAID
                                                        </span>
                                                    ) : isExemption || isWaived ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                                            <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1" /> EXEMPT
                                                        </span>
                                                    ) : isInsurance ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                            <FontAwesomeIcon icon={faIdCard} className="mr-1" /> INSURANCE
                                                        </span>
                                                    ) : isCorporate ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                            <FontAwesomeIcon icon={faBuilding} className="mr-1" /> CORPORATE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> UNPAID
                                                        </span>
                                                    )}
                                                </td>                                                

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
                                                            className="inline-flex items-center px-3 py-1.5 rounded text-xs uppercase font-bold bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
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

                    <div className="mt-4">
                        {requests.links && <Pagination links={requests.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}