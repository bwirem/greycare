import React from 'react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    // HR & Workforce Icons
    faUsers, faUserClock, faUmbrellaBeach, faUserTie,
    faIdCard,
    
    // Finance & Payroll Icons
    faMoneyCheckAlt, faHandHoldingUsd, faFileInvoiceDollar,
    faChartLine,
    
    // Configuration & Admin
    faCogs, faBuilding, faList, faSlidersH,
    
    // Common
    faArrowRight, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

// 1. Reusable Card Component (Matches your Hospital.jsx style)
function SummaryCard({ title, value, unit, description, linkHref, linkText, icon, iconBgColor, footerText, footerTextColor = "text-gray-500 dark:text-gray-400" }) {
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
                        {linkText || 'View Details'}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                ) : footerText ? (
                    <span className={`text-sm ${footerTextColor}`}>{footerText}</span>
                ) : <div className="h-[20px]"></div>}
            </div>
        </div>
    );
}

export default function HumanResource({ auth, stats }) {
    // 2. Destructure Data from Controller
    const { 
        totalEmployees = 0, 
        activeEmployees = 0,
        presentToday = 0, 
        onLeave = 0, 
        pendingLoans = 0 
    } = stats || {};

    // 3. Define Routes (Centralized for easy updates)
    const urls = {
        employeeList: route('humanresurces0.index'),
        employeeCreate: route('humanresurces0.create'),
        
        attendanceList: route('humanresurces1.index'),
        attendanceCreate: route('humanresurces1.create'),
        
        leaveList: route('humanresurces5.index'),
        leaveCreate: route('humanresurces5.create'),
        
        loanList: route('humanresurces2.index'),
        
        payrollList: route('humanresurces3.index'),
        payslipList: route('humanresurces4.index'),
        
        configOrg: route('systemconfiguration11.index'),
        configPay: route('systemconfiguration12.index'),
        configLeave: route('systemconfiguration13.index'),
    };

    return (
        <HumanResourceLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Human Resources Hub
                </h2>
            }
        >
            <Head title="HR Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* Header / Navigation */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Workforce Overview</h3>
                            <p className="text-sm text-gray-500">Real-time HR statistics</p>
                        </div>
                        <Link href={route('dashboard')} className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            ← Back to Main Menu
                        </Link>
                    </div>

                    {/* Section 1: Workforce Management */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Workforce & Operations</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Total Employees"
                                value={totalEmployees}
                                unit={`(${activeEmployees} Active)`}
                                icon={faUsers}
                                iconBgColor="bg-blue-600"
                                linkHref={urls.employeeList}
                                linkText="Manage Staff"
                            />
                            <SummaryCard
                                title="Attendance Today"
                                value={presentToday}
                                unit="Present"
                                icon={faUserClock}
                                iconBgColor="bg-indigo-500"
                                linkHref={urls.attendanceList}
                                linkText="View Logs"
                            />
                            <SummaryCard
                                title="On Leave"
                                value={onLeave}
                                unit="Absent"
                                icon={faUmbrellaBeach}
                                iconBgColor="bg-purple-500"
                                linkHref={urls.leaveList}
                                linkText="Manage Leaves"
                            />
                        </div>
                    </section>

                    {/* Section 2: Payroll & Finance */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Payroll & Finance</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Active Loans"
                                value={pendingLoans}
                                unit="Running"
                                icon={faHandHoldingUsd}
                                iconBgColor="bg-orange-600"
                                linkHref={urls.loanList}
                                linkText="Loan Management"
                            />
                            <SummaryCard
                                title="Payroll"
                                description="Process salaries and taxes."
                                icon={faMoneyCheckAlt}
                                iconBgColor="bg-green-600"
                                linkHref={urls.payrollList}
                                linkText="Process Payroll"
                            />
                            <SummaryCard
                                title="Payslips"
                                description="Employee payslip history."
                                icon={faFileInvoiceDollar}
                                iconBgColor="bg-teal-600"
                                linkHref={urls.payslipList}
                                linkText="View Records"
                            />
                        </div>
                    </section>

                    {/* Section 3: Quick Actions (Optional) */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href={urls.employeeCreate} className="bg-white p-4 rounded-xl shadow border border-gray-200 hover:border-blue-500 transition flex items-center group">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition">
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </div>
                                <span className="font-medium text-gray-700">Add Employee</span>
                            </Link>
                            <Link href={urls.attendanceCreate} className="bg-white p-4 rounded-xl shadow border border-gray-200 hover:border-indigo-500 transition flex items-center group">
                                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                                    <FontAwesomeIcon icon={faUserClock} />
                                </div>
                                <span className="font-medium text-gray-700">Manual Clock-In</span>
                            </Link>
                            <Link href={urls.leaveCreate} className="bg-white p-4 rounded-xl shadow border border-gray-200 hover:border-purple-500 transition flex items-center group">
                                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3 group-hover:bg-purple-600 group-hover:text-white transition">
                                    <FontAwesomeIcon icon={faUmbrellaBeach} />
                                </div>
                                <span className="font-medium text-gray-700">New Leave Req.</span>
                            </Link>
                        </div>
                    </section>

                    {/* Section 4: Configuration */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">System Configuration</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <SummaryCard
                                title="Organization"
                                description="Depts, Positions, Banks."
                                icon={faBuilding}
                                iconBgColor="bg-gray-600"
                                linkHref={urls.configOrg}
                                linkText="Setup Org"
                            />
                            <SummaryCard
                                title="Payroll Setup"
                                description="Tax, NSSF, NHIF, Lenders."
                                icon={faCogs}
                                iconBgColor="bg-gray-700"
                                linkHref={urls.configPay}
                                linkText="Configure Pay"
                            />
                            <SummaryCard
                                title="Leave Setup"
                                description="Leave types and rules."
                                icon={faList}
                                iconBgColor="bg-gray-800"
                                linkHref={urls.configLeave}
                                linkText="Configure Leave"
                            />
                        </div>
                    </section>

                </div>
            </div>
        </HumanResourceLayout>
    );
}