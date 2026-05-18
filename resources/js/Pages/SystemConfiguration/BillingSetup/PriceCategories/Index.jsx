import React, { useEffect, useState, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/FinanceLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faHome,
    faCheckCircle,
    faTimesCircle,
    faTags,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "@/Components/CustomModal";

const DEBOUNCE_DELAY = 300;

const StatusIndicator = ({ isActive }) => (
    isActive
        ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" title="Enabled" />
        : <FontAwesomeIcon icon={faTimesCircle} className="text-gray-400" title="Disabled" />
);

export default function Index({ auth, pricecategories, filters, success }) {

    const { data, setData } = useForm({
        search: filters.search || "",
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        itemToDeleteId: null,
    });

    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            router.get(
                route("systemconfiguration0.pricecategories.index"),
                { search: data.search },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(searchTimeoutRef.current);

    }, [data.search]);

    const handleDelete = (id) => {
        setModalState({
            isOpen: true,
            itemToDeleteId: id,
        });
    };

    const handleModalClose = () => {
        setModalState({
            isOpen: false,
            itemToDeleteId: null,
        });
    };

    const handleModalConfirm = () => {

        if (!modalState.itemToDeleteId) return;

        router.delete(
            route(
                "systemconfiguration0.pricecategories.destroy",
                modalState.itemToDeleteId
            ),
            {
                onSuccess: () => handleModalClose(),
            }
        );
    };

    const hasCategories = pricecategories.data.length > 0;

    const item = hasCategories
        ? pricecategories.data[0]
        : null;

    const priceLevels = Array.from(
        { length: 15 },
        (_, i) => i + 1
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold">
                    Price Categories
                </h2>
            }
        >
            <Head title="Price Categories" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {success && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                            {success}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        {/* Header */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faTags}
                                    className="text-blue-600 text-xl"
                                />

                                <h3 className="text-lg font-medium text-gray-800">
                                    {hasCategories
                                        ? "Current Price Category Settings"
                                        : "No Price Categories Defined"}
                                </h3>
                            </div>

                            <div className="flex items-center space-x-2">

                                {hasCategories ? (
                                    <Link
                                        href={route(
                                            "systemconfiguration0.pricecategories.edit",
                                            item.id
                                        )}
                                        className="flex items-center whitespace-nowrap rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600"
                                    >
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            className="mr-2"
                                        />

                                        Edit
                                    </Link>
                                ) : (
                                    <Link
                                        href={route(
                                            "systemconfiguration0.pricecategories.create"
                                        )}
                                        className="flex items-center whitespace-nowrap rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="mr-2"
                                        />

                                        Create
                                    </Link>
                                )}

                                <Link
                                    href={route("systemconfiguration0.index")}
                                    className="flex items-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
                        <div className="overflow-x-auto rounded-lg border">

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">
                                    <tr>
                                        {priceLevels.map((level) => (
                                            <React.Fragment key={level}>

                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                    Price Level {level}
                                                </th>

                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                                    Enabled
                                                </th>

                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">

                                    {hasCategories ? (

                                        <tr className="hover:bg-gray-50">

                                            {priceLevels.map((level) => (

                                                <React.Fragment key={level}>

                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item[`price${level}`]}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                        <StatusIndicator
                                                            isActive={item[`useprice${level}`]}
                                                        />
                                                    </td>

                                                </React.Fragment>
                                            ))}

                                        </tr>

                                    ) : (

                                        <tr>
                                            <td
                                                colSpan={30}
                                                className="text-center py-10 text-gray-500"
                                            >
                                                Click "Create" to define your price categories.
                                            </td>
                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                </div>
            </div>

            {item && (
                <Modal
                    isOpen={modalState.isOpen}
                    onClose={handleModalClose}
                    onConfirm={handleModalConfirm}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete these price categories?"
                />
            )}
        </AuthenticatedLayout>
    );
}