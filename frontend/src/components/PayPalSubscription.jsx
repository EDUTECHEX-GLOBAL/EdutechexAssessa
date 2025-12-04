import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const PayPalSubscription = ({ planId, planName, price, onSuccess, onError, onCancel, onPaymentStart }) => {
  const paypalRef = useRef();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error("❌ Missing PayPal Client ID in .env");
      toast.error("PayPal not configured. Please contact support.");
      return;
    }

    // Check if PayPal SDK already exists
    const existingScript = document.querySelector(`script[src*="www.paypal.com/sdk/js"]`);

    const loadPayPalSDK = () => {
      if (window.paypal) {
        console.log("✅ PayPal SDK already loaded");
        setPaypalLoaded(true);
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => {
        console.log("✅ PayPal SDK loaded successfully");
        setPaypalLoaded(true);
        setScriptLoaded(true);
      };
      script.onerror = (error) => {
        console.error("❌ Failed to load PayPal SDK:", error);
        toast.error("Failed to load payment system. Please refresh the page.");
        setScriptLoaded(true);
      };
      document.body.appendChild(script);
    };

    if (!existingScript) {
      console.log("🔄 Loading PayPal SDK...");
      loadPayPalSDK();
    } else if (window.paypal) {
      console.log("✅ PayPal SDK already exists");
      setPaypalLoaded(true);
      setScriptLoaded(true);
    } else {
      console.log("🔄 Waiting for existing PayPal SDK to load...");
      existingScript.addEventListener("load", () => {
        setPaypalLoaded(true);
        setScriptLoaded(true);
      });
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up PayPal buttons");
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
    };
  }, []);

  // Render PayPal buttons when SDK is loaded
  useEffect(() => {
    if (!paypalLoaded || !scriptLoaded) {
      console.log("⏳ Waiting for PayPal SDK to load...");
      return;
    }

    renderPayPalButton();
  }, [paypalLoaded, scriptLoaded, planId, price]);

  const renderPayPalButton = () => {
    if (!window.paypal) {
      console.error("❌ PayPal SDK not available");
      return;
    }

    try {
      // Clear previous buttons
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }

      console.log("🔄 Rendering PayPal button for:", planName, price);

      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
            height: 45,
            tagline: false
          },
          createSubscription: async (data, actions) => {
            try {
              console.log("🔄 Creating subscription for plan:", planId, planName, price);
              
              // ✅ Call payment start callback
              if (onPaymentStart) {
                onPaymentStart();
              }
              
              const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
              const response = await fetch("/api/subscription/create-paypal-subscription", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ planId, planName, price }),
              });

              const subscriptionData = await response.json();
              
              if (!response.ok) {
                throw new Error(subscriptionData.message || "Failed to create subscription");
              }

              if (!subscriptionData.id) {
                throw new Error("No subscription ID returned from server");
              }

              console.log("✅ Subscription created with ID:", subscriptionData.id);
              return subscriptionData.id;

            } catch (error) {
              console.error("❌ Error creating PayPal subscription:", error);
              toast.error(error.message || "Failed to create subscription.");
              onError && onError(error);
              throw error;
            }
          },
          onApprove: async (data, actions) => {
            try {
              console.log("✅ Subscription approved:", data.subscriptionID);
              console.log("📋 Approval details:", data);
              
              // Show loading state
              toast.info("Activating your subscription...", { autoClose: false });
              
              const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
              const response = await fetch("/api/subscription/capture-paypal-subscription", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subscriptionID: data.subscriptionID }),
              });

              const captureData = await response.json();
              
              if (response.ok) {
                console.log("🎉 Subscription activated successfully!", captureData);
                toast.dismiss(); // Remove loading toast
                onSuccess && onSuccess(captureData);
              } else {
                throw new Error(captureData.message || "Failed to activate subscription");
              }
            } catch (error) {
              console.error("❌ Error capturing PayPal subscription:", error);
              toast.dismiss(); // Remove loading toast
              toast.error(error.message || "Failed to activate subscription. Please contact support.");
              onError && onError(error);
            }
          },
          onError: (err) => {
            console.error("❌ PayPal Button Error:", err);
            toast.error("Payment failed. Please try again.");
            onError && onError(err);
          },
          onCancel: (data) => {
            console.log("ℹ️ Payment cancelled by user");
            toast.info("Payment cancelled");
            onCancel && onCancel(data);
          },
        })
        .render(paypalRef.current)
        .catch(err => {
          console.error("❌ Error rendering PayPal button:", err);
          toast.error("Payment temporarily unavailable.");
        });

    } catch (error) {
      console.error("❌ Error in renderPayPalButton:", error);
      toast.error("Payment temporarily unavailable.");
    }
  };

  return (
    <div className="w-full">
      {!scriptLoaded && (
        <div className="text-center py-2 text-gray-500">Loading payment options...</div>
      )}
      <div ref={paypalRef} className="paypal-button-container"></div>
    </div>
  );
};

export default PayPalSubscription;