import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DispenseCreate({ prescription, current_stock }) {
    
    const { data, setData, post, processing, errors } = useForm({
        quantity_issued: prescription.quantity_prescribed,
        batch_no: '',
        expiry_date: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pharmacy0.store', prescription.id));
    };

    return (
        <HospitalLayout header={<h2>Dispense Medication</h2>}>
            <Head title="Dispense Drug" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Header Info */}
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{prescription.product?.name}</h3>
                                <p className="text-sm text-gray-600">
                                    Dose: {prescription.dosage} | Freq: {prescription.frequency} | Dur: {prescription.duration}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs uppercase text-gray-500">Ordered Qty</span>
                                <span className="font-bold text-green-700 text-2xl">{prescription.quantity_prescribed}</span>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200 flex justify-between text-sm">
                            <span>Patient: <strong>{prescription.patient.first_name} {prescription.patient.last_name}</strong></span>
                            <span>Stock Available: <strong>{current_stock}</strong></span>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        
                        <div>
                            <InputLabel value="Quantity to Issue" />
                            <TextInput 
                                type="number" 
                                className="w-full font-bold text-lg"
                                value={data.quantity_issued}
                                onChange={e => setData('quantity_issued', e.target.value)}
                                min="1"
                                max={prescription.quantity_prescribed}
                                required
                            />
                            {errors.quantity_issued && <div className="text-red-500 text-xs mt-1">{errors.quantity_issued}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Batch Number (Optional)" />
                                <TextInput 
                                    className="w-full"
                                    value={data.batch_no}
                                    onChange={e => setData('batch_no', e.target.value)}
                                />
                            </div>
                            <div>
                                <InputLabel value="Expiry Date (Optional)" />
                                <TextInput 
                                    type="date"
                                    className="w-full"
                                    value={data.expiry_date}
                                    onChange={e => setData('expiry_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <PrimaryButton disabled={processing} className="w-full justify-center bg-green-600 hover:bg-green-700">
                                Confirm Dispense
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}