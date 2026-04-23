import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    // Basic Navigation
    faBars, faTimes, faUser, faSignOutAlt, faHome, 
    faArrowLeft,faBoxes, faCog,

    // Specialized Care Icons
    faBabyCarriage, faRibbon, faBookDead, faWalking, // Module Headers
    faCross, faHandshake, // Mortuary
    faVenusMars, faBaby, faHandHoldingMedical, faChild, faSyringe, // RCH
    faIdCard, faTablets, // HIV
    faHandsHelping, faNotesMedical, // Physio
    faChartBar, faStethoscope
} from "@fortawesome/free-solid-svg-icons";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePermissionsStore from "../stores/usePermissionsStore";

// Constants for CSS classes
const navLinkClasses = 'flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200';
const caretClasses = (isOpen) => `caret ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`;

// 1. DEFINING SPECIALIZED KEYS
const specializedModuleKeys = [
    'rch',
    'hivart',   
    'physiotherapy',
    'reporting',   // Parent for Reports
    'systemConfig'
];

// 2. DEFINING SPECIALIZED CHILD ITEM KEYS
const allowedSpecializedItemKeys = [
    // RCH Items
    'rch0', // Family Planning
    'rch1', // Antenatal
    'rch2', // Postnatal
    'rch3', // Child Health
    'rch4', // Immunizations   

    // HIV Items
    'hivart0', // Enrollment
    'hivart1', // ART Mgmt
    
    // Physio Items
    'physiotherapy0', // Sessions
    'physiotherapy1',  // Progress Notes

    'reporting18', // Specialized Reports

    'systemconfiguration14', // System Configurations

];

// Icon Map (Tailored for Specialized Clinics)
const iconMap = {
    home: faHome,
    dashboard: faChartBar,

    // Module Icons
    rch: faBabyCarriage,
    hivart: faRibbon,
    mortuary: faBookDead, // or faCross
    physiotherapy: faWalking,
    settings: faCog,

    // RCH Items
    venus_mars: faVenusMars, // Family Planning
    baby: faBaby, // Antenatal
    hand_holding_medical: faHandHoldingMedical, // Postnatal
    child: faChild, // Child Health
    syringe: faSyringe, // Immunizations
    baby_carriage: faBabyCarriage, // Maternity Records

    // HIV Items
    id_card: faIdCard, // Enrollment
    tablets: faTablets, // ART Mgmt

    // Mortuary Items
    book_dead: faBookDead, // Records
    handshake: faHandshake, // Release
    cross: faCross,

    // Physio Items
    hands_helping: faHandsHelping, // Sessions
    notes_medical: faNotesMedical, // Progress Notes

    // Generics
    analytics: faChartBar,
    stethoscope: faStethoscope,   
    
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

// --- MAIN SPECIALIZED LAYOUT ---
export default function SpecializedLayout({ header, children }) {
  
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
        // Only initialize state for specialized modules
        modules.forEach(module => {
            if(specializedModuleKeys.includes(module.modulekey)) {
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

    // Filter specialized modules and their items
    const specializedSidebarItems = modules
        .filter(module => specializedModuleKeys.includes(module.modulekey))
        .map(module => {
            // Filter children based on the whitelist (allowedSpecializedItemKeys)
            const relevantChildren = moduleItems[module.modulekey]?.filter(item =>
                allowedSpecializedItemKeys.includes(item.key)
            ) || [];

            // If module has no relevant children, hide it
            if (relevantChildren.length === 0) return null;

            return {
                label: module.moduletext,
                key: module.modulekey,
                icon: iconMap[module.modulekey] || iconMap[module.icon] || faBoxes,
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
                    <Link href="/dashboard/specialized">
                        <div className="flex items-center px-4">
                            <img
                                src="/img/greycarelogo.ico"
                                alt="Application Logo"
                                className="w-8 h-8 mr-2"
                            />
                            {sidebarVisible && (
                                <h1 className="text-lg font-bold tracking-wide leading-tight">
                                    GreyCare 2.0 
                                    {/* Rose color for Specialized */}
                                    <span className="text-xs font-normal text-rose-500 block">Specialized Clinics</span>
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
                            
                            <SidebarNavLink href={route('dashboard.specialized')} icon={faHandsHelping}>
                                Dashboard
                            </SidebarNavLink>

                            <div className="my-2 border-t border-gray-700"></div>

                            {/* Dynamic Specialized Modules */}
                            {specializedSidebarItems.map((item) => (
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

                            {specializedSidebarItems.length === 0 && (
                                <div className="text-gray-500 text-sm p-4 text-center">
                                    No specialized modules assigned.
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
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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