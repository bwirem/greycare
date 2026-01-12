import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faImage, faPenNib, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function ReportEditor({ request_data, patient, procedure, existing_report, viewer_url }) {
    
    // State to toggle Fullscreen Viewer
    const [isViewerExpanded, setIsViewerExpanded] = useState(false);

    const { data, setData, post, processing } = useForm({
        findings: existing_report?.findings || '',
        impression: existing_report?.impression || '',
        recommendation: existing_report?.suggestion || '', // Ensure this matches DB column name
        is_final: false
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('radiology1.store', request_data.id));
    };

    return (
        <HospitalLayout header={<h2>Reporting: {patient.first_name} {patient.last_name}</h2>}>
            <Head title="Radiology Report" />

            {/* Split Screen Layout: Viewer (Left) | Form (Right) */}
            {/* calculated height ensures no double scrollbars */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] overflow-hidden bg-gray-100">
                
                {/* --- LEFT PANEL: DICOM VIEWER --- */}
                <div className={`transition-all duration-300 relative bg-black ${isViewerExpanded ? 'w-full absolute inset-0 z-50' : 'w-full lg:w-3/5 h-[40vh] lg:h-full border-r border-gray-600'}`}>
                    
                    {/* Viewer Controls */}
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <button 
                            onClick={() => setIsViewerExpanded(!isViewerExpanded)}
                            className="bg-gray-800/80 text-white p-2 rounded hover:bg-gray-700 transition shadow-lg"
                            title={isViewerExpanded ? "Exit Fullscreen" : "Fullscreen Viewer"}
                        >
                            <FontAwesomeIcon icon={isViewerExpanded ? faCompress : faExpand} />
                        </button>
                    </div>

                    {viewer_url ? (
                        <iframe 
                            src={viewer_url} 
                            className="w-full h-full border-none"
                            allowFullScreen
                            title="DICOM Viewer"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FontAwesomeIcon icon={faImage} className="text-5xl mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold">No Images Available</h3>
                            <p className="text-sm mt-1">Status: {request_data.status}</p>
                            <p className="text-xs mt-2 font-mono bg-gray-900 p-1 rounded text-gray-400">
                                ACC: {request_data.accession_number}
                            </p>
                            <div className="mt-4 flex items-center text-yellow-600 text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                <span>Check if PACS server is running</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT PANEL: REPORT FORM --- */}
                {/* Hidden when viewer is fullscreen */}
                <div className={`flex flex-col w-full lg:w-2/5 h-full bg-white overflow-y-auto ${isViewerExpanded ? 'hidden' : 'block'}`}>
                    <form onSubmit={submit} className="p-6 flex flex-col min-h-full">
                        
                        {/* Header Info Card */}
                        <div className="bg-indigo-50 p-4 rounded-md mb-6 border border-indigo-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{procedure.name}</h3>
                                    <p className="text-xs text-indigo-700 font-mono mt-1">
                                        ACC: <span className="font-bold">{request_data.accession_number}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                                        {procedure.modality.code}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="flex-grow space-y-5">
                            <div>
                                <InputLabel value="Findings / Observations" className="text-gray-800 font-bold" />
                                <TextArea 
                                    className="w-full mt-1 font-mono text-sm bg-gray-50 focus:bg-white transition-colors border-gray-300 shadow-sm" 
                                    rows="12"
                                    placeholder="Enter detailed imaging findings here..."
                                    value={data.findings}
                                    onChange={e => setData('findings', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel value="Impression / Diagnosis" className="text-gray-800 font-bold" />
                                <TextArea 
                                    className="w-full mt-1 font-bold border-gray-300 shadow-sm" 
                                    rows="3"
                                    placeholder="Summary or conclusion..."
                                    value={data.impression}
                                    onChange={e => setData('impression', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel value="Recommendation (Optional)" />
                                <TextArea 
                                    className="w-full mt-1 text-sm border-gray-300 shadow-sm" 
                                    rows="2"
                                    placeholder="Follow up suggestions..."
                                    value={data.recommendation}
                                    onChange={e => setData('recommendation', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sticky Footer Actions */}
                        <div className="border-t pt-4 mt-6 bg-white sticky bottom-0 z-10">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer select-none group">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-5 h-5 cursor-pointer"
                                        checked={data.is_final}
                                        onChange={e => setData('is_final', e.target.checked)}
                                    />
                                    <span className={`text-sm font-bold group-hover:text-gray-900 transition ${data.is_final ? 'text-green-600' : 'text-gray-500'}`}>
                                        {data.is_final ? 'Finalize & Sign Report' : 'Save as Draft'}
                                    </span>
                                </label>

                                <PrimaryButton 
                                    disabled={processing} 
                                    className={`flex items-center gap-2 transition-colors ${data.is_final ? 'bg-green-600 hover:bg-green-700 border-green-700' : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700'}`}
                                >
                                    <FontAwesomeIcon icon={faPenNib} />
                                    {data.is_final ? 'Sign Report' : 'Save Draft'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}