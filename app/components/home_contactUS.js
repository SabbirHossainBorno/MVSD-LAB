import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component

export default function HomeContactUs() {
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading spinner
  
    try {
      const response = await fetch("/api/home_contactUs", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-100 via-blue-50 to-blue-100 relative">
  <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
    <div className="relative">
      {/* Loading State Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      )}

      <div className={`container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 ${isLoading ? "opacity-50" : ""}`}>
        {/* Contact Information */}
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-gray-800">
            Get in Touch With Us
          </h2>
          <p className="text-lg text-gray-600">
            We'd love to hear from you! Reach out to us with any questions,
            suggestions, or feedback.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card: Address */}
            <div className="flex items-start space-x-4 bg-white shadow-md p-6 rounded-lg transition-transform transform hover:scale-105">
              <div>
                <img
                  src="/images/contactUS_icon/address.png"
                  alt="Address Icon"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                <p className="text-gray-600">A108 Adam Street</p>
                <p className="text-gray-600">New York, NY 535022</p>
              </div>
            </div>

            {/* Card: Call Us */}
            <div className="flex items-start space-x-4 bg-white shadow-md p-6 rounded-lg transition-transform transform hover:scale-105">
              <div>
                <img
                  src="/images/contactUS_icon/callus.png"
                  alt="Call Us Icon"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Call Us</h3>
                <p className="text-gray-600">+1 5589 55488 55</p>
                <p className="text-gray-600">+1 6678 254445 41</p>
              </div>
            </div>

            {/* Card: Email */}
            <div className="flex items-start space-x-4 bg-white shadow-md p-6 rounded-lg transition-transform transform hover:scale-105">
              <div>
                <img
                  src="/images/contactUS_icon/mail.png"
                  alt="Email Icon"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email Us</h3>
                <p className="text-gray-600">info@mvsdlab.com</p>
                <p className="text-gray-600">contact@mvsdlab.com</p>
              </div>
            </div>

            {/* Card: Open Hours */}
            <div className="flex items-start space-x-4 bg-white shadow-md p-6 rounded-lg transition-transform transform hover:scale-105">
              <div>
                <img
                  src="/images/contactUS_icon/open.png"
                  alt="Open Hours Icon"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Open Hours</h3>
                <p className="text-gray-600">Monday - Friday</p>
                <p className="text-gray-600">9:00AM - 05:00PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white shadow-lg rounded-lg p-8 relative">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Send Us a Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Your Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading}
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  <ToastContainer />
</section>
  );
}