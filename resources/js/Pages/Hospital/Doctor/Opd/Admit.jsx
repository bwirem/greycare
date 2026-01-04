import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput'; // <--- Added missing import
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import ReactSelect from 'react-select';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBed, faNotesMedical, faStethoscope, 
    faPrescriptionBottle, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

export default function Admit({ 
    show, 
    onClose, 
    booking, 
    patient, 
    consultationData, // Data from the parent Consultation form
    wards = [], 
    diagnosisOptions = [] 
}) {

    // --- Form State ---
    const { data, setData, post, processing, reset, errors } = useForm({
        patient_code: patient?.code || '',
        opd_booking_id: booking?.id || '',

        billinggroup_id: booking?.billinggroup_id ||'', 
        billinggroupmembershipno: booking?.billinggroupmembershipno ||'', 
        authorizationno: booking?.authorizationno ||'',          
        schemeid: booking?.schemeid ||'',        

        ward_id: '',
        admission_diagnosis_id: '', 
        admission_notes: '',
        urgency: 'Routine',
        admission_date: new Date().toISOString().slice(0, 16) // Current time for datetime-local
    });

    // --- Auto-Fill Diagnosis ---
    useEffect(() => {
        if (show && consultationData?.diagnoses?.length > 0) {
            const firstDiagnosis = consultationData.diagnoses[0];
            if (firstDiagnosis && firstDiagnosis.id) {
                setData('admission_diagnosis_id', firstDiagnosis.id);
            }
        }
    }, [show, consultationData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.ward_id) {
            toast.error("Please select a target Ward.");
            return;
        }

        post(route('inpatient0.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Patient admitted successfully!");
                reset();
                onClose();
            },
            onError: (err) => {
                toast.error("Failed to admit patient. Check availability.");
                console.error(err);
            }
        });
    };

    const wardOptions = wards.map(w => ({ value: w.id, label: w.name }));

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="p-6">
                
                {/* --- Header --- */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 text-red-600 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                            <FontAwesomeIcon icon={faBed} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Admit Patient</h2>
                            <p className="text-sm text-gray-500">
                                {patient?.first_name} {patient?.last_name} | {patient?.code}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
                        &times;
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* --- LEFT: CONSULTATION SUMMARY (Read Only) --- */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-[500px] overflow-y-auto">
                        <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-1">
                            Consultation Summary
                        </h3>

                        {/* History */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm text-indigo-700 flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faNotesMedical} /> Clinical History
                            </h4>
                            <p className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border border-gray-100">
                                {consultationData?.history_presenting_illness || "No HPI recorded."}
                            </p>
                            {consultationData?.complaints?.length > 0 && (
                                <ul className="list-disc list-inside mt-2 text-xs text-gray-600 pl-2">
                                    {consultationData.complaints.map((c, i) => (
                                        c.chief_complaint && <li key={i}>{c.chief_complaint} <span className="text-gray-400">({c.duration})</span></li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Diagnosis */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm text-indigo-700 flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faStethoscope} /> Diagnoses
                            </h4>
                            <ul className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100">
                                {consultationData?.diagnoses?.length > 0 ? (
                                    consultationData.diagnoses.map((d, i) => (
                                        <li key={i} className="mb-1 last:mb-0">
                                            &bull; {d.label} <span className="italic text-gray-400">({d.status})</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="italic text-gray-400">None selected</li>
                                )}
                            </ul>
                        </div>

                        {/* Medications */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm text-indigo-700 flex items-center gap-2 mb-1">
                                <FontAwesomeIcon icon={faPrescriptionBottle} /> Proposed Medications
                            </h4>
                            {consultationData?.prescriptions?.length > 0 || consultationData?.new_prescriptions?.length > 0 ? (
                                <ul className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 space-y-1">
                                    {/* Merge OPD prescriptions or IPD new_prescriptions based on what's passed */}
                                    {(consultationData.prescriptions || consultationData.new_prescriptions).map((p, i) => (
                                        <li key={i} className="border-b border-gray-100 last:border-0 pb-1">
                                            <strong>{p.name}</strong>: {p.dosage} x {p.frequency} ({p.duration})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-400 italic bg-white p-2 rounded border">No medications.</p>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: ADMISSION FORM --- */}
                    <div className="space-y-5">
                        <div className="bg-red-50 border border-red-100 p-3 rounded-md text-sm text-red-800 flex items-start gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
                            <div>
                                This action will create an admission record. The patient will appear in the Nursing Station and Ward lists immediately.
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Admission Date */}
                            <div>
                                <InputLabel value="Admission Date/Time" />
                                <TextInput 
                                    type="datetime-local" 
                                    className="w-full mt-1"
                                    value={data.admission_date}
                                    onChange={e => setData('admission_date', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Ward Selection */}
                            <div>
                                <InputLabel value="Target Ward *" />
                                <ReactSelect 
                                    options={wardOptions}
                                    placeholder="Select Ward..."
                                    className="mt-1"
                                    onChange={(opt) => setData('ward_id', opt?.value)}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                />
                                {errors.ward_id && <p className="text-red-500 text-xs mt-1">{errors.ward_id}</p>}
                            </div>

                            {/* Primary Diagnosis */}
                            <div>
                                <InputLabel value="Admission Diagnosis *" />
                                <ReactSelect 
                                    options={diagnosisOptions}
                                    placeholder="Select Diagnosis..."
                                    className="mt-1"
                                    // Pre-select if ID exists
                                    value={diagnosisOptions.find(d => d.value === data.admission_diagnosis_id)}
                                    onChange={(opt) => setData('admission_diagnosis_id', opt?.value)}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                />
                            </div>

                            {/* Urgency */}
                            <div>
                                <InputLabel value="Admission Urgency" />
                                <select 
                                    className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 mt-1"
                                    value={data.urgency}
                                    onChange={e => setData('urgency', e.target.value)}
                                >
                                    <option value="Routine">Routine</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <InputLabel value="Admission Notes / Instructions to Nurse" />
                                <TextArea 
                                    className="w-full mt-1" 
                                    rows={4} 
                                    placeholder="e.g. Start IV fluids immediately, monitor BP every hour..."
                                    value={data.admission_notes}
                                    onChange={e => setData('admission_notes', e.target.value)}
                                />
                            </div>

                        </form>
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                    <SecondaryButton onClick={onClose}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton 
                        onClick={handleSubmit} 
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800"
                    >
                        {processing ? 'Processing...' : 'Confirm Admission'}
                    </PrimaryButton>
                </div>

            </div>
        </Modal>
    );
}