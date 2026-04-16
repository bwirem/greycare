import React from "react";
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoice,        // For Requisitions
    faBoxOpen,            // For Receipts
    faHandHoldingMedical, // For Usage
    faTrashAlt,           // For Disposals
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function ConsumablesIndex({ 
    auth, 
    requisitionsCount = 0, 
    receiptsCount = 0,
    usageCount = 0,
    disposalsCount = 0
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Hospital Consumables Dashboard
                </h2>
            }
        >
            <Head title="Consumables Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Grid updated to handle 4 cards cleanly (2x2 on medium/large screens) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 1. Requisitions Card */}
                        <Link 
                            href={route("inventory0.index")} 
                            className="block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group"
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 shadow">
                                        <FontAwesomeIcon icon={faFileInvoice} className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt>
                                            <p className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                                                Requisitions
                                            </p>
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <p className="text-3xl font-bold text-blue-600">
                                                {requisitionsCount}
                                            </p>
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                Requests
                                            </p>
                                        </dd>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Manage and approve requests for hospital consumables from various departments.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                        View Requisitions
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 2. Receipts Card */}
                        <Link 
                            href={route("inventory2.index")} 
                            className="block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group"
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3 shadow">
                                        <FontAwesomeIcon icon={faBoxOpen} className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt>
                                            <p className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                                                Receipts
                                            </p>
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <p className="text-3xl font-bold text-green-600">
                                                {receiptsCount}
                                            </p>
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                Deliveries
                                            </p>
                                        </dd>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Log incoming consumables, verify deliveries against purchase orders, and update stock.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
                                        View Receipts
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 3. Usage Card */}
                        <Link 
                            href={route("hospital.usage.index")} 
                            className="block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group"
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-orange-500 rounded-md p-3 shadow">
                                        <FontAwesomeIcon icon={faHandHoldingMedical} className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt>
                                            <p className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                                                Usage Tracking
                                            </p>
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <p className="text-3xl font-bold text-orange-600">
                                                {usageCount}
                                            </p>
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                Records
                                            </p>
                                        </dd>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Monitor daily consumption of medical supplies and hospital consumables.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
                                        View Usage
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* 4. Disposal Card */}
                        <Link 
                            href={route("hospital.disposals.index")} 
                            className="block bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow duration-300 ease-in-out group"
                        >
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3 shadow">
                                        <FontAwesomeIcon icon={faTrashAlt} className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt>
                                            <p className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                                                Disposals
                                            </p>
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <p className="text-3xl font-bold text-red-600">
                                                {disposalsCount}
                                            </p>
                                            <p className="ml-2 text-sm font-medium text-gray-500">
                                                Records
                                            </p>
                                        </dd>
                                        <p className="mt-3 text-sm text-gray-500">
                                            Safely document the disposal of expired, damaged, or contaminated consumables.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm font-medium text-red-600 group-hover:text-red-700">
                                        View Disposals
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}