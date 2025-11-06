import React, { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt, FaUsers, FaTag, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  // Package State
  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  });

  // Booking State
  const [bookingData, setBookingData] = useState({
    totalPrice: 0,
    packageDetails: null,
    buyer: null,
    persons: 1,
    date: "",
  });

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // Payment Gateway State
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Helper to calculate price per person
  const pricePerPerson = packageData.packageOffer
    ? packageData.packageDiscountPrice
    : packageData.packagePrice;

  // --- API CALLS & EFFECTS ---

  // Fetch Package Data
  const getPackageData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/package/get-package-data/${params?.packageId}`
      );
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDestination: data?.packageData?.packageDestination,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageImages: data?.packageData?.packageImages,
        });
      } else {
        setError(data?.message || "Failed to load package details.");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred while fetching package data.");
    } finally {
      setLoading(false);
    }
  };

  // Get Payment Gateway Token
  const getToken = async () => {
    try {
      const { data } = await axios.get(`/api/package/braintree/token`);
      setClientToken(data?.clientToken);
    } catch (error) {
      console.error("Error fetching client token:", error);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  // Handle Payment & Book Package
  const handleBookPackage = async () => {
    if (bookingData.persons <= 0 || !bookingData.date) {
      alert("Please select a date and ensure persons is at least 1.");
      return;
    }

    let nonce;
    try {
        setLoading(true);
        // Request payment method nonce from Braintree instance
        const { nonce: paymentNonce } = await instance.requestPaymentMethod();
        nonce = paymentNonce;
    } catch (error) {
        console.error("Payment method request failed:", error);
        alert("Payment method error. Please try again.");
        setLoading(false);
        return;
    }
    
    try {
        const res = await fetch(`/api/booking/book-package/${params?.packageId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...bookingData,
                paymentMethodNonce: nonce, 
            }),
        });
        const data = await res.json();
        
        if (data?.success) {
            alert(data?.message || "Booking successful! Redirecting to your bookings.");
            navigate(`/profile/${currentUser?.user_role === 1 ? "admin" : "user"}/bookings`);
        } else {
            alert(data?.message || "Booking failed. Please try again.");
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred during booking.");
    } finally {
        setLoading(false);
    }
  };

  // Fetch package data and set min date
  useEffect(() => {
    if (params?.packageId) {
      getPackageData();
    }
    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentDate(tomorrow.toISOString().substring(0, 10));
  }, [params?.packageId]);

  // Update booking data (total price, IDs) when packageData or persons change
  useEffect(() => {
    if (packageData && params?.packageId) {
      const calculatedPrice = pricePerPerson * bookingData.persons;
      setBookingData((prev) => ({
        ...prev,
        packageDetails: params?.packageId,
        buyer: currentUser?._id,
        totalPrice: calculatedPrice,
      }));
    }
  }, [packageData, bookingData.persons, params, pricePerPerson, currentUser?._id]);

  // Handle quantity change
  const handleQuantityChange = (change) => {
    setBookingData((prev) => {
      const newPersons = Math.max(1, prev.persons + change);
      if (newPersons > 10) return prev; // Limit max to 10
      return { ...prev, persons: newPersons };
    });
  };


  if (loading && packageData.packageName === "") {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center p-10 bg-white rounded-lg shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-xl font-medium text-gray-700">Loading package details...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center p-10 bg-white rounded-lg shadow-lg border border-red-400">
                <p className="text-2xl font-bold text-red-600 mb-2">Booking Error 🛑</p>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white p-6 sm:p-12 rounded-2xl shadow-2xl space-y-10">
        
        <h1 className="text-4xl font-extrabold text-gray-900 text-center pb-6 border-b-4 border-indigo-500/50">
          Confirm & Book Your Adventure 🗺️
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* --- LEFT COLUMN: User Information --- */}
          <div className="lg:col-span-1 p-6 border border-gray-200 rounded-xl shadow-md bg-white space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 border-b pb-3 mb-4">
              <FaUsers className="inline mr-2 text-indigo-500" /> Traveler Details
            </h2>
            <div className="space-y-5">
              
              {/* Username */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Username:</label>
                <input
                  type="text"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed focus:ring-0"
                  value={currentUser?.username || "N/A"}
                  disabled
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Email:</label>
                <input
                  type="email"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed focus:ring-0"
                  value={currentUser?.email || "N/A"}
                  disabled
                />
              </div>

              {/* Address (Critical for Payment) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">
                  Billing Address: <span className="text-red-500 text-xs font-semibold"> (Required for Braintree)</span>
                </label>
                <textarea
                  maxLength={200}
                  className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 resize-none cursor-not-allowed h-24 focus:ring-0"
                  value={currentUser?.address || "Please update your profile address."}
                  disabled
                />
              </div>
              
              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Phone:</label>
                <input
                  type="text"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed focus:ring-0"
                  value={currentUser?.phone || "N/A"}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Package Summary & Payment --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Package Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <FaMapMarkerAlt className="inline mr-2 text-indigo-500" /> Package Overview
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Image */}
                <img
                  className="w-full sm:w-32 h-32 object-cover rounded-lg shadow-md flex-shrink-0"
                  src={packageData.packageImages[0] || ""}
                  alt="Package"
                />
                
                {/* Details */}
                <div>
                  <p className="font-extrabold text-xl capitalize text-gray-900 mb-2">
                    {packageData.packageName}
                  </p>
                  <p className="flex items-center gap-2 text-md text-gray-600 mb-1">
                    <FaMapMarkerAlt className="text-indigo-500" /> **Destination:** {packageData.packageDestination}
                  </p>
                  <p className="flex items-center gap-2 text-md text-gray-600">
                    <FaClock className="text-indigo-500" /> **Duration:**
                    {+packageData.packageDays > 0 &&
                      ` ${packageData.packageDays} ${+packageData.packageDays > 1 ? "Days" : "Day"}`}
                    {+packageData.packageDays > 0 && +packageData.packageNights > 0 && " - "}
                    {+packageData.packageNights > 0 &&
                      `${packageData.packageNights} ${+packageData.packageNights > 1 ? "Nights" : "Night"}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Options and Price Calculation */}
            <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Date Selection */}
                <div className="flex flex-col p-4 bg-indigo-50 rounded-lg shadow-inner">
                  <label className="text-lg font-bold text-indigo-700 mb-2 flex items-center gap-2" htmlFor="date">
                    <FaCalendarAlt /> Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={currentDate}
                    id="date"
                    className="p-3 rounded-lg border-2 border-indigo-300 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition duration-200 text-gray-800"
                    onChange={(e) => {
                      setBookingData({ ...bookingData, date: e.target.value });
                    }}
                  />
                  {!bookingData.date && <p className="text-sm text-red-500 mt-1">Please select a departure date.</p>}
                </div>
                
                {/* Persons Counter */}
                <div className="flex flex-col p-4 bg-indigo-50 rounded-lg shadow-inner">
                    <label className="text-lg font-bold text-indigo-700 mb-2 flex items-center gap-2">
                        <FaUsers /> Number of Travelers
                    </label>
                    <div className="flex items-center justify-between bg-white rounded-xl border-2 border-indigo-300">
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xl py-2 px-6 rounded-l-lg transition duration-150 disabled:bg-gray-400"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={bookingData.persons <= 1}
                        >
                            −
                        </button>
                        <span className="text-3xl font-extrabold text-indigo-700 w-12 text-center">
                            {bookingData.persons}
                        </span>
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xl py-2 px-6 rounded-r-lg transition duration-150 disabled:bg-gray-400"
                            onClick={() => handleQuantityChange(1)}
                            disabled={bookingData.persons >= 10}
                        >
                            +
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">Max 10 persons per booking.</p>
                </div>
            </div>

            {/* Final Pricing */}
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 shadow-md">
                <p className="flex justify-between text-lg font-semibold text-gray-700 border-b pb-2 mb-2">
                    Price per Traveler:
                    <span className="font-extrabold text-gray-900">
                    {packageData.packageOffer ? (
                        <>
                        <span className="line-through text-red-500 text-base mr-2">${packageData.packagePrice}</span>
                        <span className="text-green-600">${pricePerPerson}</span>
                        <span className="text-sm ml-2 bg-green-500 text-white p-1 rounded-full font-bold">
                            {Math.floor(((+packageData.packagePrice - +packageData.packageDiscountPrice) / +packageData.packagePrice) * 100)}% OFF
                        </span>
                        </>
                    ) : (
                        <span className="text-green-600">${pricePerPerson}</span>
                    )}
                    </span>
                </p>
                <p className="flex justify-between text-3xl font-extrabold text-gray-900 pt-2">
                    Total Booking Cost:
                    <span className="text-4xl text-indigo-800">
                        ${bookingData.totalPrice.toFixed(2)}
                    </span>
                </p>
            </div>

            {/* Payment Integration (Braintree Drop-In) */}
            <div className="pt-4 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    <FaTag className="inline mr-2 text-indigo-700" /> Payment
                </h2>
                
                {clientToken ? (
                    <>
                      <div className="p-5 border border-gray-300 rounded-xl bg-gray-50 shadow-inner">
                        <DropIn
                          options={{
                            authorization: clientToken,
                            paypal: { flow: "vault" },
                          }}
                          onInstance={(instance) => setInstance(instance)}
                        />
                      </div>
                      
                      <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-lg border border-red-300">
                        **DEMO WARNING:** This payment system is for testing only. Do not use your actual credit card details.
                      </p>

                      <button
                        className="w-full p-4 rounded-xl bg-indigo-600 text-white font-extrabold text-xl shadow-lg transition duration-300 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        onClick={handleBookPackage}
                        disabled={loading || !instance || !currentUser?.address || !bookingData.date}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">...</svg>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Finalize Booking
                          </>
                        )}
                      </button>
                      
                      {(!currentUser?.address || !bookingData.date) && (
                          <p className="text-base text-red-600 mt-3 text-center font-bold">
                            Complete all required fields (Address in Profile & Departure Date) to enable booking.
                          </p>
                      )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">Loading secure payment portal...</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;