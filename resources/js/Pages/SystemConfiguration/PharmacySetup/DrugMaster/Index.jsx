import React, { useEffect, useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEdit, faHome, faCheckCircle, faExclamationCircle, faPills, faFlask } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function DrugMasterIndex({ auth, products, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        setSearchData("search", e.target.value);
        router.get(route("systemconfiguration9.drugmaster.index"), 
            { search: e.target.value }, 
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Pharmacy Drug Master</h2>}>
            <Head title="Drug Master" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Search */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search inventory items..." 
                                    value={searchData.search} 
                                    onChange={handleSearch} 
                                    className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <Link href={route("systemconfiguration9.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow">
                                <FontAwesomeIcon icon={faHome} className="mr-2" /> Back to Setup
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventory Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinical Config</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.map((product) => {
                                        const isConfigured = !!product.drug_details;
                                        const type = product.drug_details?.formulation_type; // 0 or 1

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    {product.drug_details?.generic_name && (
                                                        <div className="text-xs text-gray-500 italic">Gen: {product.drug_details.generic_name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{product.category?.name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {isConfigured ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Configured
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {isConfigured ? (
                                                        <div className="flex items-center gap-2">
                                                            {type === 0 
                                                                ? <span title="Solid/Tablet"><FontAwesomeIcon icon={faPills} className="text-blue-400" /></span> 
                                                                : <span title="Liquid/Syrup"><FontAwesomeIcon icon={faFlask} className="text-orange-400" /></span>
                                                            }
                                                            <span>
                                                                {product.drug_details.strength_amount} {product.drug_details.strength_unit}
                                                                {type === 1 && ` / ${product.drug_details.total_volume}${product.drug_details.volume_unit}`}
                                                            </span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link 
                                                        href={route("systemconfiguration9.drugmaster.edit", product.id)} 
                                                        className="text-blue-600 hover:text-blue-900 font-medium text-sm flex items-center justify-center"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Configure
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={products.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}