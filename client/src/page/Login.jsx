import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Login = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({}); // For form validation errors
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Validate form

    setLoading(true);

    try {
      // Simulate a login API call
      const response = await fetch('https://localhost:3000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        // Assuming successful login
        const result = await response.json();
        // Save the user session or token here if needed
        alert('Login successful');
        navigate('/'); // Redirect to the homepage or dashboard
      } else {
        alert('Login failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto p-6 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={form.username}
              onChange={handleChange}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <a href="/register" className="text-sm text-blue-600 hover:underline">Create an account</a>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
