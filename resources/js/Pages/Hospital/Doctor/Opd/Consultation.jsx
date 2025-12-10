import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal'; 
import ReactSelect from 'react-select';
import { toast } from 'react-toastify'; // Ensure react-toastify is installed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faFlask, faPills, faXRay, 
    faCheckCircle, faClock, faStethoscope, faNotesMedical, faTrash, faPlus 
} from '@fortawesome/free-solid-svg-icons';

export default function OpdConsultation({ 
    booking, 
    patient, 
    vital_signs, 
    existing_history, 
    existing_exam, 
    ordered_labs = [], 
    ordered_rads = [], 
    ordered_meds = [],
    icd_list = [], 
    lab_panels = [], 
    rad_procedures = [], 
    drugs_list = [], 
    surgery_procedures = [],
    pharmacy_frequencies = [], 
    pharmacy_durations = []
}) {
    
    // --- 1. Data Transformation for Dropdowns ---
    const icdOptions = icd_list.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }));
    const labOptions = lab_panels.map(l => ({ value: l.id, label: l.name }));
    const radOptions = rad_procedures.map(r => ({ value: r.id, label: r.name }));
    const drugOptions = drugs_list.map(d => ({ value: d.id, label: `${d.name} (Stock: ${d.stock_quantity ?? 'N/A'})` }));
    const surgeryOptions = surgery_procedures.map(s => ({ value: s.id, label: s.name }));

    // --- 2. Main Form State ---
    const { data, setData, post, processing } = useForm({
        // History
        history_presenting_illness: existing_history?.history_presenting_illness || '',
        complaints: existing_history?.complains?.length > 0 ? existing_history.complains : [{ chief_complaint: '', duration: '' }],
        
        // Exam
        general_condition: existing_exam?.general_condition || '',
        glasgow_coma_score: existing_exam?.glasgow_coma_score || '',
        pallor: existing_exam?.pallor === 1,
        jaundice: existing_exam?.jaundice === 1,
        cvs_examination: existing_exam?.cvs_examination || '',
        rs_examination: existing_exam?.rs_examination || '',
        abdomen_examination: existing_exam?.abdomen_examination || '',
        
        // Diagnosis
        diagnoses: [], 
        
        // New Orders
        prescriptions: [],
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: '', date: '' }
    });

    // --- 3. UI State ---
    const [activeTab, setActiveTab] = useState('history');
    const [viewResult, setViewResult] = useState(null); // Data for Modal
    const [resultType, setResultType] = useState('');   // 'lab' or 'rad'

    // --- 4. Pharmacy Calculation State (Temporary) ---
    const [newRx, setNewRx] = useState({
        product_id: '',
        product_name: '',
        dosage: 1, 
        frequency_id: '',
        duration_id: '',
        quantity: 0
    });

    // --- 5. Effect: Auto-Calculate Pharmacy Quantity ---
    useEffect(() => {
        // Find Multiplier (e.g. TID = 3)
        const freqObj = pharmacy_frequencies.find(f => f.id == newRx.frequency_id);
        const freqVal = freqObj ? parseFloat(freqObj.value) : 0;

        // Find Days (e.g. 1 Week = 7)
        const durObj = pharmacy_durations.find(d => d.id == newRx.duration_id);
        const durDays = durObj ? parseInt(durObj.days) : 0;

        // Get Dosage
        const doseVal = parseFloat(newRx.dosage) || 0;

        // Calculation: Dose * Freq * Days
        const calculatedQty = Math.ceil(doseVal * freqVal * durDays);

        setNewRx(prev => ({ ...prev, quantity: calculatedQty }));
    }, [newRx.dosage, newRx.frequency_id, newRx.duration_id]);


    // --- 6. Helper Functions ---

    const addOrder = (field, item) => {
        setData(field, [...data[field], item]);
        toast.info("Item added to list.");
    };

    const removeOrder = (field, idx) => {
        const list = [...data[field]]; 
        list.splice(idx, 1); 
        setData(field, list);
        toast.warn("Item removed.");
    };

    const handleAddPrescription = () => {
        if (!newRx.product_id || newRx.quantity <= 0) {
            toast.error("Please select drug, frequency, and duration.");
            return;
        }

        // Get readable codes for display (e.g., "BID", "1/52")
        const freqCode = pharmacy_frequencies.find(f => f.id == newRx.frequency_id)?.code || '';
        const durCode = pharmacy_durations.find(d => d.id == newRx.duration_id)?.code || '';

        addOrder('prescriptions', { 
            product_id: newRx.product_id, 
            name: newRx.product_name, 
            dosage: newRx.dosage, 
            frequency: freqCode,
            duration: durCode,
            quantity: newRx.quantity 
        });

        // Reset inputs but keep 'quantity' 0
        setNewRx({ ...newRx, product_id: '', product_name: '', quantity: 0 });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor0.store', booking.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Clear "New Orders" lists after successful save
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

    // Safe Patient Data Access
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
                <div className="w-full md:w-1/4 bg-white shadow rounded-lg p-4 overflow-y-auto">
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
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-xs text-gray-500 uppercase">BP</span>
                                <span className="font-bold text-gray-800">{vital_signs?.blood_pressure || '-'}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-xs text-gray-500 uppercase">Pulse</span>
                                <span className="font-bold text-gray-800">{vital_signs?.pulse || '-'}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-xs text-gray-500 uppercase">Temp</span>
                                <span className="font-bold text-gray-800">{vital_signs?.temperature || '-'}°C</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <span className="block text-xs text-gray-500 uppercase">Weight</span>
                                <span className="font-bold text-gray-800">{vital_signs?.weight || '-'} kg</span>
                            </div>
                        </div>
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

                    {/* Scrollable Form Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <form id="consultForm" onSubmit={submit} className="space-y-6">
                            
                            {/* --- TAB 1: HISTORY --- */}
                            {activeTab === 'history' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <InputLabel value="Chief Complaints" className="font-bold" />
                                            <button type="button" onClick={() => addOrder('complaints', {chief_complaint:'', duration:''})} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                                                <FontAwesomeIcon icon={faPlus} /> Add Line
                                            </button>
                                        </div>
                                        {data.complaints.map((c, i) => (
                                            <div key={i} className="flex gap-3 mb-3 items-center">
                                                <div className="flex-grow">
                                                    <TextInput 
                                                        placeholder="Complaint (e.g. Headache)" 
                                                        className="w-full"
                                                        value={c.chief_complaint} 
                                                        onChange={e => {
                                                            const list = [...data.complaints]; list[i].chief_complaint = e.target.value; setData('complaints', list);
                                                        }} 
                                                    />
                                                </div>
                                                <div className="w-1/4">
                                                    <TextInput 
                                                        placeholder="Duration" 
                                                        className="w-full"
                                                        value={c.duration} 
                                                        onChange={e => {
                                                            const list = [...data.complaints]; list[i].duration = e.target.value; setData('complaints', list);
                                                        }} 
                                                    />
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const list = [...data.complaints]; list.splice(i, 1); setData('complaints', list);
                                                }} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div>
                                        <InputLabel value="History of Presenting Illness (HPI)" />
                                        <TextArea 
                                            className="w-full mt-1" 
                                            rows={6} 
                                            placeholder="Detailed description of the illness..."
                                            value={data.history_presenting_illness} 
                                            onChange={e => setData('history_presenting_illness', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: EXAM --- */}
                            {activeTab === 'exam' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="General Condition" />
                                            <TextInput className="w-full mt-1" placeholder="e.g. Stable, Sick looking" value={data.general_condition} onChange={e => setData('general_condition', e.target.value)} />
                                        </div>
                                        <div>
                                            <InputLabel value="Glasgow Coma Scale (GCS)" />
                                            <TextInput className="w-full mt-1" placeholder="e.g. 15/15" value={data.glasgow_coma_score} onChange={e => setData('glasgow_coma_score', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="flex gap-6 p-4 bg-gray-50 rounded border border-gray-200">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} /> 
                                            <span className="text-gray-700 font-medium">Pallor</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} /> 
                                            <span className="text-gray-700 font-medium">Jaundice</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><InputLabel value="Respiratory System" /><TextArea className="w-full mt-1" rows={3} value={data.rs_examination} onChange={e => setData('rs_examination', e.target.value)} /></div>
                                        <div><InputLabel value="Cardiovascular System" /><TextArea className="w-full mt-1" rows={3} value={data.cvs_examination} onChange={e => setData('cvs_examination', e.target.value)} /></div>
                                        <div className="md:col-span-2"><InputLabel value="Abdomen / GI" /><TextArea className="w-full mt-1" rows={3} value={data.abdomen_examination} onChange={e => setData('abdomen_examination', e.target.value)} /></div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 3: DIAGNOSIS --- */}
                            {activeTab === 'diagnosis' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
                                        <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faStethoscope} /> Add Diagnosis
                                        </h3>
                                        <ReactSelect 
                                            options={icdOptions} 
                                            className="mt-1"
                                            placeholder="Search ICD-10 Code or Description..."
                                            onChange={opt => addOrder('diagnoses', { id: opt.value, label: opt.label, type: 'icd', status: 'provisional' })}
                                            value={null} // Clear after select
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Selected Diagnoses</h4>
                                        <div className="space-y-2">
                                            {data.diagnoses.map((d, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white border border-gray-200 shadow-sm p-3 rounded-md">
                                                    <span className="font-medium text-gray-800">{d.label}</span>
                                                    <div className="flex gap-2 items-center">
                                                        <select 
                                                            className="border-gray-300 rounded text-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                                            value={d.status}
                                                            onChange={e => {
                                                                const l = [...data.diagnoses]; l[i].status = e.target.value; setData('diagnoses', l);
                                                            }}
                                                        >
                                                            <option value="provisional">Provisional</option>
                                                            <option value="confirmed">Confirmed</option>
                                                        </select>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeOrder('diagnoses', i)} 
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                                        ><FontAwesomeIcon icon={faTrash} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {data.diagnoses.length === 0 && <p className="text-gray-400 italic text-sm p-2 text-center border border-dashed rounded">No diagnoses added yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 4: ORDERS (Labs, Radiology, Surgery) --- */}
                            {activeTab === 'orders' && (
                                <div className="space-y-8 animate-fade-in">
                                    
                                    {/* SECTION 1: PREVIOUS RESULTS */}
                                    {(ordered_labs?.length > 0 || ordered_rads?.length > 0) && (
                                        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                            <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Previous Results</h3>
                                            
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-500">
                                                    <tr><th>Type</th><th>Test Name</th><th>Status</th><th className="text-right">Action</th></tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {ordered_labs.map(lab => (
                                                        <tr key={`lab-${lab.id}`}>
                                                            <td className="p-2"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">LAB</span></td>
                                                            <td className="p-2 font-medium">{lab.panel?.name}</td>
                                                            <td className="p-2 text-gray-600 capitalize">{lab.status}</td>
                                                            <td className="p-2 text-right">
                                                                {lab.status === 'completed' && (
                                                                    <button type="button" onClick={() => openLabResult(lab)} className="text-blue-600 hover:text-blue-800 underline flex items-center justify-end gap-1 w-full">
                                                                        <FontAwesomeIcon icon={faEye} /> View
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {ordered_rads.map(rad => (
                                                        <tr key={`rad-${rad.id}`}>
                                                            <td className="p-2"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">RAD</span></td>
                                                            <td className="p-2 font-medium">{rad.procedure?.name}</td>
                                                            <td className="p-2 text-gray-600 capitalize">{rad.status}</td>
                                                            <td className="p-2 text-right">
                                                                {rad.status === 'completed' && (
                                                                    <button type="button" onClick={() => openRadReport(rad)} className="text-blue-600 hover:text-blue-800 underline flex items-center justify-end gap-1 w-full">
                                                                        <FontAwesomeIcon icon={faEye} /> Report
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* SECTION 2: NEW ORDERS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Lab Order */}
                                        <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                                            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faFlask} /> Order Lab Test</h4>
                                            <ReactSelect 
                                                options={labOptions} 
                                                onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} 
                                                placeholder="Select Lab Panel..." 
                                                value={null}
                                            />
                                            <div className="mt-3 space-y-1">
                                                {data.lab_requests.map((l, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm bg-white border border-gray-200 p-2 rounded shadow-sm">
                                                        <span>{l.name}</span>
                                                        <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><FontAwesomeIcon icon={faTrash} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Radiology Order */}
                                        <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                                            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faXRay} /> Order Radiology</h4>
                                            <ReactSelect 
                                                options={radOptions} 
                                                onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} 
                                                placeholder="Select Procedure..." 
                                                value={null}
                                            />
                                            <div className="mt-3 space-y-1">
                                                {data.rad_requests.map((r, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm bg-white border border-gray-200 p-2 rounded shadow-sm">
                                                        <span>{r.name}</span>
                                                        <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><FontAwesomeIcon icon={faTrash} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Surgery Booking */}
                                    <div className="border border-red-200 p-4 rounded-lg bg-red-50 shadow-sm">
                                        <h3 className="font-bold mb-3 text-red-800 flex items-center gap-2"><FontAwesomeIcon icon={faNotesMedical} /> Book Surgery</h3>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-full md:w-1/2">
                                                <ReactSelect options={surgeryOptions} onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} placeholder="Select Procedure..." />
                                            </div>
                                            <TextInput type="datetime-local" className="w-full md:w-1/3" onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 5: PHARMACY --- */}
                            {activeTab === 'rx' && (
                                <div className="space-y-6 animate-fade-in">
                                    
                                    {/* Previous Orders Table */}
                                    {ordered_meds?.length > 0 && (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Medication History</h4>
                                            <table className="w-full text-sm">
                                                <thead><tr className="text-left text-green-700"><th>Drug</th><th>Regimen</th><th>Status</th></tr></thead>
                                                <tbody>
                                                    {ordered_meds.map(rx => (
                                                        <tr key={rx.id} className="border-b border-green-200 last:border-0">
                                                            <td className="py-2 font-medium">{rx.product?.name}</td>
                                                            <td className="py-2">{rx.dosage} x {rx.frequency} ({rx.duration})</td>
                                                            <td className="py-2">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${rx.status === 'Dispensed' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
                                                                    {rx.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Prescription Calculator */}
                                    <div className="border border-gray-300 p-5 rounded-lg bg-white shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                            <FontAwesomeIcon icon={faPills} className="text-blue-500" /> Prescribe New Medication
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            
                                            {/* 1. Drug */}
                                            <div className="md:col-span-4">
                                                <InputLabel value="Drug / Product" />
                                                <ReactSelect 
                                                    placeholder="Search Drug..." 
                                                    options={drugOptions} 
                                                    value={drugOptions.find(opt => opt.value === newRx.product_id) || null}
                                                    onChange={(opt) => setNewRx({ ...newRx, product_id: opt?.value, product_name: opt?.label })}
                                                    isClearable
                                                    className="text-sm"
                                                    menuPortalTarget={document.body} 
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>

                                            {/* 2. Dose */}
                                            <div className="md:col-span-2">
                                                <InputLabel value="Dose" />
                                                <TextInput 
                                                    type="number" step="0.1" className="w-full" 
                                                    value={newRx.dosage}
                                                    onChange={e => setNewRx({ ...newRx, dosage: e.target.value })}
                                                    placeholder="1"
                                                />
                                            </div>

                                            {/* 3. Frequency */}
                                            <div className="md:col-span-2">
                                                <InputLabel value="Frequency" />
                                                <select 
                                                    className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 text-sm"
                                                    value={newRx.frequency_id}
                                                    onChange={e => setNewRx({ ...newRx, frequency_id: e.target.value })}
                                                >
                                                    <option value="">Select...</option>
                                                    {pharmacy_frequencies.map(f => (
                                                        <option key={f.id} value={f.id}>{f.code} ({f.name})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 4. Duration */}
                                            <div className="md:col-span-2">
                                                <InputLabel value="Duration" />
                                                <select 
                                                    className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 text-sm"
                                                    value={newRx.duration_id}
                                                    onChange={e => setNewRx({ ...newRx, duration_id: e.target.value })}
                                                >
                                                    <option value="">Select...</option>
                                                    {pharmacy_durations.map(d => (
                                                        <option key={d.id} value={d.id}>{d.code} ({d.name})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 5. Qty */}
                                            <div className="md:col-span-1">
                                                <InputLabel value="Qty" />
                                                <TextInput 
                                                    type="number" 
                                                    className="w-full bg-gray-100 font-bold text-blue-700 cursor-not-allowed" 
                                                    value={newRx.quantity}
                                                    readOnly 
                                                />
                                            </div>

                                            {/* 6. Add */}
                                            <div className="md:col-span-1">
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddPrescription}
                                                    className="w-full bg-blue-600 text-white py-2 rounded shadow hover:bg-blue-700 transition h-[42px] flex items-center justify-center"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List Prescriptions */}
                                    {data.prescriptions.length > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <h4 className="font-bold text-sm text-blue-800 mb-3 border-b border-blue-200 pb-1">Items to Order</h4>
                                            {data.prescriptions.map((p, i) => (
                                                <div key={i} className="text-sm border border-blue-100 py-2 px-3 flex justify-between items-center bg-white mb-2 rounded shadow-sm">
                                                    <div>
                                                        <span className="font-bold text-gray-800 block">{p.name}</span>
                                                        <span className="text-gray-500 text-xs">
                                                            {p.dosage} x {p.frequency} for {p.duration}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">Qty: {p.quantity}</span>
                                                        <button type="button" onClick={()=>removeOrder('prescriptions', i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t rounded-b-lg">
                        <span className="text-xs text-gray-500 font-mono">ID: {booking.id} | PAT: {patient.code}</span>
                        <PrimaryButton 
                            onClick={submit} 
                            disabled={processing} 
                            className={`px-8 transition-all ${processing ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            {processing ? 'Saving...' : 'Save Consultation'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* --- RESULT VIEW MODAL --- */}
            <Modal show={!!viewResult} onClose={() => setViewResult(null)} maxWidth="2xl">
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

        </HospitalLayout>
    );
}