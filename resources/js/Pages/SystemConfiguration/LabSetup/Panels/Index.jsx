import React, { useEffect, useState, useRef } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faEdit, faTrash, faHome, 
    faCheckCircle, faTimesCircle, faChevronDown, faChevronUp, faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

const DEBOUNCE_DELAY = 300;

export default function PanelIndex({ auth, panels, filters, success }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, itemToDelete: null });
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Toast Success
    useEffect(() => { if (success) toast.success(success); }, [success]);

    // Navigation Loading State
    useEffect(() => {
        const removeStart = router.on('start', () => setIsLoading(true));
        const removeFinish = router.on('finish', () => setIsLoading(false));
        return () => { removeStart(); removeFinish(); };
    }, []);

    // Search Debounce
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("systemconfiguration6.panels.index"), { search: searchData.search }, { 
                preserveState: true, replace: true, preserveScroll: true 
            });
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchData.search]);

    // Grouping Logic (Group by Category Name)
    const groupedPanels = panels.data.reduce((acc, panel) => {
        const groupName = panel.category?.name || 'Uncategorized';
        if (!acc[groupName]) { acc[groupName] = []; }
        acc[groupName].push(panel);
        return acc;
    }, {});

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const handleDelete = (item) => setModalState({ isOpen: true, itemToDelete: item });
    
    const handleConfirmDelete = () => {
        if (!modalState.itemToDelete) return;
        router.delete(route("systemconfiguration6.panels.destroy", modalState.itemToDelete.id), {
            onSuccess: () => setModalState({ isOpen: false, itemToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Lab Panels (Tests)</h2>}>
            <Head title="Lab Panels" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header Actions */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Search tests..." value={searchData.search} onChange={e => setSearchData("search", e.target.value)} className="w-full md:w-64 rounded-md border-gray-300 pl-10 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <Link href={route("systemconfiguration6.panels.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm text-sm font-semibold">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create
                                </Link>
                                <Link href={route("systemconfiguration6.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm text-sm font-semibold">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="relative rounded-lg border overflow-hidden">
                             {/* Loading Overlay */}
                             {isLoading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="flex flex-col items-center">
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-4xl mb-2" />
                                        <span className="text-blue-600 font-medium">Loading...</span>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sample</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Active</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.keys(groupedPanels).length > 0 ? (
                                            Object.entries(groupedPanels).map(([groupName, groupItems]) => (
                                                <React.Fragment key={groupName}>
                                                    <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer select-none" onClick={() => toggleGroup(groupName)}>
                                                        <td colSpan="4" className="px-4 py-2 text-left font-bold text-gray-800">
                                                            <FontAwesomeIcon icon={expandedGroups[groupName] ? faChevronUp : faChevronDown} className="mr-3 text-gray-500" />
                                                            {groupName} ({groupItems.length})
                                                        </td>
                                                    </tr>
                                                    {expandedGroups[groupName] && groupItems.map((item) => (
                                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 pl-10">
                                                                {item.name} <span className="text-gray-400 text-xs ml-2">({item.code || 'No Code'})</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.default_sample?.name || '-'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                {item.is_available 
                                                                    ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                                    : <FontAwesomeIcon icon={faTimesCircle} className="text-gray-300" />
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                                                                <Link href={route("systemconfiguration6.panels.edit", item.id)} className="text-blue-600 hover:text-blue-900 transition-colors">
                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                </Link>
                                                                <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900 transition-colors">
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">No test panels found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Pagination class="mt-6" links={panels.links} />
                    </div>
                </div>
            </div>
            
            <Modal 
                isOpen={modalState.isOpen} 
                onClose={() => setModalState({ isOpen: false, itemToDelete: null })} 
                onConfirm={handleConfirmDelete} 
                title="Delete Panel" 
                message={modalState.itemToDelete ? `Are you sure you want to delete "${modalState.itemToDelete.name}"?` : "Are you sure?"} 
            />
        </AuthenticatedLayout>
    );
}