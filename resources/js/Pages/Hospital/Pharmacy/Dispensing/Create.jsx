import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPills, faCheck, faStore, faSpinner, 
    faExclamationTriangle, faArrowLeft, faBoxOpen, faUserMd 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function DispenseCreate({ prescription, stores, default_store_id, initial_stock, allow_negative_stock, userPermissions }) {
    const disableDosageChange = userPermissions.includes('pharmacy0.disable_dosage_change');
    const [currentStock, setCurrentStock] = useState(initial_stock || 0);
    const [loadingStock, setLoadingStock] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        quantity_issued: prescription.quantity_prescribed,
        store_id: default_store_id || '',
        batch_no: '',
        expiry_date: '',
    });

    // --- EXTRACT UNIT & FULL STRENGTH ---
    // Handle both snake_case (Laravel JSON default) and camelCase
    const details = prescription.product?.drug_details || prescription.product?.drugDetails;
    const unit = details?.strength_unit || '';
    const fullStrength = details ? `${details.strength_amount || ''}${details.strength_unit || ''}` : '';

    // --- STOCK CHECK LOGIC ---
    const [isFirstMount, setIsFirstMount] = useState(true);
    useEffect(() => {
        if (isFirstMount) { setIsFirstMount(false); return; }
        if (data.store_id) { handleCheckStock(data.store_id); }
    }, [data.store_id]);

    const handleCheckStock = async (storeId) => {
        setLoadingStock(true);
        try {
            const response = await axios.get(route('pharmacy0.check_stock'), {
                params: { product_id: prescription.product_id, store_id: storeId }
            });
            setCurrentStock(response.data.stock);
        } catch (error) {
            toast.error("Could not fetch stock.");
            setCurrentStock(0);
        } finally {
            setLoadingStock(false);
        }
    };

    const isInsufficient = Number(data.quantity_issued) > Number(currentStock);
    const canSubmit = allow_negative_stock || !isInsufficient;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.store_id) { toast.error("Select a store."); return; }
        post(route('pharmacy0.store', prescription.id));
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Confirm Dispensation</h2>}>
            <Head title="Finalize Handover" />

            <div className="py-10 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* LEFT PANEL: Patient & Dosage Summary */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dispensing To</h3>
                            <div className="flex items-center mb-4">
                                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 leading-tight">
                                        {prescription.patient?.first_name} {prescription.patient?.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono uppercase">{prescription.patientcode}</div>
                                </div>
                            </div>
                            
                            {/* DOCTOR INFO */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Prescriber</h4>
                                <div className="flex items-center text-blue-700 font-bold text-sm">
                                    <FontAwesomeIcon icon={faUserMd} className="mr-2" />
                                    Dr. {prescription.doctor?.name || 'Unknown'}
                                </div>
                            </div>
                        </div>

                        {/* DOSAGE SUMMARY BOX */}
                        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-4 text-center">Dosage Instruction</h3>
                            <div className="text-center">
                                {/* FORMAT: {Dosage}{Unit} */}
                                <p className="text-3xl font-black mb-1">
                                    {prescription.dosage}<span className="text-xl text-green-200">{unit}</span>
                                </p>
                                
                                {/* FORMAT: {Frequency} • {Duration} */}
                                <p className="text-xs font-bold text-green-100 uppercase tracking-wide opacity-90">
                                    {prescription.frequency} • {prescription.duration}
                                </p>

                                <hr className="my-4 border-green-500/30" />
                                
                                <div className="text-4xl font-black">{data.quantity_issued}</div>
                                <div className="text-[10px] font-bold uppercase text-green-200 mt-1">Total Units to Issue</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                            
                            {/* HEADER: Drug Name */}
                            <div className="border-b border-gray-100 pb-5">
                                <div className="flex items-baseline gap-3">
                                    <h1 className="text-2xl font-black text-gray-900 leading-none">{prescription.product?.name}</h1>
                                    {/* Optional: Keep full strength here for verification (e.g. 500mg) */}
                                    {fullStrength && (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded uppercase">
                                            {fullStrength}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mt-2 flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                    Pharmacy Inventory Module
                                </p>
                            </div>

                            {/* Store Selection & Stock Display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase flex items-center"><FontAwesomeIcon icon={faStore} className="mr-2" /> Source Store</label>
                                    <select value={data.store_id} onChange={e => setData('store_id', e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 text-sm font-medium">
                                        <option value="">-- Choose Store --</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className={`p-4 rounded-xl border flex flex-col justify-center items-center ${isInsufficient ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Available Stock</span>
                                    <div className={`text-2xl font-black ${isInsufficient ? 'text-red-600' : 'text-green-600'}`}>
                                        {loadingStock ? <FontAwesomeIcon icon={faSpinner} spin /> : currentStock}
                                    </div>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Quantity Issued</label>
                                        {!disableDosageChange && (
                                            <input type="number" step="any" className="w-full border-gray-200 rounded-xl font-black text-lg" value={data.quantity_issued} onChange={e => setData('quantity_issued', e.target.value)} required />
                                        )}
                                        {disableDosageChange && (
                                            <input type="number" step="any" className="w-full border-gray-200 rounded-xl font-black text-lg bg-gray-100 cursor-not-allowed"  value={data.quantity_issued} readOnly  />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Batch #</label>
                                        <input type="text" className="w-full border-gray-200 rounded-xl text-sm" placeholder="Lot ID" value={data.batch_no} onChange={e => setData('batch_no', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Expiry Date</label>
                                        <input type="date" className="w-full border-gray-200 rounded-xl text-sm" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Errors */}
                            {isInsufficient && !allow_negative_stock && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center border border-red-100">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-lg" />
                                    <p className="text-[11px] font-bold leading-tight">Insufficient Stock. Negative stock disabled.</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <Link href={route('pharmacy0.index')} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition flex items-center"><FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Cancel</Link>
                                <button type="submit" disabled={processing || !canSubmit || !data.store_id || loadingStock} className={`px-10 py-4 rounded-2xl text-white font-black transition-all shadow-xl ${(!canSubmit || !data.store_id || loadingStock) ? 'bg-gray-200 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faCheck} className="mr-2" />} Finalize Handover
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}