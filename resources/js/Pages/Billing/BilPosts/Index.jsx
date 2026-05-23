import React, { useEffect, useState, useCallback, useRef } from "react";
import { Head, Link, useForm, router, usePage} from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/FinanceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faPlus,
    faEdit,
    faTrash,
    faEye,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Modal from '@/Components/CustomModal.jsx';

// 1. IMPORT TOAST
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ORDER_STAGE_LABELS = {
    3: 'Pending',
    4: 'Control No Generated', 
};

const DEBOUNCE_DELAY = 300; 

const formatQueueTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// 🔥 Added `error` to the props destructuring
export default function Index({ auth, orders, filters, success, error }) {    
    
    // 2. EXTRACT FLASH DATA FROM PROPS
    const { flash } = usePage().props;
    
    const { data, setData, errors, processing } = useForm({
        search: filters.search || "",
        stage: filters.stage || "",
        start_date: filters.start_date, 
        end_date: filters.end_date,   
    });

    const[modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        orderToDeleteId: null,
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false); // 🔥 Added error modal state
    const searchTimeoutRef = useRef(null);

    // --- 3. PRINTING LOGIC ---
    const triggerPrint = (responseData) => {
        if (!responseData) return;

        // Case 1: Auto Print via hidden iframe
        if (responseData.auto_print && responseData.preview_url) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = responseData.preview_url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            };
            return;
        }

        // Case 2: Open in new tab (Preview)
        if (responseData.preview_url) {
            window.open(responseData.preview_url, '_blank');
        }
    };
    
    // Catch the flash message containing print instructions when the page loads
    useEffect(() => {
        if (flash && flash.print_response) {
            // Show Success Toast
            if (flash.print_response.message) {
                toast.success(flash.print_response.message);
            }
            
            // Trigger the print popup/iframe
            triggerPrint(flash.print_response);
            
            // Clear flash to prevent it from firing again if the user navigates back
            flash.print_response = null; 
        }
    }, [flash]);

    // 🔥 Effect handles both success and error flashes
    useEffect(() => {
        if (success) setShowSuccessModal(true);
        if (error) setShowErrorModal(true);
    }, [success, error]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("billing1.index"), data, {
                preserveState: true,
                preserveScroll: true, 
                replace: true,        
            });
        }, DEBOUNCE_DELAY);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [data]); 

    const handleSearchChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(name, value);
    }, [setData]);

    const handleStageChange = useCallback((stage) => {
        setData("stage", stage);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        setModalState({
            isOpen: true,
            message: "Are you sure you want to delete this item? This action cannot be undone.",
            isAlert: false,
            orderToDeleteId: id,
        });
    },[]);

    const handleModalClose = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    },[]);

    const showAlert = useCallback((message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: true,
            orderToDeleteId: null,
        });
    },[]);

    const handleModalConfirm = useCallback(() => {
        if (!modalState.orderToDeleteId) return;

        router.delete(route("billing1.destroy", modalState.orderToDeleteId), {
            onSuccess: () => {
                setModalState({ isOpen: false, message: '', isAlert: false, orderToDeleteId: null });
            },
            onError: (errorResponse) => {
                showAlert((errorResponse && errorResponse.message) || "There was an error deleting the item.");
            },
        });
    },[modalState.orderToDeleteId, showAlert]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Post List</h2>}
        >
            <Head title="Post List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header Actions & Filters */}
                            <div className="mb-6 flex flex-col gap-4">
                                {/* Row 1: Date and Search */}
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={data.start_date}
                                            onChange={handleSearchChange}
                                            className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.start_date ? "border-red-500" : ""}`}
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={data.end_date}
                                            onChange={handleSearchChange}
                                            className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.end_date ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                    <div className="relative flex items-center">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Search by customer name"
                                            value={data.search}
                                            onChange={handleSearchChange}
                                            className={`w-full rounded-md border-gray-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-64 ${errors.search ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Create Button and Stage Filters */}
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <Link
                                        href={route("billing1.create")}
                                        className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 md:w-auto"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" /> Create
                                    </Link>
                                    <ul className="flex flex-wrap items-center gap-2">
                                        <li
                                            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium flex items-center ${data.stage === "" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                            onClick={() => handleStageChange("")}
                                        >
                                            All
                                        </li>
                                        {Object.entries(ORDER_STAGE_LABELS).map(([key, label]) => (
                                            <li
                                                key={key}
                                                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium flex items-center ${data.stage === key ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                                onClick={() => handleStageChange(key)}
                                            >
                                                {label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Queue Time</th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Stage</th>
                                            <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.data.length > 0 ? (
                                            orders.data.map((order) => {
                                                const isEditStage = order.stage === 3;
                                                const actionButtonText = isEditStage ? "Process" : "Payment";
                                                const actionButtonTitle = isEditStage ? "Edit Item" : "Preview Item";
                                                const actionButtonIcon = isEditStage ? faEdit : faEye;
                                                const actionButtonBgColor = isEditStage ? "bg-yellow-500 hover:bg-yellow-600" : "bg-sky-500 hover:bg-sky-600";

                                                return (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                                                            {order.customer.customer_type === 'individual' ?
                                                                `${order.customer.first_name} ${order.customer.other_names || ''} ${order.customer.surname}`.replace(/\s+/g, ' ').trim() :
                                                                order.customer.company_name
                                                            }
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                                                            {formatQueueTime(order.created_at)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">
                                                            {parseFloat(order.total).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                                                            {ORDER_STAGE_LABELS[order.stage] || 'Unknown Stage'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <Link
                                                                    href={route("billing1.edit", order.id)}
                                                                    className={`flex items-center rounded px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm ${actionButtonBgColor}`}
                                                                    title={actionButtonTitle}
                                                                >
                                                                    <FontAwesomeIcon icon={actionButtonIcon} className="mr-1.5 h-3 w-3" />
                                                                    {actionButtonText}
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="whitespace-nowrap px-4 py-10 text-center text-sm text-gray-500">
                                                    No items found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onConfirm={() => setShowSuccessModal(false)}
                title="Success"
                isAlert={true}
                confirmButtonText="OK"
            >
                <p className="text-sm text-gray-600">{success}</p>
            </Modal>

            {/* 🔥 ADDED: Error Modal (Handles the Redirect with Error) */}
            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                onConfirm={() => setShowErrorModal(false)}
                title="API Gateway Error"
                isAlert={true}
                confirmButtonText="OK"
            >
                <div className="flex flex-col text-center">
                    <p className="text-sm text-red-600 font-semibold mb-2">Order aborted because:</p>
                    <p className="text-sm text-gray-800 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
                </div>
            </Modal>

            {/* Confirmation/Alert Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={modalState.isAlert ? handleModalClose : handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Deletion"}
                isAlert={modalState.isAlert}
                isProcessing={processing && modalState.orderToDeleteId !== null}
                confirmButtonText={modalState.isAlert ? "OK" : (processing ? "Deleting..." : "Confirm Delete")}
            >
                 <p className="text-sm text-gray-600">{modalState.message}</p>
            </Modal>
        </AuthenticatedLayout>
    );
}