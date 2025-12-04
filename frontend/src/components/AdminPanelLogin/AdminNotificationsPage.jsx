import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, FaCheckDouble, FaTrash, FaArrowLeft, FaCheck,
  FaSearch, FaUserPlus, FaFileUpload, FaClipboardCheck, FaRegClock, FaEye
} from 'react-icons/fa';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`/api/admin/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // Filtering and search
  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !n.isRead) || 
      (filter === 'read' && n.isRead);
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  // Icon config
  const getNotificationConfig = (type) => {
    const config = {
      login_request: { icon: FaUserPlus, color: 'text-pink-600', bgColor: 'bg-pink-100', borderColor: 'border-pink-200', label: 'Registration' },
      assessment_uploaded: { icon: FaFileUpload, color: 'text-emerald-600', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200', label: 'Assessment' },
      assessment_taken: { icon: FaClipboardCheck, color: 'text-violet-600', bgColor: 'bg-violet-100', borderColor: 'border-violet-200', label: 'Attempt' },
    };
    return config[type] || { icon: FaBell, color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', label: 'General' };
  };

  // Notification link
  const getNotificationLink = (n) => {
    switch (n.type) {
      case 'login_request': return '/admin-dashboard/approvals';
      case 'assessment_uploaded': return n.data?.assessmentType === 'sat'
        ? '/admin-dashboard/sat-generated-assessments'
        : '/admin-dashboard/standard-generated-assessments';
      default: return '/admin-dashboard';
    }
  };

  if (authError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded shadow">
        <FaBell className="mx-auto text-2xl text-gray-400 mb-4"/>
        <h2 className="font-semibold mb-2">Access Required</h2>
        <p className="mb-4">Please log in to view notifications</p>
        <button onClick={() => navigate('/admin-login')} className="px-6 py-2 bg-blue-600 text-white rounded">Go to Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between">
        <button onClick={() => navigate('/admin-dashboard')} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
          <FaArrowLeft /> <span>Back to Dashboard</span>
        </button>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium">
            <FaCheckDouble /> <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Search notifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"/>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-md capitalize ${filter===f?'bg-white shadow text-gray-900':'text-gray-600 hover:text-gray-800'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-6 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white p-4 rounded border border-gray-200 animate-pulse flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-gray-200">
            <FaBell className="mx-auto text-3xl text-gray-300 mb-2"/>
            <h3 className="text-lg font-medium mb-1">No notifications</h3>
            <p className="text-gray-600">{searchTerm || filter !== 'all' ? 'No notifications match your search' : "You're all caught up!"}</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const config = getNotificationConfig(n.type);
            const Icon = config.icon;
            return (
              <div key={n._id} className={`bg-white p-4 rounded border transition hover:shadow ${!n.isRead?'border-pink-200 bg-pink-50':'border-gray-200'}`}>
                <div className="flex space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                    <Icon className={`${config.color} text-sm`} />
                    {!n.isRead && <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full border border-white"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${config.bgColor} ${config.color} border ${config.borderColor}`}>{config.label}</span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1"><FaRegClock className="text-xs"/><span>{getTimeAgo(n.createdAt)}</span></span>
                    </div>
                    <h3 className={`font-semibold ${!n.isRead?'text-gray-900':'text-gray-700'}`}>{n.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                    <div className="flex space-x-4 text-sm font-medium">
                      <Link to={getNotificationLink(n)} className="flex items-center space-x-1 text-gray-700 hover:text-gray-900" onClick={() => !n.isRead && markAsRead(n._id)}>
                        <FaEye className="text-xs"/> <span>View</span>
                      </Link>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700">
                          <FaCheck className="text-xs"/> <span>Mark read</span>
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n._id)} className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                        <FaTrash className="text-xs"/> <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
