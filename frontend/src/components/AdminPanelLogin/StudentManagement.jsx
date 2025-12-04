import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetch(`/api/admin/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student" }),
      });

      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  const handleToggleAccess = async (id, action) => {
    try {
      await fetch(`/api/admin/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student", action }),
      });

      setStudents((prev) =>
        prev.map((s) =>
          s._id === id
            ? { ...s, status: action === "grant" ? "approved" : "inactive" }
            : s
        )
      );
    } catch (err) {
      console.error("Error toggling access:", err);
    }
  };

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section - Updated to match Teacher Management */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all student accounts and permissions</p>
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

        {/* Statistics Cards with Different Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Students Card */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 shadow-lg border border-purple-200 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{students.length}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-purple-600">
              <span>All registered students</span>
            </div>
          </div>
          
          {/* Active Students Card */}
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-5 shadow-lg border border-teal-200 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-teal-600 text-sm font-medium">Active Students</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  {students.filter(s => s.status === "approved").length}
                </h3>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-teal-600">
              <span>Currently enrolled</span>
            </div>
          </div>
          
          {/* Inactive Students Card */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 shadow-lg border border-amber-200 transition-all hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-amber-600 text-sm font-medium">Inactive Students</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  {students.filter(s => s.status === "inactive").length}
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

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-purple-800">Students List</h2>
            <p className="text-sm text-purple-600 mt-1">All registered students in the system</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length > 0 ? (
                  currentStudents.map((s, index) => (
                    <tr key={s._id} className="hover:bg-purple-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {(currentPage - 1) * studentsPerPage + (index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === "approved" 
                            ? "bg-teal-100 text-teal-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {s.status === "approved" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 border border-red-200 transition-colors duration-200"
                          onClick={() => handleDelete(s._id)}
                        >
                          Delete
                        </button>

                        {s.status === "approved" ? (
                          <button
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md text-sm hover:bg-amber-200 border border-amber-200 transition-colors duration-200"
                            onClick={() => handleToggleAccess(s._id, "revoke")}
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-md text-sm hover:bg-teal-200 border border-teal-200 transition-colors duration-200"
                            onClick={() => handleToggleAccess(s._id, "grant")}
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No students found</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by adding a new student.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {students.length > studentsPerPage && (
            <div className="px-6 py-4 bg-purple-50/30 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-purple-700">
                Showing <span className="font-medium">{(currentPage - 1) * studentsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * studentsPerPage, students.length)}
                </span>{" "}
                of <span className="font-medium">{students.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                          ? "bg-purple-600 text-white border border-purple-600"
                          : "text-purple-700 bg-white border border-purple-200 hover:bg-purple-50"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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