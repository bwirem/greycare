import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyringe, faHistory, faClock } from '@fortawesome/free-solid-svg-icons';

export default function MedicationListTab({ prescriptions, onAdminister }) {
    
    const formatTime = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    return (
        <div className="w-full space-y-4 animate-fade-in">
            {prescriptions.map((rx) => {
                // Calculate Remaining Quantity
                const totalGiven = rx.administrations 
                    ? rx.administrations.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) 
                    : 0;
                const remaining = (parseFloat(rx.quantity_prescribed) || 0) - totalGiven;
                const isFinished = remaining <= 0;

                return (
                    <div key={rx.id} className={`bg-white rounded-lg shadow-sm border ${isFinished ? 'border-gray-200 opacity-75' : 'border-blue-200'} overflow-hidden`}>
                        
                        {/* Header: Prescription Details & Administer Button */}
                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                            <div>
                                <h4 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                                    {rx.product?.name}
                                    {isFinished && <span className="bg-gray-200 text-gray-600 text-[10px] px-2 rounded">Completed</span>}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-bold">{rx.dosage}</span> • {rx.frequency} • {rx.duration}
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-xs bg-white px-2 py-1 rounded border shadow-sm">
                                    Total: <strong>{rx.quantity_prescribed}</strong> | 
                                    Given: <strong>{totalGiven}</strong> | 
                                    <span className={`ml-1 font-bold ${remaining <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        Rem: {remaining.toFixed(2)}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => onAdminister(rx)}
                                    disabled={isFinished}
                                    className={`px-4 py-2 rounded shadow font-bold text-sm flex items-center gap-2 transition-colors ${
                                        isFinished 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faSyringe} /> Administer
                                </button>
                            </div>
                        </div>

                        {/* Body: Administration History Log */}
                        <div className="p-4 bg-white">
                            <h5 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                                <FontAwesomeIcon icon={faHistory} /> Recent Administration
                            </h5>
                            {rx.administrations && rx.administrations.length > 0 ? (
                                <ul className="space-y-2">
                                    {rx.administrations.map(admin => (
                                        <li key={admin.id} className="flex justify-between text-sm border-b border-gray-100 pb-1 last:border-0">
                                            <span className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                                                {formatTime(admin.administered_at)}
                                            </span>
                                            <span className="font-mono text-xs font-bold bg-gray-100 px-2 rounded">
                                                Qty: {admin.quantity}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    admin.status === 'Given' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {admin.status}
                                                </span>
                                                <span className="text-xs text-gray-500 italic">by {admin.nurse?.name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No doses recorded yet.</p>
                            )}
                        </div>
                    </div>
                );
            })}

            {prescriptions.length === 0 && (
                <div className="p-10 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                    No active prescriptions found.
                </div>
            )}
        </div>
    );
}