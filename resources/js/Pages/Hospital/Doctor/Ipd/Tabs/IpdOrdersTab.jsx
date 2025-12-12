import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faXRay, faTint, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function IpdOrdersTab({ 
    data, setData, options, 
    ordered_labs, ordered_rads, 
    opd_labs = [], opd_rads = [], // Received from Parent
    onViewResult 
}) {
    
    const [bloodReq, setBloodReq] = useState({ id: null, label: '', units: 1 });

    const addOrder = (field, item) => {
        setData(field, [...data[field], item]);
        toast.info("Order added.");
    };

    const removeOrder = (field, index) => {
        const list = [...data[field]]; list.splice(index, 1); setData(field, list);
    };

    const handleAddBlood = () => {
        if(!bloodReq.id) return toast.error("Select blood component");
        if(bloodReq.units < 1) return toast.error("Units must be at least 1");
        
        addOrder('blood_requests', { component_id: bloodReq.id, name: bloodReq.label, units: bloodReq.units });
        setBloodReq({ id: null, label: '', units: 1 });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* 1. OPD ORDERS (READ ONLY / REVIEW) */}
            {(opd_labs.length > 0 || opd_rads.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-blue-800 text-xs uppercase tracking-wider border-b border-blue-200 pb-2 mb-2">
                        Initial OPD Orders
                    </h3>
                    <table className="w-full text-sm text-left">
                        <tbody>
                            {opd_labs.map(l => (
                                <tr key={'opd-l'+l.id} className="border-b border-blue-100 last:border-0">
                                    <td className="p-2 w-16"><span className="bg-white text-purple-700 border border-purple-200 text-[10px] px-1 rounded font-bold">LAB</span></td>
                                    <td className="p-2 text-gray-700">{l.panel?.name}</td>
                                    <td className="p-2 text-gray-500 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                                    <td className="p-2 text-right">
                                        {/* Show View button if results exist (even from OPD) */}
                                        {l.status === 'completed' ? (
                                            <button type="button" onClick={()=>onViewResult(l,'lab')} className="text-blue-600 underline text-xs"><FontAwesomeIcon icon={faEye}/> View</button>
                                        ) : <span className="text-xs text-gray-400">{l.status}</span>}
                                    </td>
                                </tr>
                            ))}
                            {opd_rads.map(r => (
                                <tr key={'opd-r'+r.id} className="border-b border-blue-100 last:border-0">
                                    <td className="p-2 w-16"><span className="bg-white text-orange-700 border border-orange-200 text-[10px] px-1 rounded font-bold">RAD</span></td>
                                    <td className="p-2 text-gray-700">{r.procedure?.name}</td>
                                    <td className="p-2 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td className="p-2 text-right">
                                        {r.status === 'completed' ? (
                                            <button type="button" onClick={()=>onViewResult(r,'rad')} className="text-blue-600 underline text-xs"><FontAwesomeIcon icon={faEye}/> View</button>
                                        ) : <span className="text-xs text-gray-400">{r.status}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 2. ACTIVE IPD ORDERS */}
            {(ordered_labs?.length > 0 || ordered_rads?.length > 0) && (
                <div className="bg-white border p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Active Ward Orders</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500"><tr><th>Type</th><th>Test</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordered_labs.map(l => (
                                <tr key={'l'+l.id}>
                                    <td className="p-2"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">LAB</span></td>
                                    <td className="p-2">{l.panel?.name}</td>
                                    <td className="p-2 text-gray-600 capitalize">{l.status}</td>
                                    <td className="p-2 text-right">{l.status==='completed' && <button type="button" onClick={()=>onViewResult(l,'lab')} className="text-blue-600 underline"><FontAwesomeIcon icon={faEye}/></button>}</td>
                                </tr>
                            ))}
                            {ordered_rads.map(r => (
                                <tr key={'r'+r.id}>
                                    <td className="p-2"><span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">RAD</span></td>
                                    <td className="p-2">{r.procedure?.name}</td>
                                    <td className="p-2 text-gray-600 capitalize">{r.status}</td>
                                    <td className="p-2 text-right">{r.status==='completed' && <button type="button" onClick={()=>onViewResult(r,'rad')} className="text-blue-600 underline"><FontAwesomeIcon icon={faEye}/></button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 3. NEW ORDERS FORM (Existing Code) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faFlask} /> Order Lab</h4>
                    <ReactSelect options={options.lab} onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} placeholder="Select Panel..." value={null} />
                    <div className="mt-3 space-y-1">
                        {data.lab_requests.map((l, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white border p-2 rounded shadow-sm">
                                <span>{l.name}</span>
                                <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faXRay} /> Order Radiology</h4>
                    <ReactSelect options={options.rad} onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} placeholder="Select Procedure..." value={null} />
                    <div className="mt-3 space-y-1">
                        {data.rad_requests.map((r, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white border p-2 rounded shadow-sm">
                                <span>{r.name}</span>
                                <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 border border-red-200 bg-red-50 p-4 rounded-lg">
                    <h5 className="font-bold mb-3 text-red-800 flex items-center gap-2"><FontAwesomeIcon icon={faTint} /> Blood Request</h5>
                    <div className="flex gap-3 items-end">
                        <div className="w-2/3">
                            <ReactSelect 
                                options={options.blood} 
                                value={options.blood.find(o => o.value === bloodReq.id) || null}
                                onChange={opt => setBloodReq({ ...bloodReq, id: opt?.value, label: opt?.label })} 
                                placeholder="Select Component..." 
                            />
                        </div>
                        <div className="w-24">
                            <input 
                                type="number" 
                                className="w-full border-gray-300 rounded text-sm h-[38px] p-2" 
                                placeholder="Units" 
                                value={bloodReq.units}
                                onChange={e => setBloodReq({ ...bloodReq, units: e.target.value })}
                            />
                        </div>
                        <button type="button" className="bg-red-600 text-white px-5 h-[38px] rounded text-sm hover:bg-red-700 font-bold shadow" onClick={handleAddBlood}>Add</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {data.blood_requests.map((x,i) => (
                            <div key={i} className="text-xs flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-red-200 shadow-sm">
                                <span className="font-medium text-gray-800">{x.name}</span>
                                <span className="bg-red-100 text-red-800 px-1.5 rounded">{x.units} U</span>
                                <button type="button" onClick={()=>removeOrder('blood_requests',i)} className="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}