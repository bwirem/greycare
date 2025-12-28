import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faHome, 
    faSearch, 
    faSave, 
    faSpinner,
    faShieldAlt,
    faLayerGroup,
    faChevronRight,
    faCheckDouble,
    faBan
} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import Modal from '@/Components/CustomModal';

// 1. Only import 'toast' (Container is already in Layout)
import { toast } from 'react-toastify';
// You can remove the CSS import here if it's already imported in Layout or app.jsx, 
// but keeping it here doesn't hurt if you want to be safe.
import 'react-toastify/dist/ReactToastify.css';

// --- Components ---

const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);

const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
        </div>
        <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const ListHeader = ({ title, count }) => (
    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
        {count !== undefined && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{count}</span>
        )}
    </div>
);

export default function Index({ auth, usergroups, modules, moduleitems, functionAccessData }) {
    // --- State ---
    const [searchRole, setSearchRole] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [loading, setLoading] = useState(false);
    
    // Selection State
    const [selectedUserGroup, setSelectedUserGroup] = useState(null);
    const [activeModuleKey, setActiveModuleKey] = useState(null);
    const [activeModuleItem, setActiveModuleItem] = useState(null);
    
    // Data State
    const [permissionsMap, setPermissionsMap] = useState({}); 

    // --- Helpers ---
    // Fallback modal if toast fails or for critical alerts
    const showAlert = (message) => setModalState({ isOpen: true, message, isAlert: true });
    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });

    // --- Handlers ---

    const handleUserGroupSelect = async (userGroup) => {
        if (selectedUserGroup?.id === userGroup.id) return;

        setLoading(true);
        setSelectedUserGroup(userGroup);
        setActiveModuleKey(null);
        setActiveModuleItem(null);
        setPermissionsMap({});

        try {
            const response = await axios.get(route('usermanagement.userpermission.getPermissions', { userGroup: userGroup.id }));
            const fetchedPermissions = response.data;
            const newMap = {};

            // 1. Initialize map structure
            Object.keys(functionAccessData).forEach(itemKey => {
                newMap[itemKey] = { ...functionAccessData[itemKey] };
            });

            // 2. Overlay DB permissions
            fetchedPermissions.forEach(p => {
                if (!newMap[p.moduleitemkey]) newMap[p.moduleitemkey] = {};
                newMap[p.moduleitemkey][p.functionaccesskey] = p.value;
            });

            setPermissionsMap(newMap);
            if(modules.length > 0) setActiveModuleKey(modules[0].modulekey);

        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Failed to load permissions."); 
        } finally {
            setLoading(false);
        }
    };

    const handleModuleSelect = (key) => {
        setActiveModuleKey(key);
        setActiveModuleItem(null); 
    };

    const togglePermission = (itemKey, accessKey) => {
        setPermissionsMap(prev => ({
            ...prev,
            [itemKey]: {
                ...prev[itemKey],
                [accessKey]: !prev[itemKey]?.[accessKey]
            }
        }));
    };

    const toggleAllFunctions = (itemKey, shouldEnable) => {
        const updatedAccess = {};
        const validKeys = Object.keys(functionAccessData[itemKey] || {});
        
        validKeys.forEach(key => {
            updatedAccess[key] = shouldEnable;
        });

        setPermissionsMap(prev => ({
            ...prev,
            [itemKey]: {
                ...prev[itemKey], 
                ...updatedAccess
            }
        }));
    };

    const handleSavePermissions = async () => {
        if (!selectedUserGroup) {
            toast.warn("Please select a user group.");
            return;
        }

        setLoading(true);
        const permissionsPayload = [];
        
        Object.keys(moduleitems).forEach(modKey => {
            moduleitems[modKey].forEach(item => {
                if (permissionsMap[item.key]) {
                    permissionsPayload.push({
                        moduleItemKey: item.key,
                        functionAccess: permissionsMap[item.key]
                    });
                }
            });
        });

        try {
            const response = await axios.post(route('usermanagement.userpermission.storePermissions', { userGroup: selectedUserGroup.id }), {
                permissions: permissionsPayload,
            });
            
            // 2. Trigger Success Toast (Display handled by Layout)
            toast.success(response.data.success || 'Permissions updated successfully!');
            
        } catch (error) {
            console.error("Error saving:", error);
            toast.error(error.response?.data?.message || 'Failed to save permissions.');
        } finally {
            setLoading(false);
        }
    };

    // --- Derived Data ---

    const filteredRoles = usergroups.data.filter(g => 
        g.name.toLowerCase().includes(searchRole.toLowerCase())
    );

    const currentModuleItems = useMemo(() => 
        activeModuleKey ? (moduleitems[activeModuleKey] || []) : []
    , [activeModuleKey, moduleitems]);

    const activeFunctions = useMemo(() => {
        if (!activeModuleItem) return [];
        const definitions = functionAccessData[activeModuleItem.key] || {};
        return Object.keys(definitions);
    }, [activeModuleItem, functionAccessData]);

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600"/> 
                    Permission Manager
                </h2>
                <div className="flex gap-2">
                     <Link
                        href={route("usermanagement.index")}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition shadow-sm flex items-center"
                    >
                        <FontAwesomeIcon icon={faHome} className="mr-2" /> Back
                    </Link>
                    <button
                        onClick={handleSavePermissions}
                        disabled={loading || !selectedUserGroup}
                        className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition flex items-center gap-2 ${
                            loading || !selectedUserGroup 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                        Save Changes
                    </button>
                </div>
            </div>
        }>
            <Head title="Permissions" />

            <div className="h-[calc(100vh-180px)] min-h-[500px] flex gap-4 p-4 max-w-[1920px] mx-auto overflow-hidden">
                
                {/* COLUMN 1: ROLES */}
                <div className="flex flex-col w-1/5 bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-700 text-sm mb-2">1. Select Role</h3>
                        <SearchInput value={searchRole} onChange={setSearchRole} placeholder="Search..." />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                            {filteredRoles.map(group => (
                                <li key={group.id}>
                                    <button
                                        onClick={() => handleUserGroupSelect(group)}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-4 ${
                                            selectedUserGroup?.id === group.id
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {group.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* COLUMN 2: MODULES */}
                <div className={`flex flex-col w-1/5 bg-white rounded-lg shadow border border-gray-200 transition-opacity duration-200 ${!selectedUserGroup ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <ListHeader title="2. Modules" count={modules.length} />
                    <div className="flex-1 overflow-y-auto">
                        <ul className="divide-y divide-gray-100">
                            {modules.map((module) => {
                                const modItems = moduleitems[module.modulekey] || [];
                                const hasActive = modItems.some(item => {
                                    const p = permissionsMap[item.key];
                                    return p && Object.values(p).some(v => v === true);
                                });

                                return (
                                    <li key={module.modulekey}>
                                        <button
                                            onClick={() => handleModuleSelect(module.modulekey)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                                                activeModuleKey === module.modulekey
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                        >
                                            <span className="truncate">{module.moduletext}</span>
                                            {hasActive && activeModuleKey !== module.modulekey && (
                                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 ml-2"></div>
                                            )}
                                            {activeModuleKey === module.modulekey && <FontAwesomeIcon icon={faChevronRight} className="text-xs opacity-75" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* COLUMN 3: MODULE ITEMS */}
                <div className={`flex flex-col w-1/4 bg-white rounded-lg shadow border border-gray-200 transition-opacity duration-200 ${!activeModuleKey ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <ListHeader title="3. Module Items" count={currentModuleItems.length} />
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        {currentModuleItems.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No items available</div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {currentModuleItems.map(item => {
                                    const perms = permissionsMap[item.key] || {};
                                    const isActive = Object.values(perms).some(v => v === true);
                                    
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => setActiveModuleItem(item)}
                                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors bg-white hover:bg-gray-100 ${
                                                activeModuleItem?.key === item.key 
                                                ? 'ring-2 ring-inset ring-blue-500 z-10' 
                                                : ''
                                            }`}
                                        >
                                            <span className={`${isActive ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                {item.text}
                                            </span>
                                            {isActive && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                                    Active
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 4: FUNCTIONS */}
                <div className={`flex flex-col flex-1 bg-white rounded-lg shadow border border-gray-200 transition-all duration-300 ${!activeModuleItem ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="p-3 border-b border-gray-200 bg-blue-50 flex justify-between items-center shrink-0 h-[53px]">
                        <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                             {activeModuleItem ? (
                                <>
                                    <FontAwesomeIcon icon={faLayerGroup} />
                                    {activeModuleItem.text} Permissions
                                </>
                             ) : "4. Select an Item"}
                        </h3>
                        {activeModuleItem && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleAllFunctions(activeModuleItem.key, true)}
                                    title="Enable All"
                                    className="text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded shadow-sm flex items-center gap-1"
                                >
                                    <FontAwesomeIcon icon={faCheckDouble} /> All
                                </button>
                                <button 
                                    onClick={() => toggleAllFunctions(activeModuleItem.key, false)}
                                    title="Disable All"
                                    className="text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded shadow-sm flex items-center gap-1"
                                >
                                    <FontAwesomeIcon icon={faBan} /> None
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {!activeModuleItem ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-4xl mb-2 opacity-20" />
                                <p>Select a Module Item from the left</p>
                            </div>
                        ) : activeFunctions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 italic">
                                No configurable functions for this item.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {activeFunctions.map(funcKey => {
                                    const isChecked = permissionsMap[activeModuleItem.key]?.[funcKey] === true;
                                    
                                    return (
                                        <div 
                                            key={funcKey} 
                                            onClick={() => togglePermission(activeModuleItem.key, funcKey)}
                                            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all shadow-sm ${
                                                isChecked 
                                                ? 'bg-white border-blue-500 ring-1 ring-blue-500' 
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {funcKey.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {isChecked ? 'Access Granted' : 'Access Denied'}
                                                </span>
                                            </div>
                                            <ToggleSwitch 
                                                checked={isChecked} 
                                                onChange={() => {}} 
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert Modal (Fallback) */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                title={modalState.isAlert ? "System Message" : "Confirm"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
            
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500 mb-4" />
                        <span className="text-gray-700 font-medium">Processing...</span>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}