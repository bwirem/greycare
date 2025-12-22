import React, { useEffect, useState, useRef } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faPlus, faEdit, faTrash, faHome, 
    faClock, faBolt, faChevronDown, faChevronUp, faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import Modal from '@/Components/CustomModal';
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

const DEBOUNCE_DELAY = 300;

export default function ProcedureIndex({ auth, procedures, success, filters }) {
    const { data: searchData, setData: setSearchData } = useForm({ search: filters.search || "" });
    const [modalState, setModalState] = useState({ isOpen: false, idToDelete: null });
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Toast Success
    useEffect(() => { if (success) toast.success(success); }, [success]);

    // Navigation Loading
    useEffect(() => {
        const removeStart = router.on('start', () => setIsLoading(true));
        const removeFinish = router.on('finish', () => setIsLoading(false));
        return () => { removeStart(); removeFinish(); };
    }, []);

    // Search Debounce
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("systemconfiguration7.procedures.index"), { search: searchData.search }, { 
                preserveState: true, replace: true, preserveScroll: true 
            });
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchData.search]);

    // Grouping Logic (Group by Modality Name)
    const groupedProcedures = procedures.data.reduce((acc, item) => {
        const groupName = item.modality?.name || 'Unassigned';
        if (!acc[groupName]) { acc[groupName] = []; }
        acc[groupName].push(item);
        return acc;
    }, {});

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const handleDelete = (id) => setModalState({ isOpen: true, idToDelete: id });
    const handleConfirmDelete = () => {
        router.delete(route("systemconfiguration7.procedures.destroy", modalState.idToDelete), {
            onSuccess: () => setModalState({ isOpen: false, idToDelete: null }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Radiology Procedures</h2>}>
            <Head title="Procedures" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header Actions */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search exams..." 
                                        value={searchData.search} 
                                        onChange={e => setSearchData("search", e.target.value)} 
                                        className="w-full rounded-md border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route("systemconfiguration7.procedures.create")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center shadow-sm transition text-sm font-semibold">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Exam
                                </Link>
                                <Link href={route("systemconfiguration7.index")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center shadow-sm transition text-sm font-semibold">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" /> Home
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.keys(groupedProcedures).length > 0 ? (
                                            Object.entries(groupedProcedures).map(([groupName, groupItems]) => (
                                                <React.Fragment key={groupName}>
                                                     <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer select-none" onClick={() => toggleGroup(groupName)}>
                                                        <td colSpan="5" className="px-4 py-2 text-left font-bold text-gray-800">
                                                            <FontAwesomeIcon icon={expandedGroups[groupName] ? faChevronUp : faChevronDown} className="mr-3 text-gray-500" />
                                                            {groupName} ({groupItems.length})
                                                        </td>
                                                    </tr>
                                                    {expandedGroups[groupName] && groupItems.map((item) => (
                                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 pl-10">{item.name}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.code || '-'}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-500 text-center">
                                                                <span className="flex items-center justify-center gap-1">
                                                                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" /> {item.duration_minutes}m
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {item.contrast_required && (
                                                                    <span className="text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded text-xs font-medium" title="Contrast Required">
                                                                        <FontAwesomeIcon icon={faBolt} className="mr-1" /> Contrast
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center space-x-4">
                                                                <Link href={route("systemconfiguration7.procedures.edit", item.id)} className="text-blue-600 hover:text-blue-900 transition">
                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                </Link>
                                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 transition">
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                    No procedures found. Click "Add Exam" to create one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Pagination class="mt-6" links={procedures.links} />
                    </div>
                </div>
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, idToDelete: null })} onConfirm={handleConfirmDelete} title="Delete Procedure" message="Are you sure you want to delete this exam?" />
        </AuthenticatedLayout>
    );
}