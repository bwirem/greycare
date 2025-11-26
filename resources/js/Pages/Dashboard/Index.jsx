import MainDashboardLayout from '@/Layouts/MainDashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHospitalUser, 
    faTruckRampBox, 
    faSackDollar, 
    faPeopleRoof, 
    faArrowRight,
    faCogs,       // Added for System Config
    faChartPie    // Added for Reports
} from '@fortawesome/free-solid-svg-icons';
import usePermissionsStore from '@/stores/usePermissionsStore';

export default function Index({ auth }) {
    const { modules, fetchPermissions } = usePermissionsStore();

    // Ensure permissions are loaded
    useEffect(() => {
        fetchPermissions();
    }, []);

    const hasAccess = (keys) => {
        if (!modules || modules.length === 0) return false;
        return modules.some(m => keys.includes(m.modulekey));
    };

    const apps = [
        {
            title: "Hospital Services",
            description: "OPD, IPD, Doctors, Nursing, Pharmacy, Laboratory, Radiology & Mortuary.",
            icon: faHospitalUser,
            color: "bg-emerald-600",
            textColor: "text-emerald-600",
            route: "dashboard.hospital", 
            access: hasAccess(['outpatient', 'inpatient', 'nursing', 'doctor', 'theatre', 'laboratory', 'pharmacy', 'mortuary'])
        },        
        {
            title: "Sales & Finance Mgmt",
            description: "Patient Billing, General Ledger, Expense Management & Financial Reporting.",
            icon: faSackDollar,
            color: "bg-blue-600",
            textColor: "text-blue-600",
            route: "dashboard.finance",
            access: hasAccess(['billing', 'accounting', 'expenses'])
        },
        {
            title: "Resource & Asset Mgmt",
            description: "Procurement, Inventory Control, Stores, Material Conversion & Fixed Assets.",
            icon: faTruckRampBox,
            color: "bg-amber-600",
            textColor: "text-amber-600",
            route: "dashboard.resources",
            access: hasAccess(['procurements', 'inventory', 'fixedassets'])
        },
        {
            title: "Human Resource (HRM)",
            description: "Employee Records, Payroll Processing, and Attendance.",
            icon: faPeopleRoof,
            color: "bg-purple-600",
            textColor: "text-purple-600",
            route: "dashboard.hr",
            access: hasAccess(['humanresurces'])
        },
        // --- NEW CARD 1: Reporting ---
        {
            title: "Reporting & Analytics",
            description: "Centralized reports for Clinical, Financial, Inventory, and Operational metrics.",
            icon: faChartPie,
            color: "bg-teal-600",
            textColor: "text-teal-600",
            route: "dashboard.reports",
            // Checks for the generic 'reporting' key or specific reporting modules
            access: hasAccess(['reporting']) 
        },
        // --- NEW CARD 2: System Config & Admin ---
        {
            title: "System & User Admin",
            description: "Global settings, module configuration, user roles, and access control.",
            icon: faCogs,
            color: "bg-slate-600",
            textColor: "text-slate-600",
            route: "dashboard.admin",
            // Checks for system config or user management keys
            access: hasAccess(['systemConfig', 'usermanagement'])
        }
    ];

    return (
        <MainDashboardLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Main Dashboard</h2>}
        >
            <Head title="Home" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {auth.user.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Select an application suite to begin.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {apps.map((app, index) => (
                            app.access && (
                                <Link 
                                    href={route(app.route)} 
                                    key={index}
                                    className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className={`${app.color} p-6 flex items-center justify-center transition-colors duration-300`}>
                                        <FontAwesomeIcon icon={app.icon} className="text-white text-4xl opacity-90 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h4 className={`text-lg font-bold ${app.textColor} mb-2`}>{app.title}</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">{app.description}</p>
                                        </div>
                                        <div className="mt-auto flex items-center text-gray-800 dark:text-white font-semibold text-xs uppercase tracking-wide group-hover:translate-x-2 transition-transform duration-200">
                                            Open <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </MainDashboardLayout>
    );
}