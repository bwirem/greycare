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
    faPeopleArrows,
    faCheckCircle,
    faUserFriends
} from "@fortawesome/free-solid-svg-icons";

import Modal from "@/Components/CustomModal";
import Pagination from "@/Components/Pagination";
import { toast } from "react-toastify";

export default function Index({
    auth,
    adoptationTypes,
    success,
    filters,
    errors,
}) {

    const {
        data: searchData,
        setData: setSearchData
    } = useForm({
        search: filters?.search || "",
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        idToDelete: null,
    });

    useEffect(() => {
        if (success) toast.success(success);

        if (errors?.error) {
            toast.error(errors.error);
        }
    }, [success, errors]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);

        router.get(
            route("systemconfiguration17.adoptationtypes.index"),
            {
                search: e.target.value,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (id) => {
        setModalState({
            isOpen: true,
            idToDelete: id,
        });
    };

    const handleConfirmDelete = () => {
        router.delete(
            route(
                "systemconfiguration17.adoptationtypes.destroy",
                modalState.idToDelete
            ),
            {
                onSuccess: () => {
                    setModalState({
                        isOpen: false,
                        idToDelete: null,
                    });
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-slate-800">
                    Adoption Types
                </h2>
            }
        >
            <Head title="Adoption Types" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        {/* Search + Actions */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

                            <div className="relative w-full md:w-72">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Search adoption types..."
                                    value={searchData.search}
                                    onChange={handleSearch}
                                    className="w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-2">

                                <Link
                                    href={route(
                                        "systemconfiguration17.adoptationtypes.create"
                                    )}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow"
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="mr-2"
                                    />
                                    Add Adoption Type
                                </Link>

                                <Link
                                    href={route(
                                        "systemconfiguration17.index"
                                    )}
                                    className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 flex items-center shadow"
                                >
                                    <FontAwesomeIcon
                                        icon={faHome}
                                        className="mr-2"
                                    />
                                    Home
                                </Link>

                            </div>

                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">

                            <table className="min-w-full divide-y divide-slate-200">

                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Code
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                            Description
                                        </th>

                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                                            Orphanage → Orphanage
                                        </th>

                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                                            Orphanage → Adoptive Parent
                                        </th>

                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-slate-200">

                                    {adoptationTypes?.data?.length > 0 ? (

                                        adoptationTypes.data.map((item) => (

                                            <tr
                                                key={item.autocode}
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                            <FontAwesomeIcon
                                                                icon={faPeopleArrows}
                                                            />
                                                        </div>

                                                        {item.CODE}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {item.description}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {item.orphanagetoorphanages ? (
                                                        <FontAwesomeIcon
                                                            icon={faCheckCircle}
                                                            className="text-green-600"
                                                        />
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {item.orphanagetoadoptiveparent ? (
                                                        <FontAwesomeIcon
                                                            icon={faUserFriends}
                                                            className="text-blue-600"
                                                        />
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center space-x-4">

                                                    <Link
                                                        href={route(
                                                            "systemconfiguration17.adoptationtypes.edit",
                                                            item.autocode
                                                        )}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEdit}
                                                        />
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.autocode
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-10 text-center text-slate-500"
                                            >
                                                No adoption types found.
                                            </td>
                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                        <Pagination
                            class="mt-6"
                            links={adoptationTypes.links}
                        />

                    </div>

                </div>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() =>
                    setModalState({
                        isOpen: false,
                        idToDelete: null,
                    })
                }
                onConfirm={handleConfirmDelete}
                title="Delete Adoption Type"
                message="Are you sure you want to delete this adoption type?"
            />
        </AuthenticatedLayout>
    );
}