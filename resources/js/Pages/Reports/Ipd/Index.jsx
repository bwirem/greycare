import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faProcedures,
    faDoorOpen,
    faUserInjured,
    faArrowRight,
    faChartPie
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

export default function IpdReportsDashboard({ auth, stats }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">IPD Reporting Hub</h2>}>
            <Head title="IPD Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Available Reports Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <ReportCard
                            title="Current Census"
                            value={stats.current_inpatients}
                            description="Total patients currently admitted in wards."
                            icon={faProcedures}
                            iconBgColor="bg-blue-600"
                            linkHref={route('reports.ipd.census')}
                            linkText="View Bed Occupancy"
                        />
                        <ReportCard
                            title="Admissions Log"
                            value={stats.admissions_today}
                            description="Patients admitted today."
                            icon={faUserInjured}
                            iconBgColor="bg-purple-600"
                            linkHref={route('reports.ipd.admissions')}
                            linkText="View Admissions"
                        />
                        <ReportCard
                            title="Discharges Log"
                            value={stats.discharges_today}
                            description="Patients discharged today."
                            icon={faDoorOpen}
                            iconBgColor="bg-green-600"
                            linkHref={route('reports.ipd.discharges')}
                            linkText="View Discharges"
                        />
                        {/* Future Placeholders */}
                        <ReportCard
                            title="Ward Statistics"
                            description="Occupancy rates and bed turnover (Summary)."
                            icon={faChartPie}
                            iconBgColor="bg-orange-500"
                            linkHref="#" // Link to summary route later
                            linkText="Coming Soon"
                        />

                        <ReportCard
                            title="Daily Census Matrix"
                            description="Comprehensive summary of Admissions, Discharges, Deaths, and Occupancy."
                            icon={faChartPie} // Import this icon
                            iconBgColor="bg-teal-600"
                            linkHref={route('reports.ipd.daily_census')}
                            linkText="View Census Matrix"
                        />
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}