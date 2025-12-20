import AuthenticatedLayout from '@/Layouts/HumanResourceLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faIdCard, faMoneyCheckAlt, faCalendarAlt, 
    faClock, faBriefcase, faUserTie, faFilter, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

// Reusable Card Component
function ActionOrReportCard({ title, description, icon, iconBgColor, linkRoute, linkText }) {
    const { ziggy } = usePage().props;
    let href = '#';

    // Safely resolve route
    try {
        if (route().has(linkRoute)) {
            href = route(linkRoute);
        }
    } catch (e) {
        console.warn(`Route ${linkRoute} not found.`);
    }

    const textColorClass = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-indigo-600';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col">
            <Link href={href} className="block group flex-grow flex flex-col">
                <div className="flex items-start mb-auto">
                    <div className={`p-3.5 ${iconBgColor || 'bg-indigo-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" aria-label={title} />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    </div>
                </div>
                <div className="mt-3 text-sm font-medium">
                    <span className={`${textColorClass} group-hover:underline flex items-center`}>
                        {linkText}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                </div>
            </Link>
        </div>
    );
}

export default function HumanResourceReports({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Human Resources Reports</h2>}>
            <Head title="HR Reports" />
            <div className="py-8 md:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wider">Available Reports</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            <ActionOrReportCard
                                title="Employee Master List"
                                description="Detailed information for all employees."
                                icon={faIdCard}
                                iconBgColor="bg-blue-600"
                                linkRoute="reports.hr.employee_list"
                                linkText="View List"
                            />
                            <ActionOrReportCard
                                title="Payroll Summary"
                                description="Overview of payroll expenses per period."
                                icon={faMoneyCheckAlt}
                                iconBgColor="bg-purple-600"
                                linkRoute="reports.hr.payroll_summary"
                                linkText="View Payroll"
                            />
                            <ActionOrReportCard
                                title="Leave Report"
                                description="Track approved leaves and history."
                                icon={faCalendarAlt}
                                iconBgColor="bg-yellow-600"
                                linkRoute="reports.hr.leave_balances"
                                linkText="View Leaves"
                            />
                            <ActionOrReportCard
                                title="Attendance Log"
                                description="Daily attendance and punctuality report."
                                icon={faClock}
                                iconBgColor="bg-teal-600"
                                linkRoute="reports.hr.attendance_summary"
                                linkText="View Logs"
                            />
                            {/* Placeholders for future expansion */}
                            <ActionOrReportCard
                                title="Staff Turnover"
                                description="Analysis of joiners vs leavers."
                                icon={faUserTie}
                                iconBgColor="bg-red-600"
                                linkRoute="reports.hr.turnover"
                                linkText="Coming Soon"
                            />
                            <ActionOrReportCard
                                title="Demographics"
                                description="Workforce breakdown statistics."
                                icon={faUsers}
                                iconBgColor="bg-cyan-600"
                                linkRoute="reports.hr.demographics"
                                linkText="Coming Soon"
                            />
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}