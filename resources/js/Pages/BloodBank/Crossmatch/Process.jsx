import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ProcessRequest({ issue_request, available_bags }) {
    
    const { data, setData, post, processing, errors } = useForm({
        bb_blood_bag_id: '',
        compatibility_result: 'Compatible',
        action: 'Issue' // Issue or Reserve
    });

    const [selectedBag, setSelectedBag] = useState(null);

    const selectBag = (bag) => {
        setSelectedBag(bag);
        setData('bb_blood_bag_id', bag.id);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('bloodbank.requests.store', issue_request.id));
    };

    return (
        <HospitalLayout header={<h2>Crossmatch & Issue</h2>}>
            <Head title="Process Request" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 flex gap-6">
                
                {/* LEFT: Request Details */}
                <div className="w-1/3 space-y-6">
                    <div className="bg-white p-6 shadow rounded-lg border-t-4 border-red-600">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Request Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Patient</span>
                                <span className="font-medium">{issue_request.patient.first_name} {issue_request.patient.last_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Code</span>
                                <span className="font-mono">{issue_request.patientcode}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                                <span className="text-gray-500">Required Group</span>
                                <span className="font-bold text-red-700 text-lg">{issue_request.blood_group_required}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Component</span>
                                <span className="font-medium">{issue_request.component_type.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Units</span>
                                <span className="font-medium">{issue_request.units_required}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded text-xs text-gray-600">
                        <strong>Note:</strong> Only "Available" bags matching the patient's blood group and component type are shown.
                    </div>
                </div>

                {/* RIGHT: Available Bags & Form */}
                <div className="w-2/3 bg-white p-6 shadow rounded-lg">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Select Inventory Bag</h3>

                    {/* Inventory Table */}
                    <div className="overflow-y-auto max-h-64 border rounded mb-6">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Bag Serial</th>
                                    <th className="px-4 py-2 text-left">Group</th>
                                    <th className="px-4 py-2 text-left">Expires</th>
                                    <th className="px-4 py-2 text-right">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {available_bags.length === 0 ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No matching stock available.</td></tr>
                                ) : (
                                    available_bags.map(bag => (
                                        <tr key={bag.id} className={data.bb_blood_bag_id === bag.id ? 'bg-red-50' : ''}>
                                            <td className="px-4 py-2 font-mono">{bag.bag_serial_number}</td>
                                            <td className="px-4 py-2 font-bold text-red-700">{bag.blood_group}</td>
                                            <td className="px-4 py-2">{new Date(bag.expires_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-right">
                                                <input 
                                                    type="radio" 
                                                    name="selected_bag" 
                                                    checked={data.bb_blood_bag_id === bag.id}
                                                    onChange={() => selectBag(bag)}
                                                    className="text-red-600 focus:ring-red-500"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {selectedBag && (
                        <form onSubmit={submit} className="bg-red-50 p-4 rounded border border-red-100 animate-fade-in">
                            <h4 className="font-bold text-red-800 mb-3">Process Selected Bag: {selectedBag.bag_serial_number}</h4>

                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <div>
                                    <InputLabel value="Crossmatch Result" />
                                    <select 
                                        className="w-full border-gray-300 rounded shadow-sm"
                                        value={data.compatibility_result}
                                        onChange={e => setData('compatibility_result', e.target.value)}
                                    >
                                        <option value="Compatible">Compatible (Pass)</option>
                                        <option value="Incompatible">Incompatible (Fail)</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel value="Action" />
                                    <select 
                                        className="w-full border-gray-300 rounded shadow-sm"
                                        value={data.action}
                                        onChange={e => setData('action', e.target.value)}
                                        disabled={data.compatibility_result === 'Incompatible'}
                                    >
                                        <option value="Issue">Issue Now</option>
                                        <option value="Reserve">Reserve for Later</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <PrimaryButton className="bg-red-600 hover:bg-red-700" disabled={processing}>
                                    Confirm & {data.action}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </HospitalLayout>
    );
}