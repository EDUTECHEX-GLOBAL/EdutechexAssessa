import { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ FIXED: Consistent token retrieval
  const getToken = () => {
    // Your AdminLogin stores as "token", so use that consistently
    return localStorage.getItem('token');
  };

  // ✅ FIXED: Check if admin is authenticated
  const isAdminAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
      // Simple JWT structure check
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      return false;
    }
  };

  // ✅ FIXED: Fetch notifications with consistent token
  const fetchNotifications = async () => {
    // Don't fetch if not authenticated
    if (!isAdminAuthenticated()) {
      console.log('🔐 Not authenticated as admin, skipping notification fetch');
      setAuthError(true);
      return;
    }

    try {
      setLoading(true);
      setAuthError(false);
      const token = getToken();
      
      console.log('🔐 Fetching notifications with token:', token ? token.substring(0, 20) + '...' : 'No token');

      const response = await fetch('/api/admin/notifications?limit=6', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔐 Response status:', response.status);
      
      if (response.status === 401) {
        setAuthError(true);
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔐 Notifications data:', data);
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        setAuthError(true);
        console.log('🔐 Auth failed in notification fetch');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Fetch unread count with consistent token
  const fetchUnreadCount = async () => {
    if (!isAdminAuthenticated()) {
      console.log('🔐 Not authenticated, skipping unread count fetch');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('/api/admin/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        setAuthError(true);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
          setAuthError(false);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      if (error.message.includes('401')) {
        setAuthError(true);
      }
    }
  };

  // ✅ FIXED: Mark as read with consistent token
  const markAsRead = async (notificationId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAdminAuthenticated()) {
      console.log('🔐 Not authenticated, cannot mark as read');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ FIXED: Mark all as read with consistent token
  const markAllAsRead = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAdminAuthenticated()) {
      console.log('🔐 Not authenticated, cannot mark all as read');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
          );
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ✅ FIXED: Delete notification with consistent token
  const deleteNotification = async (notificationId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAdminAuthenticated()) {
      console.log('🔐 Not authenticated, cannot delete notification');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification link based on type
  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'login_request':
        return '/admin-dashboard/approvals';
      case 'assessment_uploaded':
        if (notification.data?.assessmentType === 'sat') {
          return '/admin-dashboard/sat-generated-assessments';
        }
        return '/admin-dashboard/standard-generated-assessments';
      case 'assessment_taken':
        if (notification.data?.assessmentType === 'sat') {
          return '/admin-dashboard/attempts/sat';
        }
        return '/admin-dashboard/attempts/standard';
      case 'approval_approved':
      case 'approval_rejected':
        return '/admin-dashboard/approvals';
      default:
        return '/admin-dashboard';
    }
  };

  // Get notification icon and color
  const getNotificationConfig = (type) => {
    const config = {
      login_request: { icon: '👤', color: 'text-blue-500', bgColor: 'bg-blue-100' },
      assessment_uploaded: { icon: '📝', color: 'text-green-500', bgColor: 'bg-green-100' },
      assessment_taken: { icon: '✅', color: 'text-purple-500', bgColor: 'bg-purple-100' },
      approval_approved: { icon: '👍', color: 'text-green-500', bgColor: 'bg-green-100' },
      approval_rejected: { icon: '👎', color: 'text-red-500', bgColor: 'bg-red-100' },
      system_alert: { icon: '⚠️', color: 'text-orange-500', bgColor: 'bg-orange-100' },
    };
    
    return config[type] || { icon: '🔔', color: 'text-gray-500', bgColor: 'bg-gray-100' };
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ FIXED: Only fetch if authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Show disabled bell if not authenticated
  if (authError || !isAdminAuthenticated()) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          className="relative p-2 text-gray-400 cursor-not-allowed"
          title="Please log in as admin to view notifications"
          disabled
        >
          <FaBell className="text-2xl" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => {
          if (!isAdminAuthenticated()) {
            console.log('🔐 Please log in as admin to view notifications');
            setAuthError(true);
            return;
          }
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors group"
        title="Notifications"
      >
        <FaBell className="text-2xl group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notifications */}
      {isOpen && isAdminAuthenticated() && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Mark all as read"
                >
                  <FaCheckDouble className="text-xs" />
                  <span>Mark all</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                return (
                  <div
                    key={notification._id}
                    className={`border-b border-gray-100 last:border-b-0 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification._id, { preventDefault: () => {} });
                        }
                        setIsOpen(false);
                      }}
                      className="block p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                          <span className="text-lg">{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-semibold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => markAsRead(notification._id, e)}
                                  className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <FaCheckDouble className="text-xs" />
                                </button>
                              )}
                              <button
                                onClick={(e) => deleteNotification(notification._id, e)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                title="Delete notification"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <Link
                to="/admin-dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}