import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/admin/teachers");
        const data = await res.json();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await fetch(`/api/admin/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "teacher" }),
      });

      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  const handleGrantAccess = async (id) => {
    try {
      await fetch(`/api/admin/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "teacher", action: "grant" }),
      });

      setTeachers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "approved" } : t))
      );
    } catch (err) {
      console.error("Error granting access:", err);
    }
  };

  const handleRevokeAccess = async (id) => {
    try {
      await fetch(`/api/admin/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "teacher", action: "revoke" }),
      });

      setTeachers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "inactive" } : t))
      );
    } catch (err) {
      console.error("Error revoking access:", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  // Pagination logic
  const indexOfLast = currentPage * teachersPerPage;
  const indexOfFirst = indexOfLast - teachersPerPage;
  const currentTeachers = teachers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(teachers.length / teachersPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-600">
              Teacher Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all teacher accounts and permissions</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Stats Cards with Light Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Teachers Card */}
          <div className="bg-blue-50 rounded-xl p-5 shadow-lg border border-blue-100 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Teachers</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{teachers.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <span>All registered teachers</span>
            </div>
          </div>
          
          {/* Active Teachers Card */}
          <div className="bg-green-50 rounded-xl p-5 shadow-lg border border-green-100 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Teachers</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  {teachers.filter(t => t.status === "approved").length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <span>Currently teaching</span>
            </div>
          </div>
          
          {/* Inactive Teachers Card */}
          <div className="bg-amber-50 rounded-xl p-5 shadow-lg border border-amber-100 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-amber-600 text-sm font-medium">Inactive Teachers</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  {teachers.filter(t => t.status === "inactive").length}
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-amber-600">
              <span>Access revoked</span>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-blue-800">Teachers List</h2>
            <p className="text-sm text-gray-600 mt-1">All registered teachers in the system</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTeachers.length > 0 ? (
                  currentTeachers.map((t, index) => (
                    <tr key={t._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {(currentPage - 1) * teachersPerPage + (index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {t.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.status === "approved" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 border border-red-200 transition-colors duration-200"
                          onClick={() => handleDelete(t._id)}
                        >
                          Delete
                        </button>

                        {t.status === "approved" && (
                          <button
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md text-sm hover:bg-amber-200 border border-amber-200 transition-colors duration-200"
                            onClick={() => handleRevokeAccess(t._id)}
                          >
                            Revoke Access
                          </button>
                        )}

                        {t.status === "inactive" && (
                          <button
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 border border-blue-200 transition-colors duration-200"
                            onClick={() => handleGrantAccess(t._id)}
                          >
                            Grant Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="mx-auto flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No teachers found</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by adding a new teacher.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {teachers.length > teachersPerPage && (
            <div className="px-6 py-4 bg-blue-50/30 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-blue-700">
                Showing <span className="font-medium">{(currentPage - 1) * teachersPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * teachersPerPage, teachers.length)}
                </span>{" "}
                of <span className="font-medium">{teachers.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </button>
                <div className="hidden md:flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        currentPage === page
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "text-blue-700 bg-white border border-blue-200 hover:bg-blue-50"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}