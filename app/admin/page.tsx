// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  async function login(e) {
    e.preventDefault();
    // Simple password protection - in production, use proper authentication
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchAnswers();
    } else {
      alert('Incorrect password');
    }
  }

  async function fetchAnswers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_answers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      return;
    }
    
    if (data) {
      setAnswers(data);
      
      // Calculate simple stats
      const total = data.length;
      const correct = data.filter(a => a.correct).length;
      setStats({ total, correct });
    }
    
    setLoading(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Answers</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Correct Answers</h3>
            <p className="text-3xl font-bold">
              {stats.correct} 
              <span className="text-lg text-gray-500 ml-2">
                ({Math.round((stats.correct/stats.total || 0) * 100)}%)
              </span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b">Recent Answers</h2>
          
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : answers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No answers recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {answers.map((answer) => (
                    <tr key={answer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{answer.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{answer.question}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{answer.answer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {answer.correct ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Incorrect
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(answer.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}