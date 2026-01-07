import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton'; // <--- Added
import DangerButton from '@/Components/DangerButton';       // <--- Added
import Modal from '@/Components/Modal';                     // <--- Added
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faNotesMedical, faUser, faBed, faCalendarAlt, faSignOutAlt, 
    faPrint, faFileInvoiceDollar, faExclamationTriangle // <--- Added Icon
} from '@fortawesome/free-solid-svg-icons';

// Import the Modal
import PendingBillsModal from './Partials/PendingBillsModal';

export default function DischargeCreate({ admission, statuses }) {
    
    const summary = admission.discharge_summary;
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [confirmingDischarge, setConfirmingDischarge] = useState(false); // <--- State for Confirmation Modal

    const { data, setData, post, processing, errors } = useForm({
        discharge_status_id: '',
        remarks: summary ? `Outcome: ${summary.outcome}. Instructions: ${summary.follow_up_instructions || 'None'}` : '',
        discharge_date: new Date().toISOString().slice(0, 16)
    });

    const submit = (e) => {
        e.preventDefault();
        // Instead of window.confirm, we open the modal
        setConfirmingDischarge(true);
    };

    const executeDischarge = () => {
        post(route('inpatient1.store', admission.id), {
            onFinish: () => setConfirmingDischarge(false),
        });
    };

    const handlePrintReport = () => {
        window.open(route('inpatient1.print-report', admission.id), '_blank');
    };

    return (
        <HospitalLayout header={<h2>Finalize Discharge</h2>}>
            <Head title="Discharge" />
            
            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                
                {/* LEFT: Patient & Clinical Info */}
                <div className="w-full lg:w-1/2 space-y-6">
                    
                    {/* Patient Card */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border-t-4 border-blue-500 relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {admission.patient.first_name} {admission.patient.last_name}
                                </h3>
                                <p className="text-sm text-gray-500 font-mono">{admission.patientcode}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-4">
                            <div><FontAwesomeIcon icon={faBed} className="mr-2 text-gray-400"/> {admission.ward?.name} / {admission.bed?.name}</div>
                            <div><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400"/> Admitted: {new Date(admission.created_at).toLocaleDateString()}</div>
                        </div>

                        {/* --- NEW BUTTON: CHECK PENDING BILLS --- */}
                        <div className="mt-4 pt-4 border-t flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowBillsModal(true)}
                                className="text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center"
                            >
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
                                Check Pending Bills
                            </button>
                        </div>
                    </div>

                    {/* Doctor's Summary */}
                    {summary ? (
                        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm relative">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faNotesMedical} /> Doctor's Clearance Note
                            </h4>
                            
                            <button 
                                type="button" 
                                onClick={handlePrintReport}
                                className="absolute top-4 right-4 text-green-700 hover:text-green-900 bg-white border border-green-200 px-3 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPrint} /> Print Report
                            </button>

                            <div className="space-y-3 text-sm text-gray-700">
                                <div><strong className="block text-xs uppercase text-green-600">Final Diagnosis</strong> {summary.final_diagnosis}</div>
                                <div><strong className="block text-xs uppercase text-green-600">Outcome</strong> {summary.outcome}</div>
                                <div><strong className="block text-xs uppercase text-green-600">Instructions</strong> {summary.follow_up_instructions || 'None provided'}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                            <strong>Note:</strong> No clinical discharge summary found.
                        </div>
                    )}
                </div>

                {/* RIGHT: Action Form */}
                <div className="w-full lg:w-1/2">
                    <form onSubmit={submit} className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-red-500"/> Discharge Details
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <InputLabel value="Discharge Date/Time" />
                                <TextInput type="datetime-local" className="w-full mt-1" value={data.discharge_date} onChange={e => setData('discharge_date', e.target.value)} required />
                                {errors.discharge_date && <p className="text-red-500 text-xs mt-1">{errors.discharge_date}</p>}
                            </div>

                            <div>
                                <InputLabel value="Discharge Outcome (Status)" />
                                <select className="w-full border-gray-300 rounded-md shadow-sm mt-1" value={data.discharge_status_id} onChange={e => setData('discharge_status_id', e.target.value)} required>
                                    <option value="">Select Outcome...</option>
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {errors.discharge_status_id && <p className="text-red-500 text-xs mt-1">{errors.discharge_status_id}</p>}
                            </div>

                            <div>
                                <InputLabel value="Administrative Remarks" />
                                <textarea className="w-full border-gray-300 rounded-md shadow-sm mt-1" rows="4" placeholder="Billing cleared? Medication collected?" value={data.remarks} onChange={e => setData('remarks', e.target.value)}></textarea>
                            </div>

                            <div className="pt-4">
                                <PrimaryButton className="w-full justify-center bg-red-600 hover:bg-red-700 h-12 text-lg shadow-md" disabled={processing}>
                                    {processing ? 'Processing...' : 'Finalize Discharge'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MOUNT MODAL: Pending Bills --- */}
            <PendingBillsModal 
                show={showBillsModal} 
                onClose={() => setShowBillsModal(false)} 
                patientCode={admission.patientcode} 
            />

            {/* --- MOUNT MODAL: Confirm Discharge --- */}
            <Modal show={confirmingDischarge} onClose={() => setConfirmingDischarge(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                        Confirm Discharge
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to discharge this patient? This will free the bed and stop billing.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingDischarge(false)}> 
                            Cancel 
                        </SecondaryButton>
                        <DangerButton onClick={executeDischarge} disabled={processing}> 
                            {processing ? 'Discharging...' : 'Yes, Discharge Patient'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

        </HospitalLayout>
    );
}