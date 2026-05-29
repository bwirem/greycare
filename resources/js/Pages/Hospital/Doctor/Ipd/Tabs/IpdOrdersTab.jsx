import React, { useState } from 'react';
import ReactSelect from 'react-select';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFlask, faXRay, faTint, faTrash, faEye, faTrashAlt,
    faNotesMedical, faClock, faCheckCircle, faExclamationTriangle, faBan, faUserMd,faDoorOpen
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function IpdOrdersTab({ 
    data, setData, options, 
    ordered_labs, ordered_rads, 
    ordered_surgeries = [],
    ordered_blood = [], 
    opd_labs = [], opd_rads = [], opd_surgeries = [],
    onViewResult,
    onDeleteOrder 
}) {
    const [activeDepartment, setActiveDepartment] = useState(null);

    // 1. ADDED: blood_group to the local state
    const [bloodReq, setBloodReq] = useState({ id: null, label: '', units: 1, blood_group: '' });

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
        
        // 2. UPDATED: Send blood_group alongside the component details
        addOrder('blood_requests', { 
            component_id: bloodReq.id, 
            name: bloodReq.label, 
            units: bloodReq.units,
            blood_group: bloodReq.blood_group 
        });
        
        // Reset component and units, but keep blood group selected for convenience
        setBloodReq({ id: null, label: '', units: 1, blood_group: bloodReq.blood_group });
    };

    // Helper for Surgery Status Colors
    const getSurgeryStatusColor = (status) => {
        switch(status) {
            case 'Completed': return 'text-green-600 bg-green-100 border-green-200';
            case 'In-Progress': return 'text-orange-600 bg-orange-100 border-orange-200 animate-pulse';
            case 'Recovery': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'Cancelled': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200'; // Scheduled
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* 1. OPD ORDERS (HISTORY) */}
            {(opd_labs.length > 0 || opd_rads.length > 0 || opd_surgeries.length > 0) && (
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
                                    <td className="p-2 text-right">
                                        {l.status === 'completed' ? (
                                            <button type="button" onClick={()=>onViewResult(l,'lab')} className="text-blue-600 underline text-xs"><FontAwesomeIcon icon={faEye}/> View</button>
                                        ) : <span className="text-xs text-gray-400 capitalize">{l.status}</span>}
                                    </td>
                                </tr>
                            ))}
                            {opd_rads.map(r => (
                                <tr key={'opd-r'+r.id} className="border-b border-blue-100 last:border-0">
                                    <td className="p-2 w-16"><span className="bg-white text-orange-700 border border-orange-200 text-[10px] px-1 rounded font-bold">RAD</span></td>
                                    <td className="p-2 text-gray-700">{r.procedure?.name}</td>
                                    <td className="p-2 text-right">
                                        {r.status === 'completed' ? (
                                            <button type="button" onClick={()=>onViewResult(r,'rad')} className="text-blue-600 underline text-xs"><FontAwesomeIcon icon={faEye}/>Report</button>
                                        ) : <span className="text-xs text-gray-400 capitalize">{r.status}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 2. ACTIVE IPD ORDERS */}
            {(ordered_labs.length > 0 || ordered_rads.length > 0 || ordered_surgeries.length > 0 || ordered_blood.length > 0) && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Active Ward Orders</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-3 w-20">Type</th>
                                <th className="p-3">Details</th>
                                <th className="p-3 w-40">Status</th>
                                <th className="p-3 w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            
                            {/* Labs */}
                            {ordered_labs.map(l => (
                                <tr key={'l'+l.id} className="hover:bg-gray-50">
                                    <td className="p-3"><span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded font-bold border border-purple-200">LAB</span></td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{l.panel?.name}</div>
                                        {(l.status === 'rejected' || l.status === 'sample_rejected') && (
                                            <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded border border-red-100 inline-block">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                                <span className="font-bold">Reason:</span> {l.rejection_log?.reason?.name || 'See Notes'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {l.status === 'rejected' ? (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit">
                                                <FontAwesomeIcon icon={faBan} /> Cancelled
                                            </span>
                                        ) : l.status === 'sample_rejected' ? (
                                             <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit">
                                                <FontAwesomeIcon icon={faExclamationTriangle} /> Redraw
                                            </span>
                                        ) : (
                                            <span className={`text-xs px-2 py-1 rounded capitalize font-medium border ${
                                                l.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {l.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {l.status === 'completed' && (
                                            <button type="button" onClick={()=>onViewResult(l,'lab')} className="text-blue-600 hover:text-blue-800 underline text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faEye}/> View
                                            </button>
                                        )}
                                        {l.status === 'Requested' && (
                                            <button type="button" onClick={() => onDeleteOrder(l.id, 'lab')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full" title="Delete Order">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Radiology */}
                            {ordered_rads.map(r => (
                                <tr key={'r'+r.id} className="hover:bg-gray-50">
                                    <td className="p-3"><span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded font-bold border border-orange-200">RAD</span></td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{r.procedure?.name}</div>
                                        {r.status === 'rejected' && (
                                            <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded border border-red-100 inline-block">
                                                <span className="font-bold">Reason:</span> {r.rejection_reason || 'See Notes'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {r.status === 'rejected' ? (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit">
                                                <FontAwesomeIcon icon={faBan} /> Rejected
                                            </span>
                                        ) : (
                                            <span className={`text-xs px-2 py-1 rounded capitalize font-medium border ${
                                                r.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                r.status === 'captured' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {r.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {r.status === 'completed' && (
                                            <button type="button" onClick={()=>onViewResult(r,'rad')} className="text-blue-600 hover:text-blue-800 underline text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faEye}/> Report
                                            </button>
                                        )}
                                        {(r.status === 'ordered' || r.status === 'Ordered') && (
                                            <button type="button" onClick={() => onDeleteOrder(r.id, 'rad')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full" title="Delete Order">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Blood Requests */}
                            {ordered_blood.map(b => (
                                <tr key={'b'+b.id} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold border border-red-200">BLOOD</span>
                                    </td>
                                    <td className="p-3 font-medium text-gray-700">
                                        {b.component_type?.name} <span className="text-xs text-gray-500">({b.units_required} Units)</span>
                                        <div className="text-[10px] text-gray-400">Grp: {b.blood_group_required || 'Any'}</div>
                                    </td>
                                    <td className="p-3">
                                        {b.status === 'Issued' ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold flex items-center w-fit gap-1 border border-green-200">
                                                <FontAwesomeIcon icon={faCheckCircle} /> Issued
                                            </span>
                                        ) : b.status === 'Crossmatched' ? (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">Ready</span>
                                        ) : (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold flex items-center w-fit gap-1 border border-yellow-200">
                                                <FontAwesomeIcon icon={faClock} /> {b.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        {b.status === 'Requested' && (
                                            <button type="button" onClick={() => onDeleteOrder(b.id, 'blood')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full" title="Delete Request">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Surgeries */}
                            {ordered_surgeries.map(s => (
                                <tr key={'s'+s.id} className="hover:bg-gray-50">
                                    <td className="p-3"><span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded font-bold border border-blue-200">SURG</span></td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{s.procedure?.name}</div>
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                            <FontAwesomeIcon icon={faClock} /> {new Date(s.scheduled_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSurgeryStatusColor(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {s.status === 'Scheduled' && (
                                            <button type="button" onClick={() => onDeleteOrder(s.id, 'surgery')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full" title="Cancel Surgery">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- 3. NEW ORDERS FORMS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lab */}
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

                {/* Radiology */}
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
            </div>
            
            {/* --- SECTION 3: SURGERY & PROCEDURE BOOKING --- */}
            <div className="border border-red-200 rounded-xl bg-white shadow-sm overflow-hidden mt-8">
                
                {/* Section Header */}
                <div className="bg-red-50 p-4 border-b border-red-200">
                    <h3 className="font-bold text-red-800 flex items-center gap-2 m-0 text-lg">
                        <FontAwesomeIcon icon={faNotesMedical} /> Book Surgery / Procedure
                    </h3>
                    <p className="text-xs text-red-600 mt-1">
                        Select a treatment room first to reveal the available procedures.
                    </p>
                </div>

                {/* --- GLOBAL INPUT: Theatre Room --- */}
                <div className="p-5 bg-white border-b border-gray-100">
                    <div className="w-full md:w-1/2">
                        <InputLabel value="Assigned Theatre / Treatment Room" className="mb-2 text-sm font-bold text-gray-800" />
                        <ReactSelect 
                            options={options.theatre} 
                            onChange={opt => {
                                // 1. Save the ID to the form data to be submitted to backend
                                setData('surgery_request', { ...data.surgery_request, theatre_id: opt.value });
                                
                                // 2. Tell the UI which department cards to show based on the theatre type!
                                setActiveDepartment(opt.type); 
                            }} 
                            placeholder="Select Room..." 
                            styles={{ 
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: base => ({ ...base, borderColor: '#e5e7eb', boxShadow: 'none', '&:hover': { borderColor: '#d1d5db' } })
                            }}
                            menuPortalTarget={document.body}
                        />
                    </div>
                </div>

                {/* --- DYNAMIC CATEGORY SECTION --- */}
                <div className="bg-gray-50/50 p-5">
                    
                    {/* Empty State (Shown initially before a room is selected) */}
                    {!activeDepartment && (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <FontAwesomeIcon icon={faDoorOpen} className="text-3xl text-gray-300 mb-2 block mx-auto" />
                            Please select a Theatre Room above to schedule a procedure.
                        </div>
                    )}

                    {/* 1. General Surgery Card */}
                    {activeDepartment === 'General' && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                                <FontAwesomeIcon icon={faUserMd} className="text-red-500" /> 
                                General Surgery
                            </h4>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <InputLabel value="General Procedure" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <ReactSelect 
                                        options={options.surgery} 
                                        onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} 
                                        placeholder="Select Procedure..." 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Scheduled Date & Time" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <TextInput 
                                        type="datetime-local" 
                                        className="w-full text-sm" 
                                        onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Dental Procedure Card */}
                    {activeDepartment === 'Dental' && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" /> 
                                Dental Procedure
                            </h4>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <InputLabel value="Dental Procedure" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <ReactSelect 
                                        options={options.surgery} 
                                        onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} 
                                        placeholder="Select Procedure..." 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Scheduled Date & Time" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <TextInput 
                                        type="datetime-local" 
                                        className="w-full text-sm" 
                                        onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Eye Surgery Card */}
                    {activeDepartment === 'Eye' && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                                <FontAwesomeIcon icon={faEye} className="text-emerald-500" /> 
                                Eye Surgery
                            </h4>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <InputLabel value="Eye Surgery" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <ReactSelect 
                                        options={options.surgery} 
                                        onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} 
                                        placeholder="Select Procedure..." 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Scheduled Date & Time" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <TextInput 
                                        type="datetime-local" 
                                        className="w-full text-sm" 
                                        onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Physiotherapy Card */}
                    {activeDepartment === 'Physio' && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                                <FontAwesomeIcon icon={faNotesMedical} className="text-orange-500" /> 
                                Physiotherapy
                            </h4>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <InputLabel value="Physiotherapy" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <ReactSelect 
                                        options={options.surgery} 
                                        onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} 
                                        placeholder="Select Procedure..." 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        menuPortalTarget={document.body}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Scheduled Date & Time" className="mb-1 text-xs font-semibold text-gray-600" />
                                    <TextInput 
                                        type="datetime-local" 
                                        className="w-full text-sm" 
                                        onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* 3. UPDATED: Blood Bank Form */}
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg shadow-sm">
                <h5 className="font-bold mb-3 text-red-800 flex items-center gap-2"><FontAwesomeIcon icon={faTint} /> Blood Request</h5>
                <div className="flex flex-wrap gap-3 items-end">
                    
                    {/* Changed from global `data.blood_group` to local `bloodReq.blood_group` and merged into the flex grid */}
                    <div className="w-full md:w-32">
                        <InputLabel value="Blood Group" className="mb-1 text-xs" />
                        <select 
                            className="w-full border-gray-300 rounded text-sm h-[38px] px-2 focus:ring-red-500 focus:border-red-500" 
                            value={bloodReq.blood_group} 
                            onChange={e => setBloodReq({ ...bloodReq, blood_group: e.target.value })}
                        >
                            <option value="">Unknown</option>
                            <option>A+</option><option>A-</option>
                            <option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option>
                            <option>O+</option><option>O-</option>
                        </select>
                    </div>                

                    <div className="flex-1 min-w-[200px]">
                        <InputLabel value="Component" className="mb-1 text-xs" />
                        <ReactSelect 
                            options={options.blood} 
                            value={options.blood?.find(o => o.value === bloodReq.id) || null}
                            onChange={opt => setBloodReq({ ...bloodReq, id: opt?.value, label: opt?.label })} 
                            placeholder="Select Component..." 
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPortalTarget={document.body}
                        />
                    </div>

                    <div className="w-20">
                        <InputLabel value="Units" className="mb-1 text-xs" />
                        <input 
                            type="number" 
                            className="w-full border-gray-300 rounded text-sm h-[38px] p-2 focus:ring-red-500 focus:border-red-500" 
                            placeholder="1" 
                            value={bloodReq.units}
                            onChange={e => setBloodReq({ ...bloodReq, units: e.target.value })}
                        />
                    </div>

                    <button type="button" className="bg-red-600 text-white px-5 h-[38px] rounded text-sm hover:bg-red-700 font-bold shadow transition" onClick={handleAddBlood}>
                        Add
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {data.blood_requests.map((x,i) => (
                        <div key={i} className="text-xs flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-red-200 shadow-sm">
                            <span className="font-medium text-gray-800">{x.name}</span>
                            
                            {/* Added visual representation for the blood group */}
                            {x.blood_group && (
                                <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-100">
                                    {x.blood_group}
                                </span>
                            )}

                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">{x.units} U</span>
                            <button type="button" onClick={()=>removeOrder('blood_requests',i)} className="text-red-400 hover:text-red-600 font-bold ml-1 transition">✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}