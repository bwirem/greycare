import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal'; // Ensure you have a generic Modal or use standard HTML dialog
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function BagsIndex({ bags, filters }) {
    
    // --- Filtering State ---
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [groupFilter, setGroupFilter] = useState(filters.blood_group || '');

    const handleFilterChange = (key, value) => {
        if(key === 'status') setStatusFilter(value);
        if(key === 'group') setGroupFilter(value);

        router.get(route('bloodbank1.bags'), {
            status: key === 'status' ? value : statusFilter,
            blood_group: key === 'group' ? value : groupFilter
        }, { preserveState: true, replace: true });
    };

    // --- Discard Modal State & Form ---
    const [bagToDiscard, setBagToDiscard] = useState(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        reason: 'Expired',
        remarks: ''
    });

    const openDiscardModal = (bag) => {
        setBagToDiscard(bag);
        setData('reason', 'Expired'); // Default
        setData('remarks', '');
    };

    const closeDiscardModal = () => {
        setBagToDiscard(null);
        reset();
    };

    const submitDiscard = (e) => {
        e.preventDefault();
        post(route('bloodbank1.discard', bagToDiscard.id), {
            onSuccess: () => closeDiscardModal()
        });
    };

    // Helper to calculate days until expiry
    const getExpiryStatus = (dateString, status) => {
        if (status === 'Discarded') return <span className="text-gray-500">Discarded</span>;
        
        const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return <span className="text-red-600 font-bold">Expired</span>;
        if (days <= 5) return <span className="text-orange-500 font-bold">{days} days left</span>;
        return <span className="text-green-600">{days} days</span>;
    };

    return (
        <HospitalLayout header={<h2>Blood Inventory List</h2>}>
            <Head title="Blood Bags" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Filters & Actions */}
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div className="flex gap-4">
                            <select 
                                className="border-gray-300 rounded text-sm"
                                value={statusFilter}
                                onChange={e => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Quarantine">Quarantine</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Discarded">Discarded</option>
                            </select>

                            <select 
                                className="border-gray-300 rounded text-sm"
                                value={groupFilter}
                                onChange={e => handleFilterChange('group', e.target.value)}
                            >
                                <option value="">All Groups</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option>
                                <option>O+</option><option>O-</option>
                            </select>
                        </div>

                        <Link href={route('bloodbank0.index')} className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold">
                            &larr; Back to Donors
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Bag Serial</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Group & Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bags.data.length === 0 ? (
                                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">No bags found matching criteria.</td></tr>
                                ) : (
                                    bags.data.map((bag) => (
                                        <tr key={bag.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-800">
                                                {bag.bag_serial_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-red-700 text-lg">{bag.blood_group}</div>
                                                <div className="text-xs text-gray-500">{bag.component_type?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="text-gray-500 text-xs">Collected: {new Date(bag.collected_at).toLocaleDateString()}</div>
                                                <div className="font-medium">Expires: {new Date(bag.expires_at).toLocaleDateString()}</div>
                                                <div className="text-xs mt-1">{getExpiryStatus(bag.expires_at, bag.status)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    bag.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                    bag.status === 'Quarantine' ? 'bg-yellow-100 text-yellow-800' :
                                                    bag.status === 'Discarded' ? 'bg-gray-200 text-gray-600' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {bag.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {bag.status !== 'Discarded' && (
                                                    <button 
                                                        onClick={() => openDiscardModal(bag)}
                                                        className="text-red-600 hover:text-red-900 text-xs font-bold uppercase border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                                    >
                                                        Discard
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        {bags.links && <Pagination links={bags.links} />}
                    </div>
                </div>
            </div>

            {/* Discard Modal */}
            <Modal show={bagToDiscard !== null} onClose={closeDiscardModal}>
                <form onSubmit={submitDiscard} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Discard Blood Bag <span className="font-mono text-red-600">{bagToDiscard?.bag_serial_number}</span>
                    </h2>
                    
                    <div className="mb-4">
                        <InputLabel value="Reason for Discard" />
                        <select 
                            className="w-full border-gray-300 rounded mt-1"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                        >
                            <option>Expired</option>
                            <option>Hemolyzed</option>
                            <option>Clotted</option>
                            <option>Leakage</option>
                            <option>TTI Positive (Disease)</option>
                            <option>Other</option>
                        </select>
                        {errors.reason && <div className="text-red-500 text-xs mt-1">{errors.reason}</div>}
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Remarks / Notes" />
                        <TextInput 
                            className="w-full mt-1" 
                            value={data.remarks}
                            onChange={e => setData('remarks', e.target.value)}
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeDiscardModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="bg-red-600 hover:bg-red-700" disabled={processing}>
                            Confirm Discard
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

        </HospitalLayout>
    );
}