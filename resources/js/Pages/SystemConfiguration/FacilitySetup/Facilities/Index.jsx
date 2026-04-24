import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function FacilityIndex({ auth, facilities, flash, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { 
        if (flash?.success) toast.success(flash.success); 
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.facilities.index"), 
            { search: e.target.value }, { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.facilities.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Facilities / Branches</h2>}>
            <Head title="Facilities" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search name or location..." value={searchData.search} onChange={handleSearch} className="w-full rounded-md border-gray-300 pl-10" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.facilities.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Facility
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facility Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {facilities.data.length > 0 ? facilities.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.location || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.contact_number || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration5.facilities.edit", item.id)} className="text-blue-600 hover:text-blue-900">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No facilities found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={facilities.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Facility" message="Are you sure you want to delete this facility? This action cannot be undone." />
        </AuthenticatedLayout>
    );
}