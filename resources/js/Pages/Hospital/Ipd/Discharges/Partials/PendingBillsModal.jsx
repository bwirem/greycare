import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes, faFileInvoiceDollar, faEdit, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function PendingBillsModal({ show, onClose, patientCode = null }) { // <--- Added patientCode prop
    const [loading, setLoading] = useState(false);
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (show) {
            setLoading(true);
            // Pass patient_code if available
            axios.get(route('billing1.api.pending'), { 
                params: { patient_code: patientCode } 
            })
            .then(res => {
                setBills(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [show, patientCode]);

    // ... (Rest of the component remains the same: render logic, table, etc.)
    // ...
    
    // Copy the rest of the render from the previous implementation
    // For brevity, ensuring the table maps 'bills' correctly.
    
    const filteredBills = bills.filter(bill => 
        bill.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        bill.id.toString().includes(search)
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(amount);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="p-6 bg-white rounded-lg shadow-xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-blue-600" />
                        {patientCode ? `Pending Bills for ${patientCode}` : 'Pending Bills / Saved Orders'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {!patientCode && (
                    <div className="mb-4">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full border-gray-300 rounded-md shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" /></div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No pending bills found for this patient.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>                                    
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bill.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{bill.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">{formatCurrency(bill.total)}</td>                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Modal>
    );
}