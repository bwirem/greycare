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
    faProcedures, faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function RequestsIndex({ requests, filters, flash }) {
    // 1. Initialize State with filters passed from Controller
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    // 2. Update Search Handler to include both Search and Date
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory0.index'), { search, date }, { preserveState: true });
    };

    // Grouping Logic (Kept from previous step)
    const groupedRequests = requests.data.reduce((groups, req) => {
        const key = req.patientcode;
        if (!groups[key]) groups[key] = [];
        groups[key].push(req);
        return groups;
    }, {});

    return (
        <HospitalLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lab Sample Collection Queue</h2>}>
            <Head title="Lab Requests" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* --- Toolbar --- */}
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600 mb-2 lg:mb-0">
                            Manage pending sample collections.
                            <br/>
                            <span className="text-red-600 font-bold text-xs mr-2"><FontAwesomeIcon icon={faExclamationTriangle} /> Redraws</span> 
                            require immediate priority.
                        </div>

                        {/* 3. Updated Form with Date Input */}
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            
                            {/* Date Picker */}                            
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                </span>
                                <TextInput 
                                    type="date"
                                    className="pl-10 w-full sm:w-40"
                                    value={date}
                                    onChange={e => {
                                        const newDate = e.target.value;
                                        setDate(newDate);
                                        // Trigger search immediately when date is picked
                                        router.get(
                                            route('laboratory0.index'), 
                                            { search, date: newDate }, 
                                            { preserveState: true, replace: true }
                                        );
                                    }}
                                />
                            </div>

                            {/* Search Input */}
                            <div className="flex gap-2 w-full sm:w-64">
                                <TextInput 
                                    className="w-full"
                                    placeholder="Search Patient Name or ID..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <PrimaryButton type="submit">
                                    <FontAwesomeIcon icon={faSearch} />
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* --- Data Table --- */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider w-1/12">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider w-3/12">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider w-3/12">Test Panel</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-800 uppercase tracking-wider w-3/12">Payment / Status</th>                                    
                                    <th className="px-6 py-3 text-right text-xs font-bold text-blue-800 uppercase tracking-wider w-2/12">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(groupedRequests).length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                            No pending sample requests found for this date/search.
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(groupedRequests).map(([patientCode, groupItems]) => {
                                        const patientReq = groupItems[0];
                                        const patient = patientReq.patient;
                                        const visit = patientReq.visit;
                                        
                                        const billingGroup = visit?.billingGroup;
                                        let category = patient?.payment_category || 'Cash';
                                        if (!patient?.payment_category && billingGroup) {
                                            if (billingGroup.isexemption) category = 'Exemption';
                                            else if (billingGroup.isinsurance) category = 'Insurance';
                                        }

                                        const hasRejection = groupItems.some(item => item.status === 'sample_rejected');
                                        const isAdmitted = patient?.is_admitted;
                                        
                                        let rowClass = "hover:bg-blue-50";
                                        if (hasRejection) rowClass = "bg-red-50 hover:bg-red-100";
                                        else if (isAdmitted) rowClass = "bg-orange-50 hover:bg-orange-100";

                                        return (
                                            <tr key={patientCode} className={`transition-colors duration-150 ${rowClass} border-b border-gray-200`}>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                                     {new Date(patientReq.created_at).toLocaleString([], {
                                                        year: 'numeric', month: 'short', day: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                                    <div className="font-bold text-gray-900 text-base">
                                                        {patient?.first_name} {patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {patientCode}
                                                    </div>
                                                    <div className="text-xs text-blue-600 font-bold mt-1">
                                                        {billingGroup?.name || category}
                                                    </div>
                                                    {isAdmitted && (
                                                        <div className="mt-2">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-200 text-orange-900 border border-orange-300">
                                                                <FontAwesomeIcon icon={faProcedures} className="mr-1" /> ADMITTED
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-3">
                                                        {groupItems.map((req) => {
                                                            const isRejected = req.status === 'sample_rejected';
                                                            return (
                                                                <div key={req.id} className="flex items-center h-8">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {req.panel?.name}
                                                                        {isRejected && (
                                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-800 animate-pulse">
                                                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                                                            </span>
                                                                        )}
                                                                        {req.status === 'Requested' && (
                                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-600">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-3 items-center">
                                                        {groupItems.map((req) => {
                                                            const isPaid = req.payment_status === 'paid';
                                                            const isExemption = category === 'Exemption';
                                                            const isWaived = req.payment_status === 'waived' || isExemption;
                                                            const isInsurance = category === 'Insurance';
                                                            const isCorporate = category === 'Invoice';

                                                            return (
                                                                <div key={req.id} className="h-8 flex items-center justify-center">
                                                                    {isAdmitted ? (
                                                                         <span className="text-xs font-bold text-orange-600">
                                                                            <FontAwesomeIcon icon={faProcedures} />
                                                                         </span>
                                                                    ) : isPaid ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> PAID
                                                                        </span>
                                                                    ) : isWaived ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                                                            <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1" /> EXEMPT
                                                                        </span>
                                                                    ) : isInsurance ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                                            <FontAwesomeIcon icon={faIdCard} className="mr-1" /> INS
                                                                        </span>
                                                                    ) : isCorporate ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                                            <FontAwesomeIcon icon={faBuilding} className="mr-1" /> CORP
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> UNPAID
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>                                                

                                                <td className="px-6 py-4 align-top text-right">
                                                    <div className="flex flex-col gap-3 items-end">
                                                        {groupItems.map((req) => {
                                                            const isPaid = req.payment_status === 'paid';
                                                            const isExemption = category === 'Exemption';
                                                            const isWaived = req.payment_status === 'waived' || isExemption;
                                                            const isRejected = req.status === 'sample_rejected';
                                                            const isCash = category === 'Cash';
                                                            
                                                            //const canCollect = !isCash || isPaid || isWaived || isRejected || isAdmitted;
                                                            const canCollect = !isCash || isPaid || isWaived || isRejected;

                                                            return (
                                                                <div key={req.id} className="h-8 flex items-center">
                                                                    {canCollect ? (
                                                                        <Link 
                                                                            href={route('laboratory0.create', req.id)}
                                                                            className={`inline-flex items-center px-3 py-1 rounded text-[10px] uppercase font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                                                isRejected 
                                                                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                                                                            }`}
                                                                        >
                                                                            {isRejected ? (
                                                                                <FontAwesomeIcon icon={faRedo} />
                                                                            ) : (
                                                                                <FontAwesomeIcon icon={faVial} />
                                                                            )}
                                                                            <span className="ml-2">Collect</span>
                                                                        </Link>
                                                                    ) : (
                                                                        <button 
                                                                            disabled 
                                                                            className="inline-flex items-center px-3 py-1 rounded text-[10px] uppercase font-bold bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                                                                            title="Patient must pay before collection"
                                                                        >
                                                                            <FontAwesomeIcon icon={faBan} className="mr-1" /> Lock
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
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