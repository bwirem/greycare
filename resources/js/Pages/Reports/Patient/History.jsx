import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal'; 
import SecondaryButton from '@/Components/SecondaryButton'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPrint, faUserCircle, faPhone, faMapMarkerAlt, 
    faCalendarAlt, faNotesMedical, faPills, faVials, 
    faHistory, faStethoscope, faProcedures, faFileMedical,
    faEye, faFlask, faCheckCircle, faXRay,
    faFilePdf, faFileExcel // <-- Added Export Icons
} from '@fortawesome/free-solid-svg-icons';

export default function PatientHistoryReport({ auth, patient, timeline, diagnoses, medications, investigations, filters }) {
    const [activeTab, setActiveTab] = useState('visits');
    const [viewItem, setViewItem] = useState(null);

    // --- Date Filter Setup ---
    const { data, setData } = useForm({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
    });

    const filterTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
        
        filterTimeoutRef.current = setTimeout(() => {
            router.get(window.location.pathname, data, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(filterTimeoutRef.current);
    }, [data.start_date, data.end_date]);

    // Helper function to build export URLs cleanly
    const getExportUrl = (format) => {
        const params = { format };
        if (data.start_date) params.start_date = data.start_date;
        if (data.end_date) params.end_date = data.end_date;
        
        // Ensure this route matches what you define in web.php
        return route('reports.doctor.patient.history.export', { patientCode: patient.code, ...params });
    };

    const tabs = [
        { id: 'visits', label: 'Timeline & Visits', icon: faHistory },
        { id: 'clinical', label: 'Diagnosis History', icon: faNotesMedical },
        { id: 'meds', label: 'Medications', icon: faPills },
        { id: 'investigations', label: 'Labs & Radiology', icon: faVials },
    ];

    const isCompleted = (status) => {
        if (!status) return false;
        const s = status.toLowerCase();
        return ['verified', 'completed', 'finalized', 'reported'].includes(s);
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="text-xl font-semibold text-gray-800 leading-tight">Patient Medical Record</h2>}
        >
            <Head title={`Record - ${patient.name}`} />
            
            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 1. PATIENT HEADER CARD */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-6 border-l-4 border-indigo-500 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start z-10 relative">
                        <div className="flex items-start gap-5">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full flex-shrink-0">
                                <FontAwesomeIcon icon={faUserCircle} className="text-indigo-600 dark:text-indigo-300 text-4xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-none mb-2">
                                    {patient.name}
                                </h1>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200 font-bold border border-gray-300 dark:border-gray-600">
                                        {patient.code}
                                    </span>
                                    <span className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-400"/> 
                                        {patient.dob} ({patient.age} Yrs)
                                    </span>
                                    <span className="flex items-center capitalize">
                                        <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-indigo-400"/> 
                                        {patient.gender}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400"/> 
                                        {patient.phone || 'No Phone'}
                                    </span>
                                    <span className="flex items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400"/> 
                                        {patient.address || 'No Address'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-2 print:hidden">
                            <div className="flex flex-wrap justify-end gap-2">
                                <a 
                                    href={getExportUrl('pdf')} 
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition flex items-center text-sm font-medium"
                                    title="Export to PDF"
                                >
                                    <FontAwesomeIcon icon={faFilePdf} className="mr-2"/> PDF
                                </a>
                                <a 
                                    href={getExportUrl('excel')} 
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center text-sm font-medium"
                                    title="Export to Excel"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2"/> Excel
                                </a>                                
                            </div>
                            <span className="text-xs text-gray-400 italic">Last Updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. DATE FILTERS & TABS NAVIGATION */}
                <div className="mb-6 print:hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-t-lg border-b border-gray-200 dark:border-gray-700 mb-2 shadow-sm">
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 sm:mb-0">
                            Record View Options
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1"/> Filter Dates:
                            </span>
                            <input 
                                type="date" 
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                                className="rounded-md border-gray-300 text-sm py-1 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                            <span className="text-gray-400 text-sm">to</span>
                            <input 
                                type="date" 
                                value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)}
                                className="rounded-md border-gray-300 text-sm py-1 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-6 overflow-x-auto w-full">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
                                        ${activeTab === tab.id 
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}
                                    `}
                                >
                                    <FontAwesomeIcon icon={tab.icon} className={`mr-2 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>                

                {/* 3. REPORT CONTENT SECTIONS */}
                <div className="space-y-8">

                    {/* --- SECTION A: VISITS TIMELINE --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'visits' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Clinical Timeline</h3>
                        </div>
                        <div className="p-6 relative">
                            {timeline.length === 0 ? (
                                <EmptyState message="No visit history found for this date range." />
                            ) : (
                                <div className="border-l-2 border-indigo-100 dark:border-gray-700 ml-3 space-y-8 pb-4">
                                    {timeline.map((event, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            <div className={`absolute -left-[9px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-800 ${event.type === 'IPD' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${event.type === 'IPD' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {event.type}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                            {event.date_str}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                                        {event.type === 'IPD' ? <FontAwesomeIcon icon={faProcedures} className="mr-2 text-gray-400"/> : <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-gray-400"/>}
                                                        {event.location}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Seen by: <span className="font-medium text-gray-900 dark:text-gray-300">{event.doctor}</span>
                                                    </p>
                                                </div>
                                                
                                                {(event.vitals !== '-' || event.outcome) && (
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 text-sm border border-gray-100 dark:border-gray-600 max-w-md w-full sm:w-auto">
                                                        {event.type === 'OPD' ? (
                                                            <>
                                                                <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Vitals</span>
                                                                <span className="font-mono text-gray-700 dark:text-gray-300">{event.vitals}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Outcome</span>
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{event.outcome}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- SECTION B: DIAGNOSES --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'clinical' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faNotesMedical} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Confirmed Diagnoses</h3>
                        </div>
                        <div className="p-0">
                            {diagnoses.length === 0 ? (
                                <div className="p-6"><EmptyState message="No diagnosis history recorded in this period." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {diagnoses.map((diag, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-40">{diag.date}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{diag.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* --- SECTION C: MEDICATIONS --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'meds' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPills} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Medication History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {medications.length === 0 ? (
                                <div className="p-6"><EmptyState message="No medication history found in this period." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Drug Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dosage Instruction</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                        {medications.map((rx, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">{rx.date}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{rx.drug}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">{rx.dose}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">{rx.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* --- SECTION D: LABS & RADIOLOGY --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'investigations' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            <FontAwesomeIcon icon={faVials} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Laboratory & Radiology</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {investigations.length === 0 ? (
                                <div className="p-6"><EmptyState message="No investigations found in this period." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test / Procedure</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {investigations.map((item, idx) => (
                                            <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">{item.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${
                                                        item.type === 'LAB' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.test}</div>
                                                    {item.type === 'RAD' && (
                                                        <div className="text-xs text-gray-500 mt-0.5">{item.modality}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`
                                                        px-2 py-1 text-xs rounded-full border font-semibold
                                                        ${isCompleted(item.status)
                                                            ? 'bg-green-50 border-green-200 text-green-700' 
                                                            : 'bg-yellow-50 border-yellow-200 text-yellow-700'}
                                                    `}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right print:hidden">
                                                    {/* Show button if LAB has results, or RAD has report */}
                                                    {(item.type === 'LAB' && item.results?.length > 0) || (item.type === 'RAD' && item.report !== null) ? (
                                                        <button 
                                                            onClick={() => setViewItem(item)}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold flex items-center justify-end gap-1 w-full"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} /> View {item.type === 'LAB' ? 'Results' : 'Report'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>

                {/* Print Footer */}
                <div className="mt-8 text-center hidden print:block text-xs text-gray-400 border-t pt-4">
                    <p>Report Generated on {new Date().toLocaleString()} | Confidential Medical Record</p>
                </div>
            </div>

            {/* --- UNIVERSAL MODAL FOR LABS AND RADIOLOGY --- */}
            <Modal show={viewItem !== null} onClose={() => setViewItem(null)} maxWidth={viewItem?.type === 'RAD' ? '3xl' : '2xl'}>
                {viewItem && (
                    <div className="p-0 sm:p-6 bg-white relative">
                        
                        {/* Print Header */}
                        <div className="hidden print:block mb-8 text-center border-b-2 pb-4">
                            <h1 className="text-2xl font-bold uppercase">
                                {viewItem.type === 'LAB' ? 'Laboratory Report' : 'Radiology Report'}
                            </h1>
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
                                        {patient.name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600 mt-1">
                                        <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-800">
                                            {patient.code}
                                        </span>
                                        <span>{patient.gender}</span>
                                        <span>Age: {patient.age || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 sm:mt-0 text-left sm:text-right w-full sm:w-auto bg-white p-3 sm:p-0 rounded border sm:border-0 border-gray-200">
                                <h3 className="text-indigo-800 font-bold text-base flex items-center justify-start sm:justify-end">
                                    <FontAwesomeIcon icon={viewItem.type === 'LAB' ? faFlask : faXRay} className="mr-2" />
                                    {viewItem.test}
                                </h3>
                                <div className="text-xs text-gray-500 mt-1">
                                    <strong>{viewItem.type === 'LAB' ? 'Sample ID:' : 'ACC:'}</strong> <span className="font-mono">{viewItem.identifier}</span>
                                    <span className="mx-2">|</span>
                                    <strong>Date:</strong> {viewItem.report?.finalized_at || viewItem.date}
                                </div>
                            </div>
                        </div>

                        {/* --- RENDER LAB RESULTS --- */}
                        {viewItem.type === 'LAB' && (
                            <div className="px-6 sm:px-0 overflow-hidden rounded-lg border border-gray-200 mb-6">
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
                                        {viewItem.results.map((res, i) => (
                                            <tr key={res.id || i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{res.parameter}</td>
                                                <td className="px-4 py-3 font-bold text-indigo-700">{res.value}</td>
                                                <td className="px-4 py-3 text-gray-500">{res.units}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{res.range}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- RENDER RADIOLOGY REPORT --- */}
                        {viewItem.type === 'RAD' && (
                            <div className="px-6 sm:px-0 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faNotesMedical} className="mr-2" /> Findings
                                    </h4>
                                    <div className="bg-gray-50 border border-gray-200 rounded p-4 text-gray-800 text-sm whitespace-pre-wrap font-mono min-h-[100px]">
                                        {viewItem.report?.findings || <span className="text-gray-400 italic">No findings recorded.</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Impression
                                    </h4>
                                    <div className="bg-indigo-50 border border-indigo-100 rounded p-4 text-indigo-900 text-sm font-bold whitespace-pre-wrap">
                                        {viewItem.report?.impression || <span className="text-indigo-400 italic font-normal">No impression recorded.</span>}
                                    </div>
                                </div>

                                {viewItem.report?.suggestion && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Recommendation
                                        </h4>
                                        <div className="bg-white border-l-4 border-yellow-400 p-3 text-gray-700 text-sm whitespace-pre-wrap shadow-sm">
                                            {viewItem.report.suggestion}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Footer Actions */}
                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 px-6 sm:px-0 pb-6 sm:pb-0 bg-gray-50 sm:bg-white print:hidden">
                            <button 
                                type="button"
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="mr-2 text-gray-500" /> Print
                            </button>

                            <SecondaryButton onClick={() => setViewItem(null)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

// Simple Helper Component for Empty States
function EmptyState({ message }) {
    return (
        <div className="text-center py-8">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faFileMedical} className="text-gray-400 text-xl" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
        </div>
    );
}