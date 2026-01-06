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
    faProcedures, faCalendarAlt, faCreditCard, faMoneyBillWave, faHistory, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function DispensingIndex({ prescriptions, filters, flash, userPermissions }) {

    const { auth } = usePage().props; 
    const canPostBills = userPermissions.includes('pharmacy0.charge_patient');

    // State
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    // Modals
    const [showBillModal, setShowBillModal] = useState(false); // Legacy single item
    const [selectedBillRx, setSelectedBillRx] = useState(null);
    const [billQty, setBillQty] = useState(0);

    const [showPayModal, setShowPayModal] = useState(false);
    const [newPayItems, setNewPayItems] = useState([]); 
    const [existingBilledItems, setExistingBilledItems] = useState([]);
    const [payQuantities, setPayQuantities] = useState({}); 
    const [selectedPayIds, setSelectedPayIds] = useState(new Set()); 
    const [primaryPayId, setPrimaryPayId] = useState(null); 

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('pharmacy0.index'), { search, date }, { preserveState: true });
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        router.get(route('pharmacy0.index'), { search, date: newDate }, { preserveState: true, replace: true });
    };

    // Grouping
    const groupedPrescriptions = prescriptions.data.reduce((groups, rx) => {
        const key = rx.patientcode; 
        if (!groups[key]) groups[key] = [];
        groups[key].push(rx);
        return groups;
    }, {});


    // --- ACTIONS ---

    // 1. Single Bill (Fallback)
    const openBillNegotiation = (rx) => {
        setSelectedBillRx(rx);
        setBillQty(rx.quantity_prescribed);
        setShowBillModal(true);
    };

    const submitBill = () => {
        router.post(route('pharmacy0.bill', selectedBillRx.id), { verified_qty: billQty }, {
            onSuccess: () => { setShowBillModal(false); setSelectedBillRx(null); },
            preserveScroll: true
        });
    };

    // 2. Bulk Pay & Bill Logic
    const openPostBills = (clickedRx) => {
        if (!clickedRx) return;
        
        const patientGroup = groupedPrescriptions[clickedRx.patientcode] || [];
        
        const unbilled = [];
        const billed = [];

        patientGroup.forEach(item => {
            if (item.status === 'Dispensed' || item.payment_status === 'paid') return;
            if (item.status === 'Billed') billed.push(item);
            else unbilled.push(item);
        });

        if (unbilled.length === 0 && billed.length === 0) {
            toast.info("No pending items found.");
            return;
        }

        const initialQtys = {};
        const initialSelection = new Set();
        unbilled.forEach(item => {
            initialQtys[item.id] = item.quantity_prescribed;
            initialSelection.add(item.id);
        });

        setNewPayItems(unbilled);
        setExistingBilledItems(billed);
        setPayQuantities(initialQtys);
        setSelectedPayIds(initialSelection);
        setPrimaryPayId(clickedRx.id);
        setShowPayModal(true);
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedPayIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPayIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedPayIds.size === newPayItems.length) setSelectedPayIds(new Set());
        else setSelectedPayIds(new Set(newPayItems.map(i => i.id)));
    };

    const executePayment = () => {
        if (newPayItems.length > 0 && selectedPayIds.size === 0) {
            toast.error("Please select items to bill.");
            return;
        }

        const primaryQty = payQuantities[primaryPayId] || 0;

        router.post(route('pharmacy0.pay', primaryPayId), {
            verified_qty: primaryQty,
            selected_ids: Array.from(selectedPayIds)
        }, {
            onSuccess: () => { setShowPayModal(false); setNewPayItems([]); },
            preserveScroll: true,
            onError: (err) => toast.error("Processing failed.")
        });
    };

    const calculateNewBillTotal = () => {
        return newPayItems.reduce((acc, item) => {
            if (!selectedPayIds.has(item.id)) return acc;
            return acc + ((payQuantities[item.id] || 0) * (item.product?.bls_item?.price1 || 0));
        }, 0);
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Pharmacy Queue</h2>}>
            <Head title="Pharmacy Queue" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm font-medium text-gray-500">Manage pending prescriptions.</div>
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"><FontAwesomeIcon icon={faCalendarAlt} /></span>
                                <input type="date" className="pl-10 w-full sm:w-40 border-gray-300 rounded-lg shadow-sm" value={date} onChange={(e) => handleDateChange(e.target.value)} />
                            </div>
                            <div className="relative w-full sm:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" className="w-full pl-10 border-gray-300 rounded-lg shadow-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
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
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase w-2/12">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase w-3/12">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(groupedPrescriptions).length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No prescriptions found.</td></tr>
                                ) : (
                                    Object.entries(groupedPrescriptions).map(([patientCode, groupItems]) => {
                                        const firstRx = groupItems[0];
                                        const patient = firstRx.patient;
                                        const visit = firstRx.visit;
                                        const billingGroup = visit?.billing_group || visit?.billingGroup;
                                        let category = patient?.payment_category || 'Cash';
                                        
                                        // Category Logic
                                        if (!patient?.payment_category && billingGroup) {
                                            if (billingGroup.isexemption) category = 'Exemption';
                                            else if (billingGroup.isinsurance) category = 'Insurance';
                                        }

                                        const isAdmitted = patient?.is_admitted;
                                        let rowClass = "hover:bg-gray-50 transition border-b border-gray-100";
                                        if (isAdmitted) rowClass = "bg-orange-50/50 hover:bg-orange-50 transition border-b border-orange-100";

                                        // --- AGGREGATE ACTION LOGIC ---
                                        // 1. Ready to Dispense
                                        const dispenseItems = groupItems.filter(rx => {
                                            const isPaid = rx.payment_status === 'paid';
                                            const isWaived = rx.payment_status === 'waived' || category === 'Exemption';
                                            const isCash = category === 'Cash';
                                            let canDispense = !isCash || isPaid || isWaived || isAdmitted;
                                            if (canPostBills) canDispense = !isCash || isPaid || isWaived; // Cashier rule
                                            return canDispense && rx.status !== 'Dispensed';
                                        });

                                        // 2. Needs Billing (Unpaid, Not Billed)
                                        const unbilledItems = groupItems.filter(rx => 
                                            rx.status !== 'Billed' && 
                                            rx.status !== 'Dispensed' && 
                                            rx.payment_status !== 'paid' &&
                                            dispenseItems.indexOf(rx) === -1 // Not already dispensable
                                        );

                                        // 3. Already Billed (Pending Payment)
                                        const billedItems = groupItems.filter(rx => 
                                            rx.status === 'Billed' && 
                                            rx.payment_status !== 'paid'
                                        );

                                        return (
                                            <tr key={patientCode} className={rowClass}>
                                                
                                                {/* Patient */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex items-start">
                                                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-400 flex-shrink-0"><FontAwesomeIcon icon={faUser} /></div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{patient?.first_name} {patient?.last_name}</div>
                                                            <div className="text-xs text-gray-500 font-mono uppercase">{patientCode}</div>
                                                            <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{billingGroup?.name || category}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Medications */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-4">
                                                        {groupItems.map((rx) => (
                                                            <div key={rx.id} className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                                <div className="font-bold text-gray-800 text-sm">{rx.product?.name}</div>
                                                                <div className="text-xs text-gray-500 italic font-medium">{rx.dosage} • {rx.frequency}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Status (Stacked) */}
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col gap-4 items-center">
                                                        {groupItems.map((rx) => {
                                                            const isPaid = rx.payment_status === 'paid';
                                                            const isBilled = rx.status === 'Billed' && !isPaid;
                                                            return (
                                                                <div key={rx.id} className="h-[3rem] flex items-center justify-center">
                                                                    {isPaid ? <span className="text-green-600 font-bold text-[10px]"><FontAwesomeIcon icon={faCheckCircle} /> PAID</span> 
                                                                    : isBilled ? <span className="text-purple-600 font-bold text-[10px]"><FontAwesomeIcon icon={faHourglassHalf} /> BILLED</span> 
                                                                    : <span className="text-amber-600 font-bold text-[10px]">UNPAID</span>}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>

                                                {/* CONSOLIDATED ACTIONS */}
                                                <td className="px-6 py-4 align-top text-right">
                                                    <div className="flex flex-col gap-3 items-end">
                                                        
                                                        {/* 1. Dispense Buttons (Individual per drug) */}
                                                        {dispenseItems.map(rx => (
                                                            <Link key={rx.id} href={route('pharmacy0.create', rx.id)} className="w-full text-left bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between group">
                                                                <span className="truncate mr-2 max-w-[120px]">{rx.product?.name}</span>
                                                                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] group-hover:bg-green-700">Dispense</span>
                                                            </Link>
                                                        ))}

                                                        {/* 2. Pay & Bill Button (Consolidated for Unbilled Items) */}
                                                        {unbilledItems.length > 0 && (
                                                            <button 
                                                                onClick={() => canPostBills ? openPostBills(unbilledItems[0]) : openBillNegotiation(unbilledItems[0])} 
                                                                className={`${canPostBills ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-500 hover:bg-amber-600'} text-white w-full px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center`}
                                                            >
                                                                <FontAwesomeIcon icon={canPostBills ? faCreditCard : faFileInvoiceDollar} className="mr-2" />
                                                                {canPostBills ? `Pay & Bill (${unbilledItems.length})` : `Send Bill (${unbilledItems.length})`}
                                                            </button>
                                                        )}

                                                        {/* 3. View Bills Button (Consolidated for Billed Items) */}
                                                        {billedItems.length > 0 && canPostBills && (
                                                            <Link 
                                                                href={route('pharmacy0.billing.index')} 
                                                                className="bg-blue-600 hover:bg-blue-700 text-white w-full px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center"
                                                            >
                                                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" /> 
                                                                View Bills ({billedItems.length})
                                                            </Link>
                                                        )}
                                                        
                                                        {/* Status Text if nothing to do */}
                                                        {dispenseItems.length === 0 && unbilledItems.length === 0 && billedItems.length > 0 && !canPostBills && (
                                                            <span className="text-gray-400 text-xs font-bold italic">Waiting for cashier...</span>
                                                        )}

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

            {/* --- MODALS --- */}

            {/* 1. Legacy Single Bill Modal */}
            {showBillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-amber-500 p-4 flex justify-between items-center text-white"><h3 className="font-bold">Confirm Billing</h3><button onClick={() => setShowBillModal(false)}><FontAwesomeIcon icon={faTimes} /></button></div>
                        <div className="p-6">
                            <h4 className="font-bold text-gray-800 text-lg mb-4">{selectedBillRx?.product?.name}</h4>
                            <input type="number" className="w-full border-gray-300 rounded-lg text-lg font-bold" value={billQty} onChange={e => setBillQty(e.target.value)} />
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowBillModal(false)} className="px-4 py-2 bg-white border rounded text-gray-600">Cancel</button>
                            <button onClick={submitBill} className="px-4 py-2 bg-amber-500 text-white rounded font-bold">Send</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Bulk Pay Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white"><h3 className="font-bold"><FontAwesomeIcon icon={faMoneyBillWave} className="mr-2"/> Payment</h3><button onClick={() => setShowPayModal(false)}><FontAwesomeIcon icon={faTimes}/></button></div>
                        
                        <div className="overflow-y-auto flex-1 bg-gray-50 p-4 space-y-4">
                            {/* New Items */}
                            {newPayItems.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 font-bold text-indigo-800 text-xs uppercase"><FontAwesomeIcon icon={faLayerGroup} className="mr-2"/> New Items</div>
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-gray-100">
                                            {newPayItems.map(item => {
                                                const isSelected = selectedPayIds.has(item.id);
                                                return (
                                                    <tr key={item.id} onClick={() => toggleSelection(item.id)} className={`cursor-pointer ${isSelected ? 'bg-white' : 'bg-gray-50 opacity-50'}`}>
                                                        <td className="p-3 w-8"><input type="checkbox" checked={isSelected} readOnly className="rounded text-indigo-600 pointer-events-none"/></td>
                                                        <td className="p-3 font-medium">{item.product?.name}</td>
                                                        <td className="p-3 text-right">{new Intl.NumberFormat().format(item.product?.bls_item?.price1 || 0)}</td>
                                                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                                            <input type="number" className="w-16 text-center border-gray-300 rounded text-xs p-1" value={payQuantities[item.id] || 0} onChange={e => setPayQuantities(prev => ({...prev, [item.id]: e.target.value}))} disabled={!isSelected} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Existing Bills */}
                            {existingBilledItems.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-bold text-gray-500 text-xs uppercase"><FontAwesomeIcon icon={faHistory} className="mr-2"/> Already Billed</div>
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <tbody className="divide-y divide-gray-100">
                                            {existingBilledItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="p-3 w-8"><FontAwesomeIcon icon={faCheckCircle}/></td>
                                                    <td className="p-3">{item.product?.name}</td>
                                                    <td className="p-3 text-right">-</td>
                                                    <td className="p-3 text-center">{item.quantity_prescribed}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {newPayItems.length > 0 ? (
                            <div className="bg-white border-t p-4 flex justify-between items-center">
                                <div className="text-xl font-black text-indigo-700">{new Intl.NumberFormat().format(calculateNewBillTotal())} <span className="text-sm">TZS</span></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowPayModal(false)} className="px-4 py-2 border rounded text-gray-600 font-bold">Cancel</button>
                                    <button onClick={executePayment} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold shadow-lg hover:bg-indigo-700">Confirm</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border-t p-4 flex justify-end">
                                <Link href={route('pharmacy0.billing.index')} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Go to Cashier</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </HospitalLayout>
    );
}