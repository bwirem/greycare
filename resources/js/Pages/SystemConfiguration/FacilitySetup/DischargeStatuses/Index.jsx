import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faEdit, faTrash, faHome, faDoorOpen 
} from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function DischargeStatusIndex({ auth, statuses, filters, success }) {
    // SAFETY FIX: Ensure filters is an object
    const safeFilters = filters || {};
    const { data: searchData, setData: setSearchData } = useForm({ search: safeFilters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration5.dischargestatuses.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration5.dischargestatuses.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth?.user} header={<h2 className="text-xl font-semibold text-gray-800">Discharge Statuses</h2>}>
            <Head title="Discharge Statuses" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search status..." 
                                    value={searchData.search} 
                                    onChange={handleSearch} 
                                    className="w-full rounded-md border-gray-300 pl-10 focus:ring-emerald-500 focus:border-emerald-500" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration5.dischargestatuses.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create
                                </Link>
                                <Link href={route("systemconfiguration5.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Name</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {statuses?.data?.length > 0 ? (
                                        statuses.data.map((status) => (
                                            <tr key={status.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-3">
                                                            <FontAwesomeIcon icon={faDoorOpen} />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{status.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link href={route("systemconfiguration5.dischargestatuses.edit", status.id)} className="text-blue-600 hover:text-blue-900">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(status.id)} className="text-red-600 hover:text-red-900">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-10 text-center text-gray-500">
                                                No statuses defined.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* SAFETY FIX: Check if links exist */}
                        {statuses?.links && <Pagination class="mt-6" links={statuses.links} />}
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Status" message="Are you sure you want to delete this discharge status?" />
        </AuthenticatedLayout>
    );
}