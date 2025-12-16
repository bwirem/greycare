import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faCheckCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function Authorization({ show, onClose, onAuthorized, billingGroups }) {
    
    // --- State ---
    const [step, setStep] = useState(1); // 1: Verify, 2: Request Auth
    const [loading, setLoading] = useState(false);
    
    // Inputs
    const [groupId, setGroupId] = useState('');
    const [cardNo, setCardNo] = useState('');
    
    // API Data
    const [patientData, setPatientData] = useState(null);
    
    // Request Inputs
    const [visitType, setVisitType] = useState(1); // Default Normal
    const [referralNo, setReferralNo] = useState('');
    const [remarks, setRemarks] = useState('');

    const visitTypes = [
        { id: 1, name: 'Normal' },
        { id: 2, name: 'Emergency' },
        { id: 3, name: 'Referral' },
        { id: 4, name: 'Follow up Visit' },
        { id: 5, name: 'Investigation Only' },
        { id: 6, name: 'Occupational Visit' },
    ];

    // --- Actions ---

    const verifyCard = async () => {
        if (!groupId || !cardNo) {
            toast.error("Select Insurance Group and Enter Card Number.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(route('outpatient0.auth.verify'), {
                params: { group_id: groupId, card_no: cardNo }
            });
            
            setPatientData(res.data);
            setStep(2); // Move to next step
            toast.success("Card Verified Successfully.");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Verification failed.");
            setPatientData(null);
        } finally {
            setLoading(false);
        }
    };

    const requestAuth = async () => {
        // Validation based on legacy C# logic
        if (visitType === 3 && !referralNo) return toast.error("Referral Number required.");
        if ((visitType === 2 || visitType === 4 || visitType === 3) && !remarks) return toast.error("Remarks required.");

        setLoading(true);
        try {
            const res = await axios.post(route('outpatient0.auth.request'), {
                group_id: groupId,
                card_no: cardNo,
                visit_type_id: visitType,
                referral_no: referralNo,
                remarks: remarks
            });

            if (res.data.AuthorizationStatus === 'ACCEPTED') {
                toast.success(`Authorized! Code: ${res.data.AuthorizationNo}`);
                
                // Pass all relevant data back to Create.jsx
                onAuthorized({
                    authorization_no: res.data.AuthorizationNo,
                    scheme_id: res.data.SchemeID,
                    scheme_name: res.data.SchemeName,
                    billing_group_id: groupId,
                    card_no: cardNo,
                    // Map API patient data to form fields if needed
                    patient_details: {
                        first_name: patientData.FirstName,
                        last_name: patientData.LastName,
                        middle_name: patientData.MiddleName,
                        date_of_birth: patientData.DateOfBirth ? patientData.DateOfBirth.split('T')[0] : '',
                        gender: patientData.Gender,
                        national_id: patientData.NationalID
                    }
                });
                onClose();
            } else {
                toast.error(`Status: ${res.data.AuthorizationStatus}`);
            }
        } catch (err) {
            toast.error("Authorization Request Failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FontAwesomeIcon icon={faIdCard} className="text-blue-600"/> 
                        Insurance Authorization
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                </div>

                {/* --- STEP 1: VERIFICATION --- */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Insurance Provider (Group)" />
                            <select 
                                className="w-full border-gray-300 rounded shadow-sm"
                                value={groupId}
                                onChange={e => setGroupId(e.target.value)}
                            >
                                <option value="">Select Provider...</option>
                                {billingGroups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Card Number / Member No" />
                            <TextInput 
                                className="w-full" 
                                value={cardNo}
                                onChange={e => setCardNo(e.target.value)}
                                placeholder="Enter Card No"
                                onKeyDown={e => e.key === 'Enter' && verifyCard()}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <PrimaryButton onClick={verifyCard} disabled={loading}>
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verify Card'}
                            </PrimaryButton>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: REQUEST AUTH --- */}
                {step === 2 && patientData && (
                    <div className="space-y-5 animate-fade-in">
                        
                        {/* Patient Summary Card */}
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm grid grid-cols-2 gap-2">
                            <div><strong>Name:</strong> {patientData.FirstName} {patientData.LastName}</div>
                            <div><strong>DOB:</strong> {patientData.DateOfBirth?.split('T')[0]} ({patientData.Gender})</div>
                            <div><strong>Scheme:</strong> {patientData.SchemeName}</div>
                            <div><strong>Employer:</strong> {patientData.EmployerNo}</div>
                            <div className="col-span-2 text-xs text-gray-500 border-t border-blue-200 pt-1 mt-1">
                                Last Auth: {patientData.LatestAuthorization || 'None'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Visit Type" />
                                <select 
                                    className="w-full border-gray-300 rounded shadow-sm"
                                    value={visitType}
                                    onChange={e => setVisitType(parseInt(e.target.value))}
                                >
                                    {visitTypes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Referral No" />
                                <TextInput 
                                    className="w-full"
                                    value={referralNo}
                                    onChange={e => setReferralNo(e.target.value)}
                                    disabled={visitType === 1} // Disable if Normal
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Remarks / Reason" />
                            <TextArea 
                                className="w-full" rows={3}
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <button onClick={() => setStep(1)} className="text-gray-500 underline text-sm">Back</button>
                            <PrimaryButton onClick={requestAuth} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? 'Processing...' : 'Request Authorization'}
                            </PrimaryButton>
                        </div>
                    </div>
                )}

            </div>
        </Modal>
    );
}