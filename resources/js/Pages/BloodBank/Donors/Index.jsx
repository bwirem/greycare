import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';

export default function DonorsIndex({ donors, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('bloodbank0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Blood Donors</h2>}>
            <Head title="Donors" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2 w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Donor Name or ID..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton>Search</PrimaryButton>
                        </form>
                        <Link 
                            href={route('bloodbank0.create')} 
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold"
                        >
                            + Register Donor
                        </Link>
                    </div>

                    {/* Table */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Donor ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Group</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Last Donation</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {donors.data.map((donor) => (
                                <tr key={donor.id} className="hover:bg-red-50">
                                    <td className="px-6 py-4 font-mono text-sm">{donor.donor_number}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{donor.first_name} {donor.surname}</div>
                                        <div className="text-xs text-gray-500">{donor.gender}, {new Date().getFullYear() - new Date(donor.birthdate).getFullYear()}y</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">
                                            {donor.blood_group || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{donor.contact_no}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={route('bloodbank0.show', donor.id)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        {donors.links && <Pagination links={donors.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}