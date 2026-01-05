import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserMd, faPills, faFlask, 
    faNotesMedical, faHistory, faLink, faUnlink, faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function RoundHistoryTab({ history = [], opdData = null, diagnosisHistory = [] }) {
    
    return (
        <div className="space-y-8 animate-fade-in pb-10">

            {/* --- 1. ADMISSION DIAGNOSIS HISTORY --- */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                    <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faHistory} /> Admission Diagnosis Timeline
                    </h4>
                    <span className="text-xs text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-200">
                        {diagnosisHistory.length} Records
                    </span>
                </div>
                
                {diagnosisHistory.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3 w-32">Date</th>
                                <th className="px-4 py-3 w-1/3">ICD-10</th>
                                <th className="px-4 py-3 w-1/3">Local / Mtuha</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Doctor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {diagnosisHistory.map((diag, index) => (
                                <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300"/>
                                            {new Date(diag.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    
                                    {/* ICD */}
                                    <td className="px-4 py-3">
                                        {diag.icd_code && diag.icd_code !== '-' ? (
                                            <div>
                                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                    {diag.icd_code}
                                                </span>
                                                <span className="block text-gray-700 text-xs mt-1 leading-tight">
                                                    {diag.icd_name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No ICD Link</span>
                                        )}
                                    </td>

                                    {/* Local */}
                                    <td className="px-4 py-3">
                                        {diag.local_name ? (
                                            <div className="flex items-start gap-2">
                                                <FontAwesomeIcon icon={faLink} className="text-green-500 text-xs mt-0.5"/>
                                                <span className="text-gray-800 font-medium text-xs">
                                                    {diag.local_name}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUnlink} className="text-gray-300 text-xs"/>
                                                <span className="text-gray-400 italic text-xs">Standard ICD</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            diag.status_label === 'Confirmed' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {diag.status_label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                        {diag.user_name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-center text-gray-400 italic text-xs">No diagnoses recorded for this admission yet.</div>
                )}
            </div>
            
            <hr className="border-gray-200" />

            {/* --- 2. IPD WARD ROUNDS --- */}
            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Daily Progress Notes</h4>
            
            {history && history.length > 0 ? history.map((round) => (
                <div key={round.id} className="border-l-4 border-green-500 bg-white shadow-sm p-5 rounded-r-lg relative">
                    <span className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg font-bold">IPD Round</span>
                    
                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {new Date(round.round_date).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                                Dr. {round.doctor?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="block text-xs font-bold uppercase text-gray-500">Progress Notes</span>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{round.clinical_notes}</p>
                        </div>
                        {round.treatment_plan && (
                            <div className="bg-green-50 p-3 rounded border border-green-100">
                                <span className="block text-xs font-bold uppercase text-green-700">Plan</span>
                                <p className="text-sm text-green-900 mt-1">{round.treatment_plan}</p>
                            </div>
                        )}
                        <div className="text-xs text-gray-600 mt-2">
                            <strong>Condition:</strong> {round.general_condition || '-'}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="p-4 text-center text-gray-400 italic text-xs border border-dashed rounded">No ward rounds recorded yet.</div>
            )}

            {/* --- 3. OPD CONSULTATION --- */}
            {opdData && (
                <>
                    <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest font-bold">Admission Event</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <div className="border-l-4 border-blue-500 bg-blue-50 shadow-sm p-5 rounded-r-lg relative opacity-90">
                        <span className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-bl-lg font-bold">OPD Consultation</span>
                        
                        <div className="flex justify-between items-start mb-4 border-b border-blue-200 pb-2">
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(opdData.created_at).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                                    Dr. {opdData.user?.name || 'Unknown'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* History & Exam */}
                            <div className="space-y-3">
                                <div>
                                    <span className="block text-xs font-bold uppercase text-blue-700 mb-1">
                                        <FontAwesomeIcon icon={faNotesMedical} className="mr-1" /> History (HPI)
                                    </span>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-blue-100">
                                        {opdData.history?.history_presenting_illness || 'Not recorded'}
                                    </p>
                                </div>
                            </div>

                            {/* Initial Orders */}
                            <div className="space-y-3">
                                <div>
                                    <span className="block text-xs font-bold uppercase text-blue-700 mb-1">
                                        Initial Orders
                                    </span>
                                    <div className="bg-white p-2 rounded border border-blue-100 text-xs space-y-2">
                                        {opdData.prescriptions?.length > 0 && (
                                            <div>
                                                <strong className="text-gray-500"><FontAwesomeIcon icon={faPills}/> Rx:</strong>
                                                <ul className="pl-4 list-none mt-1">
                                                    {opdData.prescriptions.map((p,i) => (
                                                        <li key={i}>{p.product?.name} ({p.dosage} x {p.frequency})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {opdData.lab_requests?.length > 0 && (
                                            <div>
                                                <strong className="text-gray-500"><FontAwesomeIcon icon={faFlask}/> Lab:</strong>
                                                <span className="ml-1">{opdData.lab_requests.map(l => l.panel?.name).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}