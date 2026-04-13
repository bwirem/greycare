import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link} from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton'; // <--- Import this
import SecondaryButton from '@/Components/SecondaryButton'; // <--- Impor
import Modal from '@/Components/Modal'; 
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faFlask, faPills, 
    faCheckCircle, faClock, faStethoscope, faBed, faUserInjured, faExclamationTriangle, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

// --- Import Child Components ---
import HistoryTab from './Tabs/HistoryTab';
import ExaminationTab from './Tabs/ExaminationTab';
import DiagnosisTab from './Tabs/DiagnosisTab';
import OrdersTab from './Tabs/OrdersTab';
import PharmacyTab from './Tabs/PharmacyTab';
import Admit from './Admit';

export default function OpdConsultation({ 
    booking, 
    patient, 
    vital_signs, 
    existing_history, 
    existing_exam, 
    // --- History Lists ---
    ordered_labs = [], 
    ordered_rads = [], 
    ordered_meds = [],
    ordered_surgeries = [], // <--- ADDED THIS PROP
    previous_diagnoses = [], 
    // --- Dropdown Options ---
    icd_list = [], 
    lab_panels = [], 
    rad_procedures = [], 
    drugs_list = [], 
    surgery_procedures = [],
    pharmacy_frequencies = [], 
    pharmacy_durations = [],
    facilityoption = null,
    wards_list = [] 
}) {
    
    // --- 1. Data Transformation ---
    const options = {
        icd: icd_list.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` })),
        lab: lab_panels.map(l => ({ value: l.id, label: l.name })),
        rad: rad_procedures.map(r => ({ value: r.id, label: r.name })),
        drug: drugs_list.map(d => ({ value: d.id, label: d.name })),
        surgery: surgery_procedures.map(s => ({ value: s.id, label: s.name }))
    };

    // --- 2. Form State ---
    const { data, setData, post, processing, errors } = useForm({
        // History
        history_presenting_illness: existing_history?.history_presenting_illness || '',
        past_medical_history: existing_history?.past_medical_history || '',
        social_and_family_history: existing_history?.social_and_family_history || '',
        review_of_other_systems: existing_history?.review_of_other_systems || '',
        complaints: existing_history?.complains?.length > 0 ? existing_history.complains : [{ chief_complaint: '', duration: '' }] || [],
        
        // Exam
        general_condition: existing_exam?.general_condition || '',
        glasgow_coma_score: existing_exam?.glasgow_coma_score || '',
        pallor: existing_exam?.pallor === 1,
        jaundice: existing_exam?.jaundice === 1,
        cvs_examination: existing_exam?.cvs_examination || '',
        rs_examination: existing_exam?.rs_examination || '',
        abdomen_examination: existing_exam?.abdomen_examination || '',
        
        // Diagnosis & Orders
        diagnoses: [], 
        prescriptions: [],
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: '', date: '' }
    });

    // --- 3. UI State ---
    const [activeTab, setActiveTab] = useState('history');
    const [viewResult, setViewResult] = useState(null);
    const [resultType, setResultType] = useState('');   
    const [showAdmitModal, setShowAdmitModal] = useState(false);


    // --- NEW: DELETE CONFIRMATION STATE ---
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id: 1, type: 'lab' }

// --- CHECK FOR CONFIRMED DIAGNOSIS ---
    const hasConfirmedDiagnosis = 
        data.diagnoses.some(d => d.status === 'confirmed') || 
        previous_diagnoses.some(d => d.status_label === 'Confirmed' || d.status === 'Confirmed');

    // --- 4. Handlers ---


    const submit = (e) => {
        e.preventDefault();
        post(route('doctor0.store', booking.id), {
            preserveScroll: true,
            onSuccess: () => {
                setData(prev => ({ 
                    ...prev, 
                    prescriptions: [], 
                    lab_requests: [], 
                    rad_requests: [], 
                    diagnoses: [] 
                }));
                toast.success("Consultation saved successfully!");
            },
            onError: (errors) => {
                toast.error("Failed to save. Check required fields.");
                console.error(errors);
            }
        });
    };

    const openLabResult = (labRequest) => {
        setResultType('lab');
        setViewResult(labRequest);
    };

    const openRadReport = (radRequest) => {
        setResultType('rad');
        setViewResult(radRequest);
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

    // Safe Patient Data
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown';
    const patientInitial = patient?.first_name ? patient.first_name.charAt(0) : '?';

    return (
        <HospitalLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800">OPD Consultation</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">Booking #{booking.id}</span>
                    <span className={`text-sm px-3 py-1 rounded-full text-white ${booking.consultation_status === 'Seen' ? 'bg-green-500' : 'bg-orange-400'}`}>
                        {booking.consultation_status || 'Pending'}
                    </span>
                </div>
            </div>
        }>
            <Head title="Consultation" />

            <div className="py-4 max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)]">
                
                {/* --- LEFT SIDEBAR: PATIENT INFO --- */}
                <div className="w-full md:w-1/4 bg-white shadow rounded-lg p-4 overflow-y-auto hidden md:block">
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-blue-600">
                            {patientInitial}
                        </div>
                        <h3 className="font-bold text-lg">{patientName}</h3>
                        <p className="text-sm text-gray-500">{patient?.code}</p>
                        <p className="text-sm text-gray-500">{patient?.age} Yrs / {patient?.gender}</p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Latest Vitals</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {/* Blood Pressure */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">BP</span>
                                <span className="font-bold text-gray-800">{vital_signs?.blood_pressure || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">mmHg</span>
                            </div>

                            {/* Pulse */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">Pulse</span>
                                <span className="font-bold text-gray-800">{vital_signs?.pulse || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">bpm</span>
                            </div>

                            {/* SPO2 */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">SPO2</span>
                                <span className="font-bold text-gray-800">{vital_signs?.oxygensaturation || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">%</span>
                            </div>

                            {/* Temperature */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">Temp</span>
                                <span className={`font-bold ${vital_signs?.temperature > 37.5 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {vital_signs?.temperature || '-'}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-1">°C</span>
                            </div>

                            {/* Respiration Rate */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">Resp. Rate</span>
                                <span className="font-bold text-gray-800">{vital_signs?.respirationrate || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">bpm</span>
                            </div>

                            {/* Weight */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">Weight</span>
                                <span className="font-bold text-gray-800">{vital_signs?.weight || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">kg</span>
                            </div>

                            {/* Height */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">Height</span>
                                <span className="font-bold text-gray-800">{vital_signs?.height || '-'}</span>
                                <span className="text-[10px] text-gray-400 ml-1">cm</span>
                            </div>

                            {/* BMI */}
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-[10px] text-gray-500 uppercase">BMI</span>
                                <span className="font-bold text-gray-800">{vital_signs?.bmi || '-'}</span>
                            </div>

                            {/* MUAC (Spans 2 columns) */}
                            <div className="col-span-2 bg-gray-50 p-2 rounded flex justify-between items-center px-4">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">MUAC</span>
                                <div>
                                    <span className="font-bold text-gray-800">{vital_signs?.muac || '-'}</span>
                                    <span className="text-[10px] text-gray-400 ml-1">cm</span>
                                </div>
                            </div>
                        </div>
                        <Link 
                            href={route('reports.doctor.patient_history.show', patient?.code)} 
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-end"
                        >
                            Past History <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </Link>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="w-full md:w-3/4 bg-white shadow rounded-lg flex flex-col">
                    
                    {/* Navigation Tabs */}
                    <div className="flex border-b bg-gray-50 overflow-x-auto">
                        {[
                            {id: 'history', label: 'History', icon: faClock},
                            {id: 'exam', label: 'Examination', icon: faCheckCircle},
                            {id: 'diagnosis', label: 'Diagnosis', icon: faStethoscope},
                            {id: 'orders', label: 'Orders', icon: faFlask},
                            {id: 'rx', label: 'Pharmacy', icon: faPills},
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 px-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors min-w-[100px] whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600 bg-white' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <form id="consultForm" onSubmit={submit} className="h-full">
                            
                            {activeTab === 'history' && <HistoryTab data={data} setData={setData} errors={errors}  />}
                            
                            {activeTab === 'exam' && <ExaminationTab data={data} setData={setData} />}
                            
                            {activeTab === 'diagnosis' && <DiagnosisTab data={data} setData={setData} options={options.icd} previous_diagnoses={previous_diagnoses} />}
                            
                            {activeTab === 'orders' && 
                                <OrdersTab 
                                    data={data} setData={setData} 
                                    options={options} 
                                    ordered_labs={ordered_labs} 
                                    ordered_rads={ordered_rads}
                                    ordered_surgeries={ordered_surgeries} // <--- PASSED HERE
                                    onViewResult={(res, type) => { setResultType(type); setViewResult(res); }}
                                    // PASS THE NEW PROP HERE:
                                    onDeleteOrder={handleDeleteOrder} 
                                />
                            }
                            
                            {activeTab === 'rx' && 
                                <PharmacyTab 
                                    data={data} setData={setData} 
                                    drugOptions={options.drug} 
                                    ordered_meds={ordered_meds}
                                    rawDrugsList={drugs_list} 
                                    frequencies={pharmacy_frequencies}
                                    durations={pharmacy_durations}
                                    facilityoption={facilityoption}
                                    onDeleteOrder={handleDeleteOrder} 
                                    // PASS NEW DIAGNOSIS CHECK HERE:
                                    hasConfirmedDiagnosis={hasConfirmedDiagnosis}
                                />
                            }
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t rounded-b-lg">
                        <span className="text-xs text-gray-500 font-mono hidden md:inline">
                            Session ID: {booking.id} | PAT: {patient.code}
                        </span>
                        
                        <div className="flex gap-3 w-full md:w-auto justify-end">
                            {/* Admit Button */}
                            <button 
                                type="button"
                                onClick={() => setShowAdmitModal(true)}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faBed} /> Admit
                            </button>

                            {/* Save Button */}
                            <PrimaryButton 
                                onClick={submit} 
                                disabled={processing} 
                                className={`px-6 bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap transition-all ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Saving...' : 'Save Consultation'}
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

            {/* --- RESULT VIEW MODAL (Lab/Radiology) --- */}
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
                                            Results pending or not yet entered by lab technician.
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
                                    <p className="text-center text-gray-500 italic p-6">Report has not been written by radiologist yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={() => setViewResult(null)} className="bg-gray-500 hover:bg-gray-600">Close</PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* --- ADMISSION MODAL --- */}
            <Admit 
                show={showAdmitModal}
                onClose={() => setShowAdmitModal(false)}
                booking={booking}
                patient={patient}
                consultationData={data} // Passes current form state
                wards={wards_list}
                diagnosisOptions={options.icd}
            />

        </HospitalLayout>
    );
}