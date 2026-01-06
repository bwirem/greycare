import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, faSpinner, faArrowLeft, faStethoscope, faVial,
    faFlask, faXRay, faNotesMedical, faEye, faExclamationTriangle, faBan
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { toast } from 'react-toastify';

// --- CLINICAL TAB ---
const ClinicalTab = ({ data, setData, errors }) => {
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gestational Age (Weeks) *</label>
                    <input type="number" value={data.gestational_age_weeks} onChange={e => setData('gestational_age_weeks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    {errors.gestational_age_weeks && <p className="text-red-500 text-xs mt-1">{errors.gestational_age_weeks}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fundal Height (cm)</label>
                    <input type="number" value={data.fundal_height_cm} onChange={e => setData('fundal_height_cm', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" step="0.1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fetal Heart Rate</label>
                    <input type="text" value={data.fetal_heart_rate} onChange={e => setData('fetal_heart_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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
                        <option value="">Select</option>
                        <option value="Neg">Negative</option>
                        <option value="+">+</option>
                        <option value="++">++</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">HIV Status</label>
                    <select value={data.hiv_status} onChange={e => setData('hiv_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Unknown</option>
                        <option value="Neg">Negative</option>
                        <option value="Known Pos">Known Positive</option>
                    </select>
                </div>
            </div>
            
            <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Interventions Given</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={data.iron_folate} onChange={e => setData('iron_folate', e.target.checked)} className="rounded text-blue-600"/><span>Iron & Folate</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={data.ipt_malaria} onChange={e => setData('ipt_malaria', e.target.checked)} className="rounded text-blue-600"/><span>SP (Malaria)</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={data.tt_vaccine} onChange={e => setData('tt_vaccine', e.target.checked)} className="rounded text-blue-600"/><span>TT Vaccine</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={data.deworming} onChange={e => setData('deworming', e.target.checked)} className="rounded text-blue-600"/><span>Deworming</span></label>
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
const OrdersTab = ({ data, setData, options, existingOrders }) => {
    
    // Safely handle empty lists
    const postedLabs = existingOrders?.labs || [];
    const postedRads = existingOrders?.rads || [];
    const postedSurg = existingOrders?.surgeries || [];

    const addOrder = (field, item) => {
        if (field === 'lab_requests' && data.lab_requests.find(x => x.panel_id === item.panel_id)) return toast.warning("Added already.");
        setData(field, [...data[field], item]);
    };

    const removeOrder = (field, index) => {
        const list = [...data[field]];
        list.splice(index, 1);
        setData(field, list);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* 1. Posted Orders Table */}
            {(postedLabs.length > 0 || postedRads.length > 0) && (
                 <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Posted Orders</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr><th className="p-2">Type</th><th className="p-2">Name</th><th className="p-2">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {postedLabs.map(l => (
                                <tr key={`l-${l.id}`}>
                                    <td className="p-2"><span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded">LAB</span></td>
                                    <td className="p-2">{l.panel?.name}</td>
                                    <td className="p-2">{l.status}</td>
                                </tr>
                            ))}
                            {postedRads.map(r => (
                                <tr key={`r-${r.id}`}>
                                    <td className="p-2"><span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded">RAD</span></td>
                                    <td className="p-2">{r.procedure?.name}</td>
                                    <td className="p-2">{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}

            {/* 2. Add New Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded bg-white">
                    <h4 className="font-bold text-sm mb-2"><FontAwesomeIcon icon={faFlask} className="text-purple-600 mr-2"/> Add Lab</h4>
                    <Select 
                        options={options?.lab || []} 
                        onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} 
                        placeholder="Select Lab..." 
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    <div className="mt-2 space-y-1">{data.lab_requests.map((l,i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 p-1 border rounded">{l.name} <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 font-bold">x</button></div>))}</div>
                </div>

                <div className="border p-4 rounded bg-white">
                    <h4 className="font-bold text-sm mb-2"><FontAwesomeIcon icon={faXRay} className="text-orange-600 mr-2"/> Add Radiology</h4>
                    <Select 
                        options={options?.rad || []} 
                        onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} 
                        placeholder="Select Procedure..." 
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    <div className="mt-2 space-y-1">{data.rad_requests.map((r,i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 p-1 border rounded">{r.name} <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 font-bold">x</button></div>))}</div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function EditVisit({ auth, visit, options = { lab: [], rad: [], surgery: [] }, existing_orders = { labs: [], rads: [], surgeries: [] } }) {
    
    const [activeTab, setActiveTab] = useState('clinical');
    const { data, setData, put, processing, errors } = useForm({
        // Clinical
        gestational_age_weeks: visit.gestational_age_weeks,
        fundal_height_cm: visit.fundal_height_cm || '',
        fetal_heart_rate: visit.fetal_heart_rate || '',
        fetal_lie: visit.fetal_lie || '',
        urine_albumin: visit.urine_albumin || '',
        syphilis_result: visit.syphilis_result || '',
        hiv_status: visit.hiv_status || '',
        arv_prophylaxis: !!visit.arv_prophylaxis,
        ipt_malaria: !!visit.ipt_malaria,
        tt_vaccine: !!visit.tt_vaccine,
        iron_folate: !!visit.iron_folate,
        deworming: !!visit.deworming,
        remarks: visit.remarks || '',
        
        // Orders (New only)
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: null, date: '' },
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('rch1.update', visit.id), {
            onSuccess: () => toast.success("Visit updated."),
            onError: () => toast.error("Check errors.")
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Edit ANC Visit</h2>}>
            <Head title="Edit Visit" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        
                        <div className="p-6 border-b bg-gray-50 flex justify-between">
                            <div>
                                <h3 className="font-bold">{visit.pregnancy?.patient?.first_name} {visit.pregnancy?.patient?.last_name}</h3>
                                <p className="text-sm text-gray-500">ANC: {visit.pregnancy?.anc_number}</p>
                            </div>
                            <Link href={route('rch1.history', visit.pregnancy_id)} className="text-blue-600 hover:underline"><FontAwesomeIcon icon={faArrowLeft} /> Back</Link>
                        </div>

                        <div className="flex border-b">
                            <button onClick={()=>setActiveTab('clinical')} className={`flex-1 py-3 text-sm font-medium ${activeTab==='clinical'?'border-b-2 border-blue-600 text-blue-600':''}`}>Clinical</button>
                            <button onClick={()=>setActiveTab('orders')} className={`flex-1 py-3 text-sm font-medium ${activeTab==='orders'?'border-b-2 border-blue-600 text-blue-600':''}`}>Orders</button>
                        </div>

                        <form onSubmit={submit} className="p-6">
                            {activeTab === 'clinical' ? 
                                <ClinicalTab data={data} setData={setData} errors={errors} /> : 
                                <OrdersTab data={data} setData={setData} options={options} existingOrders={existing_orders} />
                            }
                            <div className="flex justify-end pt-4 mt-6 border-t">
                                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />} Update
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}