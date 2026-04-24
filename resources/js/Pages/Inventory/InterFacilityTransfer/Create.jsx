import AuthenticatedLayout from '@/Layouts/ResourceLayout';
import { Head, useForm, Link, router as inertiaRouter } from '@inertiajs/react';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faTrash, faSave, faCheck, faSpinner, faTruck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '@/Components/CustomModal.jsx';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(null, args), delay); };
};

export default function CreateInterFacilityTransfer({ auth, stores = [], facilities = [], facilityOptions }) {
    const { data, setData, post, errors, processing, clearErrors, setError } = useForm({
        source_store_id: '',
        destination_facility_id: '',
        total: 0,
        stage: 1, 
        transferitems: [],
        remarks: '', 
    });

    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [itemSearchResults, setItemSearchResults] = useState([]);
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [isItemSearchLoading, setIsItemSearchLoading] = useState(false);
    const itemSearchContainerRef = useRef(null);
    const isInitialMount = useRef(true);

    const [commitConfirmationModal, setCommitConfirmationModal] = useState({ isOpen: false, isLoading: false, isSuccess: false });

    const fetchItems = useCallback(async (query) => {
        if (!query.trim() || !data.source_store_id) return setShowItemDropdown(false);
        setIsItemSearchLoading(true);
        try {
            const response = await axios.get(route('systemconfiguration2.products.search'), { params: { query, store_id: data.source_store_id } });
            setItemSearchResults(response.data.products?.slice(0, 10) || []);
            setShowItemDropdown(true);
        } catch (error) { toast.error('Failed to fetch items.'); setItemSearchResults([]); setShowItemDropdown(false); }
        finally { setIsItemSearchLoading(false); }
    }, [data.source_store_id]);

    const debouncedItemSearch = useMemo(() => debounce(fetchItems, 350), [fetchItems]);

    useEffect(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        if (data.transferitems.length > 0) {
            setData('transferitems', []);
            toast.info('Store changed. Item list cleared to ensure stock accuracy.');
        }
    }, [data.source_store_id]);

    useEffect(() => { itemSearchQuery.trim() ? debouncedItemSearch(itemSearchQuery) : setShowItemDropdown(false); }, [itemSearchQuery, debouncedItemSearch]);

    useEffect(() => {
        const handleClickOutside = (event) => { if (itemSearchContainerRef.current && !itemSearchContainerRef.current.contains(event.target)) setShowItemDropdown(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setData('total', data.transferitems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0)); 
    }, [data.transferitems, setData]);

    const handleItemChange = (index, field, value) => {
        setData('transferitems', data.transferitems.map((item, i) => {
            if (i === index) {
                let processedValue = value;
                if (field === 'quantity') { 
                    const parsedValue = parseFloat(value);
                    processedValue = isNaN(parsedValue) || parsedValue < 0 ? '' : parsedValue;

                    const allowNegative = facilityOptions?.allownegativestock ?? false;
                    const hasStockData = item.stock_quantity !== undefined && item.stock_quantity !== null;

                    if (!allowNegative && hasStockData && processedValue > parseFloat(item.stock_quantity)) {
                        toast.error(`Insufficient stock. Available: ${item.stock_quantity}`);
                        processedValue = parseFloat(item.stock_quantity); // Cap at max
                    }
                }
                return { ...item, [field]: processedValue };
            }
            return item;
        }));
    };

    const addItem = (selectedItem) => {
        if (!selectedItem || !selectedItem.id) return;
        if (data.transferitems.some(item => item.item_id === selectedItem.id)) return toast.info(`Item already in list.`);
        
        setData('transferitems', [...data.transferitems, {
            _listId: `trfitem-${Date.now()}`, item_name: selectedItem.name, item_id: selectedItem.id,
            quantity: '', price: parseFloat(selectedItem.price) || 0, stock_quantity: selectedItem.stock_quantity !== undefined ? parseFloat(selectedItem.stock_quantity) : 0
        }]);
        setItemSearchQuery(''); setShowItemDropdown(false);
    };

    const removeItem = (index) => {
        if(window.confirm(`Remove item?`)) setData('transferitems', data.transferitems.filter((_, idx) => idx !== index));
    };

    const validateForm = (isCommitting = false) => {
        clearErrors(); let isValid = true;
        if (!data.source_store_id) { setError('source_store_id', 'Required.'); isValid = false; }
        if (!data.destination_facility_id) { setError('destination_facility_id', 'Required.'); isValid = false; }
        if (data.transferitems.length === 0) { toast.error("Add at least one item."); isValid = false; }

        data.transferitems.forEach((item, index) => {
            if (!item.quantity || parseFloat(item.quantity) <= 0) { setError(`transferitems.${index}.quantity`, 'Invalid.'); isValid = false; }
        });
        
        if (isCommitting && !data.remarks.trim()) { setError('remarks', 'Required for commit.'); isValid = false; }
        return isValid;
    };

    const handleSaveDraft = (e) => {
        e.preventDefault();
        if (!validateForm(false)) return;
        setData(prev => ({ ...prev, stage: 1 })); 
        post(route('inventory4.store'), { onSuccess: () => toast.success("Draft saved!"), onError: () => toast.error("Failed to save.") });
    };

    const handleCommit = () => {
        if (!data.remarks.trim()) return setError('remarks', 'Remarks required.');
        setCommitConfirmationModal(prev => ({ ...prev, isLoading: true }));
        post(route('inventory4.store'), { 
            onSuccess: () => setCommitConfirmationModal({ isOpen: true, isLoading: false, isSuccess: true }),
            onError: () => { setCommitConfirmationModal(p => ({ ...p, isLoading: false })); toast.error("Commit failed."); }
        });
    };

    return (
        <AuthenticatedLayout user={auth?.user} header={<h2 className="text-xl font-semibold text-gray-800">New Inter-Facility Transfer</h2>}>
            <Head title="New Transfer" />
            <div className="py-12"><div className="mx-auto max-w-5xl sm:px-6 lg:px-8"><div className="bg-white p-6 shadow-sm sm:rounded-lg">
                <form className="space-y-6"> 
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Source Store <span className="text-red-500">*</span></label>
                            <select value={data.source_store_id} onChange={(e) => setData('source_store_id', e.target.value)} className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${errors.source_store_id ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}>
                                <option value="">Select source...</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.source_store_id && <p className="text-red-600 text-sm mt-1">{errors.source_store_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Destination Facility <span className="text-red-500">*</span></label>
                            <select value={data.destination_facility_id} onChange={(e) => setData('destination_facility_id', e.target.value)} className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${errors.destination_facility_id ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}>
                                <option value="">Select facility...</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                            {errors.destination_facility_id && <p className="text-red-600 text-sm mt-1">{errors.destination_facility_id}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Remarks <span className="text-gray-500">(Required for commit)</span></label>
                        <textarea rows="2" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} className="mt-2 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
                        {errors.remarks && <p className="text-red-600 text-sm mt-1">{errors.remarks}</p>}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Add Items to Transfer</label>
                        <div className="relative" ref={itemSearchContainerRef}>
                            <input type="text" placeholder="Search item..." value={itemSearchQuery} onChange={(e) => { setItemSearchQuery(e.target.value); setShowItemDropdown(!!e.target.value); }} onFocus={() => itemSearchQuery && setShowItemDropdown(true)} className="block w-full rounded-md border-gray-300 sm:text-sm" />
                            {showItemDropdown && itemSearchQuery && (
                                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {itemSearchResults.map((item) => (
                                        <li key={item.id} className="p-3 hover:bg-indigo-50 cursor-pointer text-sm" onClick={() => addItem(item)}>
                                            <div className="font-medium">{item.name}</div><div className="text-xs text-gray-500">Stock: {item.stock_quantity ?? 'N/A'}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {data.transferitems.length > 0 && (
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-300 border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900 w-40">Qty to Transfer *</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900 w-32">Unit Price</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold text-gray-900 w-36">Total</th>
                                        <th className="px-3 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.transferitems.map((item, index) => (
                                        <tr key={item._listId}>
                                            <td className="px-3 py-3 text-sm text-gray-900">{item.item_name}</td>
                                            <td className="px-3 py-3"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-center rounded border-gray-300 sm:text-sm" min="0.01" step="any"/></td>
                                            <td className="px-3 py-3 text-center text-sm">{parseFloat(item.price).toFixed(2)}</td>
                                            <td className="px-3 py-3 text-right text-sm text-gray-500">{((parseFloat(item.quantity)||0) * (parseFloat(item.price)||0)).toFixed(2)}</td>
                                            <td className="px-3 py-3 text-center"><button type="button" onClick={() => removeItem(index)} className="text-red-500"><FontAwesomeIcon icon={faTrash}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end gap-x-4 border-t pt-6">
                        <Link href={route('inventory4.index')} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">Cancel</Link>
                        <button onClick={handleSaveDraft} disabled={processing} className="rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500">Save Draft</button>
                        <button type="button" onClick={() => { if(validateForm(true)) { setData('stage', 2); setCommitConfirmationModal({ isOpen: true }); } }} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"><FontAwesomeIcon icon={faTruck} className="mr-2"/>Commit Transfer</button>
                    </div>
                </form>
            </div></div></div>

            <Modal isOpen={commitConfirmationModal.isOpen} onClose={() => { if(commitConfirmationModal.isSuccess) inertiaRouter.visit(route('inventory4.index')); setCommitConfirmationModal({ isOpen: false }); setData('stage', 1); }} onConfirm={commitConfirmationModal.isSuccess ? () => inertiaRouter.visit(route('inventory4.index')) : handleCommit} title="Commit Transfer" confirmButtonText={commitConfirmationModal.isSuccess ? "View List" : "Confirm"} confirmButtonDisabled={commitConfirmationModal.isLoading}>
                {commitConfirmationModal.isSuccess ? <div className="text-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 fa-3x mb-3"/><p>Transferred successfully!</p></div> : <p>Confirm to transfer these items out of your stock to the destination facility.</p>}
            </Modal>
        </AuthenticatedLayout>
    );
}