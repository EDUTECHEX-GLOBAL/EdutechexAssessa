import React, { useState, useEffect } from "react";
import axios from "axios";


const subjectsList = ["Math", "Science", "English", "History", "Geography", "Computer Science"];

const loadProfileData = () => {
  const savedData = localStorage.getItem('teacherProfile');
  const defaultData = {
    pic: null,
    fullName: "Chaitanya",
    email: "chaitanya@gmail.com",
    role: "Teacher",
    className: "Grade 10",
    selectedSubjects: ["Math", "English", "Computer Science"]
  };
  try {
    return savedData ? { ...defaultData, ...JSON.parse(savedData) } : defaultData;
  } catch (e) {
    console.warn("Failed to parse profile data from localStorage:", e);
    return defaultData;
  }
};

export default function TeacherProfile({ teacherInfo, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  // prefer teacherInfo.pic (server/localStorage), fallback to older profilePic key and then defaults
  const [profilePic, setProfilePic] = useState(
  teacherInfo?.pic || loadProfileData().pic || "/default-profile.png"
  );

  const [fullName, setFullName] = useState(teacherInfo?.name || loadProfileData().fullName);
  const [email, setEmail] = useState(teacherInfo?.email || loadProfileData().email);
  const [role, setRole] = useState(teacherInfo?.role || loadProfileData().role);
  const [className, setClassName] = useState(loadProfileData().className);
  const [selectedSubjects, setSelectedSubjects] = useState(
    teacherInfo?.selectedSubjects || loadProfileData().selectedSubjects || []
  );

  useEffect(() => {
  const profileData = {
    pic: profilePic,
    fullName,
    email,
    role,
    className,
    selectedSubjects
  };
  localStorage.setItem('teacherProfile', JSON.stringify(profileData));

  // keep teacherInfo.pic in localStorage in sync (if teacherInfo exists in props)
  if (teacherInfo) {
    try {
      const updatedTeacherInfo = { ...teacherInfo, pic: profilePic };
      localStorage.setItem('teacherInfo', JSON.stringify(updatedTeacherInfo));
    } catch (e) {
      // ignore serialization errors
      console.warn('Failed to sync teacherInfo.pic to localStorage', e);
    }
  }
}, [profilePic, fullName, email, role, className, selectedSubjects, teacherInfo]);


  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
  if (!teacherInfo?.token) return;

  const formData = new FormData();
  formData.append("pic", file);

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/teachers/upload-pic`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${teacherInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ Save the signed URL for immediate display
    setProfilePic(data.url);

    // ✅ Persist the KEY in DB by calling update profile
    const { data: updated } = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/teachers/profile`,
      { pic: data.key }, // only send key to backend
      {
        headers: { Authorization: `Bearer ${teacherInfo.token}` },
      }
    );

    // ✅ Update localStorage with backend response (which includes fresh signed URL)
    localStorage.setItem("teacherInfo", JSON.stringify(updated));
    localStorage.setItem("teacherProfile", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to upload profile picture:", err);
  }
};



  const handleSave = async () => {
  try {
    setIsEditing(false);

    const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
    if (!teacherInfo?.token) return;

    const { data } = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/teachers/profile`,
      {
        name: fullName,
        email,
        role,
        className,
        selectedSubjects,
      },
      {
        headers: { Authorization: `Bearer ${teacherInfo.token}` },
      }
    );

    // Update localStorage with fresh data from backend
    localStorage.setItem("teacherInfo", JSON.stringify(data));
    localStorage.setItem("teacherProfile", JSON.stringify(data));

    // Update state
    setProfilePic(data.pic || "/default-profile.png");
    setFullName(data.name || "");
    setEmail(data.email || "");
    setRole(data.role || "Teacher");
    setClassName(data.className || "");
    setSelectedSubjects(data.selectedSubjects || []);
  } catch (err) {
    console.error("Failed to update teacher profile:", err);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-700 hover:text-purple-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-purple-500 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-teal-300 to-purple-400 p-1 rounded-full">
                  <div className="bg-white rounded-full p-1">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white">
                      <img
                        src={profilePic || "/default-profile.png"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />

                    </div>
                  </div>
                </div>
                {isEditing && (
                  <label className="absolute bottom-4 right-2 bg-teal-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-teal-600 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              
              <div className="md:ml-6 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
                <p className="text-purple-100 mt-1 text-lg">{role}</p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-auto">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-teal-300 to-purple-400 w-2 h-8 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-purple-500 transition shadow-inner"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {fullName}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-purple-500 transition shadow-inner"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {email}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                    {isEditing ? (
                      <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-purple-500 transition shadow-inner"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {role}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-teal-300 to-purple-400 w-2 h-8 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-gray-800">Teaching Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Class</label>
                    {isEditing ? (
                      <input
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-purple-500 transition shadow-inner"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner font-medium">
                        {className || "Not specified"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Subjects</label>
                    {isEditing ? (
                      <div className="mt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {subjectsList.map((subject) => (
                            <label 
                              key={subject} 
                              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
                                selectedSubjects.includes(subject)
                                  ? "bg-gradient-to-r from-teal-50 to-purple-50 border-purple-300 text-purple-700"
                                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject)}
                                onChange={() => handleSubjectChange(subject)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm font-medium">{subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray(selectedSubjects) && selectedSubjects.length > 0 ? 
                          selectedSubjects.map(subject => (
                            <span key={subject} className="bg-gradient-to-r from-teal-100 to-teal-100 text-teal-600 px-4 py-2 rounded-full text-sm font-medium">
                              {subject}
                            </span>
                          )) : 
                          <div className="px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-inner text-gray-500">
                            Not specified
                          </div>
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
