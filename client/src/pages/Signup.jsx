import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const { username, email, password, address, phone } = formData;

    if (!username || !email || !password || !address || !phone) {
      alert("All fields are required!");
      return false;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return false;
    }

    if (!/^\d{10,15}$/.test(phone)) {
      alert("Phone number must contain only digits (10–15 digits).");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", formData);
      const { success, message } = res.data;

      alert(message);
      if (success) navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col border border-black rounded-2xl p-5 w-80 sm:w-96 bg-white bg-opacity-70 shadow-xl gap-3"
      >
        <h1 className="text-3xl text-center font-semibold mb-2">Signup</h1>

        {["username", "email", "password", "address", "phone"].map((field) => (
          <div className="flex flex-col" key={field}>
            <label htmlFor={field} className="font-semibold capitalize">
              {field}:
            </label>
            {field === "address" ? (
              <textarea
                id={field}
                maxLength={200}
                className="p-2 rounded border border-gray-400 resize-none bg-white bg-opacity-80"
                value={formData[field]}
                onChange={handleChange}
              />
            ) : (
              <input
                id={field}
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                className="p-2 rounded border border-gray-400 bg-white bg-opacity-80"
                value={formData[field]}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        <p className="text-blue-700 text-sm hover:underline text-right">
          <Link to="/login">Already have an account? Login</Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="p-3 text-white bg-slate-700 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
