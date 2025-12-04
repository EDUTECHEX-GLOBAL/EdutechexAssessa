import { useState, useEffect } from "react";
import { FaCrown, FaStar, FaUser } from "react-icons/fa";

const SubscriptionBadge = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch("/api/subscription/my-subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  const isActive = subscriptionData?.subscription?.status === "active";
  const planName = subscriptionData?.subscription?.planId?.name || "Free";
  
  if (!isActive || planName === "Free") {
    return null; // Don't show badge for free users
  }

  const getBadgeStyles = () => {
    switch (planName) {
      case "Premium":
        return {
          bg: "bg-gradient-to-r from-purple-500 to-pink-500",
          text: "text-white",
          icon: <FaCrown className="w-3 h-3" />,
          label: "Premium"
        };
      case "Basic":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500", 
          text: "text-white",
          icon: <FaStar className="w-3 h-3" />,
          label: "Basic"
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-white", 
          icon: <FaUser className="w-3 h-3" />,
          label: planName
        };
    }
  };

  const badgeStyles = getBadgeStyles();

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badgeStyles.bg} ${badgeStyles.text}`}>
      {badgeStyles.icon}
      <span>{badgeStyles.label}</span>
    </div>
  );
};

export default SubscriptionBadge;