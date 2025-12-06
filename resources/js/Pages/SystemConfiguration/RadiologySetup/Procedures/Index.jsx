import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faClock, faBolt } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal'; // Ensure you have this component
import Pagination from "@/Components/Pagination"; // Ensure you have this component
import { toast } from 'react-toastify';

export default function ProcedureIndex({ auth, procedures, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    // Handle Search
    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration7.procedures.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    // Handle Delete
    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration7.procedures.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Radiology Procedures</h2>}>
            <Head title="Procedures" />
            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search exams..." 
                                        value={searchData.search} 
                                        onChange={handleSearch} 
                                        className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration7.procedures.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm transition">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Exam
                                </Link>
                                <Link href={route("systemconfiguration7.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm transition">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modality</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {procedures.data.length > 0 ? (
                                        procedures.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                                        {item.modality?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.code || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                                    {item.duration_minutes} <span className="text-xs">min</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.contrast_required && (
                                                        <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs" title="Contrast Required">
                                                            <FontAwesomeIcon icon={faBolt} /> Contrast
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link href={route("systemconfiguration7.procedures.edit", item.id)} className="text-blue-600 hover:text-blue-900 transition">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 transition">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                No procedures found. Click "Add Exam" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={procedures.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Procedure" message="Are you sure you want to delete this exam?" />
        </AuthenticatedLayout>
    );
}