import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    // Basic Navigation
    faBars, faTimes, faUser, faSignOutAlt, faHome, 
    
    // Icons used in Reporting & Config (Retained)
    faShoppingCart, faPlusSquare, faMoneyBill, faMoneyBillAlt,
    faHistory, faBoxes, faFileInvoice, faCartPlus, faWarehouse, faStore, faTruck, faSyncAlt, faRedo, faBalanceScale,
    faBook, faChartBar, faFileAlt, faCog, faUsersCog, faCogs,
    faBox,
    faClipboardList,
    faListAlt,
    faBuilding, faUpload, faUserSlash, faMoneyCheckAlt,
    faJournalWhills,    
    faBalanceScaleLeft, 
    faFileInvoiceDollar,
    faExchangeAlt,
    faLandmark, 
    faChartPie,       
    faArrowUp, 
    faArrowDown, 
    faTrashAlt,    
    faWrench,  
    faPaperPlane,
    faThumbsUp,
    faMoneyBillTransfer,

    // Hospital Icons (Medical)
    faStethoscope, faProcedures, faUserNurse, faUserMd, faHeartbeat, faWalking, faMicroscope, faTint, faRadiation,
    faBabyCarriage, faRibbon, faClipboardCheck, faFileSignature, faAmbulance, faBed, faDoorOpen, faThermometerHalf,
    faPills, faNotesMedical, faUserInjured, faSearchPlus, faFileMedical, faFileMedicalAlt, faCut, faCalendarCheck,
    faHandsHelping, faVials, faVial, faPoll, faHandHoldingHeart, faXRay, faImages, faVenusMars, faBaby,
    faHandHoldingMedical, faChild, faSyringe, faIdCard, faTablets, faCashRegister,

    // --- NEW MORTUARY ICONS ---
    faCross,
    faBookDead,
    faHandshake,
    // Pharmacy Icons
    faCapsules,
    faPrescriptionBottle,   
    

    



} from "@fortawesome/free-solid-svg-icons";

import { faHistory as faSalesHistory } from '@fortawesome/free-solid-svg-icons'; 
import { faMoneyCheckAlt as faPaymentsHistory } from '@fortawesome/free-solid-svg-icons'; 
import { faBan as faVoidHistory } from '@fortawesome/free-solid-svg-icons'; 
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoice as faBillingSetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import { faMoneyBillWave as faExpensesSetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import { faBoxOpen as faInventorySetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import { faMapMarkerAlt as faLocationSetupIcon } from '@fortawesome/free-solid-svg-icons'; 
import "@fortawesome/fontawesome-svg-core/styles.css";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import usePermissionsStore from "../stores/usePermissionsStore";

// Constants for CSS classes
const navLinkClasses = 'flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md';
const caretClasses = (isOpen) => `caret ${isOpen ? 'rotate-180' : ''}`;


// Icon Map
const iconMap = {
    home: faHome,
    
    // --- HOSPITAL MODULE ICONS ---
    stethoscope: faStethoscope,
    procedures: faProcedures,
    user_nurse: faUserNurse,
    user_md: faUserMd,
    heartbeat: faHeartbeat,
    walking: faWalking,
    microscope: faMicroscope,
    tint: faTint,
    radiation: faRadiation,
    baby_carriage: faBabyCarriage,
    ribbon: faRibbon,
    capsules: faCapsules, // Pharmacy Module

    // --- PHARMACY ITEMS ---
    capsule: faCapsules, // Reusing capsules or use faPills
    prescription_bottle: faPrescriptionBottle,

    // --- MORTUARY MODULE ---
    cross: faCross,
    book_dead: faBookDead,
    handshake: faHandshake,
    
    // --- HOSPITAL ITEM ICONS ---
    clipboard_list: faClipboardList,
    file_signature: faFileSignature,
    ambulance: faAmbulance,
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
    hands_helping: faHandsHelping,
    vials: faVials,
    vial: faVial,
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
    cash_register: faCashRegister,

    // --- ICONS FOR REPORTING & CONFIG (Retained) ---
    add_shopping_cart: faShoppingCart,
    post_add: faPlusSquare,
    paid: faMoneyBill,
    sales_history: faSalesHistory, 
    payments_history: faPaymentsHistory, 
    void_history: faVoidHistory, 
    attach_money: faMoneyBillAlt,
    history: faHistory,
    person: faUser,
    upload: faUpload,
    person_outline: faUserSlash,
    payroll: faMoneyCheckAlt,
    inventory: faBoxes,
    request_quote: faFileInvoice,
    shopping_cart: faCartPlus,
    storage: faWarehouse,
    store: faStore,
    local_shipping: faTruck,
    sync_alt: faSyncAlt,
    autorenew: faRedo,
    account_balance: faBalanceScale,
    menu_book: faBook,
    analytics: faChartBar,
    description: faFileAlt,
    settings: faCog,
    manage_accounts: faUsersCog,
    security_settings: faShieldAlt, 
    billing_setup: faBillingSetupIcon, 
    expenses_setup: faExpensesSetupIcon, 
    inventory_setup: faInventorySetupIcon, 
    location_setup: faLocationSetupIcon,  
    goods_receiving: faBox,          
    inventory_reconciliation: faClipboardList, 
    stock_history: faListAlt,       
    facility_setup: faBuilding,      
    journal_whills: faJournalWhills,   
    balance_scale: faBalanceScale,
    balance_scale_left: faBalanceScaleLeft,
    file_invoice_dollar: faFileInvoiceDollar,
    //exchange_alt: faExchangeAlt,
    landmark: faLandmark,
    chart_pie: faChartPie,
    fixed_assets: faBuilding, 
    list_alt: faListAlt,
    arrow_down: faArrowDown, 
    arrow_up: faArrowUp, 
    trash_alt: faTrashAlt,       
    wrench: faWrench,
    shield_alt : faShieldAlt,
    paper_plane: faPaperPlane,
    thumbs_up: faThumbsUp,   
    money_bill_transfer: faMoneyBillTransfer,
};

// SidebarNavLink Component
function SidebarNavLink({ href, icon, children }) {
    return (
        <li>
            <Link href={href} className={navLinkClasses}>
                {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                <span className="sidebar-normal">{children}</span>
            </Link>
        </li>
    );
}

// SidebarItem Component
function SidebarItem({ icon, label, isOpen, toggleOpen, children, href }) {
    return (
        <li>
            {href ? (
                <Link href={href} className={navLinkClasses}>
                    {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                    <p>{label}</p>
                </Link>
            ) : (
                <button
                    onClick={toggleOpen}
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full rounded-md focus:outline-none"
                    aria-expanded={isOpen}
                >
                    {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                    <p>
                        {label}
                        <b className={caretClasses(isOpen)}></b>
                    </p>
                </button>
            )}
            {children && isOpen && (
                <div className="pl-6">
                    <ul className="nav">{children}</ul>
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

// Main Component
export default function AuthenticatedLayout({ header, children }) {
  
    const { modules, moduleItems,fetchPermissions } = usePermissionsStore();

    //2. Get the clearPermissions action from the store
    const clearPermissions = usePermissionsStore((state) => state.clearPermissions);


    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 640);   
    const [sidebarState, setSidebarState] = useState({});

    useEffect(() => {
        fetchPermissions(); // Fetch permissions on mount
    }, []);

   
    useEffect(() => {
              
        const initialState = {};
        modules.forEach(module => {
            initialState[module.modulekey] = false; // Set initial state to false
        });
        setSidebarState(initialState);
    }, []);

    const toggleSidebarSection = (section) => {
        setSidebarState((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const sidebarMenuItems = modules.map(module => ({
        label: module.moduletext,
        icon: iconMap[module.icon] || null, // Get the icon for the module
        isOpen: sidebarState[module.modulekey],
        toggleOpen: () => toggleSidebarSection(module.modulekey),
        children: moduleItems[module.modulekey].map(item => ({
            label: item.text,
            icon: iconMap[item.icon] || null, // Get the icon for the item
            href: `/${item.key}`,
        })),
    }));

    return (
        <div className="min-h-screen flex bg-gray-100">            

            {/* Sidebar */}
            <div
                className={`sidebar transition-all duration-300 ease-in-out ${sidebarVisible ? 'block' : 'hidden'} sm:block bg-gray-800 text-white border-r border-gray-700 overflow-y-auto`}
                style={{ maxHeight: '100vh' }}
            >
                <div className="flex items-center justify-center p-4">
                    <Link href="/">
                        <div className="flex items-center">
                            <img
                                src="/img/greycarelogo.ico"
                                alt="Application Logo"
                                className="w-8 h-8 mr-2"
                            />
                            <h1 className="text-xl font-bold">GreyCare</h1>
                        </div>
                    </Link>
                </div>

                <nav className="mt-6">
                    <ul className="nav">
                        {sidebarMenuItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isOpen={item.isOpen}
                                toggleOpen={item.toggleOpen}
                                children={item.children && item.isOpen ? (
                                    <>
                                        {item.children.map((child) => (
                                            <SidebarNavLink key={child.label} href={child.href} icon={child.icon}>
                                                {child.label}
                                            </SidebarNavLink>
                                        ))}
                                    </>
                                ) : null}
                            />
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <nav className="border-b border-gray-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <MenuButton onClick={() => setSidebarVisible(!sidebarVisible)} className="sm:hidden">
                                    <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                                </MenuButton>

                                {header && (
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        {header}
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                >
                                                    {user.name}
                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                onClick={clearPermissions} // Clear permissions on logout
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <MenuButton
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={showingNavigationDropdown ? faTimes : faBars} className="h-6 w-6" />
                                </MenuButton>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}
                    >
                        <div className="border-t border-gray-200 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <SidebarNavLink href={route('profile.edit')}>
                                    <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                                </SidebarNavLink>
                                <SidebarNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Log Out
                                </SidebarNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 h-full overflow-y-auto">
                    <div className="p-4 h-full">
                        {children}
                    </div>
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
                    />
                </main>
            </div>
        </div>
    );
}