import { useState, useEffect } from 'react';
import { User } from '../../types';
import { trainerApi } from '../../services/api/trainerApi';

interface TrainerProfileProps {
  user: User | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface TrainerProfileData {
  id: number;
  user_id: number;
  specialization: string[];
  certification: string[];
  experience_years: number;
  bio: string;
  hourly_rate: number;
  availability: any;
  rating: number;
  total_sessions: number;
  profile_image?: string;
}

export const TrainerProfile = ({ user, showToast }: TrainerProfileProps) => {
  const [profileData, setProfileData] = useState<TrainerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    certification: [] as string[],
    experience_years: 0,
    bio: '',
    hourly_rate: 0,
    profile_image: ''
  });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await trainerApi.getProfile();
      setProfileData(data);
      setFormData({
        first_name: data.first_name || user?.first_name || '',
        last_name: data.last_name || user?.last_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || user?.phone || '',
        specialization: Array.isArray(data.specialization) ? data.specialization : [],
        certification: Array.isArray(data.certification) ? data.certification : [],
        experience_years: typeof data.experience_years === 'number' ? data.experience_years : 0,
        bio: data.bio || '',
        hourly_rate: typeof data.hourly_rate === 'number' ? data.hourly_rate : 0,
        profile_image: data.profile_image || ''
      });
      if (data.profile_image) {
        setImagePreview(data.profile_image);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      showToast('Failed to load profile data', 'error');
      // Set default values if API fails
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        specialization: [],
        certification: [],
        experience_years: 0,
        bio: '',
        hourly_rate: 0,
        profile_image: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialization.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certification.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certification: [...prev.certification, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certification: prev.certification.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('specialization', JSON.stringify(formData.specialization));
      formDataToSend.append('certification', JSON.stringify(formData.certification));
      formDataToSend.append('experience_years', formData.experience_years.toString());
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('hourly_rate', formData.hourly_rate.toString());
      
      if (selectedImage) {
        formDataToSend.append('profile_image', selectedImage);
      }

      await trainerApi.updateProfile(formDataToSend);
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
      fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER PROFILE
        </h1>
        <p className="text-gray-300">Manage your professional profile and personal information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-400 mx-auto">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <i className="fas fa-user text-4xl text-gray-400"></i>
                    </div>
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
              )}
            </div>

            {profileData && (
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profileData.first_name || user?.first_name || ''} {profileData.last_name || user?.last_name || ''}
                  </div>
                  <div className="text-pink-400 font-semibold">
                    {Array.isArray(profileData.specialization) && profileData.specialization.length > 0 
                      ? profileData.specialization.join(', ') 
                      : 'No specializations yet'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400">
                    <i className="fas fa-star"></i>
                    <span className="font-semibold">
                      {typeof profileData.rating === 'number' ? profileData.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-gray-300">
                      ({profileData.total_sessions || 0} sessions)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-pink-400">Profile Information</h3>
              {editing && (
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfileData(); // Reset to original data
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-save mr-2"></i>
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-400 pb-2">
                  Personal Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-400 pb-2">
                  Professional Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleNumberInputChange}
                    disabled={!editing}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate (PKR)</label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleNumberInputChange}
                    disabled={!editing}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-400 pb-2 mb-4">
                Specializations
              </h4>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {spec}
                    {editing && (
                      <button
                        onClick={() => removeSpecialization(index)}
                        className="ml-2 text-pink-200 hover:text-white"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {editing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add specialization..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-400 focus:outline-none"
                  />
                  <button
                    onClick={addSpecialization}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-400 pb-2 mb-4">
                Certifications
              </h4>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.certification.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {cert}
                    {editing && (
                      <button
                        onClick={() => removeCertification(index)}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {editing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-pink-400 focus:outline-none"
                  />
                  <button
                    onClick={addCertification}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-pink-400 border-b border-pink-400 pb-2 mb-4">
                Bio
              </h4>
              
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                rows={4}
                placeholder="Tell clients about your training philosophy, experience, and what makes you unique..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white disabled:opacity-50 focus:border-pink-400 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
