import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/MortuaryLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faBuilding } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function MortuaryIndex({ auth, mortuaries, success, filters, errors }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { 
        if (success) toast.success(success); 
        if (errors?.error) toast.error(errors.error);
    }, [success, errors]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration16.mortuaries.index"), 
            { search: e.target.value }, { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration16.mortuaries.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-slate-800">Mortuary Facilities</h2>}>
            <Head title="Mortuaries" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search mortuaries..." value={searchData.search} onChange={handleSearch} className="w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration16.mortuaries.create")} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Mortuary
                                </Link>
                                <Link href={route("systemconfiguration16.index")} className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 flex items-center shadow">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Facility Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type / Designation</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {mortuaries.data.length > 0 ? (
                                        mortuaries.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mr-3">
                                                        <FontAwesomeIcon icon={faBuilding} />
                                                    </div>
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{item.type || '-'}</td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link href={route("systemconfiguration16.mortuaries.edit", item.id)} className="text-indigo-600 hover:text-indigo-900">
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
                                            <td colSpan="3" className="px-6 py-10 text-center text-slate-500">No mortuary facilities found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={mortuaries.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Mortuary" message="Are you sure? You can only delete this if it has no rooms assigned to it." />
        </AuthenticatedLayout>
    );
}