'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Providers from '@/component/Providers';
import '../styles/profile.css';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: {
    asset: {
      url: string;
      _ref: string;
    };
  };
  isVerified: boolean;
  phoneVerified: boolean;
  role: string;
  provider: string;
  _createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'edit' | 'details' | 'logout'>('edit');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchProfile();
    }
  }, [status, session?.user?.email]);

  const fetchProfile = async () => {
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
        name: result.data.name || '',
        phone: result.data.phone || ''
      });

      if (result.data.avatar?.asset?.url) {
        setImagePreview(result.data.avatar.asset.url);
      } else if (session?.user?.image) {
        setImagePreview(session.user.image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

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
      const updatePayload: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone
      };

      if (selectedFile && imagePreview && imagePreview.startsWith('data:')) {
        const uploadPayload = {
          file: imagePreview
        };

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(uploadPayload)
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.error) {
          setError('Failed to upload image');
          setLoading(false);
          return;
        }

        updatePayload.avatarAssetId = uploadResult.assetId;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      setSelectedFile(null);
      setProfileData(result.data);
      
      if (result.data.avatar?.asset?.url) {
        const newAvatarUrl: string = result.data.avatar.asset.url;
        setImagePreview(newAvatarUrl);
        
        await update({
          image: newAvatarUrl,
          name: result.data.name
        });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  if (status === 'loading') {
    return (
      <Providers>
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </Providers>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Providers>
      <div className="simple-profile-wrapper">
        <div className="simple-profile-container">
          <div className="simple-profile-header">
            <h1>My Account</h1>
            <p>Manage your profile and settings</p>
          </div>

          <div className="simple-profile-nav">
            <button 
              className={`simple-nav-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Profile
            </button>
            <button 
              className={`simple-nav-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Account Details
            </button>
            <button 
              className={`simple-nav-btn ${activeTab === 'logout' ? 'active' : ''}`}
              onClick={() => setActiveTab('logout')}
            >
              Sign Out
            </button>
          </div>

          <div className="simple-profile-content">
            {error && (
              <div className="simple-alert simple-alert-error">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && <div className="simple-alert simple-alert-success"><span>✓</span> {success}</div>}

            {loading && !profileData && (
              <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
              </div>
            )}

            {profileData && (
              <>
                {activeTab === 'edit' && (
                  <div className="simple-panel">
                    <h2>Edit Your Profile</h2>

                    <form onSubmit={handleUpdateProfile} className="simple-form">
                      <div className="simple-avatar-section">
                        <div className="simple-avatar">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Profile" 
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="simple-avatar-placeholder">
                              {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <label htmlFor="avatar-input" className="simple-upload-btn">
                          📷 Change Photo
                        </label>
                        <input
                          id="avatar-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden-input"
                        />
                      </div>

                      <div className="simple-form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="simple-form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="simple-btn simple-btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="simple-panel">
                    <h2>Account Information</h2>

                    <div className="simple-detail-item">
                      <label>Full Name</label>
                      <p>{profileData?.name || 'Not provided'}</p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Email Address</label>
                      <p>{profileData?.email}</p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Phone Number</label>
                      <p>{profileData?.phone || 'Not provided'}</p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Email Verified</label>
                      <p>
                        {profileData?.isVerified ? (
                          <span className="simple-badge simple-badge-success">✓ Verified</span>
                        ) : (
                          <span className="simple-badge simple-badge-warning">✗ Not Verified</span>
                        )}
                      </p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Phone Verified</label>
                      <p>
                        {profileData?.phoneVerified ? (
                          <span className="simple-badge simple-badge-success">✓ Verified</span>
                        ) : (
                          <span className="simple-badge simple-badge-warning">✗ Not Verified</span>
                        )}
                      </p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Account Type</label>
                      <p>{profileData?.provider || 'Standard'}</p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Account Role</label>
                      <p className="capitalize">{profileData?.role || 'Customer'}</p>
                    </div>

                    <div className="simple-detail-item">
                      <label>Member Since</label>
                      <p>
                        {profileData?._createdAt ? new Date(profileData._createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'logout' && (
                  <div className="simple-panel">
                    <h2>Sign Out</h2>
                    <p className="simple-subtitle">Leave your account securely</p>

                    <p className="simple-info">
                      Are you sure you want to sign out? You'll need to log in again to access your account.
                    </p>
                    <button 
                      onClick={handleSignOut}
                      className="simple-btn simple-btn-danger"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Providers>
  );
}