import React, { useState, useEffect } from 'react';
import { Calendar, Users, Image, Settings, LogOut, Trash2, Edit2, Check, X } from 'lucide-react';

const API_URL = 'https://hiking-portal-api-554106646136.us-central1.run.app';

export default function HikingPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('hikes');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hikes, setHikes] = useState([]);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/hikes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(userData);
        fetchHikes();
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const fetchHikes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/hikes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHikes(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setHikes([]);
  };

  const toggleInterest = async (hikeId) => {
    try {
      await fetch(`${API_URL}/api/hikes/${hikeId}/interest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchHikes();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Hiking Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to view upcoming hikes</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">Demo accounts:</p>
            <p className="text-xs text-gray-500 text-center mt-2">Admin: admin@hiking.com / admin123</p>
            <p className="text-xs text-gray-500 text-center">Hiker: hiker@hiking.com / hiker123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-green-600" />
              <span className="text-xl font-bold text-gray-800">Hiking Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser.email} ({currentUser.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Hikes</h2>
        
        {hikes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            Loading hikes...
          </div>
        ) : (
          <div className="space-y-4">
            {hikes.map(hike => (
              <div key={hike.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{hike.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        hike.group_type === 'family' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {hike.group_type === 'family' ? 'Family' : 'Men\'s'}
                      </span>
                    </div>
                    <p className="text-gray-600">{hike.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hike.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    hike.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {hike.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(hike.date).toLocaleDateString()}</span>
                  </div>
                  <span>Distance: {hike.distance}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    hike.type === 'day' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}
                  </span>
                  {hike.cost > 0 && <span className="font-medium text-green-700">R{hike.cost}</span>}
                </div>

                <button
                  onClick={() => toggleInterest(hike.id)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    hike.interested_users?.includes(currentUser.id)
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {hike.interested_users?.includes(currentUser.id) ? 'Remove Interest' : 'I\'m Interested!'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}