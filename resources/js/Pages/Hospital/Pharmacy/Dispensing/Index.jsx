import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faPills, faCheckCircle, 
    faFileInvoiceDollar, faUser, faTimes, faCalculator,
    faCashRegister, faStethoscope, faHourglassHalf,
    faIdCard, faHandHoldingHeart, faBuilding,
    faProcedures, faCalendarAlt,faReceipt // <--- Added Calendar Icon
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import TextInput from '@/Components/TextInput'; // Assuming you have this

export default function DispensingIndex({ prescriptions, filters, flash, userPermissions }) {

    const { auth } = usePage().props; 
    const canPostBills = userPermissions.includes('pharmacy0.charge_patient');

    // 1. Initialize State with Filters
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || ''); // <--- Date State

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedRx, setSelectedRx] = useState(null);
    const [negotiatedQty, setNegotiatedQty] = useState(0);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // 2. Updated Search Handler
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('pharmacy0.index'), { search, date }, { preserveState: true });
    };

    // 3. Date Change Handler
    const handleDateChange = (newDate) => {
        setDate(newDate);
        router.get(
            route('pharmacy0.index'), 
            { search, date: newDate }, 
            { preserveState: true, replace: true }
        );
    };

    // --- GROUPING LOGIC ---
    // Group prescriptions by patientcode
    const groupedPrescriptions = prescriptions.data.reduce((groups, rx) => {
        const key = rx.patientcode; // Ensure this exists on the model, or use rx.patient.id
        if (!groups[key]) groups[key] = [];
        groups[key].push(rx);
        return groups;
    }, {});


    // --- ACTION HANDLERS ---
    const openNegotiation = (rx) => {
        setSelectedRx(rx);
        setNegotiatedQty(rx.quantity_prescribed);
        setShowModal(true);
    };

    const openPostBills = (rx) => {
        if (!rx || !rx.id) {
            toast.error("Invalid prescription data.");
            return;
        }
        router.post(route('pharmacy0.pay', rx.id), {
            verified_qty: rx.quantity_prescribed 
        }, {
            onSuccess: () => closeNegotiation(),
            preserveScroll: true,
            onError: (errors) => {
                toast.error("Failed to process bill.");
                console.error(errors);
            }
        });
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
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm font-medium text-gray-500 mb-2 lg:mb-0">
                            Manage pending prescriptions.
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            
                            {/* Date Filter */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                </span>
                                <input 
                                    type="date"
                                    className="pl-10 w-full sm:w-40 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500" 
                                    placeholder="Search Patient..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                />
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-3/12">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-4/12">Medications</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase w-3/12">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase w-2/12">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(groupedPrescriptions).length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No prescriptions found for this date.</td></tr>
                                ) : (
                                    Object.entries(groupedPrescriptions).map(([patientCode, groupItems]) => {
                                        // Take patient details from the first item
                                        const firstRx = groupItems[0];
                                        const patient = firstRx.patient;
                                        const visit = firstRx.visit;

                                        // Category Logic (Patient Level)
                                        const billingGroup = visit?.billing_group || visit?.billingGroup;
                                        let category = patient?.payment_category || 'Cash';
                                        if (!patient?.payment_category && billingGroup) {
                                            if (billingGroup.isexemption) category = 'Exemption';
                                            else if (billingGroup.isinsurance) category = 'Insurance';
                                        }

                                        const isInsurance = category === 'Insurance';
                                        const isExemption = category === 'Exemption';
                                        const isCorporate = category === 'Invoice'; 
                                        const isAdmitted = patient?.is_admitted;

                                        let rowClass = "hover:bg-gray-50 transition border-b border-gray-100";
                                        if (isAdmitted) rowClass = "bg-orange-50/50 hover:bg-orange-50 transition border-b border-orange-100";

                                        return (
                                            <tr key={patientCode} className={rowClass}>
                                                
                                                {/* 1. PATIENT DETAILS */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-start">
                                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-400 flex-shrink-0">
                                                            <FontAwesomeIcon icon={faUser} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{patient?.first_name} {patient?.last_name}</div>
                                                            <div className="text-xs text-gray-500 font-mono uppercase">{patientCode}</div>
                                                            <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 flex items-center gap-1">
                                                                {isInsurance && <FontAwesomeIcon icon={faIdCard} />}
                                                                {isCorporate && <FontAwesomeIcon icon={faBuilding} />}
                                                                {isExemption && <FontAwesomeIcon icon={faHandHoldingHeart} />}
                                                                {billingGroup?.name || category}
                                                            </div>
                                                            {isAdmitted && (
                                                                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                                    <FontAwesomeIcon icon={faProcedures} className="mr-1" /> ADMITTED
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 2. MEDICATIONS (Stacked) */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-4">
                                                        {groupItems.map((rx) => {
                                                            const details = rx.product?.drug_details || rx.product?.drugDetails;
                                                            const unit = details?.strength_unit || '';
                                                            return (
                                                                <div key={rx.id} className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                                    <div className="font-bold text-gray-800 text-sm">
                                                                        {rx.product?.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 italic font-medium">
                                                                        {rx.dosage}{unit} • {rx.frequency} • {rx.duration}
                                                                    </div>
                                                                    <div className="flex items-center mt-1 text-[10px] text-blue-600 font-medium bg-blue-50 w-fit px-1.5 py-0.5 rounded border border-blue-100">
                                                                        <FontAwesomeIcon icon={faStethoscope} className="mr-1" />
                                                                        {rx.doctor?.name || 'Dr. Unknown'}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* 3. STATUS (Stacked) */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-4 items-center">
                                                        {groupItems.map((rx) => {
                                                            const isPaid = rx.payment_status === 'paid';
                                                            const isBilled = rx.status === 'Billed' && !isPaid;
                                                            const isWaived = rx.payment_status === 'waived' || isExemption;
                                                            const isCash = category === 'Cash';

                                                            return (
                                                                <div key={rx.id} className="h-[4.5rem] flex items-center justify-center"> {/* Fixed height to align with meds roughly */}
                                                                    {isAdmitted ? (
                                                                        <span className="text-xs font-bold text-orange-600"><FontAwesomeIcon icon={faProcedures} /> Admitted</span>
                                                                    ) : isPaid ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> PAID
                                                                        </span>
                                                                    ) : isBilled ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                                                                            <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" /> Cashier
                                                                        </span>
                                                                    ) : isWaived ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                                                                            <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1" /> Exempt
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isCash ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                            {isCash ? 'Unpaid' : 'Insurance'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                
                                                {/* 4. ACTIONS (Stacked) */}
                                                <td className="px-6 py-4 align-top text-right">
                                                    <div className="flex flex-col gap-4 items-end">
                                                        {groupItems.map((rx) => {
                                                            const isPaid = rx.payment_status === 'paid';
                                                            const isBilled = rx.status === 'Billed' && !isPaid;
                                                            const isWaived = rx.payment_status === 'waived' || isExemption;
                                                            const isCash = category === 'Cash';
                                                            const canDispense = !isCash || isPaid || isWaived || isAdmitted;

                                                            return (
                                                                <div key={rx.id} className="h-[4.5rem] flex items-center">
                                                                    {canDispense ? (
                                                                        <Link href={route('pharmacy0.create', rx.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-[10px] font-bold transition inline-flex items-center">
                                                                            <FontAwesomeIcon icon={faPills} className="mr-1" /> Dispense
                                                                        </Link>
                                                                    ) : isBilled ? (
                                                                        canPostBills ? (
                                                                            <Link 
                                                                                href={route('pharmacy0.billing.index')} 
                                                                                // Changed to Blue to distinguish from Dispense (Green)
                                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[10px] font-bold transition inline-flex items-center"
                                                                            >
                                                                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" /> 
                                                                                View Bills
                                                                            </Link>
                                                                        ) : (
                                                                            <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-[10px] font-bold cursor-not-allowed flex items-center">
                                                                                <FontAwesomeIcon icon={faCashRegister} className="mr-1" /> 
                                                                                Sent
                                                                            </button>
                                                                        )
                                                                        
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => canPostBills ? openPostBills(rx) : openNegotiation(rx)} 
                                                                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-[10px] font-bold transition flex items-center"
                                                                        >
                                                                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" /> Bill
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
                    <div className="mt-6"><Pagination links={prescriptions.links} /></div>
                </div>
            </div>

            {/* Negotiation Modal (Same as before) */}
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