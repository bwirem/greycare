import React, { useEffect, useState, useCallback, useRef } from "react";
import { Head, Link, useForm, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/FinanceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Modal from '@/Components/CustomModal.jsx';

// IMPORT TOAST
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define constants outside the component
const DEBTOR_STAGE_LABELS = {
    1: 'Partial',
    2: 'Complete',
};

const DEBOUNCE_DELAY = 300; 

export default function Index({ auth, debtors, filters, success, error, billing_groups = [] }) {
    
    // EXTRACT FLASH DATA FROM PROPS
    const { flash } = usePage().props;

    const { data, setData, errors, processing } = useForm({ 
        search: filters.search || "",
        stage: filters.stage || "",
        group_id: filters.group_id || "", // Billing Group Dropdown
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Ref for debouncing
    const searchTimeoutRef = useRef(null);

    // --- PRINTING LOGIC ---
    const triggerPrint = (responseData) => {
        if (!responseData) return;

        if (responseData.auto_print && responseData.preview_url) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = responseData.preview_url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => document.body.removeChild(iframe), 60000); // Cleanup
            };
            return;
        }

        if (responseData.preview_url) {
            window.open(responseData.preview_url, '_blank');
        }
    };
    
    // Catch flash message containing print instructions when the page loads
    useEffect(() => {
        if (flash && flash.print_response) {
            if (flash.print_response.message) {
                toast.success(flash.print_response.message);
            }
            triggerPrint(flash.print_response);
            flash.print_response = null; 
        }
    }, [flash]);

    // Handle success/error modals
    useEffect(() => {
        if (success) setShowSuccessModal(true);
        if (error) setShowErrorModal(true);
    }, [success, error]);

    // Effect to fetch data when filters change (debounced for search)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("billing2.index"), data, {
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
    }, [data]);

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(name, value);
    }, [setData]);

    const handleStageChange = useCallback((stage) => {
        setData("stage", stage);
    }, [setData]);

    return (
        <AuthenticatedLayout
            user={auth.user} 
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Debtor List</h2>}
        >
            <Head title="Debtor List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            {/* Header Actions & Filters */}
                            <div className="mb-6 flex flex-col gap-4">
                                
                                {/* Row 1: Billing Group and Search */}
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    
                                    {/* Billing Group Dropdown */}
                                    <div className="flex items-center">
                                        <select
                                            name="group_id"
                                            value={data.group_id}
                                            onChange={handleFilterChange}
                                            className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-w-[200px] ${errors.group_id ? "border-red-500" : ""}`}
                                        >
                                            <option value="">All Billing Groups</option>
                                            {billing_groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Search Bar */}
                                    <div className="relative flex items-center w-full md:w-auto">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Search by customer name"
                                            value={data.search}
                                            onChange={handleFilterChange}
                                            className={`w-full rounded-md border-gray-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 md:w-64 ${errors.search ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Stage Filters */}
                                <div className="flex flex-col justify-end gap-4 md:flex-row md:items-center border-t border-gray-100 pt-4">
                                    <ul className="flex flex-wrap items-center gap-2">
                                        <li
                                            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium flex items-center ${data.stage === "" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                            onClick={() => handleStageChange("")}
                                        >
                                            All Balances
                                        </li>
                                        {Object.entries(DEBTOR_STAGE_LABELS).map(([key, label]) => (
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

                            {/* Debtors Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                                            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">Balance Due</th>                                            
                                            <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {debtors.data && debtors.data.length > 0 ? (
                                            debtors.data.map((debtor) => (
                                                <tr key={debtor.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                                                        {debtor.customer.customer_type === 'individual' ? (
                                                            `${debtor.customer.first_name} ${debtor.customer.other_names ? debtor.customer.other_names + ' ' : ''}${debtor.customer.surname}`.replace(/\s+/g, ' ').trim()
                                                        ) : (
                                                            debtor.customer.company_name
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-red-600">
                                                        {parseFloat(debtor.balance).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </td>                                                    
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                                                        <div className="flex items-center justify-center"> 
                                                            <Link
                                                                href={route("billing2.edit", debtor.id)}
                                                                className="flex items-center rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600"
                                                                title="Make Payment"
                                                            >
                                                                <FontAwesomeIcon icon={faMoneyBill} className="mr-1.5 h-3 w-3" />
                                                                Pay Bills
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="whitespace-nowrap px-4 py-10 text-center text-sm text-gray-500">
                                                    No debtors found matching your criteria.
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

            {/* Error Modal */}
            <Modal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                onConfirm={() => setShowErrorModal(false)}
                title="System Alert"
                isAlert={true}
                confirmButtonText="OK"
            >
                <div className="flex flex-col text-center">
                    <p className="text-sm text-red-600 font-semibold mb-2">Notice:</p>
                    <p className="text-sm text-gray-800 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}