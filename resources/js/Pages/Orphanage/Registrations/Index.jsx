import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/Orphanage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faPlus,
    faEdit,
    faTrash,
    faHome,
    faClipboardList
} from "@fortawesome/free-solid-svg-icons";

import Modal from "@/Components/CustomModal";
import Pagination from "@/Components/Pagination";
import { toast } from "react-toastify";

export default function Index({
    auth,
    registrations,
    success,
    filters,
    errors
}) {
    const { data, setData } = useForm({
        search: filters?.search || ""
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        idToDelete: null
    });

    useEffect(() => {
        if (success) toast.success(success);
        if (errors?.error) toast.error(errors.error);
    }, [success, errors]);

    const handleSearch = (e) => {
        setData("search", e.target.value);

        router.get(
            route("orphanage0.index"),
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => {
        setModalState({ isOpen: true, idToDelete: id });
    };

    const confirmDelete = () => {
        router.delete(
            route("orphanage0.destroy", modalState.idToDelete),
            {
                onSuccess: () =>
                    setModalState({ isOpen: false, idToDelete: null })
            }
        );
    };

    // Helper to format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold">Registrations</h2>}
        >
            <Head title="Registrations" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="bg-white p-6 rounded-lg shadow-sm">

                        {/* Top Bar */}
                        <div className="flex justify-between mb-6">
                            <div className="relative">
                                <FontAwesomeIcon 
                                    icon={faSearch} 
                                    className="absolute left-3 top-3 text-gray-400" 
                                />
                                <input
                                    value={data.search}
                                    onChange={handleSearch}
                                    placeholder="Search child, code, etc..."
                                    className="border rounded-md pl-10 p-2 w-72"
                                />
                            </div>

                            <Link
                                href={route("orphanage0.create")}
                                className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2 rounded-md flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Registration
                            </Link>

                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr className="border-b">
                                        <th className="py-3 px-4">Child Code</th>
                                        <th className="py-3 px-4">Full Name</th>
                                        <th className="py-3 px-4">Gender / DOB</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Institution / Contact</th>
                                        <th className="py-3 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {registrations?.data?.length ? (
                                        registrations.data.map((item) => (
                                            <tr key={item.autocode} className="border-b hover:bg-slate-50 transition-colors">
                                                
                                                <td className="py-3 px-4 font-semibold text-indigo-600">
                                                    {item.childcode}
                                                </td>

                                                <td className="py-3 px-4 font-medium text-slate-800">
                                                    {/* Safely combine first, middle, and last name */}
                                                    {[item.first_name, item.middle_name, item.last_name]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-700">{item.gender}</div>
                                                    <div className="text-xs text-slate-500">{formatDate(item.date_of_birth)}</div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    {/* Fallback to registrationType if snake_case relation isn't mapped automatically */}
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {item.registration_type?.description || item.registrationType?.description || "N/A"}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-700">
                                                        {item.institution || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {item.contact || "No Contact"}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 text-center space-x-4">
                                                    <Link
                                                        href={route("orphanage0.edit", item.autocode)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(item.autocode)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-8 text-slate-500">
                                                No child registrations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4">
                            <Pagination links={registrations.links} />
                        </div>

                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, idToDelete: null })}
                onConfirm={confirmDelete}
                title="Delete Registration"
                message="Are you sure you want to delete this record? This action cannot be undone."
            />
        </AuthenticatedLayout>
    );
}