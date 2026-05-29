import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react'; // <--- ADDED router HERE
import HospitalLayout from '@/Layouts/HospitalLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton'; // <--- Import this
import SecondaryButton from '@/Components/SecondaryButton'; // <--- Impor
import Modal from '@/Components/Modal';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClipboardList, faHistory, faFlask, faPills, faDoorOpen,faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import Discharge from './Discharge'; 

// Import Sub-Components
import AssessmentTab from './Tabs/AssessmentTab';
import RoundHistoryTab from './Tabs/RoundHistoryTab';
import IpdOrdersTab from './Tabs/IpdOrdersTab';
import PharmacyTab from './Tabs/PharmacyTab';

export default function WardRound({ 
    admission, patient, previous_rounds = [],    
    opd_consultation = null, 
    diagnosis_history = [], 
    ordered_labs = [], ordered_rads = [], ordered_surgeries = [], ordered_blood = [], ordered_meds = [],
    lab_panels = [], rad_procedures = [], drugs_list = [], bb_components = [],
    pharmacy_frequencies = [], pharmacy_durations = [],
    surgery_procedures = [],
    icd_list = [], ipd_diagnoses_list = [], theatre_list = [] 
}) {
    
    // --- 1. Data Transformation ---
    const options = {
        lab: lab_panels.map(l => ({ value: l.id, label: l.name })),
        rad: rad_procedures.map(r => ({ value: r.id, label: r.name })),
        blood: bb_components.map(b => ({ value: b.id, label: b.name })),
        drug: drugs_list.map(d => ({ value: d.id, label: d.name })),   
        surgery: surgery_procedures.map(s => ({ value: s.id, label: s.name })), 
        theatre: theatre_list.map(t => ({ value: t.id, label: t.name, type: t.type }))    
    };
  
    // Build "Reverse Lookup" Map
    const icdToMtuhaMap = {};
    if (ipd_diagnoses_list) {
        ipd_diagnoses_list.forEach(localDiag => {
            if (localDiag.icd_map?.id) {
                icdToMtuhaMap[localDiag.icd_map.id] = {
                    id: localDiag.id,
                    name: localDiag.name
                };
            }
        });
    }

    const diagnosisOptions = icd_list.map(icd => {
        const mappedLocal = icdToMtuhaMap[icd.id];
        return {
            value: icd.id,
            label: `${icd.code} - ${icd.name}`,
            type: 'icd',
            mtuha_label: mappedLocal ? mappedLocal.name : null,
            mtuha_id: mappedLocal ? mappedLocal.id : null 
        };
    });
     
    // --- 2. Form State ---
    const { data, setData, post, processing, errors } = useForm({
        clinical_notes: '', 
        treatment_plan: '',
        general_condition: '',
        glasgow_coma_score: '',
        pallor: false,
        jaundice: false,
        cvs_examination: '',
        rs_examination: '',
        abdomen_examination: '',
        diagnoses: [], 
        lab_requests: [],
        rad_requests: [],
        blood_requests: [],
        new_prescriptions: []
    });

    // Extract OPD Data
    const opd_labs = opd_consultation?.lab_requests || [];
    const opd_rads = opd_consultation?.radiology_requests || [];
    const opd_surgeries = opd_consultation?.theatre_bookings || []; 
    const opd_meds = opd_consultation?.prescriptions || [];

    const [activeTab, setActiveTab] = useState('assessment');
    const [viewResult, setViewResult] = useState(null);
    const [resultType, setResultType] = useState('');    
    const [showDischargeModal, setShowDischargeModal] = useState(false);

    // --- NEW: DELETE CONFIRMATION STATE ---
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id: 1, type: 'lab' }

    // --- 3. Handlers ---
    const submit = (e) => {
        e.preventDefault();
        post(route('doctor1.store', admission.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Ward Round Saved Successfully!");
                setData(prev => ({ 
                    ...prev, 
                    lab_requests: [], 
                    rad_requests: [], 
                    blood_requests: [], 
                    new_prescriptions: [] 
                }));
            },
            onError: (err) => {
                console.error("Validation Errors:", err);
                if (err.clinical_notes) {
                    toast.error("Progress Notes are required.");
                    setActiveTab('assessment'); 
                } else if (err.general_condition) {
                    toast.error("General Condition is required.");
                    setActiveTab('assessment');
                } else {
                    toast.error("Please check required fields.");
                }
            }
        });
    };
    

    // 1. Trigger Modal Open
    const handleDeleteOrder = (id, type) => {
        setDeleteTarget({ id, type });
        setConfirmingDeletion(true);
    };

    // 2. Execute Deletion (Called from Modal)
    const executeDelete = () => {
        if (!deleteTarget) return;

        router.delete(route('doctor1.order.destroy', { id: deleteTarget.id, type: deleteTarget.type }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Order deleted successfully.");
                setConfirmingDeletion(false);
                setDeleteTarget(null);
            },
            onError: (errors) => {
                console.error("Delete Errors:", errors);
                toast.error(errors.error || "Could not delete order.");
                setConfirmingDeletion(false); // Close modal even on error to reset UI
            }
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setDeleteTarget(null);
    };


    const patientInitial = patient?.first_name ? patient.first_name.charAt(0) : '?';

    return (
        <HospitalLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800">IPD Ward Round</h2>
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium shadow-sm">
                    {admission.ward?.name} <span className="mx-1">/</span> Bed {admission.bed?.name}
                </div>
            </div>
        }>
            <Head title="Ward Round" />

            <div className="py-4 max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)]">
                
                {/* LEFT: PATIENT SUMMARY */}
                <div className="w-full md:w-1/4 bg-white shadow rounded-lg p-4 overflow-y-auto hidden md:block">
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-green-600 border-2 border-white shadow">
                            {patientInitial}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{patient.first_name} {patient.last_name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{patient.code}</p>
                        <p className="text-xs text-gray-400 mt-1">{patient.age} Yrs / {patient.gender}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="block text-xs text-gray-400 uppercase">Admitted On</span>
                            <span className="font-medium text-gray-700">{new Date(admission.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="block text-xs text-gray-400 uppercase">Doctor</span>
                            <span className="font-medium text-gray-700">{admission.user?.name || 'Assigned'}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: MAIN TABS */}
                <div className="w-full md:w-3/4 bg-white shadow rounded-lg flex flex-col">
                    
                    {/* Navigation */}
                    <div className="flex border-b bg-gray-50 overflow-x-auto">
                        {[
                            {id: 'assessment', label: 'Assessment', icon: faClipboardList},
                            {id: 'history', label: 'History', icon: faHistory},
                            {id: 'orders', label: 'Orders & Results', icon: faFlask},
                            {id: 'rx', label: 'Pharmacy', icon: faPills},
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 px-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors min-w-[100px] whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'border-green-600 text-green-600 bg-white' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}>
                                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
                                {tab.id === 'assessment' && errors.clinical_notes && <span className="h-2 w-2 bg-red-500 rounded-full ml-1"></span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <form onSubmit={submit} className="h-full">

                            {activeTab === 'assessment' && 
                                <AssessmentTab 
                                    data={data} 
                                    setData={setData} 
                                    errors={errors} 
                                    diagnosisOptions={diagnosisOptions}
                                />}

                            {activeTab === 'history' && (
                                <RoundHistoryTab 
                                    history={previous_rounds} 
                                    opdData={opd_consultation} 
                                    diagnosisHistory={diagnosis_history}
                                />
                            )}

                            {activeTab === 'orders' && 
                                <IpdOrdersTab 
                                    data={data} setData={setData} 
                                    options={options} 
                                    // IPD
                                    ordered_labs={ordered_labs} 
                                    ordered_rads={ordered_rads}
                                    ordered_surgeries={ordered_surgeries}
                                    ordered_blood={ordered_blood}
                                    // OPD
                                    opd_labs={opd_labs}
                                    opd_rads={opd_rads}
                                    opd_surgeries={opd_surgeries}

                                    onViewResult={(res, type) => { setResultType(type); setViewResult(res); }}
                                    onDeleteOrder={handleDeleteOrder}
                                />
                            }

                            {activeTab === 'rx' && 
                                <PharmacyTab 
                                    data={data} setData={setData}
                                    drugOptions={options.drug}
                                    rawDrugsList={drugs_list}
                                    ordered_meds={ordered_meds}
                                    opd_meds={opd_meds}
                                    frequencies={pharmacy_frequencies}
                                    durations={pharmacy_durations}
                                    onDeleteOrder={handleDeleteOrder}
                                />
                            }
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t rounded-b-lg">
                        <span className="text-xs text-gray-500">Session ID: {admission.id}</span>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowDischargeModal(true)}
                                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded shadow-sm text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faDoorOpen} /> Discharge
                            </button>

                            <PrimaryButton onClick={submit} disabled={processing} className="px-8 bg-green-600 hover:bg-green-700">
                                {processing ? 'Saving...' : 'Save Round'}
                            </PrimaryButton>
                        </div>
                    </div>   
                </div>
            </div>

            {/* --- CONFIRM DELETE MODAL --- */}
            <Modal show={confirmingDeletion} onClose={closeModal} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                        Confirm Deletion
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to delete this order? This action cannot be undone.
                        Any associated unpaid bills will also be removed.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}> Cancel </SecondaryButton>
                        <DangerButton onClick={executeDelete}> Delete Order </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* RESULT MODAL */}
            <Modal show={!!viewResult} onClose={() => setViewResult(null)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4 border-b pb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                            {resultType === 'lab' ? 'Laboratory Result' : 'Radiology Report'}
                        </h3>
                        <button onClick={() => setViewResult(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold transition">✕</button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded text-sm mb-4 border border-gray-200">
                        <p><strong className="text-gray-600">Test:</strong> <span className="font-medium text-gray-900">{resultType === 'lab' ? viewResult?.panel?.name : viewResult?.procedure?.name}</span></p>
                        <p><strong className="text-gray-600">Date:</strong> {new Date(viewResult?.created_at).toLocaleString()}</p>
                    </div>

                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                        {resultType === 'lab' ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left bg-gray-100 border-b"><th className="p-2 font-semibold">Parameter</th><th className="p-2 font-semibold">Value</th><th className="p-2 font-semibold">Ref Range</th></tr>
                                </thead>
                                <tbody>
                                    {viewResult?.sample?.results?.map(res => (
                                        <tr key={res.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-2 font-medium text-gray-800">{res.parameter?.name}</td>
                                            <td className="p-2 font-bold text-blue-700">{res.result_value} {res.parameter?.units}</td>
                                            <td className="p-2 text-gray-500 text-xs">
                                                M: {res.parameter?.ranges?.[0]?.male_min}-{res.parameter?.ranges?.[0]?.male_max}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!viewResult?.sample?.results || viewResult.sample.results.length === 0) && (
                                        <tr><td colSpan="3" className="p-6 text-center italic text-gray-500">
                                            Results pending or not yet entered.
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="space-y-4 text-sm text-gray-800 bg-white p-4 border rounded">
                                {viewResult?.report ? (
                                    <>
                                        <div className="border-b pb-2"><strong className="block text-gray-500 text-xs uppercase tracking-wide mb-1">Findings</strong><p className="whitespace-pre-wrap">{viewResult?.report?.findings}</p></div>
                                        <div className="border-b pb-2"><strong className="block text-gray-500 text-xs uppercase tracking-wide mb-1">Impression</strong><p className="font-medium text-indigo-900">{viewResult?.report?.impression}</p></div>
                                        <div><strong className="block text-gray-500 text-xs uppercase tracking-wide mb-1">Recommendation</strong><p>{viewResult?.report?.suggestion}</p></div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 italic p-6">Report has not been written yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={() => setViewResult(null)} className="bg-gray-500 hover:bg-gray-600">Close</PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* DISCHARGE MODAL */}
            <Discharge 
                show={showDischargeModal}
                onClose={() => setShowDischargeModal(false)}
                admission={admission}
                diagnosisOptions={diagnosisOptions} 
            />

        </HospitalLayout>
    );
}