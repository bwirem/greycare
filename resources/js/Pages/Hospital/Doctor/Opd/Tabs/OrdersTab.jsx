import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faXRay, faNotesMedical, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function OrdersTab({ data, setData, options, ordered_labs, ordered_rads }) {
    
    const addOrder = (field, item) => {
        setData(field, [...data[field], item]);
        toast.info("Order added.");
    };

    const removeOrder = (field, index) => {
        const list = [...data[field]];
        list.splice(index, 1);
        setData(field, list);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Previous Results Display - Basic Table */}
            {(ordered_labs?.length > 0 || ordered_rads?.length > 0) && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">Previous Results</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500"><tr><th>Type</th><th>Test</th><th>Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordered_labs.map(l => <tr key={'l'+l.id}><td className="p-2 font-bold text-purple-600">LAB</td><td>{l.panel?.name}</td><td>{l.status}</td></tr>)}
                            {ordered_rads.map(r => <tr key={'r'+r.id}><td className="p-2 font-bold text-orange-600">RAD</td><td>{r.procedure?.name}</td><td>{r.status}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lab */}
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faFlask} /> Order Lab Test</h4>
                    <ReactSelect options={options.lab} onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} placeholder="Select Panel..." value={null} />
                    <div className="mt-3 space-y-1">
                        {data.lab_requests.map((l, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white border border-gray-200 p-2 rounded shadow-sm">
                                <span>{l.name}</span>
                                <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500"><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rad */}
                <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FontAwesomeIcon icon={faXRay} /> Order Radiology</h4>
                    <ReactSelect options={options.rad} onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} placeholder="Select Procedure..." value={null} />
                    <div className="mt-3 space-y-1">
                        {data.rad_requests.map((r, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white border border-gray-200 p-2 rounded shadow-sm">
                                <span>{r.name}</span>
                                <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500"><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Surgery */}
            <div className="border border-red-200 p-4 rounded-lg bg-red-50 shadow-sm">
                <h3 className="font-bold mb-3 text-red-800 flex items-center gap-2"><FontAwesomeIcon icon={faNotesMedical} /> Book Surgery</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                        <ReactSelect options={options.surgery} onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} placeholder="Select Procedure..." />
                    </div>
                    <TextInput type="datetime-local" className="w-full md:w-1/3" onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} />
                </div>
            </div>
        </div>
    );
}