import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCheck, FaUserTimes, FaEnvelope, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [filter, setFilter] = useState("pending");

  const navigate = useNavigate();
  const onBackHome = () => {
    navigate("/admin-dashboard");
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/admin/approvals?status=${filter}`);
        const data = await response.json();
        if (response.ok) {
          setRequests(data);
        } else {
          toast.error(data.message || "Failed to fetch requests");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to fetch requests");
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  const handleApprove = async (requestId, role) => {
    try {
      const response = await fetch(`/api/admin/approvals/${requestId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Request approved successfully");
        setRequests((prev) => prev.filter((req) => req._id !== requestId));
      } else {
        toast.error(data.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = (request) => {
    setCurrentRequest(request);
    setShowRejectionModal(true);
  };

  const confirmRejection = async () => {
    try {
      const response = await fetch(
        `/api/admin/approvals/${currentRequest._id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectionReason,
            role: currentRequest.role,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Request rejected successfully");
        setRequests((prev) =>
          prev.filter((req) => req._id !== currentRequest._id)
        );
        setShowRejectionModal(false);
        setRejectionReason("");
      } else {
        toast.error(data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((req) => req.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <button
        onClick={onBackHome}
        className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium pb-5"
      >
        ← Back Home
      </button>
      <div className="text-purple-700 flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">User Approval Requests</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                filter === status
                  ? {
                      pending: "bg-blue-100 text-blue-800",
                      approved: "bg-green-100 text-green-800",
                      rejected: "bg-red-100 text-red-800",
                      all: "bg-purple-100 text-purple-800",
                    }[status]
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaClock className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No {filter} requests found</p>
        </div>
      ) : (
         <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`
                border rounded-xl p-5 transition-all hover:shadow-md
                ${request.status === "approved" ? 
                  "border-green-200 bg-green-50" : 
                  request.status === "rejected" ? 
                  "border-red-200 bg-red-50" : 
                  "border-blue-200 bg-blue-50"}
              `}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`
                      p-3 rounded-full
                      ${request.status === "approved" ? 
                        "bg-green-100 text-green-600" : 
                        request.status === "rejected" ? 
                        "bg-red-100 text-red-600" : 
                        "bg-blue-100 text-blue-600"}
                    `}>
                      <FaEnvelope />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <span className={`
                          px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${request.status === "approved" ? 
                            "bg-green-200 text-green-800" : 
                            request.status === "rejected" ? 
                            "bg-red-200 text-red-800" : 
                            "bg-blue-200 text-blue-800"}
                        `}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-16">
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
                      <p className="text-sm font-medium capitalize mt-1">{request.role}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</p>
                      <p className="text-sm font-medium mt-1">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {request.status !== "pending" && (
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {request.status === "approved" ? "Approved" : "Rejected"} On
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {new Date(request.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.status === "rejected" && request.rejectionReason && (
                    <div className="mt-3 bg-white p-3 rounded-lg shadow-xs ml-16">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</p>
                      <p className="text-sm mt-1">{request.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex md:flex-col gap-6 pt-3">
                    <button
                      onClick={() => handleApprove(request._id, request.role)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <FaUserCheck />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <FaUserTimes />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Request</h3>
            <p className="mb-2">
              Rejecting request for {currentRequest?.name} ({currentRequest?.email})
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter reason for rejection..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalRequests;
