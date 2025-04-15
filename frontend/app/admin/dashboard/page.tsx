'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Navbar from '@/components/AdminNavbar';
import NotificationBox from '@/components/NotificationBox';

interface DashboardData {
  adminCount: number;
  onlineAdminsCount: number;
  userCount: number;
  onlineUsersCount: number;
  subscriptionTypesCount: number;
  apiKeyCount: number;
  errorCount: number;
  subscriptionUserCount: number;
  apiKeyUsage: number;
  income: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show Notification function
  const showNotification = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Hide after 5 seconds
  };

  // Error handling function
  const showError = (msg: string) => {
    showNotification({ type: 'error', message: msg });
  };

  // Fetch Dashboard data
  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/auth/admin/dashboard');
      setData(res.data.data);
    } catch (err) {
      showError('Failed to load admin dashboard.');
    }
  };

  useEffect(() => {
    fetchDashboard();

    const intervalId = setInterval(() => {
      fetchDashboard();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

        {notification && (
          <div className="fixed bottom-5 right-5 z-50">
            <NotificationBox type={notification.type} message={notification.message} />
          </div>
        )}

        {data && (
          <>
            {/* Circular Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-3">Admins Online</h2>
                <div className="w-40 h-40">
                  <CircularProgressbar
                    value={(data.onlineAdminsCount / data.adminCount) * 100}
                    text={`${data.onlineAdminsCount}/${data.adminCount}`}
                    styles={buildStyles({
                      textColor: '#000',
                      pathColor: '#3b82f6',
                      trailColor: '#d1d5db',
                    })}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-3">Users Online</h2>
                <div className="w-40 h-40">
                  <CircularProgressbar
                    value={(data.onlineUsersCount / data.userCount) * 100}
                    text={`${data.onlineUsersCount}/${data.userCount}`}
                    styles={buildStyles({
                      textColor: '#000',
                      pathColor: '#10b981',
                      trailColor: '#d1d5db',
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">Subscription Types</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{data.subscriptionTypesCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">API Keys Total</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{data.apiKeyCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">API Key Usage</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{data.apiKeyUsage}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">User Subscriptions</h3>
                <p className="text-3xl font-bold text-yellow-500 mt-2">{data.subscriptionUserCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">Errors Logged</h3>
                <p className="text-3xl font-bold text-red-500 mt-2">{data.errorCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-sm font-semibold text-gray-500">Total Income</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">${data.income.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
