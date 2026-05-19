import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react'; // Import router
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ShowDonor({ donor, component_types, history }) {
    
    // Donation Form
    const { data, setData, post, processing, reset } = useForm({
        volume_collected: 450,
        bag_serial_number: '',
        bb_component_type_id: '',
        bp: '',
        hb_level: ''
    });

    const submitDonation = (e) => {
        e.preventDefault();
        post(route('bloodbank0.donate', donor.id), {
            onSuccess: () => reset()
        });
    };

    // Action to make blood available after test
    const handleMakeAvailable = (donation) => {
        let bloodGroup = donor.blood_group && donor.blood_group !== 'Unknown' 
            ? donor.blood_group 
            : null;

        // If blood group is unknown, prompt the lab tech to enter it
        if (!bloodGroup) {
            bloodGroup = window.prompt("Donor blood group is Unknown. Please enter the tested Blood Group (e.g., A+, O-):");
            if (!bloodGroup) return; // Cancelled
        } else {
            if (!window.confirm(`Mark this bag as Available? (Confirmed Blood Group: ${bloodGroup})`)) {
                return;
            }
        }

        router.post(route('bloodbank0.makeAvailable', donation.id), {
            blood_group: bloodGroup
        }, { preserveScroll: true });
    };

    return (
        <HospitalLayout header={<h2>Donor Profile: {donor.first_name}</h2>}>
            <Head title="Donor Profile" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Donor Info & Donate Form */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-white p-6 shadow rounded-lg border-t-4 border-red-500">
                        <h3 className="font-bold text-xl text-gray-800">{donor.first_name} {donor.surname}</h3>
                        <p className="text-gray-500 mb-4">{donor.donor_number}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="block text-gray-500">Group</span> <span className="font-bold text-red-600 text-lg">{donor.blood_group || '?'}</span></div>
                            <div><span className="block text-gray-500">Age</span> {new Date().getFullYear() - new Date(donor.birthdate).getFullYear()} yrs</div>
                            <div><span className="block text-gray-500">Status</span> {donor.status}</div>
                            <div><span className="block text-gray-500">Weight</span> {donor.weight} kg</div>
                        </div>
                    </div>

                    {/* Donation Form */}
                    <form onSubmit={submitDonation} className="bg-white p-6 shadow rounded-lg">
                        <h4 className="font-bold text-lg mb-4 text-gray-800">Record New Donation</h4>
                        
                        <div className="space-y-3">
                            <div>
                                <InputLabel value="Bag Serial / Barcode" />
                                <TextInput className="w-full" value={data.bag_serial_number} onChange={e => setData('bag_serial_number', e.target.value)} required />
                            </div>
                            
                            <div>
                                <InputLabel value="Component Type" />
                                <select className="w-full border-gray-300 rounded" value={data.bb_component_type_id} onChange={e => setData('bb_component_type_id', e.target.value)} required>
                                    <option value="">Select Type...</option>
                                    {component_types.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div><InputLabel value="BP (e.g. 120/80)" /><TextInput className="w-full" value={data.bp} onChange={e => setData('bp', e.target.value)} required /></div>
                                <div><InputLabel value="Hb Level (g/dL)" /><TextInput type="number" step="0.1" className="w-full" value={data.hb_level} onChange={e => setData('hb_level', e.target.value)} required /></div>
                            </div>

                            <div>
                                <InputLabel value="Volume (ml)" />
                                <TextInput type="number" className="w-full" value={data.volume_collected} onChange={e => setData('volume_collected', e.target.value)} required />
                            </div>

                            <PrimaryButton className="w-full justify-center bg-red-600 hover:bg-red-700" disabled={processing}>Save Donation</PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* Right: Donation History */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Donation History</h3>
                        
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs uppercase">Bag Serial</th>
                                    <th className="px-4 py-2 text-left text-xs uppercase">Volume</th>
                                    <th className="px-4 py-2 text-left text-xs uppercase">Hb</th>
                                    <th className="px-4 py-2 text-right text-xs uppercase">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? <tr><td colSpan="5" className="p-4 text-center text-gray-500">No donations recorded yet.</td></tr> : 
                                history.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{new Date(d.donation_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm font-mono">{d.bag_serial_number}</td>
                                        <td className="px-4 py-3 text-sm">{d.volume_collected} ml</td>
                                        <td className="px-4 py-3 text-sm">{d.hb_level}</td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {/* Show Test Button if Bag is in Quarantine */}
                                            {d.bag?.status === 'Quarantine' ? (
                                                <button
                                                    onClick={() => handleMakeAvailable(d)}
                                                    className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition"
                                                >
                                                    Test & Make Available
                                                </button>
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    d.bag?.status === 'Available' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {d.bag?.status || d.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </HospitalLayout>
    );
}