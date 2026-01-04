import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPills,
    faPrescriptionBottleAlt,
    faUserCheck,
    faHourglassHalf,
    faListAlt,
    faChartPie,
    faArrowRight,
    faFileMedical
} from '@fortawesome/free-solid-svg-icons';

function ReportCard({ title, value, description, icon, iconBgColor, linkHref, linkText }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <Link href={linkHref || '#'} className="block group flex-grow flex flex-col">
                <div className="flex items-start mb-auto">
                    <div className={`p-3.5 ${iconBgColor || 'bg-indigo-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                        {value !== undefined && (
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</h3>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-sm font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center">
                        {linkText}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3" />
                    </span>
                </div>
            </Link>
        </div>
    );
}

export default function PharmacyReportsDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Pharmacy Reporting Hub</h2>}>
            <Head title="Pharmacy Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
                            <span className="text-gray-500 text-xs uppercase font-bold">Prescribed Items</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">{stats.total_prescribed}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500">
                            <span className="text-gray-500 text-xs uppercase font-bold">Pending Dispense</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">{stats.pending_queue}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
                            <span className="text-gray-500 text-xs uppercase font-bold">Dispensed Items</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">{stats.dispensed_today}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-500">
                            <span className="text-gray-500 text-xs uppercase font-bold">Patients Served</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">{stats.patients_served}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">Available Reports</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <ReportCard
                            title="Dispensing Log"
                            description="Detailed history of prescriptions and dispensed drugs."
                            icon={faListAlt}
                            iconBgColor="bg-blue-600"
                            linkHref={route('reports.pharmacy.dispensing')}
                            linkText="View Logs"
                        />
                        <ReportCard
                            title="Drug Consumption"
                            description="Analysis of top moving items and dispensing volumes."
                            icon={faChartPie}
                            iconBgColor="bg-orange-500"
                            linkHref={route('reports.pharmacy.analysis')}
                            linkText="View Analysis"
                        />
                        <ReportCard
                            title="Patient Medication History"
                            description="Lookup specific patient prescription records."
                            icon={faFileMedical}
                            iconBgColor="bg-teal-600"
                            linkHref={route('reporting11.index')} // Shared Patient History
                            linkText="Search Patient"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}