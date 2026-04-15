import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import HospitalLayout from "@/Layouts/HospitalLayout";
import Pagination from "@/Components/Pagination";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, faEye, faHistory, faCheckCircle, 
    faPrint, faFlask
} from "@fortawesome/free-solid-svg-icons";

const DEBOUNCE_DELAY = 300;

export default function HistoryIndex({ samples, filters }) {
    
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
            router.get(route("laboratory2.index"), {
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
    const [viewSample, setViewSample] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openResultModal = (sample) => {
        setViewSample(sample);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setViewSample(null), 300);
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Test History & Results</h2>}>
            <Head title="Lab Test History" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-gray-200">
                    
                    {/* --- Filter Section --- */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <div className="text-sm text-gray-600 mr-auto flex items-center">
                            <FontAwesomeIcon icon={faHistory} className="mr-2 text-indigo-500" />
                            <span className="hidden sm:inline">Completed results.</span>
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
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">Test Panel</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-indigo-800 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-indigo-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {samples.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                            No completed tests found for this date range.
                                        </td>
                                    </tr>
                                ) : (
                                    samples.data.map((sample) => {
                                        const patient = sample.prescription?.patient;
                                        if (!patient) return null;

                                        return (
                                            <tr key={sample.id} className="hover:bg-gray-50 transition-colors">
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-middle">
                                                     {new Date(sample.created_at).toLocaleDateString()}
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
                                                        <FontAwesomeIcon icon={faFlask} className="mr-2 text-indigo-500 opacity-80"/>
                                                        {sample.prescription?.panel?.name || 'Unknown Panel'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 align-middle text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold bg-green-100 text-green-800 border border-green-200">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> COMPLETED
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 align-middle text-right">
                                                    <button 
                                                        onClick={() => openResultModal(sample)}
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
                        <Pagination links={samples.links} />
                    </div>
                </div>
            </div>

            {/* --- VIEW RESULTS MODAL --- */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                {viewSample && viewSample.prescription && (
                    <div className="p-6">
                        
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFlask} /> 
                                    {viewSample.prescription.panel?.name}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>Patient:</strong> {viewSample.prescription.patient.first_name} {viewSample.prescription.patient.last_name} 
                                    <span className="mx-2">|</span> 
                                    <strong>Sample ID:</strong> <span className="font-mono">{viewSample.sample_code}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> FINAL
                                </span>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Parameter</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Result</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Units</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Ref. Range</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {viewSample.results && viewSample.results.length > 0 ? (
                                        viewSample.results.map(result => (
                                            <tr key={result.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {result.parameter?.name}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-indigo-700">
                                                    {result.result_value}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {result.parameter?.units || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {result.parameter?.ranges && result.parameter.ranges.length > 0 ? (
                                                        <>
                                                            M: {result.parameter.ranges[0].male_min} - {result.parameter.ranges[0].male_max} <br/>
                                                            F: {result.parameter.ranges[0].female_min} - {result.parameter.ranges[0].female_max}
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                                No parameters recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button 
                                type="button"
                                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-200 focus:outline-none"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print
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