'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/profile.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'signout'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const email = session?.user?.email;

      if (!email) {
        setError('Email not found in session');
        setLoading(false);
        return;
      }

      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`/api/profile?email=${encodedEmail}`);
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (!result.data) {
        setError('No profile data returned');
        setLoading(false);
        return;
      }

      setProfileData(result.data);
      setFormData({
        firstName: result.data.firstName || '',
        lastName: result.data.lastName || '',
        email: result.data.email || '',
        phone: result.data.phone || '',
        company: result.data.company || '',
        address: result.data.address || '',
        city: result.data.city || '',
        state: result.data.state || '',
        pincode: result.data.pincode || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchProfile();
    }
  }, [status, session?.user?.email, router, fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      setProfileData(result.data);
      
      await update({
        firstName: result.data.firstName,
        lastName: result.data.lastName
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const getInitial = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
    }
    if (profileData?.firstName) {
      return profileData.firstName.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return session?.user?.email || 'User';
  };

  if (status === 'loading') {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="profile-page">
      <Image
        src="/mountain-bg.webp"
        alt="Background"
        fill
        className="profile-bg-image"
        priority
        quality={80}
      />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="sidebar-section">
            <h3>Account Settings</h3>
            <nav className="sidebar-nav">
              <button
                className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
              <button
                className={`sidebar-nav-item ${activeTab === 'signout' ? 'active' : ''}`}
                onClick={() => setActiveTab('signout')}
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        <div className="profile-content">
          {error && (
            <div className="profile-alert alert-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="profile-alert alert-success">
              <span>✓</span>
              <p>{success}</p>
            </div>
          )}

          {activeTab === 'profile' && profileData && (
            <div className="profile-panel">
              <div className="profile-header">
                <div className="profile-header-top">
                  <div className="profile-avatar-large">
                    {session?.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={getFullName()}
                        width={120}
                        height={120}
                        className="profile-avatar-img"
                      />
                    ) : (
                      <span>{getInitial()}</span>
                    )}
                  </div>
                  <div className="profile-header-info">
                    <h1>{getFullName()}</h1>
                    {profileData.city && profileData.state && (
                      <p className="profile-location">
                        {profileData.city}, {profileData.state}
                      </p>
                    )}
                  </div>
                  <button className="profile-edit-icon" type="button" title="Edit profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-section">
                  <h2>Personal Information</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="disabled"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(213) 555-1234"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Address</h2>
                  <div className="form-group full-width">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="profile-save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'signout' && (
            <div className="profile-panel">
              <h2>Sign Out</h2>
              <p className="signout-text">
                Are you sure you want to sign out? You&apos;ll need to log in again to access your account.
              </p>
              <button 
                onClick={handleSignOut}
                className="signout-btn"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}