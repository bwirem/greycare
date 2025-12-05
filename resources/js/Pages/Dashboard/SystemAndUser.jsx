import AuthenticatedLayout from '@/Layouts/SystemAndUserLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faUserShield,
    faUserTag,
    faCogs,
    faBuilding,
    faServer,
    faDatabase,
    faListAlt,
    faArrowRight,
    faShieldAlt,
    faHistory
} from '@fortawesome/free-solid-svg-icons';
import usePermissionsStore from '@/stores/usePermissionsStore';

// Reusable Summary Card Component
function SummaryCard({ title, value, unit, description, linkHref, linkText, icon, iconBgColor, footerText }) {
    const valueTextColor = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-gray-800 dark:text-white';
    const linkColor = iconBgColor ? iconBgColor.replace('bg-', 'text-') : 'text-indigo-600 dark:text-indigo-400';
    const displayValue = (value !== undefined && value !== null) ? value : 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col justify-between">
            <div>
                <div className="flex items-start">
                    <div className={`p-3.5 ${iconBgColor || 'bg-gray-500'} rounded-lg shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={icon} className="text-white h-6 w-6" aria-label={title} />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                        <h3 className={`text-2xl sm:text-3xl font-bold ${valueTextColor} dark:text-gray-100 mt-1`}>
                            {displayValue}
                            {unit && displayValue !== 'N/A' && <small className="text-gray-500 dark:text-gray-400 text-sm ml-1">{unit}</small>}
                        </h3>
                        {description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-3">
                {linkHref ? (
                    <Link href={linkHref} className={`${linkColor} hover:underline text-sm font-medium flex items-center group`}>
                        {linkText || 'Manage'}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                ) : (
                    <span className="text-sm text-gray-400">{footerText}</span>
                )}
            </div>
        </div>
    );
}

export default function AdminDashboard({ auth, userCount = 0, roleCount = 0, onlineUsers = 0 }) {
    const { modules } = usePermissionsStore();

    // Define URLs
    const urls = {
        // User Mgmt
        users: '/admin/users',
        roles: '/admin/roles',
        permissions: '/admin/permissions',
        activity: '/admin/activity-logs',
        
        // System Config
        settings: '/admin/settings',
        departments: '/admin/departments',
        modules: '/admin/modules',
        backups: '/admin/backups'
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    System Administration
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Navigation Back */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="mb-4 sm:mb-0">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg">Admin Control Panel</h3>
                            <p className="text-sm text-gray-500">Manage users, access control, and system configuration.</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>

                    {/* --- SECTION 1: USER MANAGEMENT --- */}
                    {modules.some(m => m.modulekey === 'usermanagement') && (
                        <section>
                            <div className="flex items-center mb-4">
                                <FontAwesomeIcon icon={faUserShield} className="text-indigo-600 dark:text-indigo-400 mr-2 text-xl" />
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">User & Access Management</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Users Card */}
                                <SummaryCard
                                    title="Total Users"
                                    value={userCount}
                                    unit="Accounts"
                                    description="Active system accounts."
                                    icon={faUsers}
                                    iconBgColor="bg-indigo-600"
                                    linkHref={urls.users}
                                    linkText="Manage Users"
                                />

                                {/* Roles Card */}
                                <SummaryCard
                                    title="Roles"
                                    value={roleCount}
                                    unit="Defined"
                                    description="User groups & access levels."
                                    icon={faUserTag}
                                    iconBgColor="bg-purple-600"
                                    linkHref={urls.roles}
                                    linkText="Manage Roles"
                                />

                                {/* Permissions Card */}
                                <SummaryCard
                                    title="Permissions"
                                    value="Config"
                                    unit=""
                                    description="Granular access controls."
                                    icon={faShieldAlt}
                                    iconBgColor="bg-blue-600"
                                    linkHref={urls.permissions}
                                    linkText="Review Access"
                                />

                                {/* Activity Logs */}
                                <SummaryCard
                                    title="Activity Logs"
                                    value={onlineUsers}
                                    unit="Online Now"
                                    description="Audit trails & sessions."
                                    icon={faHistory}
                                    iconBgColor="bg-slate-500"
                                    linkHref={urls.activity}
                                    linkText="View Logs"
                                />
                            </div>
                        </section>
                    )}

                    {/* --- SECTION 2: SYSTEM CONFIGURATION --- */}
                    {modules.some(m => m.modulekey === 'systemConfig') && (
                        <section>
                            <div className="flex items-center mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <FontAwesomeIcon icon={faCogs} className="text-slate-600 dark:text-slate-400 mr-2 text-xl" />
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-4">System Configuration</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* General Settings */}
                                <SummaryCard
                                    title="General Settings"
                                    value="Global"
                                    description="Hospital info, logos & localization."
                                    icon={faServer}
                                    iconBgColor="bg-slate-600"
                                    linkHref={urls.settings}
                                    linkText="Edit Settings"
                                />

                                {/* Departments / Structure */}
                                <SummaryCard
                                    title="Hospital Structure"
                                    value="Depts"
                                    description="Departments, Wards & Units."
                                    icon={faBuilding}
                                    iconBgColor="bg-cyan-600"
                                    linkHref={urls.departments}
                                    linkText="Manage Units"
                                />

                                {/* Module Manager */}
                                <SummaryCard
                                    title="Modules"
                                    value="Active"
                                    description="Enable/Disable system features."
                                    icon={faListAlt}
                                    iconBgColor="bg-emerald-600"
                                    linkHref={urls.modules}
                                    linkText="Configure Modules"
                                />

                                {/* Database / Backups */}
                                <SummaryCard
                                    title="System Health"
                                    value="Good"
                                    description="Database backups & status."
                                    icon={faDatabase}
                                    iconBgColor="bg-rose-600"
                                    linkHref={urls.backups}
                                    linkText="System Tools"
                                />
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}