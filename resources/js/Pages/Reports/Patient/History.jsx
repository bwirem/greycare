import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPrint, 
    faUserCircle, 
    faPhone, 
    faMapMarkerAlt, 
    faCalendarAlt, 
    faNotesMedical, 
    faPills, 
    faVials, 
    faHistory,
    faStethoscope,
    faProcedures,
    faAllergies,
    faFileMedical
} from '@fortawesome/free-solid-svg-icons';

export default function PatientHistoryReport({ auth, patient, timeline, diagnoses, medications, labs }) {
    const [activeTab, setActiveTab] = useState('visits');

    const tabs = [
        { id: 'visits', label: 'Timeline & Visits', icon: faHistory },
        { id: 'clinical', label: 'Diagnosis History', icon: faNotesMedical },
        { id: 'meds', label: 'Medications', icon: faPills },
        { id: 'labs', label: 'Labs & Radiology', icon: faVials },
    ];

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
                            <button 
                                onClick={() => window.print()} 
                                className="bg-gray-800 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-700 transition flex items-center text-sm font-medium"
                            >
                                <FontAwesomeIcon icon={faPrint} className="mr-2"/> Print Record
                            </button>
                            <span className="text-xs text-gray-400 italic">Last Updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Clinical Alert Flags (If needed in future) */}
                    {/* <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <FontAwesomeIcon icon={faAllergies} className="mr-1"/> Allergies: Penicillin
                        </span>
                    </div> */}
                </div>

                {/* 2. TABS NAVIGATION (Hidden on Print) */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6 print:hidden overflow-x-auto">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
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

                {/* 3. REPORT CONTENT SECTIONS */}
                {/* Note: 'print:block' ensures ALL sections show when printing, regardless of activeTab */}
                
                <div className="space-y-8">

                    {/* --- SECTION A: VISITS TIMELINE --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'visits' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Clinical Timeline</h3>
                        </div>
                        
                        <div className="p-6 relative">
                            {timeline.length === 0 ? (
                                <EmptyState message="No visit history found for this patient." />
                            ) : (
                                <div className="border-l-2 border-indigo-100 dark:border-gray-700 ml-3 space-y-8 pb-4">
                                    {timeline.map((event, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            {/* Timeline Dot */}
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
                                                
                                                {/* Vitals / Outcome Box */}
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
                                <div className="p-6"><EmptyState message="No diagnosis history recorded." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diagnosis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {diagnoses.map((diag, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-40">{diag.date}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{diag.name}</td>
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
                                <div className="p-6"><EmptyState message="No medication history found." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Drug Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosage Instruction</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {medications.map((rx, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-32">{rx.date}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">{rx.drug}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono text-xs">{rx.dose}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-200">{rx.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* --- SECTION D: LABS & RADIOLOGY --- */}
                    <div className={`bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden ${activeTab === 'labs' ? 'block' : 'hidden print:block'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faVials} className="text-gray-400"/>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Laboratory & Radiology</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {labs.length === 0 ? (
                                <div className="p-6"><EmptyState message="No lab or radiology requests found." /></div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Test / Procedure</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Results Summary</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {labs.map((lab, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-32">{lab.date}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{lab.test}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`
                                                        px-2 py-1 text-xs rounded-full border font-semibold
                                                        ${lab.status === 'Verified' || lab.status === 'Completed' 
                                                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
                                                            : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400'}
                                                    `}>
                                                        {lab.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic">
                                                    {lab.result_summary}
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