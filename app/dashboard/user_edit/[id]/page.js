'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function UserEditPage({ params }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/user/${id}`, { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
          setUser(result.user);
          setFormData(result.user);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to fetch user data');
      }
    }

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'confirmNewPassword') setConfirmNewPassword(value);
  };

  const validatePasswords = () => {
    let validationErrors = {};
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,16}$/;

    if (newPassword && !passwordPattern.test(newPassword)) {
      validationErrors.newPassword = 'Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, and one special symbol.';
    }

    if (newPassword !== confirmNewPassword) {
      validationErrors.confirmNewPassword = 'Passwords do not match.';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully');
        router.push('/dashboard/users_list');
      } else {
        toast.error(`Error updating profile: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      const updateUserUrl = `/api/user/${id}`;
      const updateResponse = await fetch(updateUserUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          newPassword,
          confirmNewPassword
        }),
      });

      const updateResult = await updateResponse.json();

      if (updateResponse.ok) {
        toast.success('Password changed successfully');
        router.push('/dashboard/users_list');
      } else {
        toast.error(`Error changing password: ${updateResult.message}`);
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Image 
          src="/images/loading.gif" // Path to your GIF
          alt="Loading..." // Alt text for accessibility
          width={96} // 24 * 4 = 96px width
          height={96} // 24 * 4 = 96px height
          className="w-24 h-24" // Tailwind classes for sizing
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-6 sm:p-8 md:p-10 lg:p-12">
      <ToastContainer />
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
          Edit User
        </h1>
      </header>

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-300">Profile Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm">Status</label>
              <select
                name="status"
                value={formData.status || 'pending'}
                onChange={handleChange}
                className="p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-300">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handlePasswordChange}
              className={`p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.newPassword ? 'border-red-500' : ''}`}
            />
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-300 text-sm">Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={confirmNewPassword}
              onChange={handlePasswordChange}
              className={`p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmNewPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmNewPassword && <p className="text-red-500 text-sm">{errors.confirmNewPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
          >
            Submit Password Change
          </button>
        </form>
      </div>
    </div>
  );
}
