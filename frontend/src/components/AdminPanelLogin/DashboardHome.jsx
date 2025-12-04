import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaClipboardList, FaUserClock, FaTimes, FaBook, FaRocket } from 'react-icons/fa';
import { MdAdminPanelSettings, MdAssignment } from 'react-icons/md';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function DashboardHome() {
  const [approvalCounts, setApprovalCounts] = useState({
    total: 0,
    teachers: 0,
    students: 0,
  });

  const [stats, setStats] = useState({
    teachers: { total: 0, active: 0, inactive: 0 },
    users: { total: 0, active: 0, pending: 0 },
  });

  // showModal (boolean) + modalType ('generated' | 'attempts')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("generated");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        const data = await response.json();
        console.log("📊 API /dashboard/stats Response:", data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    const fetchApprovalCounts = async () => {
      try {
        const response = await fetch("/api/admin/approvals/counts");
        const data = await response.json();
        setApprovalCounts(data);
      } catch (error) {
        console.error("Error fetching approval counts:", error);
      }
    };

    fetchStats();
    fetchApprovalCounts();
  }, []);

  // helper to open modal for specific context
  const openModal = (type = "generated") => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <>
      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Generated Assessments Card */}
        <div
          className="bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
          onClick={() => openModal("generated")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Generated Assessments</h3>
              {/* <p className="text-2xl">{stats?.teachers?.assessmentsGenerated ?? 0}</p> */}
            </div>
            <MdAdminPanelSettings className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Active Teachers: {stats?.teachers?.active ?? 0}</p>
              <p>Inactive Teachers: {stats?.teachers?.inactive ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Student Attempts Card */}
        <div
          className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
          onClick={() => openModal("attempts")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Student Attempts</h3>
              {/* <p className="text-2xl">{stats?.users?.attempts ?? 0}</p> */}
              <p className="text-sm mt-2">Total attempts across all students</p>
            </div>
            <FaUsers className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Active Students: {stats?.users?.active ?? 0}</p>
              <p>Pending Students: {stats?.users?.pending ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Analytics</h3>
              <p className="text-2xl">89%</p>
              <p className="text-sm mt-2">Engagement Rate</p>
            </div>
            <FaClipboardList className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Assessments: 250</p>
              <p>Avg. Score: 78%</p>
            </div>
            <Link 
              to="/admin/analytics" 
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
            >
              View
            </Link>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Pending Approvals</h3>
              <p className="text-2xl">{approvalCounts?.total ?? 0}</p>
              <p className="text-sm mt-2">New requests</p>
            </div>
            <FaUserClock className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Teachers: {approvalCounts?.teachers ?? 0}</p>
              <p>Students: {approvalCounts?.students ?? 0}</p>
            </div>
            <Link 
              to="/admin-dashboard/approvals" 
              className="bg-white/20 hover:bg-white/30 px-3 py-3 rounded-full"
            >
              Review
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs & Recent Activities Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Key Performance Indicators (KPIs) & Recent Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student Engagement Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-blue-700 font-bold mb-4">Student Engagement</h3>
            <div className="flex items-center justify-center">
              <div className="w-32 h-32">
                <CircularProgressbar
                  value={95}
                  text={`95%`}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: '#3B82F6',
                    textColor: '#1E293B',
                    trailColor: '#E5E7EB',
                  })}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">Average attendance rate: 95%</p>
            <p className="text-sm text-gray-500 text-center">Average participation rate: 90%</p>
          </div>

          {/* Recent Assessments Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-violet-900 font-bold mb-4 flex items-center justify-between">
              Recent Assessments
              <span className="text-blue-600 text-sm">5 New</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">AI Math Quiz</p>
                  <p className="text-sm text-gray-500">Generated 2 hours ago</p>
                </div>
                <button className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200">
                  View
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Science Test</p>
                  <p className="text-sm text-gray-500">Teacher-Written | 1 day ago</p>
                </div>
                <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                  Analyze
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-green-600 font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <FaUsers className="text-2xl text-yellow-500 mb-2" />
                <span className="text-sm font-medium">Manage Teachers</span>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <MdAssignment className="text-2xl text-purple-600 mb-2" />
                <span className="text-sm font-medium">Review Submissions</span>
              </button>
              <button className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                <FaClipboardList className="text-2xl text-cyan-600 mb-2" />
                <span className="text-sm font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 👇 Modal (shared for both Generated Assessments and Student Attempts) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div
              className={
                modalType === "generated"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white"
                  : "bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white"
              }
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {modalType === "generated" ? "Assessment Types" : "Student Attempts"}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <p className="mt-2 opacity-90">
                {modalType === "generated"
                  ? "Select the type of assessments you want to view"
                  : "Select which attempted assessments you want to view"}
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {modalType === "generated" ? (
                  <>
                    {/* SAT Generated */}
                    <Link
                      to="/admin-dashboard/sat-generated-assessments"
                      className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group"
                      onClick={() => setShowModal(false)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-200 transition-colors">
                        <FaRocket className="text-xl text-indigo-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">SAT Assessments</h3>
                        <p className="text-sm text-gray-500 mt-1">Access specialized SAT preparation tests</p>
                      </div>
                      <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>

                    {/* Standard Generated */}
                    <Link
                      to="/admin-dashboard/standard-generated-assessments"
                      className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group"
                      onClick={() => setShowModal(false)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                        <FaBook className="text-xl text-purple-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">Standard Assessments</h3>
                        <p className="text-sm text-gray-500 mt-1">View and manage regular curriculum assessments</p>
                      </div>
                      <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* SAT Attempted */}
                    <Link
                      to="/admin-dashboard/attempts/sat"
                      className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all group"
                      onClick={() => setShowModal(false)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-rose-200 transition-colors">
                        <FaRocket className="text-xl text-rose-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">Attempted SAT Assessments</h3>
                        <p className="text-sm text-gray-500 mt-1">View all student SAT attempts</p>
                      </div>
                      <div className="text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>

                    {/* Standard Attempted */}
                    <Link
                      to="/admin-dashboard/attempts/standard"
                      className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-pink-400 hover:shadow-md transition-all group"
                      onClick={() => setShowModal(false)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-pink-200 transition-colors">
                        <FaBook className="text-xl text-pink-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">Attempted Standard Assessments</h3>
                        <p className="text-sm text-gray-500 mt-1">View all student standard attempts</p>
                      </div>
                      <div className="text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
