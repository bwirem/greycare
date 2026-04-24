import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/ResourceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimesCircle as faClose, faEdit, faTrash, faTimesCircle, faTruck } from "@fortawesome/free-solid-svg-icons"; 
import "@fortawesome/fontawesome-svg-core/styles.css";
import { toast } from 'react-toastify'; 

import Modal from '@/Components/CustomModal.jsx';

export default function IndexInterFacilityTransfer({ auth, transfers, filters, flash }) { 
    const { data, setData, clearErrors } = useForm({ 
        search: filters.search || "",
        stage: filters.stage || "1", 
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        transferToDeleteId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        const params = { search: data.search, stage: data.stage };
        Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);
        
        router.get(route("inventory4.index"), params, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    }, [data.search, data.stage]);

    const handleSearchChange = (e) => setData("search", e.target.value);
    const handleStageChange = (newStage) => setData("stage", data.stage === newStage ? "" : newStage);

    const confirmDelete = (id) => {
        setModalState({
            isOpen: true,
            message: "Are you sure you want to delete this transfer record? This action cannot be undone.",
            transferToDeleteId: id,
        });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', transferToDeleteId: null });
        setIsDeleting(false);
    };

    const handleDeleteConfirmed = () => {
        if (!modalState.transferToDeleteId) return;
        setIsDeleting(true);
        router.delete(route("inventory4.destroy", modalState.transferToDeleteId), { 
            onSuccess: () => {
                handleModalClose();
                toast.success("Transfer record deleted successfully.");
            },
            onError: () => {
                handleModalClose();
                toast.error("Failed to delete record.");
            },
            onFinish: () => setIsDeleting(false)
        });
    };

    const resetFilters = () => { setData({ search: "", stage: "1" }); clearErrors(); };

    const stageInfo = {
        1: { label: 'Draft', color: 'bg-yellow-500' },
        2: { label: 'Transferred', color: 'bg-green-500' },
        // 6: { label: 'Cancelled', color: 'bg-red-500' },
    };

    const formatCurrency = (amount) => {
        const parsedAmount = parseFloat(amount);
        return isNaN(parsedAmount) ? '0.00' : parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Inter-Facility Transfers</h2>}>
            <Head title="Transfers List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative flex-grow md:max-w-xs">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                    </div>
                                    <input type="text" placeholder="Search store or facility..." value={data.search} onChange={handleSearchChange}
                                        className="block w-full rounded-md border-gray-300 py-2 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={route("inventory4.create")} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center">
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />New Transfer
                                    </Link>
                                    <button onClick={resetFilters} className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 flex items-center">
                                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />Reset
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Stage</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleStageChange("")} className={`px-3 py-1.5 rounded-md text-sm font-medium ${data.stage === "" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}>All</button>
                                    {Object.entries(stageInfo).map(([key, { label }]) => (
                                        <button key={key} onClick={() => handleStageChange(key)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${data.stage === key ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}>{label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flow-root"><div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"><div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">From Store</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">To Facility</th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total Value</th>
                                        <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Stage</th>
                                        <th className="py-3.5 pl-3 pr-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transfers.data.length > 0 ? transfers.data.map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{transfer.id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transfer.source_store?.name || 'N/A'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-indigo-600 font-semibold"><FontAwesomeIcon icon={faTruck} className="mr-2"/>{transfer.destination_facility?.name || 'N/A'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">{formatCurrency(transfer.total)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${stageInfo[transfer.stage]?.color || 'bg-gray-400'}`}>
                                                    {stageInfo[transfer.stage]?.label || `Stage ${transfer.stage}`}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-3 space-x-2">
                                                <Link href={route("inventory4.edit", transfer.id)} className="rounded-md bg-yellow-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-yellow-400"><FontAwesomeIcon icon={faEdit} /></Link>
                                                {transfer.stage === 1 && ( 
                                                    <button onClick={() => confirmDelete(transfer.id)} className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500"><FontAwesomeIcon icon={faTrash} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="6" className="py-4 text-center text-sm text-gray-500">No transfers found.</td></tr>}
                                </tbody>
                            </table>
                        </div></div></div>
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={handleModalClose} onConfirm={handleDeleteConfirmed} title="Confirm Deletion" message={modalState.message} confirmButtonText={isDeleting ? "Deleting..." : "Yes, Delete"} isProcessing={isDeleting} />
        </AuthenticatedLayout>
    );
}