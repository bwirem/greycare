import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import HospitalLayout from "@/Layouts/HospitalLayout";
import Pagination from "@/Components/Pagination";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faEye, faHistory, faCheckCircle, 
    faPrint, faXRay, faNotesMedical, faUserCircle 
} from "@fortawesome/free-solid-svg-icons";

const DEBOUNCE_DELAY = 300;

export default function RadHistoryIndex({ studies, filters }) {
    
    // Initialize form state with filters
    const { data, setData, errors } = useForm({
        search: filters.search || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const searchTimeoutRef = useRef(null);

    // Watch for changes in any filter and trigger a reload
    useEffect(() => {
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            router.get(route("radiology2.index"), {
                search: data.search,
                start_date: data.start_date,
                end_date: data.end_date,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, DEBOUNCE_DELAY);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [data.search, data.start_date, data.end_date]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setData(name, value);
    }, [setData]);

    // --- Modal State ---
    const [viewStudy, setViewStudy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openReportModal = (study) => {
        setViewStudy(study);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setViewStudy(null), 300);
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Radiology History & Reports</h2>}>
            <Head title="Radiology History" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-200">
                    
                    {/* --- Filter Section --- */}
                    <div className="mb-6 flex flex-wrap items-center gap-3 border-b pb-4">
                        <div className="text-sm text-gray-600 mr-auto flex items-center">
                            <FontAwesomeIcon icon={faHistory} className="mr-2 text-indigo-500" />
                            <span className="hidden sm:inline">Completed reports.</span>
                        </div>

                        {/* Date Range Filters */}
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                name="start_date" 
                                value={data.start_date} 
                                onChange={handleFormChange} 
                                className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.start_date ? "border-red-500" : ""}`} 
                            />
                            <span className="text-gray-500 hidden sm:inline">to</span>
                            <input 
                                type="date" 
                                name="end_date" 
                                value={data.end_date} 
                                onChange={handleFormChange} 
                                className={`rounded-md border-gray-300 py-2 px-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.end_date ? "border-red-500" : ""}`} 
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative flex items-center flex-grow sm:flex-grow-0">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
                            <input 
                                type="text" 
                                name="search" 
                                placeholder="Search Patient..." 
                                value={data.search} 
                                onChange={handleFormChange} 
                                className={`w-full rounded-md border-gray-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:w-64 md:w-80 ${errors.search ? "border-red-500" : ""}`} 
                            />
                        </div>
                    </div>

                    {/* --- Data Table --- */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Procedure / Exam</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-indigo-800 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-indigo-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studies.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                            No completed reports found for this date range.
                                        </td>
                                    </tr>
                                ) : (
                                    studies.data.map((study) => {
                                        const patient = study.patient;
                                        if (!patient) return null;

                                        return (
                                            <tr key={study.id} className="hover:bg-gray-50 transition-colors">
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-middle">
                                                     {new Date(study.updated_at).toLocaleDateString()}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                    <div className="font-semibold text-gray-900 text-sm">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                        {patient.code || patient.patientcode}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 align-middle">
                                                    <div className="text-sm font-medium text-gray-800">
                                                        <FontAwesomeIcon icon={faXRay} className="mr-2 text-indigo-500 opacity-80"/>
                                                        {study.procedure?.name || 'Unknown Procedure'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                        {study.procedure?.modality?.name || 'Modality'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 align-middle text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold bg-green-100 text-green-800 border border-green-200">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> FINALIZED
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 align-middle text-right">
                                                    <button 
                                                        onClick={() => openReportModal(study)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded font-semibold text-xs shadow-sm transition"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} className="mr-1.5" /> View
                                                    </button>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <Pagination links={studies.links} />
                    </div>
                </div>
            </div>

            {/* --- VIEW REPORT MODAL --- */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="3xl">
                {viewStudy && (
                    <div className="p-0 sm:p-6 bg-white relative">
                        
                        {/* Print Header */}
                        <div className="hidden print:block mb-8 text-center border-b-2 pb-4">
                            <h1 className="text-2xl font-bold uppercase">Radiology Report</h1>
                            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleString()}</p>
                        </div>

                        {/* Modal Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-6 pt-4 sm:pt-0 px-6 sm:px-0 bg-gray-50 sm:bg-white rounded-t-lg">
                            <div className="flex gap-4 items-start">
                                <div className="hidden sm:block bg-indigo-100 text-indigo-600 p-3 rounded-full">
                                    <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                        {viewStudy.patient?.first_name} {viewStudy.patient?.last_name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600 mt-1">
                                        <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-800">
                                            {viewStudy.patient?.code || viewStudy.patient?.patientcode}
                                        </span>
                                        <span>{viewStudy.patient?.gender}</span>
                                        <span>Age: {viewStudy.patient?.age || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 text-left sm:text-right w-full sm:w-auto bg-white p-3 sm:p-0 rounded border sm:border-0 border-gray-200">
                                <h3 className="text-indigo-800 font-bold text-base flex items-center justify-start sm:justify-end">
                                    <FontAwesomeIcon icon={faXRay} className="mr-2" />
                                    {viewStudy.procedure?.name}
                                </h3>
                                <div className="text-xs text-gray-500 mt-1">
                                    <strong>ACC:</strong> <span className="font-mono">{viewStudy.accession_number || 'N/A'}</span>
                                    <span className="mx-2">|</span>
                                    <strong>Date:</strong> {new Date(viewStudy.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 sm:px-0 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                    <FontAwesomeIcon icon={faNotesMedical} className="mr-2" /> Findings
                                </h4>
                                <div className="bg-gray-50 border border-gray-200 rounded p-4 text-gray-800 text-sm whitespace-pre-wrap font-mono min-h-[100px]">
                                    {viewStudy.report?.findings || <span className="text-gray-400 italic">No findings recorded.</span>}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Impression
                                </h4>
                                <div className="bg-indigo-50 border border-indigo-100 rounded p-4 text-indigo-900 text-sm font-bold whitespace-pre-wrap">
                                    {viewStudy.report?.impression || <span className="text-indigo-400 italic font-normal">No impression recorded.</span>}
                                </div>
                            </div>

                            {viewStudy.report?.suggestion && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Recommendation
                                    </h4>
                                    <div className="bg-white border-l-4 border-yellow-400 p-3 text-gray-700 text-sm whitespace-pre-wrap shadow-sm">
                                        {viewStudy.report.suggestion}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 px-6 sm:px-0 pb-6 sm:pb-0 bg-gray-50 sm:bg-white print:hidden">
                            <button 
                                type="button"
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="mr-2 text-gray-500" /> Print Report
                            </button>

                            <SecondaryButton onClick={closeModal}>
                                Close
                            </SecondaryButton>
                        </div>
                        
                    </div>
                )}
            </Modal>
        </HospitalLayout>
    );
}