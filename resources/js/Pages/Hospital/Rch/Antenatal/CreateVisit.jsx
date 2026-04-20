import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, faSpinner, faStethoscope, faVial, 
    faFlask, faXRay, faNotesMedical, faEye,
    faUserCircle, faCheckCircle, faPrint // New imports for the modal
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Modal from '@/Components/Modal'; // Added Modal
import SecondaryButton from '@/Components/SecondaryButton'; // Added SecondaryButton

// --- CLINICAL TAB ---
const ClinicalTab = ({ data, setData, errors }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gestational Age (Weeks) *</label>
                    <input 
                        type="number" 
                        value={data.gestational_age_weeks} 
                        onChange={e => setData('gestational_age_weeks', e.target.value)} 
                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.gestational_age_weeks ? 'border-red-500' : 'border-gray-300'}`}
                        required min="1" max="45" 
                    />
                    {errors.gestational_age_weeks && <p className="text-red-500 text-xs mt-1">{errors.gestational_age_weeks}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fundal Height (cm)</label>
                    <input type="number" value={data.fundal_height_cm} onChange={e => setData('fundal_height_cm', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" step="0.1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fetal Heart Rate (bpm)</label>
                    <input type="text" value={data.fetal_heart_rate} onChange={e => setData('fetal_heart_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="140" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fetal Lie</label>
                    <select value={data.fetal_lie} onChange={e => setData('fetal_lie', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select</option>
                        <option value="Longitudinal">Longitudinal</option>
                        <option value="Transverse">Transverse</option>
                        <option value="Oblique">Oblique</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Urine Albumin</label>
                    <select value={data.urine_albumin} onChange={e => setData('urine_albumin', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Not Done</option>
                        <option value="Neg">Negative</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                        <option value="+++">+++</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">HIV Status</label>
                    <select value={data.hiv_status} onChange={e => setData('hiv_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Unknown</option>
                        <option value="Neg">Negative</option>
                        <option value="Known Pos">Known Positive</option>
                        <option value="New Pos">New Positive</option>
                    </select>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Interventions Given Today</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={data.iron_folate} onChange={e => setData('iron_folate', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>Iron & Folate</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={data.ipt_malaria} onChange={e => setData('ipt_malaria', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>SP (Malaria)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={data.tt_vaccine} onChange={e => setData('tt_vaccine', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>TT Vaccine</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={data.deworming} onChange={e => setData('deworming', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>Deworming</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={data.arv_prophylaxis} onChange={e => setData('arv_prophylaxis', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>ARV Prophylaxis</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="3"></textarea>
            </div>
        </div>
    );
};

// --- ORDERS TAB ---
const OrdersTab = ({ data, setData, options, history, setViewItem }) => {
    
    const addOrder = (field, item) => {
        if (field === 'lab_requests' && data.lab_requests.find(x => x.panel_id === item.panel_id)) return toast.warning("Lab already added.");
        if (field === 'rad_requests' && data.rad_requests.find(x => x.procedure_id === item.procedure_id)) return toast.warning("Procedure already added.");
        setData(field, [...data[field], item]);
        toast.info("Order added.");
    };

    const removeOrder = (field, index) => {
        const list = [...data[field]];
        list.splice(index, 1);
        setData(field, list);
    };

    // Helper to determine if status implies "done"
    const isCompleted = (status) => ['verified', 'completed', 'finalized', 'reported'].includes(status?.toLowerCase());

    return (
        <div className="space-y-8 animate-fade-in">
            {(history?.labs?.length > 0 || history?.rads?.length > 0 || history?.surgeries?.length > 0) && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Active Orders & History</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-3 w-16">Type</th>
                                <th className="p-3">Details</th>
                                <th className="p-3 w-32">Status</th>
                                <th className="p-3 w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Labs History */}
                            {history.labs.map(l => (
                                <tr key={`l-${l.id}`} className="hover:bg-gray-50">
                                    <td className="p-3"><span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded font-bold">LAB</span></td>
                                    <td className="p-3 font-medium">{l.panel?.name}</td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isCompleted(l.status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {isCompleted(l.status) && l.sample?.results?.length > 0 && (
                                            <button type="button" onClick={() => setViewItem({ type: 'LAB', ...l })} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end w-full">
                                                <FontAwesomeIcon icon={faEye} className="mr-1"/> View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {/* Radiology History */}
                            {history.rads.map(r => (
                                <tr key={`r-${r.id}`} className="hover:bg-gray-50">
                                    <td className="p-3"><span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded font-bold">RAD</span></td>
                                    <td className="p-3 font-medium">{r.procedure?.name}</td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isCompleted(r.status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {isCompleted(r.status) && r.report && (
                                            <button type="button" onClick={() => setViewItem({ type: 'RAD', ...r })} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end w-full">
                                                <FontAwesomeIcon icon={faEye} className="mr-1"/> View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faFlask} className="text-purple-600" /> Order Lab Test</h4>
                    <Select options={options?.lab} onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} placeholder="Select Lab Panel..." value={null} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} menuPortalTarget={document.body} />
                    <div className="mt-3 space-y-1">{data.lab_requests.map((l, i) => (<div key={i} className="flex justify-between items-center p-2 bg-white border rounded text-xs font-medium"><span>{l.name}</span><button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button></div>))}</div>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faXRay} className="text-orange-600" /> Order Radiology</h4>
                    <Select options={options?.rad} onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} placeholder="Select Procedure..." value={null} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} menuPortalTarget={document.body} />
                    <div className="mt-3 space-y-1">{data.rad_requests.map((r, i) => (<div key={i} className="flex justify-between items-center p-2 bg-white border rounded text-xs font-medium"><span>{r.name}</span><button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button></div>))}</div>
                </div>
            </div>
            
            <div className="border border-red-200 p-4 rounded-lg bg-red-50 shadow-sm">
                <h3 className="font-bold mb-3 text-red-800 flex items-center gap-2"><FontAwesomeIcon icon={faNotesMedical} /> Book Surgery</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Procedure</label>
                        <Select options={options?.surgery} onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} placeholder="Select Procedure..." styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} menuPortalTarget={document.body} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input type="datetime-local" className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function CreateVisit({ auth, preselectedPregnancy, options, history }) {
    
    const [patientOptions, setPatientOptions] = useState([]);
    const [activePregnancy, setActivePregnancy] = useState(preselectedPregnancy || null);
    const [activeTab, setActiveTab] = useState('clinical'); 
    
    // --- MODAL STATE ---
    const [viewItem, setViewItem] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        pregnancy_id: preselectedPregnancy?.id || '',
        gestational_age_weeks: '',
        fundal_height_cm: '',
        fetal_heart_rate: '',
        fetal_lie: '',
        urine_albumin: '',
        syphilis_result: '',
        hiv_status: '',
        arv_prophylaxis: false,
        ipt_malaria: false,
        tt_vaccine: false,
        iron_folate: false,
        deworming: false,
        remarks: '',
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: null, date: '' },
    });

    useEffect(() => {
        if (preselectedPregnancy) {
            setData('pregnancy_id', preselectedPregnancy.id);
            setActivePregnancy(preselectedPregnancy);
        }
    }, [preselectedPregnancy]);

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                setPatientOptions(json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                })));
            });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rch1.visit.store'), {
            onSuccess: () => toast.success("Visit saved successfully!"),
            onError: () => toast.error("Please check the form for errors.")
        });
    };

    // Helper to get patient details for the modal
    const patient = activePregnancy?.patient;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">New ANC Visit</h2>}>
            <Head title="ANC Visit" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {!activePregnancy && (
                        <div className="bg-white p-6 shadow-sm rounded-lg mb-6">
                            <h3 className="text-lg font-medium mb-4">Select Patient</h3>
                            <Select
                                options={patientOptions}
                                onInputChange={loadPatients}
                                onChange={(opt) => router.visit(route('rch1.visit.create', { patient_code: opt?.value }))}
                                placeholder="Search by Name or File No..."
                                className="basic-single"
                            />
                        </div>
                    )}
                    {activePregnancy && (
                        <div className="bg-white shadow-md sm:rounded-lg overflow-hidden">
                            <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{activePregnancy.patient.first_name} {activePregnancy.patient.last_name}</h3>
                                    <div className="text-sm text-gray-600 mt-1 flex gap-4">
                                        <span><span className="font-semibold">ANC No:</span> {activePregnancy.anc_number}</span>
                                        <span><span className="font-semibold">LMP:</span> {activePregnancy.lmp_date}</span>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold border border-green-200">Active Pregnancy</span>
                            </div>

                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button onClick={() => setActiveTab('clinical')} className={`flex-1 py-4 text-center text-sm font-medium transition-colors border-b-2 ${activeTab === 'clinical' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500'}`}>
                                    <FontAwesomeIcon icon={faStethoscope} className="mr-2" /> Clinical Assessment
                                </button>
                                <button onClick={() => setActiveTab('orders')} className={`flex-1 py-4 text-center text-sm font-medium transition-colors border-b-2 ${activeTab === 'orders' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500'}`}>
                                    <FontAwesomeIcon icon={faVial} className="mr-2" /> Orders & Investigations
                                </button>
                            </div>

                            <form onSubmit={submit} className="p-6">
                                <input type="hidden" value={data.pregnancy_id} />
                                {activeTab === 'clinical' ? (
                                    <ClinicalTab data={data} setData={setData} errors={errors} />
                                ) : (
                                    <OrdersTab data={data} setData={setData} options={options} history={history} setViewItem={setViewItem} />
                                )}

                                <div className="flex justify-between items-center border-t mt-8 pt-4">
                                    <Link href={route('rch1.index')} className="text-gray-500 hover:text-gray-700 px-4">Cancel</Link>
                                    <div className="flex gap-3">
                                        <button type="submit" disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                                            {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                            Save Visit Details
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* --- UNIVERSAL RESULTS MODAL --- */}
            <Modal show={viewItem !== null} onClose={() => setViewItem(null)} maxWidth={viewItem?.type === 'RAD' ? '3xl' : '2xl'}>
                {viewItem && patient && (
                    <div className="p-0 sm:p-6 bg-white relative">
                        
                        {/* Print Header */}
                        <div className="hidden print:block mb-8 text-center border-b-2 pb-4">
                            <h1 className="text-2xl font-bold uppercase">
                                {viewItem.type === 'LAB' ? 'Laboratory Report' : 'Radiology Report'}
                            </h1>
                            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleString()}</p>
                        </div>

                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-6 pt-4 sm:pt-0 px-6 sm:px-0 bg-gray-50 sm:bg-white rounded-t-lg">
                            <div className="flex gap-4 items-start">
                                <div className="hidden sm:block bg-blue-100 text-blue-600 p-3 rounded-full">
                                    <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                        {patient.first_name} {patient.last_name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600 mt-1">
                                        <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-800">
                                            {patient.code}
                                        </span>
                                        <span>Age: {patient.age || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 text-left sm:text-right w-full sm:w-auto bg-white p-3 sm:p-0 rounded border sm:border-0 border-gray-200">
                                <h3 className="text-blue-800 font-bold text-base flex items-center justify-start sm:justify-end">
                                    <FontAwesomeIcon icon={viewItem.type === 'LAB' ? faFlask : faXRay} className="mr-2" />
                                    {viewItem.type === 'LAB' ? viewItem.panel?.name : viewItem.procedure?.name}
                                </h3>
                                <div className="text-xs text-gray-500 mt-1">
                                    <strong>{viewItem.type === 'LAB' ? 'Sample ID:' : 'ACC:'}</strong> <span className="font-mono">{viewItem.type === 'LAB' ? viewItem.sample?.sample_code : viewItem.accession_number}</span>
                                    <span className="mx-2">|</span>
                                    <strong>Date:</strong> {new Date(viewItem.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* --- RENDER LAB RESULTS --- */}
                        {viewItem.type === 'LAB' && (
                            <div className="px-6 sm:px-0 overflow-hidden rounded-lg border border-gray-200 mb-6">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Parameter</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Result</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Units</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Ref. Range</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {viewItem.sample?.results?.map((res, i) => {
                                            const range = res.parameter?.ranges?.[0];
                                            const rangeStr = range ? `M: ${range.male_min}-${range.male_max} / F: ${range.female_min}-${range.female_max}` : 'N/A';
                                            
                                            return (
                                                <tr key={res.id || i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{res.parameter?.name}</td>
                                                    <td className="px-4 py-3 font-bold text-blue-700">{res.result_value}</td>
                                                    <td className="px-4 py-3 text-gray-500">{res.parameter?.units || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">{rangeStr}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- RENDER RADIOLOGY REPORT --- */}
                        {viewItem.type === 'RAD' && (
                            <div className="px-6 sm:px-0 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faNotesMedical} className="mr-2" /> Findings
                                    </h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded p-4 text-gray-800 text-sm whitespace-pre-wrap font-mono min-h-[100px]">
                                        {viewItem.report?.findings || <span className="text-gray-400 italic">No findings recorded.</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Impression
                                    </h4>
                                    <div className="bg-blue-50 border border-blue-100 rounded p-4 text-blue-900 text-sm font-bold whitespace-pre-wrap">
                                        {viewItem.report?.impression || <span className="text-blue-400 italic font-normal">No impression recorded.</span>}
                                    </div>
                                </div>

                                {viewItem.report?.suggestion && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Recommendation
                                        </h4>
                                        <div className="bg-white border-l-4 border-yellow-400 p-3 text-gray-700 text-sm whitespace-pre-wrap shadow-sm">
                                            {viewItem.report.suggestion}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Footer Actions */}
                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 px-6 sm:px-0 pb-6 sm:pb-0 bg-gray-50 sm:bg-white print:hidden">
                            <button 
                                type="button"
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="mr-2 text-gray-500" /> Print
                            </button>

                            <SecondaryButton onClick={() => setViewItem(null)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}