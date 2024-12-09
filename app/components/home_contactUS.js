import React, { useState } from "react";

export default function HomeContactUs() {
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
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-100">
  <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Contact Information */}
      <div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8">
          Get in Touch with Us
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Reach out to us with any inquiries or feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Address */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-4 rounded-full bg-blue-500 text-white">
                <i className="fas fa-map-marker-alt text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Address</h3>
            </div>
            <p className="text-gray-600">A108 Adam Street</p>
            <p className="text-gray-600">New York, NY 535022</p>
          </div>

          {/* Card: Call Us */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-4 rounded-full bg-green-500 text-white">
                <i className="fas fa-phone-alt text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Call Us</h3>
            </div>
            <p className="text-gray-600">+1 5589 55488 55</p>
            <p className="text-gray-600">+1 6678 254445 41</p>
          </div>

          {/* Card: Email Us */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-4 rounded-full bg-yellow-500 text-white">
                <i className="fas fa-envelope text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Email Us</h3>
            </div>
            <p className="text-gray-600">info@mvsdlab.com</p>
            <p className="text-gray-600">contact@mvsdlab.com</p>
          </div>

          {/* Card: Open Hours */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-4 rounded-full bg-purple-500 text-white">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-4">Open Hours</h3>
            </div>
            <p className="text-gray-600">Monday - Friday</p>
            <p className="text-gray-600">9:00AM - 05:00PM</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white p-8 shadow-lg rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
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
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
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
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

  );
}
