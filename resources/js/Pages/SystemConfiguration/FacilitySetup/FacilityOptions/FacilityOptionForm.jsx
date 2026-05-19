import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faImage } from '@fortawesome/free-solid-svg-icons';

const CheckboxInput = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
        </label>
    </div>
);

export default function FacilityOptionForm({ option = null, chartOfAccounts, billinggroups, deathstatuses }) {
    // Initialize form data with new Control Number API fields
    const { data, setData, post, processing, errors, reset } = useForm({
        name: option?.name || '',
        address: option?.address || '',
        phone: option?.phone || '',
        email: option?.email || '',
        website: option?.website || '',
        tin: option?.tin || '',
        vrn: option?.vrn || '',
        logo: null, // For the file input
        
        chart_of_account_id: option?.chart_of_account_id || '',
        default_cash_billing_group_id: option?.default_cash_billing_group_id || '',
        default_death_status_id: option?.default_death_status_id || '',
        
        // Booleans
        affectstockatcashier: option ? Boolean(option.affectstockatcashier) : false,
        doubleentryissuing: option ? Boolean(option.doubleentryissuing) : false,
        allownegativestock: option ? Boolean(option.allownegativestock) : false,        
        show_register_button: option ? Boolean(option.show_register_button) : true, 
        
        // Payment Gateway API Configuration Fields
        corporate_id: option?.corporate_id || '',
        token_id: option?.token_id || '',
        access_token: option?.access_token || '',
        registration_url: option?.registration_url || '',
        check_payment_url: option?.check_payment_url || '',
        crdb_payment_type: option?.crdb_payment_type || '1088',

        _method: option ? 'PUT' : 'POST', 
    });

    const [previewUrl, setPreviewUrl] = useState(option?.logo_path ? `/storage/${option.logo_path}` : null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (option) {
            post(route('systemconfiguration5.facilityoptions.update', option.id), {
                preserveScroll: true,
                forceFormData: true, 
            });
        } else {
            post(route('systemconfiguration5.facilityoptions.store'), {
                onSuccess: () => reset(),
                forceFormData: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Information & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Facility Name*</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address / Location</label>
                        <textarea
                            id="address"
                            rows="2"
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                </div>

                {/* Logo Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-gray-50">
                    <div className="mb-3 relative h-24 w-24 bg-white border rounded-md flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                        ) : (
                            <FontAwesomeIcon icon={faImage} className="text-gray-400 text-3xl" />
                        )}
                    </div>
                    <label htmlFor="logo" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                        Upload Logo
                        <input id="logo" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                </div>
            </div>

            {/* 2. Contact Information */}
            <div>
                <h3 className="text-base font-medium text-gray-800 border-b pb-2 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            id="phone"
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                            id="website"
                            type="text"
                            value={data.website}
                            onChange={e => setData('website', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                    </div>
                </div>
            </div>

            {/* 3. Tax Information */}
            <div>
                <h3 className="text-base font-medium text-gray-800 border-b pb-2 mb-4">Tax & Accounting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label htmlFor="tin" className="block text-sm font-medium text-gray-700">TIN (Tax Identification Number)</label>
                        <input
                            id="tin"
                            type="text"
                            value={data.tin}
                            onChange={e => setData('tin', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.tin && <p className="text-red-500 text-xs mt-1">{errors.tin}</p>}
                    </div>
                    <div>
                        <label htmlFor="vrn" className="block text-sm font-medium text-gray-700">VRN (VAT Registration Number)</label>
                        <input
                            id="vrn"
                            type="text"
                            value={data.vrn}
                            onChange={e => setData('vrn', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.vrn && <p className="text-red-500 text-xs mt-1">{errors.vrn}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="chart_of_account_id" className="block text-sm font-medium text-gray-700">Revenue Account*</label>
                        <select
                            id="chart_of_account_id"
                            value={data.chart_of_account_id}
                            onChange={e => setData('chart_of_account_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select an account</option>
                            {chartOfAccounts?.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.account_name} ({account.account_code})
                                </option>
                            ))}
                        </select>
                        {errors.chart_of_account_id && <p className="text-red-500 text-xs mt-1">{errors.chart_of_account_id}</p>}
                    </div>
                    <div>
                        <label htmlFor="default_cash_billing_group_id" className="block text-sm font-medium text-gray-700">Default Billing Group*</label>
                        <select
                            id="default_cash_billing_group_id"
                            value={data.default_cash_billing_group_id}
                            onChange={e => setData('default_cash_billing_group_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select a Billing Group</option>
                            {billinggroups?.map(billinggroup => (
                                <option key={billinggroup.id} value={billinggroup.id}>
                                    {billinggroup.name}
                                </option>
                            ))}
                        </select>
                        {errors.default_cash_billing_group_id && <p className="text-red-500 text-xs mt-1">{errors.default_cash_billing_group_id}</p>}
                    </div>
                </div>
            </div>

            {/* 4. Payment Gateway API Configuration (Control Numbers) */}
            <div>
                <h3 className="text-base font-medium text-gray-800 border-b pb-2 mb-4">Payment Gateway API (Control Numbers)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="corporate_id" className="block text-sm font-medium text-gray-700">Corporate ID</label>
                        <input
                            id="corporate_id"
                            type="text"
                            value={data.corporate_id}
                            onChange={e => setData('corporate_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.corporate_id && <p className="text-red-500 text-xs mt-1">{errors.corporate_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="token_id" className="block text-sm font-medium text-gray-700">Token ID</label>
                        <input
                            id="token_id"
                            type="text"
                            value={data.token_id}
                            onChange={e => setData('token_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.token_id && <p className="text-red-500 text-xs mt-1">{errors.token_id}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">Access Token</label>
                        <textarea
                            id="access_token"
                            rows="2"
                            value={data.access_token}
                            onChange={e => setData('access_token', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.access_token && <p className="text-red-500 text-xs mt-1">{errors.access_token}</p>}
                    </div>

                    <div>
                        <label htmlFor="registration_url" className="block text-sm font-medium text-gray-700">Registration URL (Generation Endpoint)</label>
                        <input
                            id="registration_url"
                            type="url"
                            placeholder="http://example.com/api/regctrno"
                            value={data.registration_url}
                            onChange={e => setData('registration_url', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.registration_url && <p className="text-red-500 text-xs mt-1">{errors.registration_url}</p>}
                    </div>

                    <div>
                        <label htmlFor="check_payment_url" className="block text-sm font-medium text-gray-700">Check Payment URL (Validation Endpoint)</label>
                        <input
                            id="check_payment_url"
                            type="url"
                            placeholder="http://example.com/api/checkctrno"
                            value={data.check_payment_url}
                            onChange={e => setData('check_payment_url', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.check_payment_url && <p className="text-red-500 text-xs mt-1">{errors.check_payment_url}</p>}
                    </div>

                    <div>
                        <label htmlFor="crdb_payment_type" className="block text-sm font-medium text-gray-700">CRDB Payment Type</label>
                        <input
                            id="crdb_payment_type"
                            type="text"
                            placeholder="1088"
                            value={data.crdb_payment_type}
                            onChange={e => setData('crdb_payment_type', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.crdb_payment_type && <p className="text-red-500 text-xs mt-1">{errors.crdb_payment_type}</p>}
                    </div>
                </div>
            </div>

            {/* 5. System Settings */}
            <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-base font-medium text-gray-800 mb-4">System Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <CheckboxInput id="affectstockatcashier" label="Affect Stock at Cashier" checked={data.affectstockatcashier} onChange={e => setData('affectstockatcashier', e.target.checked)} />
                    <CheckboxInput id="doubleentryissuing" label="Double Entry Issuing" checked={data.doubleentryissuing} onChange={e => setData('doubleentryissuing', e.target.checked)} />
                    <CheckboxInput id="allownegativestock" label="Allow Negative Stock" checked={data.allownegativestock} onChange={e => setData('allownegativestock', e.target.checked)} />
                    <CheckboxInput id="show_register_button" label="Show Register Button" checked={data.show_register_button} onChange={e => setData('show_register_button', e.target.checked)} />
                </div>
                {errors.affectstockatcashier && <p className="text-red-500 text-xs mt-2">{errors.affectstockatcashier}</p>}
            </div>

            <div>
                <label htmlFor="default_death_status_id" className="block text-sm font-medium text-gray-700">Default Death Status*</label>
                <select
                    id="default_death_status_id"
                    value={data.default_death_status_id}
                    onChange={e => setData('default_death_status_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">Select a Death Status</option>
                    {deathstatuses?.map(deathstatus => (
                        <option key={deathstatus.id} value={deathstatus.id}>
                            {deathstatus.name}
                        </option>
                    ))}
                </select>
                {errors.default_death_status_id && <p className="text-red-500 text-xs mt-1">{errors.default_death_status_id}</p>}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration5.facilityoptions.index')} className="text-gray-700 font-medium hover:text-gray-900">
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {option ? 'Update Option' : 'Save Option'}
                </button>
            </div>
        </form>
    );
}