import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    // Basic Navigation
    faBars, faTimes, faUser, faSignOutAlt, faHome, 
    faArrowLeft,

    // Hospital Icons (Medical)
    faStethoscope, faProcedures, faUserNurse, faUserMd, faHeartbeat, faWalking, faMicroscope, faTint, faRadiation,
    faBabyCarriage, faRibbon, faClipboardList, faFileSignature, faAmbulance, faBed, faDoorOpen, faThermometerHalf,
    faPills, faNotesMedical, faUserInjured, faSearchPlus, faFileMedical, faFileMedicalAlt, faCut, faCalendarCheck,
    faHandsHelping, faVials, faVial, faPoll, faHandHoldingHeart, faXRay, faImages, faVenusMars, faBaby,
    faHandHoldingMedical, faChild, faSyringe, faIdCard, faTablets,faSackDollar,

    // Mortuary & Pharmacy
    faCross, faBookDead, faHandshake,
    faCapsules, faPrescriptionBottle,
    
    // Additional Icons
    faExchangeAlt,  
    // Generic Icons
    faChartBar, faCog,
    // Setup Icons
    faFlask,
    faHistory,
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePermissionsStore from "@/stores/usePermissionsStore"; // Ensure path is correct

// Constants for CSS classes
const navLinkClasses = 'flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200';
const caretClasses = (isOpen) => `caret ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`;

// 2. DEFINING FINANCE CHILD ITEM KEYS (Whitelist)
const allowedFinanceItemKeys = [     
    
    //Outpatient Module Items
    'outpatient0', 'outpatient1', 'outpatient2', 'outpatient3', 'outpatient4',
    //Inpatient Module Items
    'inpatient0', 'inpatient1', 'inpatient2', 
    //Nursing Module Items
    'nursing0', 'nursing1', 'nursing2', 'nursing3', 'nursing4',
    //Doctor Module Items
    'doctor0', 'doctor1', 'doctor2', 'doctor3',
    //Theatre Module Items
    'theatre0', 'theatre1', 'theatre2', 'theatre3', 'theatre4',
    //Physiotherapy Module Items
    'physiotherapy0', 'physiotherapy1', 'physiotherapy2',
    //Laboratory Module Items
    'laboratory0', 'laboratory1','laboratory2', 'laboratory3',
    //Blood Bank Module Items
    'bloodbank0', 'bloodbank1', 'bloodbank2', 'bloodbank3',
    //Radiology Module Items
    'radiology0', 'radiology1', 'radiology2', 'radiology3',
    //Pharmacy Module Items
    'pharmacy0', 'pharmacy1',

    'reporting8', 'reporting9',  
    'reporting10', 'reporting11',
    'reporting12', 'reporting13',
    'reporting14', 'reporting15',
    'reporting16', 'reporting17',       

    //System Configuration Module Items   
    'systemconfiguration6', //  
    'systemconfiguration7', //  
    'systemconfiguration8', //  
    'systemconfiguration9', //  
    'systemconfiguration10', //   
];

// Icon Map
const iconMap = {
    home: faHome,
    outpatient: faClipboardList,
    inpatient: faProcedures,    
    nursing: faUserNurse,
    doctor: faUserMd,
    theatre: faHeartbeat,
    physiotherapy: faWalking,
    laboratory: faMicroscope,
    'blood-bank': faTint,
    radiology: faRadiation,
    rch: faBabyCarriage,
    hivart: faRibbon,
    pharmacy: faCapsules, 
    mortuary: faCross,
    dashboard: faStethoscope,
    clipboard_list: faClipboardList,

    file_signature: faFileSignature,
    ambulance: faAmbulance,
    cash_register: faSackDollar,
    bed: faBed,
    door_open: faDoorOpen,
    exchange_alt: faExchangeAlt,

    thermometer: faThermometerHalf,
    pills: faPills,
    notes_medical: faNotesMedical,
    clipboard_user: faUserInjured,
    search_plus: faSearchPlus,
    prescription: faFileMedical,
    file_medical: faFileMedical,
    cut: faCut,
    calendar_check: faCalendarCheck,
    file_medical_alt: faFileMedicalAlt,
    procedures: faProcedures,
    hands_helping: faHandsHelping,
    vials: faVials,
    vial: faVial,
    tint: faTint, // <--- Add this line
     
    

    poll: faPoll,
    hand_holding_heart: faHandHoldingHeart,
    x_ray: faXRay,
    images: faImages,
    venus_mars: faVenusMars,
    baby: faBaby,
    hand_holding_medical: faHandHoldingMedical,
    child: faChild,
    syringe: faSyringe,
    id_card: faIdCard,
    tablets: faTablets,
    capsule: faCapsules,
    prescription_bottle: faPrescriptionBottle,
    book_dead: faBookDead,
    handshake: faHandshake,

    // Generics
    analytics: faChartBar,
    settings: faCog,

    // Setup Icons
    lab_setup: faFlask,            // Laboratory
    radiology_setup: faXRay,       // Radiology / Imaging
    theatre_setup: faProcedures,   // Operating Theatre
    pharmacy_setup: faPills,       // Pharmacy
    blood_bank_setup: faTint,      // Blood Bank
    test_history: faHistory,
    imaging_history: faHistory,
    box_open: faBoxOpen,
};

// SidebarNavLink Component
function SidebarNavLink({ href, icon, children, active = false }) {
    return (
        <li>
            <Link href={href} className={`${navLinkClasses} ${active ? 'bg-gray-900 text-white' : ''}`}>
                {/* Ensure icon exists before rendering FontAwesomeIcon */}
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
            
            {/* Render children only if they exist */}
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

// --- MAIN HOSPITAL LAYOUT ---
export default function HospitalLayout({ header, children }) {

    const { props } = usePage();
    const hospitalModuleKeys = props.moduleGroups?.hospital || []; 
    const { modules, moduleItems, fetchPermissions, clearPermissions } = usePermissionsStore();
    const user = usePage().props.auth.user;
    
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 640);   
    const [sidebarState, setSidebarState] = useState({});

    useEffect(() => {
        fetchPermissions();
    }, []);

    useEffect(() => {
        const initialState = {};
        modules.forEach(module => {
            if(hospitalModuleKeys.includes(module.modulekey)) {
                initialState[module.modulekey] = false;
            }
        });
        setSidebarState(initialState);
    }, [modules, hospitalModuleKeys]); 

    const toggleSidebarSection = (section) => {
        setSidebarState((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    // 3. Filter and Map Sidebar Items
    // FIX: Renamed 'children' to 'subItems' to avoid prop conflict with React Components
    const clinicalSidebarItems = modules
        .filter(module => hospitalModuleKeys.includes(module.modulekey))
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
                subItems: relevantChildren.map(item => ({
                    label: item.text,
                    icon: iconMap[item.icon] || null,
                    href: `/${item.key}`, 
                })),
            };
        })
        .filter(Boolean); // Filter out nulls
        
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">            

            {/* Sidebar Container */}
            <div
                className={`flex-shrink-0 bg-gray-900 text-white border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${sidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full sm:translate-x-0 sm:w-0'}`}
                style={{ height: '100vh' }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-center h-16 bg-gray-800 shadow-md flex-shrink-0 overflow-hidden whitespace-nowrap">
                    <Link href={route('dashboard.hospital')}>
                        <div className="flex items-center px-4">
                            <img
                                src="/img/greycarelogo.ico"
                                alt="Application Logo"
                                className="w-8 h-8 mr-2"
                            />
                            {sidebarVisible && (
                                <h1 className="text-lg font-bold tracking-wide leading-tight">
                                    GreyCare 2.0 
                                    <span className="text-xs font-normal text-gray-400 block">Clinical Station</span>
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
                            
                            <SidebarNavLink href={route('dashboard.hospital')} icon={faHome}>
                                Dashboard
                            </SidebarNavLink>

                            <div className="my-2 border-t border-gray-700"></div>

                            {/* Dynamic Hospital Modules */}
                            {clinicalSidebarItems.map((item) => (
                                <SidebarItem
                                    key={item.key}
                                    icon={item.icon}
                                    label={item.label}
                                    isOpen={item.isOpen}
                                    toggleOpen={item.toggleOpen}
                                >
                                    {/* FIX: Mapping over 'subItems' instead of 'children' */}
                                    {item.subItems.map((child) => (
                                        <SidebarNavLink key={child.label} href={child.href} icon={child.icon}>
                                            {child.label}
                                        </SidebarNavLink>
                                    ))}
                                </SidebarItem>
                            ))}

                            {clinicalSidebarItems.length === 0 && (
                                <div className="text-gray-500 text-sm p-4 text-center">
                                    No clinical modules assigned.
                                </div>
                            )}
                        </ul>
                    </nav>
                </div>
                
                {/* Sidebar Footer */}
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
                </nav>

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