import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faPills, faCheckCircle, 
    faFileInvoiceDollar, faUser, faTimes, faCalculator,
    faCashRegister, faStethoscope, faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function DispensingIndex({ prescriptions, filters, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [selectedRx, setSelectedRx] = useState(null);
    const [negotiatedQty, setNegotiatedQty] = useState(0);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('pharmacy0.index'), { search }, { preserveState: true });
    };

    const openNegotiation = (rx) => {
        setSelectedRx(rx);
        setNegotiatedQty(rx.quantity_prescribed);
        setShowModal(true);
    };

    const closeNegotiation = () => {
        setShowModal(false);
        setSelectedRx(null);
    };

    const handleSubmitBill = () => {
        if (negotiatedQty <= 0) {
            toast.error("Please enter a valid quantity.");
            return;
        }
        router.post(route('pharmacy0.bill', selectedRx.id), {
            verified_qty: negotiatedQty
        }, {
            onSuccess: () => closeNegotiation(),
            preserveScroll: true
        });
    };

    // Calculate Modal Price
    const unitPrice = selectedRx?.product?.bls_item?.price1 || 0;
    const totalPrice = unitPrice * negotiatedQty;

    // Helper for Modal display only
    const getModalStrength = () => {
        const d = selectedRx?.product?.drug_details || selectedRx?.product?.drugDetails;
        return d ? `${d.strength_amount || ''}${d.strength_unit || ''}` : '';
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Pharmacy Queue</h2>}>
            <Head title="Pharmacy Queue" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <div className="relative w-full">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500" 
                                    placeholder="Search Patient Name or Code..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                />
                            </div>
                        </form>
                        <div className="text-sm font-medium text-gray-500">
                            Queue: {prescriptions.total}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Prescription Details</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Payment Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {prescriptions.data.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No prescriptions found.</td></tr>
                                ) : (
                                    prescriptions.data.map((rx) => {
                                        const billingGroup = rx.visit?.billing_group?.name || 'Cash';
                                        const isCash = billingGroup.toLowerCase().includes('cash');
                                        const isPaid = rx.payment_status === 'paid';
                                        const isBilled = rx.status === 'Billed'; // Intermediate Status
                                        
                                        // Extract details for the unit
                                        const details = rx.product?.drug_details || rx.product?.drugDetails;
                                        const unit = details?.strength_unit || '';

                                        return (
                                            <tr key={rx.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-400">
                                                            <FontAwesomeIcon icon={faUser} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{rx.patient?.first_name} {rx.patient?.last_name}</div>
                                                            <div className="text-xs text-gray-500 font-mono uppercase">{rx.patientcode}</div>
                                                            <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{billingGroup}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* Drug Name */}
                                                    <div className="font-bold text-gray-800">
                                                        {rx.product?.name}
                                                    </div>
                                                    
                                                    {/* Dosage info with Unit concatenated */}
                                                    <div className="text-xs text-gray-500 italic mt-1 font-medium">
                                                        {rx.dosage}{unit} • {rx.frequency} • {rx.duration}
                                                    </div>

                                                    <div className="flex items-center mt-2 text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">
                                                        <FontAwesomeIcon icon={faStethoscope} className="mr-1.5" />
                                                        Dr. {rx.doctor?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> PAID
                                                        </span>
                                                    ) : isBilled ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                                                            <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" /> At Cashier
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isCash ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {isCash ? 'Unpaid' : 'Insurance'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isCash && !isPaid ? (
                                                        isBilled ? (
                                                            // Billed but Waiting for Payment
                                                            <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold cursor-not-allowed flex items-center ml-auto">
                                                                <FontAwesomeIcon icon={faCashRegister} className="mr-2" /> Bill Sent
                                                            </button>
                                                        ) : (
                                                            // Unpaid & Not Billed
                                                            <button onClick={() => openNegotiation(rx)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center ml-auto">
                                                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" /> Bill
                                                            </button>
                                                        )
                                                    ) : (
                                                        // Paid or Insurance -> Dispense
                                                        <Link href={route('pharmacy0.create', rx.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition inline-flex items-center ml-auto">
                                                            <FontAwesomeIcon icon={faPills} className="mr-2" /> Dispense
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6"><Pagination links={prescriptions.links} /></div>
                </div>
            </div>

            {/* Negotiation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-amber-500 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center"><FontAwesomeIcon icon={faCalculator} className="mr-2" /> Billing</h3>
                            <button onClick={closeNegotiation}><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="border-b pb-3">
                                <p className="text-[10px] text-gray-400 uppercase font-black">Medication</p>
                                <p className="font-bold text-gray-800 text-lg">
                                    {selectedRx?.product?.name} 
                                    {getModalStrength() && (
                                        <span className="text-sm text-gray-500 ml-2 font-normal">({getModalStrength()})</span>
                                    )}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Unit Price</p>
                                    <p className="font-black text-blue-600 text-xl">{new Intl.NumberFormat().format(unitPrice)}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                    <p className="text-[10px] text-green-500 uppercase font-bold">Total Bill</p>
                                    <p className="font-black text-green-700 text-xl">{new Intl.NumberFormat().format(totalPrice)}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input type="number" step="any" className="w-full text-2xl font-black text-center border-gray-300 rounded-xl py-3" value={negotiatedQty} onChange={e => setNegotiatedQty(e.target.value)} />
                                <div className="absolute right-4 top-4 text-gray-300 font-bold uppercase text-[10px]">Units</div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3">
                            <button onClick={closeNegotiation} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold">Cancel</button>
                            <button onClick={handleSubmitBill} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center"><FontAwesomeIcon icon={faCashRegister} className="mr-2" /> Send</button>
                        </div>
                    </div>
                </div>
            )}
        </HospitalLayout>
    );
}