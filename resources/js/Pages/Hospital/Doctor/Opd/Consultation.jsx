import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheckCircle, faStethoscope, faFlask, faPills } from '@fortawesome/free-solid-svg-icons';

// Import Child Components
import HistoryTab from './Tabs/HistoryTab';
import ExaminationTab from './Tabs/ExaminationTab';
import DiagnosisTab from './Tabs/DiagnosisTab';
import OrdersTab from './Tabs/OrdersTab';
import PharmacyTab from './Tabs/PharmacyTab';

export default function OpdConsultation({ 
    booking, patient, vital_signs, 
    existing_history, existing_exam, 
    ordered_labs = [], ordered_rads = [], ordered_meds = [],
    icd_list = [], lab_panels = [], rad_procedures = [], 
    drugs_list = [], surgery_procedures = [],
    pharmacy_frequencies = [], pharmacy_durations = []
}) {
    
    // --- 1. Data Prep for Dropdowns ---
    const options = {
        icd: icd_list.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` })),
        lab: lab_panels.map(l => ({ value: l.id, label: l.name })),
        rad: rad_procedures.map(r => ({ value: r.id, label: r.name })),
        drug: drugs_list.map(d => ({ value: d.id, label: d.name })),
        surgery: surgery_procedures.map(s => ({ value: s.id, label: s.name }))
    };

    // --- 2. Form State ---
    const { data, setData, post, processing } = useForm({
        // History
        history_presenting_illness: existing_history?.history_presenting_illness || '',
        past_medical_history: existing_history?.past_medical_history || '',           
        social_and_family_history: existing_history?.social_and_family_history || '', 
        review_of_other_systems: existing_history?.review_of_other_systems || '', 
        complaints: existing_history?.complains?.length > 0 ? existing_history.complains : [{ chief_complaint: '', duration: '' }],
        // Exam
        general_condition: existing_exam?.general_condition || '',
        glasgow_coma_score: existing_exam?.glasgow_coma_score || '',
        pallor: existing_exam?.pallor === 1,
        jaundice: existing_exam?.jaundice === 1,
        cvs_examination: existing_exam?.cvs_examination || '',
        rs_examination: existing_exam?.rs_examination || '',
        abdomen_examination: existing_exam?.abdomen_examination || '',
        // Lists
        diagnoses: [], 
        prescriptions: [],
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: '', date: '' }
    });

    const [activeTab, setActiveTab] = useState('history');

    // --- 3. Shared Handlers ---
    const submit = (e) => {
        e.preventDefault();
        post(route('doctor0.store', booking.id), {
            preserveScroll: true,
            onSuccess: () => {
                setData(prev => ({ ...prev, prescriptions: [], lab_requests: [], rad_requests: [], diagnoses: [] }));
                toast.success("Consultation saved successfully!");
            },
            onError: () => toast.error("Failed to save. Check required fields.")
        });
    };

    // Safe Patient Data
    const patientInitial = patient?.first_name ? patient.first_name.charAt(0) : '?';

    return (
        <HospitalLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800">OPD Consultation</h2>
                <span className={`text-sm px-3 py-1 rounded-full text-white ${booking.consultation_status === 'Seen' ? 'bg-green-500' : 'bg-orange-400'}`}>
                    {booking.consultation_status || 'Pending'}
                </span>
            </div>
        }>
            <Head title="Consultation" />

            <div className="py-4 max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)]">
                
                {/* --- LEFT SIDEBAR --- */}
                <div className="w-full md:w-1/4 bg-white shadow rounded-lg p-4 overflow-y-auto hidden md:block">
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-blue-600">
                            {patientInitial}
                        </div>
                        <h3 className="font-bold text-lg">{patient?.first_name} {patient?.last_name}</h3>
                        <p className="text-sm text-gray-500">{patient?.code}</p>
                        <p className="text-sm text-gray-500">{patient?.age} Yrs / {patient?.gender}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Latest Vitals</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded text-center"><span className="block text-xs text-gray-500 uppercase">BP</span><span className="font-bold text-gray-800">{vital_signs?.blood_pressure || '-'}</span></div>
                            <div className="bg-gray-50 p-2 rounded text-center"><span className="block text-xs text-gray-500 uppercase">Pulse</span><span className="font-bold text-gray-800">{vital_signs?.pulse || '-'}</span></div>
                            <div className="bg-gray-50 p-2 rounded text-center"><span className="block text-xs text-gray-500 uppercase">Temp</span><span className="font-bold text-gray-800">{vital_signs?.temperature || '-'}°C</span></div>
                            <div className="bg-gray-50 p-2 rounded text-center"><span className="block text-xs text-gray-500 uppercase">Weight</span><span className="font-bold text-gray-800">{vital_signs?.weight || '-'} kg</span></div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="w-full md:w-3/4 bg-white shadow rounded-lg flex flex-col">
                    
                    {/* Tabs */}
                    <div className="flex border-b bg-gray-50 overflow-x-auto">
                        {[
                            {id: 'history', label: 'History', icon: faClock},
                            {id: 'exam', label: 'Exam', icon: faCheckCircle},
                            {id: 'diagnosis', label: 'Diagnosis', icon: faStethoscope},
                            {id: 'orders', label: 'Orders', icon: faFlask},
                            {id: 'rx', label: 'Pharmacy', icon: faPills},
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 px-2 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors min-w-[100px] whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <form id="consultForm" onSubmit={submit} className="h-full">
                            
                            {activeTab === 'history' && <HistoryTab data={data} setData={setData} />}
                            
                            {activeTab === 'exam' && <ExaminationTab data={data} setData={setData} />}
                            
                            {activeTab === 'diagnosis' && <DiagnosisTab data={data} setData={setData} options={options.icd} />}
                            
                            {activeTab === 'orders' && <OrdersTab data={data} setData={setData} options={options} ordered_labs={ordered_labs} ordered_rads={ordered_rads} />}
                            
                            {activeTab === 'rx' && 
                                <PharmacyTab 
                                    data={data} setData={setData} 
                                    drugOptions={options.drug} 
                                    ordered_meds={ordered_meds}
                                    rawDrugsList={drugs_list} // Needed for calculation
                                    frequencies={pharmacy_frequencies}
                                    durations={pharmacy_durations}
                                />
                            }
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t rounded-b-lg">
                        <span className="text-xs text-gray-500 font-mono">ID: {booking.id} | PAT: {patient?.code}</span>
                        <PrimaryButton onClick={submit} disabled={processing} className="px-8 bg-indigo-600 hover:bg-indigo-700">
                            {processing ? 'Saving...' : 'Save Consultation'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}