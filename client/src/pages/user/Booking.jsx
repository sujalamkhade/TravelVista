import React, { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa"; // Added FaUsers for persons
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
    packageDescription: "",
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
    date: "", // Changed to empty string to be explicit about required input
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
    
  // Fetch Package Data
  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/package/get-package-data/${params?.packageId}`
      );
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageImages: data?.packageData?.packageImages,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch package data.");
      setLoading(false);
    }
  };

  // Get Payment Gateway Token
  const getToken = async () => {
    try {
      const { data } = await axios.get(`/api/package/braintree/token`);
      setClientToken(data?.clientToken);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getToken();
  }, []); // Run once on component mount

  // Handle Payment & Book Package
  const handleBookPackage = async () => {
    if (bookingData.persons <= 0 || !bookingData.date) {
      alert("Please select a date and ensure persons is at least 1.");
      return;
    }
    
    // Payment specific handling (moved here for cleaner structure)
    let nonce;
    try {
        setLoading(true);
        const { nonce: paymentNonce } = await instance.requestPaymentMethod();
        nonce = paymentNonce;
    } catch (error) {
        console.error("Payment method request failed:", error);
        alert("Payment method error. Please try again.");
        setLoading(false);
        return;
    }
    
    try {
        const res = await fetch(`/api/booking/book-package/${params?.packageId}`, { // Corrected URL structure assuming packageId is used
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...bookingData,
                paymentMethodNonce: nonce, // Include nonce for transaction
            }),
        });
        const data = await res.json();
        
        if (data?.success) {
            alert(data?.message || "Booking successful!");
            navigate(`/profile/${currentUser?.user_role === 1 ? "admin" : "user"}/bookings`); // Adjusted navigation path
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
      const newPersons = Math.max(1, prev.persons + change); // Ensure min 1
      if (newPersons > 10) return prev; // Limit max to 10
      return {
        ...prev,
        persons: newPersons,
      };
    });
  };


  if (loading && packageData.packageName === "") {
    return <div className="text-center p-10 text-xl font-medium">Loading package details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-xl font-medium text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow-xl space-y-8">
        <h1 className="text-3xl font-extrabold text-indigo-800 text-center border-b pb-4">
          Complete Your Booking ✈️
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Information Section */}
          <div className="md:border-r md:pr-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">
              <FaUsers className="inline mr-2 text-indigo-500" /> Traveler Details
            </h2>
            <div className="space-y-4">
              {/* Input: Username (Disabled) */}
              <div className="flex flex-col">
                <label htmlFor="username" className="text-sm font-medium text-gray-600">
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={currentUser?.username || "N/A"}
                  disabled
                />
              </div>

              {/* Input: Email (Disabled) */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-medium text-gray-600">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={currentUser?.email || "N/A"}
                  disabled
                />
              </div>

              {/* Input: Address (Disabled) */}
              <div className="flex flex-col">
                <label htmlFor="address" className="text-sm font-medium text-gray-600">
                  Address: <span className="text-red-500 text-xs"> (Required for payment)</span>
                </label>
                <textarea
                  maxLength={200}
                  id="address"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 resize-none cursor-not-allowed h-24"
                  value={currentUser?.address || "Please update your profile address."}
                  disabled
                />
              </div>
              
              {/* Input: Phone (Disabled) */}
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-sm font-medium text-gray-600">
                  Phone:
                </label>
                <input
                  type="text"
                  id="phone"
                  className="p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={currentUser?.phone || "N/A"}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Package & Payment Section */}
          <div className="space-y-6 md:pl-8">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">
              <FaMapMarkerAlt className="inline mr-2 text-indigo-500" /> Package & Checkout
            </h2>
            
            {/* Package Summary Card */}
            <div className="bg-indigo-50 p-4 rounded-lg flex gap-4 items-center shadow-sm">
              <img
                className="w-20 h-20 object-cover rounded-md"
                src={packageData.packageImages[0] || ""}
                alt="Package"
              />
              <div className="flex flex-col">
                <p className="font-bold text-lg capitalize text-indigo-700">
                  {packageData.packageName}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-600 capitalize">
                  <FaMapMarkerAlt className="text-indigo-400" /> {packageData.packageDestination}
                </p>
                {(+packageData.packageDays > 0 || +packageData.packageNights > 0) && (
                  <p className="flex items-center gap-1 text-sm text-gray-600">
                    <FaClock className="text-indigo-400" />
                    {+packageData.packageDays > 0 &&
                      `${packageData.packageDays} ${+packageData.packageDays > 1 ? "Days" : "Day"}`}
                    {+packageData.packageDays > 0 && +packageData.packageNights > 0 && " - "}
                    {+packageData.packageNights > 0 &&
                      `${packageData.packageNights} ${+packageData.packageNights > 1 ? "Nights" : "Night"}`}
                  </p>
                )}
              </div>
            </div>

            {/* Date Selection */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="date">
                Departure Date: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={currentDate}
                id="date"
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                onChange={(e) => {
                  setBookingData({ ...bookingData, date: e.target.value });
                }}
              />
            </div>
            
            {/* Persons Counter */}
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <label className="font-semibold text-gray-700">Persons (Max 10):</label>
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-md transition duration-150 disabled:bg-indigo-300"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={bookingData.persons <= 1}
                    >
                        -
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{bookingData.persons}</span>
                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded-md transition duration-150 disabled:bg-indigo-300"
                        onClick={() => handleQuantityChange(1)}
                        disabled={bookingData.persons >= 10}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 border-t pt-4">
              <p className="flex justify-between text-base font-medium text-gray-600">
                Price per Person:
                <span className="font-semibold text-gray-800">
                  {packageData.packageOffer ? (
                    <>
                      <span className="line-through text-red-500 mr-2">${packageData.packagePrice}</span>
                      <span className="text-green-600">${pricePerPerson}</span>
                    </>
                  ) : (
                    <span className="text-green-600">${pricePerPerson}</span>
                  )}
                </span>
              </p>
              
              <p className="flex justify-between text-2xl font-extrabold text-gray-800">
                Total Price:
                <span className="text-indigo-600">
                  ${bookingData.totalPrice.toFixed(2)}
                </span>
              </p>
            </div>

            {/* Payment Integration (Braintree Drop-In) */}
            <div className="pt-4 space-y-3">
                <p className="font-semibold text-gray-700">Payment Information:</p>
                
                {clientToken ? (
                    <>
                      <div className="border p-4 rounded-lg shadow-inner">
                        <DropIn
                          options={{
                            authorization: clientToken,
                            paypal: { flow: "vault" },
                          }}
                          onInstance={(instance) => setInstance(instance)}
                        />
                      </div>
                      <p className="text-sm font-medium text-red-600">
                        **Demo Mode:** Do not use original card details! This is a test environment.
                      </p>

                      <button
                        className="w-full p-3 rounded-lg bg-indigo-600 text-white font-bold text-lg transition duration-300 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleBookPackage}
                        disabled={loading || !instance || !currentUser?.address || !bookingData.date}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Book Now"
                        )}
                      </button>
                      
                      {(!currentUser?.address) && (
                          <p className="text-sm text-red-500 mt-2 text-center font-medium">
                            Please provide your address in your profile to enable booking.
                          </p>
                      )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 p-4 border rounded-lg">Loading payment options...</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;