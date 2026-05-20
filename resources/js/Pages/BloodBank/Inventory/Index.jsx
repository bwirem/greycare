import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function InventoryIndex({ stock, component_types }) {
    
    // External Bag Modal State
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        bag_serial_number: '',
        blood_group: 'O+',
        bb_component_type_id: '',
        collected_at: '',
        expires_at: ''
    });

    const openReceiveModal = () => setShowReceiveModal(true);
    const closeReceiveModal = () => {
        setShowReceiveModal(false);
        reset();
    };

    const submitReceiveExternal = (e) => {
        e.preventDefault();
        post(route('bloodbank1.receiveExternal'), {
            onSuccess: () => closeReceiveModal()
        });
    };

    return (
        <HospitalLayout header={<h2>Blood Bank Inventory</h2>}>
            <Head title="Blood Stock" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={openReceiveModal} 
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold"
                    >
                        + Receive External Bag
                    </button>

                    <Link href={route('bloodbank1.bags')} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
                        View All Bags List
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Render Stock Cards */}
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => {
                        // Filter stock for this group
                        const groupStock = stock.filter(s => s.blood_group === group);
                        const totalBags = groupStock.reduce((acc, curr) => acc + curr.count, 0);

                        return (
                            <div key={group} className="bg-white p-6 shadow rounded-lg border-t-4 border-red-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold text-red-700">{group}</h3>
                                    <span className="text-3xl font-extrabold text-gray-800">{totalBags}</span>
                                </div>
                                <div className="text-sm space-y-1">
                                    {groupStock.map((s, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-600">
                                            <span>{s.component_type?.name || 'Unknown'}</span>
                                            <span className="font-medium">{s.count}</span>
                                        </div>
                                    ))}
                                    {groupStock.length === 0 && <span className="text-gray-400 italic">Out of Stock</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Receive External Bag Modal */}
            <Modal show={showReceiveModal} onClose={closeReceiveModal}>
                <form onSubmit={submitReceiveExternal} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                        Receive Blood from National Bank
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Bag Serial Number / Barcode" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={data.bag_serial_number}
                                onChange={e => setData('bag_serial_number', e.target.value)}
                                required
                            />
                            {errors.bag_serial_number && <div className="text-red-500 text-xs mt-1">{errors.bag_serial_number}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Blood Group" />
                                <select 
                                    className="w-full border-gray-300 rounded mt-1"
                                    value={data.blood_group}
                                    onChange={e => setData('blood_group', e.target.value)}
                                    required
                                >
                                    <option>A+</option><option>A-</option>
                                    <option>B+</option><option>B-</option>
                                    <option>AB+</option><option>AB-</option>
                                    <option>O+</option><option>O-</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Component Type" />
                                <select 
                                    className="w-full border-gray-300 rounded mt-1"
                                    value={data.bb_component_type_id}
                                    onChange={e => setData('bb_component_type_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Type...</option>
                                    {component_types?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Collection Date" />
                                <TextInput 
                                    type="date"
                                    className="w-full mt-1" 
                                    value={data.collected_at}
                                    onChange={e => setData('collected_at', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Expiry Date" />
                                <TextInput 
                                    type="date"
                                    className="w-full mt-1" 
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={closeReceiveModal}>Cancel</SecondaryButton>
                        <PrimaryButton className="bg-red-600 hover:bg-red-700" disabled={processing}>
                            Save to Inventory
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </HospitalLayout>
    );
}