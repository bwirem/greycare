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

export default function EditInterFacilityTransfer({ auth, transfer, stores = [], facilities = [], facilityOptions }) {
    const { data, setData, put, errors, processing, clearErrors, setError } = useForm({
        source_store_id: transfer.source_store_id || '',
        destination_facility_id: transfer.destination_facility_id || '',
        total: parseFloat(transfer.total) || 0,
        stage: transfer.stage || 1, 
        remarks: transfer.remarks || '',
        transferitems: transfer.transferitems?.map(item => ({
            id: item.id, 
            _listId: `trfitem-edit-${item.id || Date.now()}`, 
            item_name: item.item?.name || 'Unknown Item', 
            // FIX: Use product_id which matches the database column
            item_id: item.product_id || item.item_id, 
            quantity: String(item.quantity), 
            price: parseFloat(item.price) || 0, 
            stock_quantity: null
        })) || [],
        _method: 'PUT', 
        deleted_item_ids: [],
    });

    const isEditable = data.stage === 1;
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [itemSearchResults, setItemSearchResults] = useState([]);
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const itemSearchContainerRef = useRef(null);
    const [commitConfirmationModal, setCommitConfirmationModal] = useState({ isOpen: false, isLoading: false, isSuccess: false });

    const fetchItems = useCallback(async (query) => {
        if (!query.trim() || !isEditable || !data.source_store_id) return setShowItemDropdown(false);
        try {
            const response = await axios.get(route('systemconfiguration2.products.search'), { params: { query, store_id: data.source_store_id } });
            setItemSearchResults(response.data.products?.slice(0, 10) || []); setShowItemDropdown(true);
        } catch (error) { 
            toast.error('Fetch failed.'); setShowItemDropdown(false); 
        }
    }, [isEditable, data.source_store_id]);

    const debouncedItemSearch = useMemo(() => debounce(fetchItems, 350), [fetchItems]);

    // FIX: Safely check if the store was actually changed by the user (prevents React Strict Mode double-fire bug)
    useEffect(() => {
        if (data.source_store_id && String(data.source_store_id) !== String(transfer.source_store_id)) {
            if (data.transferitems.length > 0 && isEditable) { 
                setData('transferitems', []); 
                toast.info('Store changed. Items cleared.'); 
            }
        }
    }, [data.source_store_id]);

    useEffect(() => { 
        itemSearchQuery.trim() ? debouncedItemSearch(itemSearchQuery) : setShowItemDropdown(false); 
    }, [itemSearchQuery, debouncedItemSearch]);
    
    useEffect(() => { 
        setData('total', data.transferitems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0), 0)); 
    }, [data.transferitems]);

    const handleItemChange = (index, field, value) => {
        if (!isEditable) return;
        setData('transferitems', data.transferitems.map((item, i) => {
            if (i === index) {
                let pv = field === 'quantity' ? Math.max(0, parseFloat(value) || '') : value;
                if (field === 'quantity' && item.stock_quantity !== null && pv > item.stock_quantity) pv = item.stock_quantity;
                return { ...item, [field]: pv };
            }
            return item;
        }));
    };

    const addItem = (si) => {
        if (!isEditable || data.transferitems.some(i => i.item_id === si.id)) return;
        setData('transferitems', [...data.transferitems, { id: null, _listId: `trfitem-new-${Date.now()}`, item_name: si.name, item_id: si.id, quantity: '', price: parseFloat(si.price) || 0, stock_quantity: si.stock_quantity }]);
        setItemSearchQuery(''); setShowItemDropdown(false);
    };

    const removeItem = (idx) => {
        if (!isEditable || !window.confirm('Remove item?')) return;
        const item = data.transferitems[idx];
        if (item.id) setData('deleted_item_ids', [...data.deleted_item_ids, item.id]);
        setData('transferitems', data.transferitems.filter((_, i) => i !== idx));
    };

    const handleSaveDraft = (e) => {
        e.preventDefault(); setData('stage', 1);
        put(route('inventory4.update', transfer.id), { onSuccess: () => toast.success("Draft updated!") });
    };

    const handleCommit = () => {
        setCommitConfirmationModal(p => ({ ...p, isLoading: true }));
        put(route('inventory4.update', transfer.id), { onSuccess: () => setCommitConfirmationModal({ isOpen: true, isLoading: false, isSuccess: true }) });
    };

    return (
        <AuthenticatedLayout user={auth?.user} header={<h2 className="text-xl font-semibold text-gray-800">{isEditable ? `Edit Transfer (#${transfer.id})` : `View Transfer (#${transfer.id})`}</h2>}>
            <Head title="Edit Transfer" />
            <div className="py-12"><div className="mx-auto max-w-5xl sm:px-6 lg:px-8"><div className={`bg-white p-6 shadow-sm sm:rounded-lg ${!isEditable ? 'opacity-90' : ''}`}>
                <form className="space-y-6">
                    {!isEditable && <div className="p-3 mb-4 bg-yellow-100 border text-yellow-700 rounded-md text-sm">This transfer is <strong>Committed</strong> and cannot be edited.</div>}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Source Store</label>
                            <select value={data.source_store_id} onChange={(e) => setData('source_store_id', e.target.value)} disabled={!isEditable} className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Destination Facility</label>
                            <select value={data.destination_facility_id} onChange={(e) => setData('destination_facility_id', e.target.value)} disabled={!isEditable} className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Remarks</label>
                        <textarea rows="2" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} disabled={!isEditable} className={`mt-2 block w-full rounded-md shadow-sm sm:text-sm ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}></textarea>
                    </div>

                    {isEditable && (
                        <div className="border-t border-gray-200 pt-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Search Items</label>
                            <div className="relative" ref={itemSearchContainerRef}>
                                <input type="text" value={itemSearchQuery} onChange={(e) => { setItemSearchQuery(e.target.value); setShowItemDropdown(!!e.target.value); }} className="block w-full rounded-md border-gray-300 sm:text-sm" placeholder="Search..." />
                                {showItemDropdown && itemSearchResults.length > 0 && (
                                    <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {itemSearchResults.map((item) => (
                                            <li key={item.id} className="p-3 hover:bg-indigo-50 cursor-pointer text-sm" onClick={() => addItem(item)}>{item.name} (Stock: {item.stock_quantity})</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {data.transferitems.length > 0 && (
                        <div className="mt-6 overflow-x-auto"><table className="min-w-full divide-y divide-gray-300 border border-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                                <th className="px-3 py-3 text-center text-sm font-semibold text-gray-900">Qty</th>
                                <th className="px-3 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                                {isEditable && <th className="px-3 py-3"></th>}
                            </tr></thead>
                            <tbody>{data.transferitems.map((item, idx) => (
                                <tr key={item._listId}>
                                    <td className="px-3 py-3 text-sm text-gray-900">{item.item_name}</td>
                                    <td className="px-3 py-3"><input type="number" value={item.quantity} disabled={!isEditable} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className={`w-full text-center rounded border-gray-300 sm:text-sm ${!isEditable ? 'bg-gray-100' : ''}`} /></td>
                                    <td className="px-3 py-3 text-right text-sm">{parseFloat(item.price).toFixed(2)}</td>
                                    {isEditable && <td className="px-3 py-3 text-center"><button type="button" onClick={() => removeItem(idx)} className="text-red-500"><FontAwesomeIcon icon={faTrash}/></button></td>}
                                </tr>
                            ))}</tbody>
                        </table></div>
                    )}

                    <div className="mt-8 flex justify-end gap-x-4 border-t pt-6">
                        <Link href={route('inventory4.index')} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">{isEditable ? 'Cancel' : 'Back'}</Link>
                        {isEditable && <>
                            <button onClick={handleSaveDraft} disabled={processing} className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-500">Update Draft</button>
                            <button type="button" onClick={() => { setData('stage', 2); setCommitConfirmationModal({ isOpen: true }); }} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"><FontAwesomeIcon icon={faTruck} className="mr-2"/>Commit</button>
                        </>}
                    </div>
                </form>
            </div></div></div>

            <Modal isOpen={commitConfirmationModal.isOpen} onClose={() => { setCommitConfirmationModal({ isOpen: false }); setData('stage', 1); }} onConfirm={commitConfirmationModal.isSuccess ? () => inertiaRouter.visit(route('inventory4.index')) : handleCommit} title="Commit Transfer" confirmButtonText={commitConfirmationModal.isSuccess ? "OK" : "Confirm"} confirmButtonDisabled={commitConfirmationModal.isLoading}>
                {commitConfirmationModal.isSuccess ? <div className="text-center"><FontAwesomeIcon icon={faCheck} className="text-green-500 fa-3x mb-3"/><p>Committed successfully!</p></div> : <p>Confirm to transfer items.</p>}
            </Modal>
        </AuthenticatedLayout>
    );
}