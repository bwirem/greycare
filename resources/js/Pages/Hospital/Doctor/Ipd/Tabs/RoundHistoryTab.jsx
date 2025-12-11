import React from 'react';

export default function RoundHistoryTab({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="italic">No previous ward rounds recorded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {history.map((round) => (
                <div key={round.id} className="border-l-4 border-green-500 bg-white shadow-sm p-5 rounded-r-lg">
                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-900">{new Date(round.round_date).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Dr. {round.doctor?.name || 'Unknown'}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Round #{round.id}</span>
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
                        <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-gray-600">
                            <div><strong>Condition:</strong> {round.general_condition || '-'}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}