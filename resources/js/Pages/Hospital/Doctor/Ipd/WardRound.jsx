import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import ReactSelect from 'react-select';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, faFlask, faPills, faXRay, faTint, faHistory,
    faCheckCircle, faClipboardList, faTrash, faPlus 
} from '@fortawesome/free-solid-svg-icons';

export default function WardRound({ 
    admission, patient, previous_rounds = [], 
    ordered_labs = [], ordered_rads = [], ordered_meds = [],
    lab_panels = [], rad_procedures = [], drugs_list = [], bb_components = [],
    pharmacy_frequencies = [], pharmacy_durations = []
}) {
    
    // --- Data Transformation ---
    const labOptions = lab_panels.map(l => ({ value: l.id, label: l.name }));
    const radOptions = rad_procedures.map(r => ({ value: r.id, label: r.name }));
    const bloodOptions = bb_components.map(b => ({ value: b.id, label: b.name }));
    const drugOptions = drugs_list.map(d => ({ value: d.id, label: d.name }));

    // --- Form State ---
    const { data, setData, post, processing } = useForm({
        // Assessment
        clinical_notes: '',
        treatment_plan: '',
        general_condition: '',
        
        // Physical Exam
        glasgow_coma_score: '',
        pallor: false,
        jaundice: false,
        cvs_examination: '',
        rs_examination: '',
        abdomen_examination: '',

        // Orders
        lab_requests: [],
        rad_requests: [],
        blood_requests: [],
        new_prescriptions: []
    });

    // --- UI State ---
    const [activeTab, setActiveTab] = useState('assessment');
    const [viewResult, setViewResult] = useState(null);
    const [resultType, setResultType] = useState('');

    // --- Local State for Inputs ---
    const [newRx, setNewRx] = useState({
        product_id: '', product_name: '', dosage: 1, 
        frequency_id: '', duration_id: '', quantity: 0
    });

    const [newBlood, setNewBlood] = useState({
        component_id: '', component_name: '', units: 1
    });

    // --- Auto-Calculate Pharmacy ---
    useEffect(() => {
        const freqObj = pharmacy_frequencies.find(f => f.id == newRx.frequency_id);
        const freqVal = freqObj ? parseFloat(freqObj.value) : 0;

        const durObj = pharmacy_durations.find(d => d.id == newRx.duration_id);
        const durDays = durObj ? parseInt(durObj.days) : 0;

        const doseVal = parseFloat(newRx.dosage) || 0;
        const calculatedQty = Math.ceil(doseVal * freqVal * durDays);

        setNewRx(prev => ({ ...prev, quantity: calculatedQty }));
    }, [newRx.dosage, newRx.frequency_id, newRx.duration_id]);

    // --- Helpers ---
    const addOrder = (field, item) => {
        setData(field, [...data[field], item]);
        toast.info("Item added.");
    };

    const removeOrder = (field, idx) => {
        const list = [...data[field]]; list.splice(idx, 1); setData(field, list);
    };

    const handleAddPrescription = () => {
        if (!newRx.product_id || newRx.quantity <= 0) {
            toast.error("Complete prescription details.");
            return;
        }
        const freqCode = pharmacy_frequencies.find(f => f.id == newRx.frequency_id)?.code || '';
        const durCode = pharmacy_durations.find(d => d.id == newRx.duration_id)?.code || '';

        addOrder('new_prescriptions', { 
            product_id: newRx.product_id, name: newRx.product_name, 
            dosage: newRx.dosage, frequency: freqCode, duration: durCode, quantity: newRx.quantity 
        });
        setNewRx({ ...newRx, product_id: '', product_name: '', quantity: 0 });
    };

    const handleAddBlood = () => {
        if (!newBlood.component_id || !newBlood.units) {
            toast.error("Select blood component and units.");
            return;
        }
        addOrder('blood_requests', { 
            component_id: newBlood.component_id, 
            name: newBlood.component_name, 
            units: newBlood.units 
        });
        setNewBlood({ component_id: '', component_name: '', units: 1 });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor1.store', admission.id), {
            onSuccess: () => {
                toast.success("Round Saved!");
                // Clear temporary lists
                setData(d => ({ ...d, lab_requests: [], rad_requests: [], blood_requests: [], new_prescriptions: [] }));
            },
            onError: () => toast.error("Error saving round.")
        });
    };

    // --- Render ---
    return (
        <HospitalLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800">IPD Ward Round</h2>
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    {admission.ward?.name} / Bed {admission.bed?.name}
                </div>
            </div>
        }>
            <Head title="Ward Round" />

            <div className="py-4 max-w-7xl mx-auto sm:px-6 lg:px-8 flex gap-4 h-[calc(100vh-140px)]">
                
                {/* LEFT: PATIENT SUMMARY */}
                <div className="w-1/4 bg-white shadow rounded-lg p-4 overflow-y-auto hidden md:block">
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold text-green-600">
                            {patient.first_name.charAt(0)}
                        </div>
                        <h3 className="font-bold">{patient.first_name} {patient.last_name}</h3>
                        <p className="text-xs text-gray-500">{patient.code} | {patient.age}Y</p>
                    </div>
                    <div className="text-sm space-y-2">
                        <p><strong>Admitted:</strong> {new Date(admission.created_at).toLocaleDateString()}</p>
                        <p><strong>Diagnosis:</strong> <span className="italic text-gray-600">See History</span></p>
                    </div>
                </div>

                {/* RIGHT: MAIN TABS */}
                <div className="w-full md:w-3/4 bg-white shadow rounded-lg flex flex-col">
                    
                    {/* Tabs */}
                    <div className="flex border-b bg-gray-50">
                        {[
                            {id: 'assessment', label: 'Assessment', icon: faClipboardList},
                            {id: 'history', label: 'History', icon: faHistory},
                            {id: 'orders', label: 'Orders/Labs', icon: faFlask},
                            {id: 'rx', label: 'Pharmacy', icon: faPills},
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <form onSubmit={submit} className="space-y-6">

                            {/* TAB: ASSESSMENT */}
                            {activeTab === 'assessment' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><InputLabel value="General Condition" /><TextInput className="w-full mt-1" value={data.general_condition} onChange={e => setData('general_condition', e.target.value)} /></div>
                                        <div><InputLabel value="GCS" /><TextInput className="w-full mt-1" placeholder="15/15" value={data.glasgow_coma_score} onChange={e => setData('glasgow_coma_score', e.target.value)} /></div>
                                    </div>
                                    <div className="flex gap-4 p-3 bg-gray-50 rounded border">
                                        <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} /> Pallor</label>
                                        <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} /> Jaundice</label>
                                    </div>
                                    <div><InputLabel value="Progress Notes" /><TextArea className="w-full mt-1" rows={6} value={data.clinical_notes} onChange={e => setData('clinical_notes', e.target.value)} /></div>
                                    <div><InputLabel value="Plan" /><TextArea className="w-full mt-1" rows={3} value={data.treatment_plan} onChange={e => setData('treatment_plan', e.target.value)} /></div>
                                </div>
                            )}

                            {/* TAB: HISTORY (Previous Rounds) */}
                            {activeTab === 'history' && (
                                <div className="space-y-4 animate-fade-in">
                                    <h4 className="font-bold text-gray-700">Previous Rounds</h4>
                                    {previous_rounds.length === 0 ? <p className="italic text-gray-500">No previous rounds.</p> :
                                        previous_rounds.map(round => (
                                            <div key={round.id} className="border-l-4 border-green-400 bg-gray-50 p-4 rounded shadow-sm">
                                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                    <span>{new Date(round.round_date).toLocaleString()}</span>
                                                    <span>{round.doctor?.name}</span>
                                                </div>
                                                <p className="text-gray-800 whitespace-pre-wrap">{round.clinical_notes}</p>
                                                <div className="mt-2 text-sm text-green-800"><strong>Plan:</strong> {round.treatment_plan}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {/* TAB: ORDERS (Lab, Rad, Blood) */}
                            {activeTab === 'orders' && (
                                <div className="space-y-8 animate-fade-in">
                                    
                                    {/* Existing Orders Table */}
                                    <div className="bg-gray-50 border p-3 rounded">
                                        <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Active Orders</h4>
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-left"><th>Type</th><th>Name</th><th>Status</th><th></th></tr></thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {ordered_labs.map(l => (
                                                    <tr key={`l-${l.id}`}><td className="text-purple-600 font-bold">LAB</td><td>{l.panel?.name}</td><td>{l.status}</td>
                                                    <td>{l.status==='completed' && <button type="button" onClick={()=>{setResultType('lab'); setViewResult(l)}} className="text-blue-600 underline">View</button>}</td></tr>
                                                ))}
                                                {ordered_rads.map(r => (
                                                    <tr key={`r-${r.id}`}><td className="text-orange-600 font-bold">RAD</td><td>{r.procedure?.name}</td><td>{r.status}</td>
                                                    <td>{r.status==='completed' && <button type="button" onClick={()=>{setResultType('rad'); setViewResult(r)}} className="text-blue-600 underline">View</button>}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Order Forms */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border p-3 rounded">
                                            <h5 className="font-bold mb-2 text-sm"><FontAwesomeIcon icon={faFlask} /> Order Lab</h5>
                                            <ReactSelect options={labOptions} onChange={opt => addOrder('lab_requests', {panel_id: opt.value, name: opt.label})} value={null} placeholder="Select Panel" />
                                            {data.lab_requests.map((x,i) => <div key={i} className="text-xs mt-1 flex justify-between bg-white p-1 rounded border">{x.name} <button type="button" onClick={()=>removeOrder('lab_requests',i)} className="text-red-500 font-bold">x</button></div>)}
                                        </div>
                                        <div className="border p-3 rounded">
                                            <h5 className="font-bold mb-2 text-sm"><FontAwesomeIcon icon={faXRay} /> Order Rad</h5>
                                            <ReactSelect options={radOptions} onChange={opt => addOrder('rad_requests', {procedure_id: opt.value, name: opt.label})} value={null} placeholder="Select Procedure" />
                                            {data.rad_requests.map((x,i) => <div key={i} className="text-xs mt-1 flex justify-between bg-white p-1 rounded border">{x.name} <button type="button" onClick={()=>removeOrder('rad_requests',i)} className="text-red-500 font-bold">x</button></div>)}
                                        </div>
                                    </div>

                                    <div className="border border-red-200 bg-red-50 p-3 rounded">
                                        <h5 className="font-bold mb-2 text-red-800 text-sm"><FontAwesomeIcon icon={faTint} /> Blood Request</h5>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-3/4">
                                                <ReactSelect 
                                                    options={bloodOptions} 
                                                    value={bloodOptions.find(o => o.value === newBlood.component_id) || null}
                                                    onChange={opt => setNewBlood({ ...newBlood, component_id: opt?.value, component_name: opt?.label })} 
                                                    placeholder="Select Component..." 
                                                />
                                            </div>
                                            <input 
                                                type="number" 
                                                className="w-20 border-gray-300 rounded text-sm h-[38px]" 
                                                placeholder="Units" 
                                                value={newBlood.units}
                                                onChange={e => setNewBlood({ ...newBlood, units: e.target.value })}
                                            />
                                            <button type="button" className="bg-red-600 text-white px-4 h-[38px] rounded text-sm hover:bg-red-700" onClick={handleAddBlood}>Add</button>
                                        </div>
                                        {data.blood_requests.map((x,i) => (
                                            <div key={i} className="text-xs mt-2 flex justify-between bg-white p-2 rounded border border-red-100">
                                                <span>{x.name} ({x.units} U)</span> 
                                                <button type="button" onClick={()=>removeOrder('blood_requests',i)} className="text-red-500 font-bold">x</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB: PHARMACY */}
                            {activeTab === 'rx' && (
                                <div className="space-y-6 animate-fade-in">
                                    
                                    {/* History */}
                                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                                        <h4 className="font-bold text-xs uppercase text-green-800 mb-2">Active Medications</h4>
                                        <ul className="text-sm space-y-1">
                                            {ordered_meds.map(m => (
                                                <li key={m.id} className="flex justify-between border-b border-green-100 last:border-0 pb-1">
                                                    <span>{m.product?.name} - {m.dosage} x {m.frequency}</span>
                                                    <span className="font-bold text-xs text-green-900">{m.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Prescription Calculator */}
                                    <div className="border border-gray-300 p-4 rounded bg-white shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-2 text-sm"><FontAwesomeIcon icon={faPills} /> Prescribe</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                            <div className="md:col-span-4">
                                                <InputLabel value="Drug" />
                                                <ReactSelect 
                                                    options={drugOptions} 
                                                    value={drugOptions.find(o => o.value === newRx.product_id) || null}
                                                    onChange={opt => setNewRx({...newRx, product_id: opt?.value, product_name: opt?.label})} 
                                                    menuPortalTarget={document.body} 
                                                    styles={{menuPortal: base => ({...base, zIndex: 9999})}} 
                                                    placeholder="Search..."
                                                />
                                            </div>
                                            <div className="md:col-span-2"><InputLabel value="Dose" /><TextInput type="number" step="0.5" className="w-full" value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} /></div>
                                            <div className="md:col-span-2"><InputLabel value="Freq" /><select className="w-full border-gray-300 rounded" value={newRx.frequency_id} onChange={e => setNewRx({...newRx, frequency_id: e.target.value})}>{pharmacy_frequencies.map(f=><option key={f.id} value={f.id}>{f.code}</option>)}</select></div>
                                            <div className="md:col-span-2"><InputLabel value="Dur" /><select className="w-full border-gray-300 rounded" value={newRx.duration_id} onChange={e => setNewRx({...newRx, duration_id: e.target.value})}>{pharmacy_durations.map(d=><option key={d.id} value={d.id}>{d.code}</option>)}</select></div>
                                            <div className="md:col-span-1"><InputLabel value="Qty" /><TextInput className="w-full bg-gray-100" value={newRx.quantity} readOnly /></div>
                                            <div className="md:col-span-1"><button type="button" onClick={handleAddPrescription} className="w-full bg-blue-600 text-white h-[42px] rounded hover:bg-blue-700">+</button></div>
                                        </div>
                                    </div>

                                    {/* Staged */}
                                    {data.new_prescriptions.map((p, i) => (
                                        <div key={i} className="text-sm border-b py-2 flex justify-between items-center bg-gray-50 px-2 rounded">
                                            <span><strong>{p.name}</strong>: {p.dosage} x {p.frequency} ({p.duration}) &rarr; Qty: {p.quantity}</span>
                                            <button type="button" onClick={()=>removeOrder('new_prescriptions', i)} className="text-red-500 font-bold hover:text-red-700">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </form>
                    </div>

                    <div className="bg-gray-100 px-6 py-4 flex justify-between border-t rounded-b-lg">
                        <span className="text-xs text-gray-500 self-center">ID: {admission.id}</span>
                        <PrimaryButton onClick={submit} disabled={processing} className="px-8 bg-green-600 hover:bg-green-700">Save Round</PrimaryButton>
                    </div>
                </div>
            </div>

            {/* RESULT MODAL */}
            <Modal show={!!viewResult} onClose={() => setViewResult(null)} maxWidth="lg">
                <div className="p-6">
                    <h3 className="font-bold text-lg mb-4">{resultType === 'lab' ? 'Lab Result' : 'Radiology Report'}</h3>
                    {resultType === 'lab' ? (
                        <table className="w-full text-sm">
                            <thead><tr className="text-left bg-gray-100"><th className="p-2">Param</th><th className="p-2">Value</th></tr></thead>
                            <tbody>
                                {viewResult?.sample?.results?.map(res => (
                                    <tr key={res.id} className="border-b">
                                        <td className="p-2">{res.parameter?.name}</td>
                                        <td className="p-2 font-bold">{res.result_value} {res.parameter?.units}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-sm whitespace-pre-wrap">{viewResult?.report?.findings || 'No report yet.'}</div>
                    )}
                    <div className="mt-4 flex justify-end"><PrimaryButton onClick={() => setViewResult(null)}>Close</PrimaryButton></div>
                </div>
            </Modal>

        </HospitalLayout>
    );
}