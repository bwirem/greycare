import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function TaxBracketForm({ tax = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        lower_limit: tax?.lower_limit || '0',
        upper_limit: tax?.upper_limit || '',
        rate: tax?.rate || '0',
        fixed_amount: tax?.fixed_amount || '0',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tax) {
            put(route('systemconfiguration12.tax.update', tax.id));
        } else {
            post(route('systemconfiguration12.tax.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lower Limit*</label>
                    <input 
                        type="number" step="0.01"
                        value={data.lower_limit} 
                        onChange={e => setData('lower_limit', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                    {errors.lower_limit && <p className="text-red-500 text-xs mt-1">{errors.lower_limit}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upper Limit</label>
                    <div className="flex gap-2 items-center">
                        <input 
                            type="number" step="0.01"
                            value={data.upper_limit} 
                            onChange={e => setData('upper_limit', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                            placeholder="Leave empty for Infinity"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">Null = ∞</span>
                    </div>
                    {errors.upper_limit && <p className="text-red-500 text-xs mt-1">{errors.upper_limit}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)*</label>
                    <input 
                        type="number" step="0.01" max="100"
                        value={data.rate} 
                        onChange={e => setData('rate', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                    {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fixed Base Amount</label>
                    <input 
                        type="number" step="0.01"
                        value={data.fixed_amount} 
                        onChange={e => setData('fixed_amount', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount added to tax calculation automatically.</p>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration12.tax.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {tax ? 'Update Band' : 'Save Band'}
                </button>
            </div>
        </form>
    );
}