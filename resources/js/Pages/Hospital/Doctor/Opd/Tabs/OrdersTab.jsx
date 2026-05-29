import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFlask, faXRay, faNotesMedical, faTrash, faEye, 
    faExclamationTriangle, faBan, faUserMd, faCheckCircle, faClock, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function OrdersTab({ 
    data, 
    setData, 
    options, 
    ordered_labs = [], 
    ordered_rads = [], 
    ordered_surgeries = [], 
    onViewResult,
    onDeleteOrder // <--- NEW PROP: Function to handle server-side deletion
}) {
    
    // --- Handlers ---

    const addOrder = (field, item) => {
        // Prevent duplicates in current session list
        if (field === 'lab_requests' && data.lab_requests.find(x => x.panel_id === item.panel_id)) return;
        if (field === 'rad_requests' && data.rad_requests.find(x => x.procedure_id === item.procedure_id)) return;

        setData(field, [...data[field], item]);
        toast.info("Order added.");
    };

    const removeOrder = (field, index) => {
        const list = [...data[field]];
        list.splice(index, 1);
        setData(field, list);
    };

    // Helper for Surgery Status Badge Colors
    const getSurgeryStatusColor = (status) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'In-Progress': return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
            case 'Recovery': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200'; // Scheduled
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* --- SECTION 1: PREVIOUS ORDERS & RESULTS --- */}
            {(ordered_labs.length > 0 || ordered_rads.length > 0 || ordered_surgeries.length > 0) && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">
                        Active Orders & History
                    </h3>
                    
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-3 w-20">Type</th>
                                <th className="p-3">Details / Name</th>
                                <th className="p-3 w-40">Status</th>
                                <th className="p-3 w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            
                            {/* 1. LAB ORDERS */}
                            {ordered_labs.map(l => (
                                <tr key={`l-${l.id}`} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded font-bold border border-purple-200">LAB</span>
                                    </td>
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
                                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium border ${
                                            l.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            l.status === 'Requested' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {/* VIEW BUTTON */}
                                        {l.status === 'completed' && (
                                            <button type="button" onClick={() => onViewResult(l, 'lab')} className="text-blue-600 hover:text-blue-800 underline text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faEye} /> View
                                            </button>
                                        )}
                                        {/* DELETE BUTTON (Only if Requested) */}
                                        {l.status === 'Requested' && (
                                            <button type="button" onClick={() => onDeleteOrder(l.id, 'lab')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* 2. RADIOLOGY ORDERS */}
                            {ordered_rads.map(r => (
                                <tr key={`r-${r.id}`} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded font-bold border border-orange-200">RAD</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{r.procedure?.name}</div>
                                        {r.status === 'rejected' && (
                                            <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded border border-red-100 inline-block">
                                                <span className="font-bold">Reason:</span> {r.rejection_reason || 'See Notes'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium border ${
                                            r.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            r.status === 'Ordered' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {/* VIEW BUTTON */}
                                        {r.status === 'completed' && (
                                            <button type="button" onClick={() => onViewResult(r, 'rad')} className="text-blue-600 hover:text-blue-800 underline text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faEye} /> Report
                                            </button>
                                        )}
                                        {/* DELETE BUTTON (Only if Ordered) */}
                                        {r.status === 'Ordered' && (
                                            <button type="button" onClick={() => onDeleteOrder(r.id, 'rad')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full">
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* 3. SURGERY BOOKINGS */}
                            {ordered_surgeries.map(s => (
                                <tr key={`s-${s.id}`} className="hover:bg-gray-50">
                                    <td className="p-3">
                                        <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold border border-red-200">OR</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{s.procedure?.name || 'Surgery'}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                            {new Date(s.scheduled_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded font-bold border ${getSurgeryStatusColor(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {/* DELETE BUTTON (Only if Scheduled) */}
                                        {s.status === 'Scheduled' && (
                                            <button type="button" onClick={() => onDeleteOrder(s.id, 'surgery')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full">
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

            {/* --- SECTION 2: NEW ORDER ENTRY --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lab Selection */}
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFlask} className="text-purple-600" /> Order Lab Test
                    </h4>
                    <ReactSelect 
                        options={options.lab} 
                        onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} 
                        placeholder="Select Lab Panel..." 
                        value={null}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                    />
                    <div className="mt-3 space-y-1">
                        {data.lab_requests.map((l, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white border border-gray-200 p-2 rounded shadow-sm">
                                <span className="font-medium text-gray-800">{l.name}</span>
                                <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radiology Selection */}
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faXRay} className="text-orange-600" /> Order Radiology
                    </h4>
                    <ReactSelect 
                        options={options.rad} 
                        onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} 
                        placeholder="Select Procedure..." 
                        value={null}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                    />
                    <div className="mt-3 space-y-1">
                        {data.rad_requests.map((r, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-white border border-gray-200 p-2 rounded shadow-sm">
                                <span className="font-medium text-gray-800">{r.name}</span>
                                <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Surgery Booking */}
            {/* --- SECTION 3: SURGERY & PROCEDURE BOOKING --- */}
            <div className="border border-red-200 rounded-xl bg-white shadow-sm overflow-hidden mt-8">
                {/* Section Header */}
                <div className="bg-red-50 p-4 border-b border-red-200">
                    <h3 className="font-bold text-red-800 flex items-center gap-2 m-0 text-lg">
                        <FontAwesomeIcon icon={faNotesMedical} /> Book Surgery / Procedure
                    </h3>
                    <p className="text-xs text-red-600 mt-1">
                        Select a department below to schedule a new procedure or surgery.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
                    
                    {/* 1. General Surgery Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-400 group-hover:bg-red-500"></div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <FontAwesomeIcon icon={faUserMd} className="text-red-500" /> 
                            Theatre & General Surgery
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Theatre Room" className="mb-1 text-xs font-semibold text-gray-600" />
                                <ReactSelect 
                                    options={options.room} 
                                    onChange={opt => setData('surgery_request', { ...data.surgery_request, room_id: opt.value })} 
                                    placeholder="Select Room..." 
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                />
                            </div>
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

                    {/* 2. Dental Procedure Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 group-hover:bg-blue-500"></div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" /> 
                            Dental Procedure
                        </h4>
                        <div className="space-y-4">
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

                    {/* 3. Eye Surgery Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 group-hover:bg-emerald-500"></div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <FontAwesomeIcon icon={faEye} className="text-emerald-500" /> 
                            Eye Surgery
                        </h4>
                        <div className="space-y-4">
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

                    {/* 4. Physiotherapy Card */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400 group-hover:bg-orange-500"></div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                            <FontAwesomeIcon icon={faNotesMedical} className="text-orange-500" /> 
                            Physiotherapy
                        </h4>
                        <div className="space-y-4">
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

                </div>
            </div>

        </div>
    );
}