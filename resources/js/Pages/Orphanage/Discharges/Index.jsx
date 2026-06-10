import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/Orphanage";
import Pagination from "@/Components/Pagination";
import Modal from "@/Components/CustomModal";
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faSearch,
    faPlus,
    faEdit,
    faTrash,
    faHome,
    faPersonWalkingArrowRight
} from "@fortawesome/free-solid-svg-icons";

export default function Index({
    auth,
    discharges,
    filters,
    success,
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

        if (errors?.error) {
            toast.error(errors.error);
        }

    }, [success, errors]);

    const handleSearch = (e) => {

        setData("search", e.target.value);

        router.get(
            route("orphanage2.index"),
            {
                search: e.target.value
            },
            {
                preserveState: true,
                replace: true
            }
        );
    };

    const handleDelete = (id) => {

        setModalState({
            isOpen: true,
            idToDelete: id
        });
    };

    const confirmDelete = () => {

        router.delete(
            route(
                "orphanage2.destroy",
                modalState.idToDelete
            )
        );
    };

    return (

        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-slate-800">
                    Child Discharges
                </h2>
            }
        >

            <Head title="Discharges" />

            <div className="py-12">

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="bg-white shadow-sm rounded-lg p-6">

                        <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">

                            <div className="relative w-full md:w-72">

                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={data.search}
                                    onChange={handleSearch}
                                    placeholder="Search..."
                                    className="w-full rounded-md border-slate-300 pl-10"
                                />

                            </div>

                            <div className="flex gap-2">

                                <Link
                                    href={route("orphanage2.create")}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow"
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="mr-2"
                                    />
                                    Add Discharge
                                </Link>

                                <Link
                                    href={route("systemconfiguration17.index")}
                                    className="bg-slate-600 text-white px-4 py-2 rounded-md shadow"
                                >
                                    <FontAwesomeIcon
                                        icon={faHome}
                                        className="mr-2"
                                    />
                                    Home
                                </Link>

                            </div>

                        </div>

                        <div className="overflow-x-auto border rounded-lg">

                            <table className="min-w-full divide-y divide-slate-200">

                                <thead className="bg-slate-50">

                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Child Code
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Parent
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Guardian
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Relationship
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Contact
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs uppercase">
                                            Date
                                        </th>

                                        <th className="px-6 py-3 text-center text-xs uppercase">
                                            Actions
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {discharges.data.length > 0 ? (

                                        discharges.data.map((item) => (

                                            <tr
                                                key={item.autocode}
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4">
                                                    {item.childcode}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.parentname}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.guardianname}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.relationship}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.contact}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.transdate
                                                        ? new Date(item.transdate).toLocaleDateString('en-GB')
                                                        : '-'}
                                                </td>

                                                <td className="px-6 py-4 text-center space-x-4">

                                                    <Link
                                                        href={route(
                                                            "orphanage2.edit",
                                                            item.autocode
                                                        )}
                                                        className="text-indigo-600"
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
                                                        className="text-red-600"
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
                                                colSpan="7"
                                                className="text-center py-10 text-slate-500"
                                            >
                                                No discharge records found.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                        <Pagination
                            class="mt-6"
                            links={discharges.links}
                        />

                    </div>

                </div>

            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() =>
                    setModalState({
                        isOpen: false,
                        idToDelete: null
                    })
                }
                onConfirm={confirmDelete}
                title="Delete Discharge"
                message="Are you sure you want to delete this discharge record?"
            />

        </AuthenticatedLayout>
    );
}