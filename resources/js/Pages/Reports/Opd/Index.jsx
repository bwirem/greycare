import AuthenticatedLayout from '@/Layouts/HospitalLayout'; // Or your Main Layout
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClipboardList,
    faChartLine,
    faUserMd,
    faUsers,
    faArrowRight,
    faCalendarDay
} from '@fortawesome/free-solid-svg-icons';

function ReportCard({ title, value, description, icon, iconBgColor, linkHref, linkText }) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col">
            <Link href={linkHref || '#'} className="block group flex-grow flex flex-col">
                <div className="flex items-start mb-auto">
                    <div className={`p-3.5 ${iconBgColor || 'bg-indigo-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                        {value !== undefined && (
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</h3>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <div className="mt-3 text-sm font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center">
                        {linkText}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3" />
                    </span>
                </div>
            </Link>
        </div>
    );
}

export default function OpdReportsDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">OPD Reporting Hub</h2>}
        >
            <Head title="OPD Reports" />

            <div className="py-8 md:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Live Stats Section */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                            <span className="block text-gray-500 dark:text-gray-400 text-sm">Today's Registrations</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-gray-200">{stats?.today_total || 0}</span>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded shadow-sm">
                            <span className="block text-gray-500 dark:text-gray-400 text-sm">New Cases</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-gray-200">{stats?.today_new || 0}</span>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded shadow-sm">
                            <span className="block text-gray-500 dark:text-gray-400 text-sm">Revisits</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-gray-200">{stats?.today_revisit || 0}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">
                        Available Reports
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <ReportCard
                            title="Daily Registrations"
                            description="Detailed list of patients registered for a specific day."
                            icon={faCalendarDay}
                            iconBgColor="bg-blue-600"
                            linkHref={route('reports.opd.daily')}
                            linkText="View Daily Log"
                        />
                        <ReportCard
                            title="Registration Summary"
                            description="Trends over time (Daily/Monthly) or by Clinic."
                            icon={faChartLine}
                            iconBgColor="bg-purple-600"
                            linkHref={route('reports.opd.summary')}
                            linkText="View Trends"
                        />
                         <ReportCard
                            title="Clinic Utilization"
                            description="See which clinics are handling the most traffic."
                            icon={faClipboardList}
                            iconBgColor="bg-teal-600"
                            linkHref={route('reports.opd.summary', { group_by: 'clinic' })}
                            linkText="View Clinic Stats"
                        />
                         {/* Placeholder for future implementation */}
                        <ReportCard
                            title="Demographics"
                            description="Breakdown by Age and Gender (Coming Soon)."
                            icon={faUsers}
                            iconBgColor="bg-gray-500"
                            linkHref="#"
                            linkText="View Demographics"
                        />
                        <ReportCard
                            title="Doctor Performance"
                            description="Consultation counts per doctor (Coming Soon)."
                            icon={faUserMd}
                            iconBgColor="bg-gray-500"
                            linkHref="#"
                            linkText="View Performance"
                        />
                                              
                        <ReportCard
                            title="Attendance Matrix"
                            description="Breakdown of New vs Revisit by Gender and Clinic/Payer."
                            icon={faUsers}
                            iconBgColor="bg-rose-600"
                            linkHref={route('reports.opd.attendance')}
                            linkText="View Matrix"
                        />

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}