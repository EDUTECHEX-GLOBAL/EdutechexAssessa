import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaCrown, FaStar, FaRocket, FaSpinner } from "react-icons/fa";
import PayPalSubscription from "../PayPalSubscription";

const SubscriptionWall = ({ onUpgrade, onCancel, attemptsUsed }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  const fetchSubscriptionPlans = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch("/api/subscription/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPlans(data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPROVED: Handle PayPal success with proper feedback
  const handlePayPalSuccess = async (data) => {
    console.log("🎉 PayPal subscription successful:", data);
    setProcessingPayment(false);
    setPaymentSuccess(true);
    
    // Show success message
    toast.success(`🎉 ${data.plan.name} subscription activated successfully!`, {
      autoClose: 5000,
      position: "top-center"
    });
    
    // Wait a moment to show success, then close and reload
    setTimeout(() => {
      onCancel();
      // Reload to refresh subscription status
      window.location.reload();
    }, 3000);
  };

  // ✅ IMPROVED: Handle PayPal errors
  const handlePayPalError = (err) => {
    console.error("❌ PayPal Error:", err);
    setProcessingPayment(false);
    toast.error("Payment failed. Please try again.", {
      autoClose: 5000,
      position: "top-center"
    });
  };

  // ✅ IMPROVED: Handle PayPal cancellation
  const handlePayPalCancel = () => {
    console.log("Payment cancelled by user");
    setProcessingPayment(false);
    toast.info("Payment cancelled", {
      autoClose: 3000,
      position: "top-center"
    });
  };

  // ✅ NEW: Handle payment start
  const handlePaymentStart = () => {
    setProcessingPayment(true);
  };

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId);
    onUpgrade(planId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading plans...</p>
        </div>
      </div>
    );
  }

  // ✅ SUCCESS STATE
  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscription Activated!</h3>
          <p className="text-gray-600 mb-6">
            Your subscription has been successfully activated. You now have unlimited access to all assessments.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">🎉 Welcome to {selectedPlan?.name || 'Premium'} Plan!</p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade Your Plan
            </h2>
            <p className="text-gray-600">
              You've used{" "}
              <span className="font-semibold text-orange-600">
                {attemptsUsed} of 2
              </span>{" "}
              free assessments this month
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={processingPayment}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Processing Overlay */}
        {processingPayment && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we activate your subscription...</p>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`relative rounded-lg border-2 p-5 transition-all ${
                    plan.name === "Premium"
                      ? "border-purple-500 bg-purple-50 shadow-sm"
                      : plan.name === "Basic"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white"
                  } ${plan.name === "Premium" ? "scale-105" : "hover:scale-105"}`}
                >
                  {/* Badges */}
                  {plan.name === "Premium" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FaCrown className="text-yellow-300" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  {plan.name === "Basic" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FaRocket />
                        GREAT VALUE
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {plan.name === "Premium" && (
                        <FaCrown className="text-purple-500" />
                      )}
                      {plan.name === "Basic" && (
                        <FaStar className="text-blue-500" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="mb-3">
                      <span className="text-3xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 text-sm ml-1">
                          /{plan.billingCycle}
                        </span>
                      )}
                    </div>

                    {plan.name === "Free" && (
                      <div className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                        Current Plan
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-5">
                    <li className="flex items-center text-sm">
                      <FaCheck
                        className={`mr-2 text-sm ${
                          plan.name === "Premium"
                            ? "text-purple-500"
                            : plan.name === "Basic"
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      />
                      <span className="text-gray-700">
                        {plan.features.maxRealModeAttempts === -1
                          ? "Unlimited Real Mode"
                          : `${plan.features.maxRealModeAttempts} Real Mode`}
                      </span>
                    </li>

                    <li className="flex items-center text-sm">
                      <FaCheck
                        className={`mr-2 text-sm ${
                          plan.name === "Premium"
                            ? "text-purple-500"
                            : plan.name === "Basic"
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      />
                      <span className="text-gray-700">Unlimited Test Mode</span>
                    </li>

                    <li className="flex items-center text-sm">
                      <FaCheck
                        className={`mr-2 text-sm ${
                          plan.name === "Premium"
                            ? "text-purple-500"
                            : plan.name === "Basic"
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      />
                      <span className="text-gray-700">SAT Access</span>
                    </li>

                    {plan.features.advancedAnalytics && (
                      <li className="flex items-center text-sm">
                        <FaCheck
                          className={`mr-2 text-sm ${
                            plan.name === "Premium"
                              ? "text-purple-500"
                              : "text-blue-500"
                          }`}
                        />
                        <span className="text-gray-700">
                          Advanced Analytics
                        </span>
                      </li>
                    )}
                    {plan.features.prioritySupport && (
                      <li className="flex items-center text-sm">
                        <FaCheck className="text-purple-500 mr-2 text-sm" />
                        <span className="text-gray-700">Priority Support</span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan._id)}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      plan.name === "Free"
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : plan.name === "Premium"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={plan.name === "Free" || processingPayment}
                  >
                    {plan.name === "Free"
                      ? "Current Plan"
                      : plan.name === "Premium"
                      ? "Go Premium"
                      : "Get Started"}
                  </button>

                  {/* PayPal Integration */}
                  {plan.price > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-gray-500 text-center mb-2">
                        Secure payment via PayPal
                      </div>
                      <PayPalSubscription
                        planId={plan._id}
                        planName={plan.name}
                        price={plan.price}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                        onCancel={handlePayPalCancel}
                        onPaymentStart={handlePaymentStart}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Continue with free Test Mode anytime
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            disabled={processingPayment}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionWall;