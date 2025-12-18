import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash, faHome, faTint } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function ComponentIndex({ auth, components, success }) {
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration10.components.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Blood Components</h2>}>
            <Head title="Blood Components" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-700">Components List</h3>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration10.components.create")} className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create
                                </Link>
                                <Link href={route("systemconfiguration10.index")} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Shelf Life</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {components.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center">
                                                <FontAwesomeIcon icon={faTint} className="text-red-400 mr-2" />
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.code || '-'}</td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-500">{item.shelf_life_days} Days</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration10.components.edit", item.id)} className="text-blue-600 hover:text-blue-900">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={components.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Component" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}