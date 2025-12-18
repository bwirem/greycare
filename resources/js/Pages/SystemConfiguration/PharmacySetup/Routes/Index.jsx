import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faHome, faSyringe } from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";

export default function RoutesIndex({ auth, routes }) {
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration9.routes.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Administration Routes</h2>}>
            <Head title="Routes" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-700">Routes List</h3>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration9.routes.create")} className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create
                                </Link>
                                <Link href={route("systemconfiguration9.index")} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abbreviation</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {routes.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.abbreviation || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <Link href={route("systemconfiguration9.routes.edit", item.id)} className="text-blue-600 hover:text-blue-900">
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
                        <Pagination class="mt-6" links={routes.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Route" message="Are you sure?" />
        </AuthenticatedLayout>
    );
}