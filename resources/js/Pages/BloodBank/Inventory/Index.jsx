import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function InventoryIndex({ stock }) {
    return (
        <HospitalLayout header={<h2>Blood Bank Inventory</h2>}>
            <Head title="Blood Stock" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                <div className="flex justify-end mb-6">
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
        </HospitalLayout>
    );
}