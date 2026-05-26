import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/SystemAndUserLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Modal from '@/Components/CustomModal';

// Restored `auth` and added default `{}` to filters
export default function Index({ auth, usergroups, filters = {} }) {
    const { data, setData, get } = useForm({
        search: filters?.search || "",
    });

    const [modalState, setModalState] = useState({
        isOpen: false, message: '', isAlert: false, usergroupToDeleteId: null,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            get(route("usermanagement.usergroups.index"), { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [data.search]);

    const handleDelete = (id) => {
        setModalState({
            isOpen: true,
            message: "Are you sure you want to delete this role? This action cannot be undone.",
            isAlert: false,
            usergroupToDeleteId: id,
        });
    };

    const handleModalConfirm = () => {
        router.delete(route("usermanagement.usergroups.destroy", modalState.usergroupToDeleteId), {
            onSuccess: () => setModalState({ isOpen: false, message: '', isAlert: false, usergroupToDeleteId: null }),
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth?.user} // Safely pass user just in case your layout needs it
            header={<h2 className="text-xl font-semibold text-gray-800">Roles List</h2>}
        >
            <Head title="Roles List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
                                <FontAwesomeIcon icon={faSearch} className="absolute top-3 left-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    value={data.search}
                                    onChange={(e) => setData("search", e.target.value)}
                                    className="w-full pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Link
                                    href={route("usermanagement.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link> 
                                <Link
                                    href={route("usermanagement.usergroups.create")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create Role
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Safely check if usergroups and data exist */}
                                    {usergroups?.data?.length > 0 ? (
                                        usergroups.data.map((usergroup) => (
                                            <tr key={usergroup?.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {usergroup?.name || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">
                                                        {usergroup?.staff_category_label || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route("usermanagement.usergroups.edit", usergroup?.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(usergroup?.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No roles found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, isAlert: false })}
                onConfirm={handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Deletion"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}