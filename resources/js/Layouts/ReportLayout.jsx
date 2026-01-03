import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    // Basic Navigation
    faBars, faTimes, faUser, faSignOutAlt, faHome, 
    faArrowLeft,

    // Finance & Sales Icons
    faShoppingCart, faPlusSquare, faMoneyBill, faMoneyBillAlt,
    faHistory, faFileInvoice, faFileInvoiceDollar,
    faChartBar, faChartPie, faLandmark, faBalanceScale,
    faJournalWhills, faMoneyCheckAlt, faPaperPlane, faThumbsUp,
    faCog, faBuilding, faBook, faArrowUp, faArrowDown,
    faSackDollar, faCashRegister, faCalculator,
    faCreditCard, faReceipt, faHandHoldingDollar
} from "@fortawesome/free-solid-svg-icons";

import { faHistory as faSalesHistory } from '@fortawesome/free-solid-svg-icons'; 
import { faBan as faVoidHistory } from '@fortawesome/free-solid-svg-icons'; 
import { faFileInvoice as faBillingSetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import { faMoneyBillWave as faExpensesSetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import { faMapMarkerAlt as faLocationSetupIcon } from '@fortawesome/free-solid-svg-icons'; 

import "@fortawesome/fontawesome-svg-core/styles.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePermissionsStore from "../stores/usePermissionsStore";

// Constants for CSS classes
const navLinkClasses = 'flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200';
const caretClasses = (isOpen) => `caret ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`;

// 1. DEFINING FINANCE PARENT KEYS 
const financeModuleKeys = [    
    'reporting',   // Parent for Reports    
];

// 2. DEFINING FINANCE CHILD ITEM KEYS (Whitelist)
const allowedFinanceItemKeys = [
   
    // --- REQUESTED REPORTS ---
    'reporting0', // Sales & Billing
    'reporting1', // Payments
    'reporting2', // Aging
    'reporting3', // Revenue    
    'reporting4', // Expenses  
    'reporting5', // Profit & Loss
    'reporting6', // Balance Sheet
    'reporting7', // Cash Flow     
    
    // --- Hospital Reports ---
    'reporting8', // Outpatient
    'reporting9', // Inpatient    
    'reporting10',//
    'reporting11',
    'reporting12',
    'reporting13',
    'reporting14',
    'reporting15',
    'reporting16',
    'reporting17',
    'reporting18',    
];

// Icon Map (Tailored for Finance)
const iconMap = {
    home: faHome,
    dashboard: faChartBar,
    
    // Module Icons    
    reporting: faChartPie,
    systemConfig: faCog,   

    // Expense Items
    paper_plane: faPaperPlane,
    thumbs_up: faThumbsUp,                            
    history: faHistory,

    // Config Items
    billing_setup: faBillingSetupIcon, 
    expenses_setup: faExpensesSetupIcon, 
    accounting_setup: faBook, // Maps to systemconfiguration3 if using specific icon, or generic below
    menu_book: faBook, // Standard Accounting Setup Icon
    
    // Generics
    analytics: faChartBar,
    settings: faCog,
    cash_register: faCashRegister,
    calculator: faCalculator,
    receipt: faReceipt,
    credit_card: faCreditCard
};

// SidebarNavLink Component
function SidebarNavLink({ href, icon, children, active = false }) {
    return (
        <li>
            <Link href={href} className={`${navLinkClasses} ${active ? 'bg-gray-900 text-white' : ''}`}>
                {icon && <FontAwesomeIcon icon={icon} className="mr-3 w-5 text-center" />}
                <span className="sidebar-normal">{children}</span>
            </Link>
        </li>
    );
}

// SidebarItem Component (Dropdown)
function SidebarItem({ icon, label, isOpen, toggleOpen, children }) {
    return (
        <li>
            <button
                onClick={toggleOpen}
                className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full rounded-md focus:outline-none transition-colors duration-200"
                aria-expanded={isOpen}
            >
                {icon && <FontAwesomeIcon icon={icon} className="mr-3 w-5 text-center" />}
                <span className="flex-1 text-left">{label}</span>
                <b className={caretClasses(isOpen)}>▼</b>
            </button>
            
            {children && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="pl-4 mt-1 space-y-1 border-l border-gray-600 ml-2">
                        {children}
                    </ul>
                </div>
            )}
        </li>
    );
}

// Menu Button Component
function MenuButton({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none ${className}`}
        >
            {children}
        </button>
    );
}

// --- MAIN FINANCE LAYOUT ---
export default function FinanceLayout({ header, children }) {
  
    const { modules, moduleItems, fetchPermissions, clearPermissions } = usePermissionsStore();
    const user = usePage().props.auth.user;
    
    // Sidebar visibility state
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 640);   
    const [sidebarState, setSidebarState] = useState({});

    useEffect(() => {
        fetchPermissions();
    }, []);

    useEffect(() => {
        const initialState = {};
        // Only initialize state for finance modules
        modules.forEach(module => {
            if(financeModuleKeys.includes(module.modulekey)) {
                initialState[module.modulekey] = false;
            }
        });
        setSidebarState(initialState);
    }, [modules]);

    const toggleSidebarSection = (section) => {
        setSidebarState((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    // 3. Filter Modules AND Children
    const financeSidebarItems = modules
        .filter(module => financeModuleKeys.includes(module.modulekey))
        .map(module => {
            // Filter children based on the whitelist (allowedFinanceItemKeys)
            const relevantChildren = moduleItems[module.modulekey]?.filter(item => 
                allowedFinanceItemKeys.includes(item.key)
            ) || [];

            // If module has no relevant children, hide it
            if (relevantChildren.length === 0) return null;

            return {
                label: module.moduletext,
                key: module.modulekey,
                icon: iconMap[module.modulekey] || iconMap[module.icon] || faSackDollar, 
                isOpen: sidebarState[module.modulekey],
                toggleOpen: () => toggleSidebarSection(module.modulekey),
                children: relevantChildren.map(item => ({
                    label: item.text,
                    icon: iconMap[item.icon] || null,
                    href: `/${item.key}`, 
                })),
            };
        })
        .filter(Boolean); // Filter out nulls

    return (
        // Root container with no window scrollbars
        <div className="flex h-screen bg-gray-100 overflow-hidden">            

            {/* Sidebar Container */}
            <div
                className={`flex-shrink-0 bg-gray-900 text-white border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${sidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full sm:translate-x-0 sm:w-0'}`}
                style={{ height: '100vh' }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-center h-16 bg-gray-800 shadow-md flex-shrink-0 overflow-hidden whitespace-nowrap">
                    <Link href="/dashboard/reports">
                        <div className="flex items-center px-4">
                            <img
                                src="/img/greycarelogo.ico"
                                alt="Application Logo"
                                className="w-8 h-8 mr-2"
                            />
                            {sidebarVisible && (
                                <h1 className="text-lg font-bold tracking-wide leading-tight">
                                    GreyCare 2.0 
                                    {/* Using Blue to distinguish Finance */}
                                    <span className="text-xs font-normal text-blue-400 block">Reporting & Analytics</span>
                                </h1>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Sidebar Scrollable Menu */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
                    <nav>
                        <ul className="space-y-1">
                            {/* Static Links */}
                            <SidebarNavLink href={route('dashboard')} icon={faArrowLeft}>
                                Main Menu
                            </SidebarNavLink>
                            
                            <SidebarNavLink href={route('dashboard.reports')} icon={faChartBar}>
                                Dashboard
                            </SidebarNavLink>

                            <div className="my-2 border-t border-gray-700"></div>

                            {/* Dynamic Finance Modules */}
                            {financeSidebarItems.map((item) => (
                                <SidebarItem
                                    key={item.key}
                                    icon={item.icon}
                                    label={item.label}
                                    isOpen={item.isOpen}
                                    toggleOpen={item.toggleOpen}
                                >
                                    {item.children.map((child) => (
                                        <SidebarNavLink key={child.label} href={child.href} icon={child.icon}>
                                            {child.label}
                                        </SidebarNavLink>
                                    ))}
                                </SidebarItem>
                            ))}

                            {financeSidebarItems.length === 0 && (
                                <div className="text-gray-500 text-sm p-4 text-center">
                                    No finance modules assigned.
                                </div>
                            )}
                        </ul>
                    </nav>
                </div>
                
                {/* Sidebar Footer (User Info) */}
                <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0 overflow-hidden">
                     <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                        {sidebarVisible && (
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white truncate w-32">{user.name}</p>
                                <p className="text-xs text-gray-400">Logged In</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <nav className="border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                {/* Toggle Sidebar Button */}
                                <MenuButton onClick={() => setSidebarVisible(!sidebarVisible)} className="mr-4">
                                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                                </MenuButton>

                                {header && (
                                    <div className="hidden sm:block">
                                        {header}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center">
                                {/* User Dropdown */}
                                <div className="relative ml-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:bg-gray-50 focus:outline-none transition"
                                            >
                                                {user.name}
                                                <svg className="-mr-1 ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('dashboard')}>
                                                <FontAwesomeIcon icon={faHome} className="mr-2" /> Main Menu
                                            </Dropdown.Link>
                                            <div className="border-t border-gray-100" />
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                onClick={clearPermissions}
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Body - The ONLY scrollable area */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                    {children}
                    
                    <ToastContainer
                        position="bottom-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </main>
            </div>
        </div>
    );
}