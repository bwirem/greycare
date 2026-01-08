import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faTimesCircle, 
    faCamera, 
    faBan, 
    faExclamationTriangle,
    faSearch,
    faTimes,
    faIdCard,
    faBuilding,
    faHandHoldingHeart,
    faProcedures // <--- 1. Added Bed Icon
} from '@fortawesome/free-solid-svg-icons';

export default function RadRequestsIndex({ requests, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    
    // --- Modal States ---
    const [modalState, setModalState] = useState({
        type: null, // 'capture' or 'reject'
        isOpen: false,
        selectedId: null
    });
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // 1. Handle Flash Messages
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // 2. Search Logic
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('radiology0.index'), { search }, { preserveState: true });
    };

    // --- Modal Handlers ---

    const openCaptureModal = (id) => {
        setModalState({ type: 'capture', isOpen: true, selectedId: id });
    };

    const openRejectModal = (id) => {
        setRejectReason(''); 
        setModalState({ type: 'reject', isOpen: true, selectedId: id });
    };

    const closeModal = () => {
        setModalState({ type: null, isOpen: false, selectedId: null });
        setRejectReason('');
        setProcessing(false);
    };

    // --- Action Submitters ---

    const submitCapture = () => {
        setProcessing(true);
        router.post(route('radiology0.process', modalState.selectedId), {}, {
            onSuccess: () => {
                closeModal();
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    const submitReject = (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            toast.error("Please enter a reason for rejection.");
            return;
        }

        setProcessing(true);
        router.post(route('radiology0.reject', modalState.selectedId), { 
            reason: rejectReason 
        }, {
            onSuccess: () => {
                closeModal();
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Radiology Worklist</h2>}>
            <Head title="Imaging Requests" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                </div>
                                <TextInput 
                                    className="w-full pl-10"
                                    placeholder="Search Patient Code or Name..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <PrimaryButton>Search</PrimaryButton>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure / Modality</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                            No pending imaging requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => {
                                        // --- 1. DETERMINE CATEGORY & FLAGS ---
                                        const billingGroup = req.booking?.billing_group || req.booking?.billingGroup; 
                                        
                                        // Check Admission
                                        const isAdmitted = req.patient?.is_admitted; // <--- 2. Get Admission Status

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
                                        // Allow if: Paid OR Waived OR Insurance OR Corporate OR ADMITTED
                                        //const canProceed = !isCash || isPaid || isWaived || isAdmitted; // <--- 3. Updated Logic
                                        const canProceed = !isCash || isPaid || isWaived; // <--- 3. Updated Logic

                                        // Determine Row Class
                                        let rowClass = "hover:bg-gray-50 transition-colors";
                                        if (isAdmitted) rowClass = "bg-orange-50 hover:bg-orange-100 transition-colors";
                                        else if (!canProceed) rowClass = "bg-red-50/30 hover:bg-red-50/50 transition-colors";

                                        return (
                                            <tr key={req.id} className={rowClass}>
                                                
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(req.created_at).toLocaleString([], {
                                                        dateStyle: 'short', timeStyle: 'short'
                                                    })}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{req.patient?.first_name} {req.patient?.last_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{req.patientcode}</div>
                                                    <div className="text-xs text-blue-600 mt-1 font-bold">
                                                        {billingGroup?.name || category}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{req.procedure?.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                            {req.procedure?.modality?.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Dr. {req.requested_by?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                {/* Payment / Admission Status Badge */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {isAdmitted ? (
                                                        // <--- 4. New Admitted Badge
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                            <FontAwesomeIcon icon={faProcedures} className="mr-1.5" /> Admitted
                                                        </span>
                                                    ) : isPaid ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5" /> Paid
                                                        </span>
                                                    ) : isExemption || isWaived ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1.5" /> Exempt
                                                        </span>
                                                    ) : isInsurance ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <FontAwesomeIcon icon={faIdCard} className="mr-1.5" /> Insurance
                                                        </span>
                                                    ) : isCorporate ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            <FontAwesomeIcon icon={faBuilding} className="mr-1.5" /> Corporate
                                                        </span>
                                                    ) : (
                                                        // Cash + Unpaid
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1.5" /> Unpaid
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                                                    {canProceed ? (
                                                        <button 
                                                            onClick={() => openCaptureModal(req.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-green-700 transition shadow-sm"
                                                            title="Mark Image Captured"
                                                        >
                                                            <FontAwesomeIcon icon={faCamera} className="mr-1.5" /> Capture
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            disabled
                                                            className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-500 text-xs font-bold uppercase tracking-wider rounded cursor-not-allowed"
                                                            title="Payment Required"
                                                        >
                                                            <FontAwesomeIcon icon={faBan} className="mr-1.5" /> Locked
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => openRejectModal(req.id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-wider transition"
                                                        title="Reject Request"
                                                    >
                                                        Reject
                                                    </button>
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

            {/* --- 1. CAPTURE CONFIRMATION MODAL --- */}
            <Modal show={modalState.isOpen && modalState.type === 'capture'} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Confirm Image Capture
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to mark this request as captured? 
                        The patient will be moved to the Radiologist's reporting queue.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={closeModal} 
                            disabled={processing}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={submitCapture} 
                            disabled={processing}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
                        >
                            {processing && <FontAwesomeIcon icon={faExclamationTriangle} spin className="mr-2" />}
                            Confirm Capture
                        </button>
                    </div>
                </div>
            </Modal>

            {/* --- 2. REJECTION MODAL --- */}
            <Modal show={modalState.isOpen && modalState.type === 'reject'} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-red-600">Reject Request</h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    
                    <form onSubmit={submitReject}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection *</label>
                            <textarea 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                                rows="3"
                                placeholder="e.g. Duplicate request, Patient refused, Wrong procedure..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={closeModal} 
                                disabled={processing}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                            >
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

        </HospitalLayout>
    );
}