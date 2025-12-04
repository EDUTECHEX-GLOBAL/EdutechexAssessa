
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaSave,
  FaCamera,
  FaCity,
  FaGlobe,
  FaEdit
} from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { BiSolidBookAlt } from 'react-icons/bi';

const UserProfile = ({ user, onBackHome }) => { // Added onBackHome prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pic: '',
    class: '',
    mobile: '',
    bio: '',
    city: '',
    country: ''
  });
  const [uploading, setUploading] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const navigate = useNavigate();

  const getToken = () => {
    const raw = localStorage.getItem('token');
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        setFormData({
  name: data.name || '',
  email: data.email || '',
  pic: data.pic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  class: data.class || '',
  mobile: data.mobile || '',
  bio: data.bio || '',
  city: data.city || '',
  country: data.country || ''
});

      } catch (error) {
        toast.error('Failed to load profile data');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const formDataPic = new FormData();
    formDataPic.append('image', file);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload/profile-pic`,
        formDataPic,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      setFormData(prev => ({
  ...prev,
  pic: data.url || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
}));

      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      toast.success('Profile updated successfully!');
      setFormData({
        name: data.name || '',
        email: data.email || '',
        pic: data.pic || '',
        class: data.class || '',
        mobile: data.mobile || '',
        bio: data.bio || '',
        city: data.city || '',
        country: data.country || ''
      });
      setReadOnly(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleEdit = () => setReadOnly(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top navigation - Fixed to use onBackHome prop */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBackHome} // Fixed to use onBackHome prop
            className="flex items-center text-gray-700 hover:text-emerald-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Main profile card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-400 to-sky-500 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-emerald-300 to-sky-400 p-1 rounded-full">
                  <div className="bg-white rounded-full p-1">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white">
                      <img
  src={formData.pic}
  alt="Profile"
  className="w-full h-full object-cover"
/>

                    </div>
                  </div>
                </div>
                {!readOnly && (
                  <label className="absolute bottom-4 right-2 bg-emerald-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-emerald-600 transition-all">
                    <FaCamera className="h-5 w-5 text-white" />
                    <input 
                      type="file" 
                      onChange={handlePicChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              
              <div className="md:ml-6 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{formData.name || "Your Name"}</h1>
                <p className="text-emerald-100 mt-1 text-lg">Student</p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-auto">
                {readOnly ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200 font-medium shadow-md"
                  >
                    <FaEdit className="h-5 w-5 mr-1" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setReadOnly(true)}
                      className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200 font-medium shadow-md flex items-center"
                    >
                      <FaSave className="h-5 w-5 mr-1" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-emerald-300 to-sky-400 w-2 h-8 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <FaUser size={14} className="text-emerald-600" />
                      Full Name
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.name || "Not specified"}
                      </div>
                    ) : (
                      <input
                        value={formData.name}
                        name="name"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                        placeholder="Enter your full name"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <IoMdMail size={16} className="text-emerald-600" />
                      Email
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.email || "Not specified"}
                      </div>
                    ) : (
                      <input
                        type="email"
                        value={formData.email}
                        name="email"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                        placeholder="Enter your email"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <FaPhone size={14} className="text-emerald-600" />
                      Mobile Number
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.mobile || "Not specified"}
                      </div>
                    ) : (
                      <input
                        type="tel"
                        value={formData.mobile}
                        name="mobile"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                        placeholder="Enter mobile number"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional Information Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-emerald-300 to-sky-400 w-2 h-8 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Additional Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <FaGraduationCap size={14} className="text-emerald-600" />
                      Class/Grade
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.class || "Not specified"}
                      </div>
                    ) : (
                      <input
                        value={formData.class}
                        name="class"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition shadow-inner"
                        placeholder="Enter your class/grade"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <FaCity size={14} className="text-emerald-600" />
                      City
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.city || "Not specified"}
                      </div>
                    ) : (
                      <input
                        value={formData.city}
                        name="city"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                        placeholder="Enter your city"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <FaGlobe size={14} className="text-emerald-600" />
                      Country
                    </label>
                    {readOnly ? (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {formData.country || "Not specified"}
                      </div>
                    ) : (
                      <input
                        value={formData.country}
                        name="country"
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                        placeholder="Enter your country"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio Field */}
            <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-emerald-300 to-sky-400 w-2 h-8 rounded-full mr-3"></div>
                <h2 className="text-xl font-bold text-gray-800">Bio</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <BiSolidBookAlt size={16} className="text-emerald-600" />
                  About Me
                </label>
                {readOnly ? (
                  <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium min-h-[100px]">
                    {formData.bio || "Tell us about yourself..."}
                  </div>
                ) : (
                  <textarea
                    value={formData.bio}
                    name="bio"
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-sky-500 transition shadow-inner"
                    placeholder="Tell us about yourself..."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;