'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/userNavbar';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaSync, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaCopy } from 'react-icons/fa';
import 'react-circular-progressbar/dist/styles.css';

interface ApiKey {
  api_key: string;
  key_name: string;
}

export default function UserDashboard() {
  const [csrf, setCsrf] = useState('');
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(1000);
  const [plan, setPlan] = useState('Free');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupKeyName, setPopupKeyName] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchApiKeys();

    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCSRF = async (): Promise<string> => {
    const res = await axios.get('/api/auth/csrf-token');
    const token = res.data.data.CSRF_Token;
    setCsrf(token);
    return token;
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/auth/user/dashboard');
      const data = res.data.data;
      setPlan(data.subscriptionPlan);
      setUsage(data.apiKyeUsage);
      setLimit(data.incluge);
    } catch {
      showError('Failed to load dashboard');
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get('/api/auth/user/apikey');
      setApiKeys(res.data.data);
    } catch {
      showError('Failed to load API keys');
    }
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleCreateKey = async () => {
    if (plan === 'Free' && apiKeys.length > 0) {
      showError('Free plan users can only have 1 API key.');
      return;
    }
    setShowPopup(true);
  };

  const confirmCreateKey = async () => {
    if (!popupKeyName.trim()) {
      showError('API key name is required');
      return;
    }
    const csrfToken = await fetchCSRF();
    try {
      await axios.post('/api/auth/user/apikey/createnewkey', {
        api_key_name: popupKeyName,
        _csrf: csrfToken,
      });
      fetchApiKeys();
      setShowPopup(false);
      setPopupKeyName('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create key');
    }
  };

  const regenerateKey = async (keyName: string) => {
    const csrfToken = await fetchCSRF();
    try {
      await axios.patch('/api/auth/user/apikey/generatenewkey', {
        api_key_name: keyName,
        _csrf: csrfToken,
      });
      fetchApiKeys();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to regenerate key');
    }
  };

  const deleteKey = async (keyName: string) => {
    const csrfToken = await fetchCSRF();
    try {
      await axios.delete('/api/auth/user/apikey/delete', {
        data: { api_key_name: keyName, _csrf: csrfToken },
      });
      fetchApiKeys();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete key');
    }
  };

  const renameKey = async (oldName: string) => {
    if (!newKeyName.trim()) {
      setEditingKey(null);
      setNewKeyName('');
      return;
    }
    const csrfToken = await fetchCSRF();
    try {
      await axios.patch('/api/auth/user/apikey/changename', {
        old_api_key_name: oldName,
        new_api_key_name: newKeyName,
        _csrf: csrfToken,
      });
      fetchApiKeys();
      setEditingKey(null);
      setNewKeyName('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to rename key');
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        showError('Failed to copy to clipboard');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch {
        showError('Failed to copy to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <div className={`p-6 max-w-6xl mx-auto ${showPopup ? 'blur-sm' : ''}`}>
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white text-black rounded-xl shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Plan: {plan}</h3>
            <div className="w-56 h-56">
              <CircularProgressbar
                value={(usage / limit) * 100}
                text={`${Math.round((usage / limit) * 100)}%`}
                styles={buildStyles({
                  textColor: '#000',
                  pathColor: '#10b981',
                  trailColor: '#d1d5db',
                })}
              />
            </div>
            <p className="mt-4 text-gray-700">Usage: {usage} / {limit}</p>
          </div>

          <div className="bg-white text-black rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">API Keys</h3>
              <button
                onClick={handleCreateKey}
                className="text-sm text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded flex items-center space-x-2"
              >
                <FaPlus className="text-base" /> <span>Add Key</span>
              </button>
            </div>
            <ul>
              {apiKeys.map((keyObj, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col">
                    {editingKey === keyObj.key_name ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="border px-2 py-1 rounded text-sm"
                        />
                        <FaCheck
                          className="text-green-600 cursor-pointer text-lg"
                          onClick={() => renameKey(keyObj.key_name)}
                        />
                        <FaTimes
                          className="text-red-500 cursor-pointer text-lg"
                          onClick={() => {
                            setEditingKey(null);
                            setNewKeyName('');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{keyObj.key_name}</span>
                        <FaEdit
                          className="text-yellow-500 hover:text-yellow-700 cursor-pointer text-lg"
                          onClick={() => {
                            setEditingKey(keyObj.key_name);
                            setNewKeyName(keyObj.key_name);
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-3 text-xs break-all text-gray-600 mt-1">
                      <span>{keyObj.api_key}</span>
                      <FaCopy
                        className="text-gray-500 hover:text-gray-700 cursor-pointer text-lg"
                        onClick={() => copyToClipboard(keyObj.api_key)}
                      />
                      <FaSync
                        onClick={() => regenerateKey(keyObj.key_name)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer text-lg"
                      />
                      <FaTrash
                        onClick={() => deleteKey(keyObj.key_name)}
                        className="text-red-500 hover:text-red-700 cursor-pointer text-lg"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-black">Create New API Key</h2>
            <input
              type="text"
              placeholder="Enter API Key Name"
              value={popupKeyName}
              onChange={(e) => setPopupKeyName(e.target.value)}
              className="w-full border px-3 py-2 rounded text-black"
            />
            <div className="flex justify-end space-x-4">
              <FaTimes
                className="text-red-500 text-xl cursor-pointer"
                onClick={() => setShowPopup(false)}
              />
              <FaCheck
                className="text-green-500 text-xl cursor-pointer"
                onClick={confirmCreateKey}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
