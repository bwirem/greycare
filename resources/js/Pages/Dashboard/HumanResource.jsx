import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserClock, faUserTie } from '@fortawesome/free-solid-svg-icons';

const HRCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 flex items-center">
        <div className={`p-4 rounded-full ${color} text-white`}>
            <FontAwesomeIcon icon={icon} className="h-6 w-6" />
        </div>
        <div className="ml-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
    </div>
);

export default function HumanResource({ auth, stats }) {
    const { totalEmployees = 0, onLeave = 0 } = stats || {};

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800">Human Resources</h2>}>
            <Head title="HR Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Main Menu</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <HRCard 
                            title="Total Employees" 
                            value={totalEmployees} 
                            icon={faUsers} 
                            color="bg-purple-600" 
                        />
                        <HRCard 
                            title="On Leave Today" 
                            value={onLeave} 
                            icon={faUserClock} 
                            color="bg-orange-500" 
                        />
                        <HRCard 
                            title="Active Users" 
                            value="-" 
                            icon={faUserTie} 
                            color="bg-blue-500" 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}