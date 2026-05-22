import React, { useState, useEffect, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill, faSpinner, faStore, faTag, faUser, faBuilding } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import axios from 'axios';
import Modal from '@/Components/CustomModal.jsx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function ProcessExistingOrderPayment({ auth, orderData, originalOrder }) {
    const STORAGE_KEY = `pendingOrderChanges_${orderData.id}`;

    // Hardcode sale_type to 'credit' and paid_amount to 0
    const { data, errors, setError, clearErrors, reset } = useForm({
        ...orderData,
        customer_id: originalOrder.customer_id,
        stage: originalOrder.stage,
        sale_type: 'credit', 
        payment_method: '', // Not needed for credit
        paid_amount: 0,
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isProcessingRef = useRef(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);  

    // Helper to display customer name securely
    const customerDisplay = useMemo(() => {
        if (!originalOrder.customer) return 'Unknown Customer';
        return originalOrder.customer.customer_type === 'company' 
            ? originalOrder.customer.company_name 
            : `${originalOrder.customer.first_name || ''} ${originalOrder.customer.surname || ''}`.trim();
    }, [originalOrder.customer]);

    // Badges Logic
    const showStoreBadge = useMemo(() => {
        if (!data.orderitems || data.orderitems.length === 0) return false;
        const uniqueStores = new Set(data.orderitems.map(item => item.source_store_name || item.store?.name).filter(Boolean));
        return uniqueStores.size > 1; 
    }, [data.orderitems]);

    const showPriceBadge = useMemo(() => {
        if (!data.orderitems || data.orderitems.length === 0) return false;
        const uniquePrices = new Set(data.orderitems.map(item => item.price_ref).filter(Boolean));
        return uniquePrices.size > 1; 
    }, [data.orderitems]);
   
    const proceedWithSubmission = () => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        setIsSubmitting(true);
        clearErrors();

        const toastId = toast.loading("Processing credit invoice... Please wait.");

        axios.post(route('outpatient4.pay', { order: orderData.id }), data)
            .then((response) => {
                toast.dismiss(toastId);
                toast.success("Order Processed Successfully!");

                sessionStorage.removeItem(STORAGE_KEY);
                if (response.data.success) {                    
                    const { invoice_url, auto_print, backend_printed } = response.data;

                    if (backend_printed) {
                        console.log("Printed via Server/SumatraPDF");
                    } 
                    else if (invoice_url) {
                        if (auto_print) {
                            const iframe = document.createElement('iframe');
                            iframe.style.display = 'none';
                            iframe.src = invoice_url;
                            document.body.appendChild(iframe);

                            iframe.onload = function() {
                                try {
                                    iframe.contentWindow.focus();
                                    iframe.contentWindow.print();
                                } catch (e) {
                                    console.error(e);
                                }
                                setTimeout(() => document.body.removeChild(iframe), 60000);
                            };
                        } else {
                            window.open(invoice_url, '_blank');
                        }
                    }                  
                }
                setShowSuccessModal(true);
                reset();
                setTimeout(() => {
                    router.visit(route('outpatient4.index'));
                }, 1500);
            })
            .catch((error) => {
                isProcessingRef.current = false;
                setIsSubmitting(false);
                toast.dismiss(toastId);

                if (error.response && error.response.status === 422) {
                    const serverErrors = error.response.data.errors;
                    
                    if (serverErrors.api_error) {
                    
                        toast.error(serverErrors.api_error[0]);

                    } else if (serverErrors.orderitems) {

                        toast.error(serverErrors.orderitems[0]);

                    } else {

                        // show first validation error dynamically
                        const firstError = Object.values(serverErrors)[0];

                        if (Array.isArray(firstError)) {
                            toast.error(firstError[0]);
                        } else {
                            toast.error('Please check the input fields for errors.');
                        }
                    }

                    Object.keys(serverErrors).forEach((key) => {
                        setError(key, serverErrors[key][0]);
                    });
                } else {
                    toast.error(error.response?.data?.message || `Processing failed: ${error.message}`);
                }
            });
    };

    const submitPayment = (e) => {
        e.preventDefault();
        
        if (!data.customer_id) { 
            toast.error('Error: No customer associated with this order.');
            return; 
        }

        Swal.fire({
            title: 'Confirm Credit Sale?',
            text: `Process this order for ${customerDisplay}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Confirm',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                proceedWithSubmission();
            }
        });
    };
   
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Process Order #{orderData.id}</h2>}>
            <Head title="Process Order" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 p-6 shadow-sm sm:rounded-lg">
                        <form onSubmit={submitPayment} className="space-y-6">      

                            {/* Customer Information (Read Only) */}
                            <section className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Bill To</h3>
                                <div className="flex items-center text-gray-900 dark:text-gray-100 text-lg font-semibold">
                                    <FontAwesomeIcon 
                                        icon={originalOrder.customer?.customer_type === 'company' ? faBuilding : faUser} 
                                        className="mr-3 text-gray-400" 
                                    />
                                    {customerDisplay}
                                </div>
                                {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                            </section>

                            {/* Order Summary */}
                            <section className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Order Items</h3>
                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md">
                                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {data.orderitems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                        <div className="font-medium">{item.item_name || item.item?.name || 'Unknown Item'}</div>
                                                        {(showStoreBadge || showPriceBadge) && (
                                                            <div className="flex space-x-2 mt-1">
                                                                {showStoreBadge && item.source_store_name && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                        <FontAwesomeIcon icon={faStore} className="mr-1" /> {item.source_store_name}
                                                                    </span>
                                                                )}
                                                                {showPriceBadge && item.price_ref && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                        <FontAwesomeIcon icon={faTag} className="mr-1" /> {item.price_ref}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-sm">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.price)}</td>
                                                    <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.quantity * item.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">Invoice Total</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">TZS {formatCurrency(data.total)}</span>
                                </div>
                            </section>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Link href={route('outpatient4.edit', { order: orderData.id })} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Back to Edit</Link>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-4 py-2 bg-green-600 text-white rounded flex items-center hover:bg-green-700 disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={isSubmitting ? faSpinner : faMoneyBill} spin={isSubmitting} className="mr-2" />
                                    Confirm Credit Sale
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={showSuccessModal} title="Success" isAlert={true} hideCloseButton={true}>
                <div className="text-center"><p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Invoice generated successfully! Redirecting...</p><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" /></div>
            </Modal>
          
        </AuthenticatedLayout>
    );
}