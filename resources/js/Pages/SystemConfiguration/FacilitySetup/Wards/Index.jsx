import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faBed, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function WardIndex({ auth, wards, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.wards.index"), 
            { search: e.target.value }, { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.wards.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">IPD Wards</h2>}>
            <Head title="IPD Wards" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search wards..." value={searchData.search} onChange={handleSearch} className="w-full rounded-md border-gray-300 pl-10 focus:border-orange-500 focus:ring-orange-500" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.wards.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Ward
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-orange-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gender</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Daily Charge</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {wards.data.length > 0 ? (
                                        wards.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                                        <FontAwesomeIcon icon={faBed} />
                                                    </div>
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{item.type || '-'}</td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-500">
                                                    {item.gender === 'Male' && <span className="text-blue-600"><FontAwesomeIcon icon={faVenusMars}/> Male</span>}
                                                    {item.gender === 'Female' && <span className="text-pink-600"><FontAwesomeIcon icon={faVenusMars}/> Female</span>}
                                                    {item.gender === 'Mixed' && <span className="text-purple-600"><FontAwesomeIcon icon={faVenusMars}/> Mixed</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                                    {item.bls_item 
                                                        ? parseFloat(item.bls_item.price1).toLocaleString(undefined, {minimumFractionDigits: 2}) 
                                                        : <span className="text-gray-400 text-xs italic">Not Set</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link href={route("systemconfiguration5.wards.edit", item.id)} className="text-blue-600 hover:text-blue-900">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No wards found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={wards.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Ward" message="Are you sure? This action cannot be undone." />
        </AuthenticatedLayout>
    );
}