import { useState, useEffect } from 'react'; // Added useEffect
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, 
    faSignOutAlt, 
    faBars, 
    faTimes, 
    faCubes 
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePermissionsStore from "../stores/usePermissionsStore";

export default function MainDashboardLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    // 1. Destructure fetchPermissions from the store
    const { fetchPermissions, clearPermissions } = usePermissionsStore();

    // 2. Fetch permissions automatically when this layout mounts
    useEffect(() => {
        fetchPermissions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* --- Top Navigation Bar --- */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        
                        {/* Left Side: Branding */}
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard" className="flex items-center group">
                                     {/* Logo Image */}
                                    <img
                                        src="/img/greycarelogo.ico"
                                        alt="Application Logo"
                                        className="w-10 h-10 mr-3" 
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xl tracking-tight text-gray-800 leading-none">GreyCare 2.0</span>
                                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Enterprise Hub</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Right Side: Desktop Menu */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="hidden md:inline">{user.name}</span>
                                                </div>

                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
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
                                        <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                                            Signed in as <br/>
                                            <span className="font-bold text-gray-800">{user.email}</span>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" /> Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            onClick={clearPermissions}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-red-400" /> Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <FontAwesomeIcon icon={showingNavigationDropdown ? faTimes : faBars} className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <div className="px-4 py-3 border-t border-gray-200">
                            <div className="font-medium text-base text-gray-800">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition duration-150 ease-in-out"
                        >
                            Profile
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={clearPermissions}
                            className="block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-300 focus:outline-none transition duration-150 ease-in-out"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- Main Page Header --- */}
            {header && (
                <header className="bg-white shadow-sm border-b border-gray-100">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* --- Main Content Area --- */}
            <main>
                <div className="py-8">
                    {children}
                </div>
            </main>

            <ToastContainer position="bottom-right" />
        </div>
    );
}