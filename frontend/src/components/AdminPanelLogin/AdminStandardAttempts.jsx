// src/components/AdminPanelLogin/AdminStandardAttempts.jsx
import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Button, Modal, Card, Row, Col, Statistic, Tag, Progress, Typography, Space, Select, Input } from "antd";
import { 
  BookOutlined, ClockCircleOutlined, 
  ArrowLeftOutlined, BarChartOutlined, TrophyOutlined,
  DashboardOutlined, CrownOutlined,
  RocketOutlined, StarOutlined, SafetyCertificateOutlined,
  EyeOutlined, TeamOutlined, CalendarOutlined, SearchOutlined,
  FilterOutlined, CloseOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const AdminStandardAttempts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    subject: null,
    difficulty: null,
    class: null,
    scoreRange: null
  });
  const [showFilters, setShowFilters] = useState(false);

  // Profile modal states
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/attempts/standard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        
        // Calculate some basic statistics
        if (res.data.length > 0) {
          const totalAttempts = res.data.length;
          const avgScore = res.data.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalAttempts;
          const completed = res.data.filter(item => item.status === 'completed').length;
          const highScores = res.data.filter(item => item.percentage >= 80).length;
          
          setStats({
            totalAttempts,
            avgScore,
            completionRate: (completed / totalAttempts) * 100,
            highScores
          });
        }
      } catch (err) {
        setError("Failed to fetch Standard attempts");
        console.error("Standard attempts fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleRowClick = async (record) => {
    const studentId = record.studentId;
    if (!studentId) {
      console.warn("studentId missing on record — ensure backend returns studentId");
      setProfileError("Student ID missing for this record.");
      setProfileData(null);
      setProfileVisible(true);
      return;
    }

    setProfileData(null);
    setProfileError(null);
    setProfileVisible(true);
    setProfileLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/attempts/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(res.data);
    } catch (err) {
      console.error("Failed to fetch student profile", err);
      setProfileError(err.response?.data?.message || err.message || "Failed to fetch profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getDifficultyTag = (difficulty) => {
    let color = '';
    let icon = null;
    
    switch(difficulty?.toLowerCase()) {
      case 'easy': 
        color = 'green'; 
        icon = <StarOutlined />;
        break;
      case 'medium': 
        color = 'orange'; 
        icon = <RocketOutlined />;
        break;
      case 'hard': 
        color = 'red'; 
        icon = <CrownOutlined />;
        break;
      case 'very hard': 
        color = 'volcano'; 
        icon = <CrownOutlined />;
        break;
      default: 
        color = 'default';
        icon = <SafetyCertificateOutlined />;
    }
    
    const displayText = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown';
    
    return (
      <Tag 
        color={color} 
        className="flex items-center gap-1 font-medium px-2 py-1 rounded-lg"
      >
        {icon}
        {displayText}
      </Tag>
    );
  };

  // Extract unique values for filters
  const uniqueSubjects = [...new Set(data.map(item => item.subject))].filter(Boolean);
  const uniqueDifficulties = [...new Set(data.map(item => item.difficulty))].filter(Boolean);
  const uniqueClasses = [...new Set(data.map(item => item.studentClass))].filter(Boolean);

  const filteredData = data.filter(item => {
    // Text search
    const matchesSearch = 
      !searchText ||
      item.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.assessmentTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchText.toLowerCase());
    
    // Filter matches
    const matchesSubject = !filters.subject || item.subject === filters.subject;
    const matchesDifficulty = !filters.difficulty || item.difficulty === filters.difficulty;
    const matchesClass = !filters.class || item.studentClass === filters.class;
    
    // Score range filter
    let matchesScore = true;
    if (filters.scoreRange) {
      const score = item.percentage || 0;
      switch(filters.scoreRange) {
        case 'high': matchesScore = score >= 80; break;
        case 'medium': matchesScore = score >= 60 && score < 80; break;
        case 'low': matchesScore = score < 60; break;
        default: matchesScore = true;
      }
    }
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesClass && matchesScore;
  });

  const clearFilters = () => {
    setFilters({
      subject: null,
      difficulty: null,
      class: null,
      scoreRange: null
    });
    setSearchText("");
  };

  const hasActiveFilters = filters.subject || filters.difficulty || filters.class || filters.scoreRange || searchText;

  const columns = [
    { 
      title: <span className="font-semibold text-gray-700">Student</span>, 
      dataIndex: "studentName", 
      key: "studentName",
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          <div className="text-xs text-gray-500">{record.studentEmail}</div>
        </div>
      )
    },
    { 
      title: <span className="font-semibold text-gray-700">Class</span>, 
      dataIndex: "studentClass", 
      key: "studentClass",
      render: (text) => <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{text || 'N/A'}</span>
    },
    { 
      title: <span className="font-semibold text-gray-700">Assessment</span>, 
      dataIndex: "assessmentTitle", 
      key: "assessmentTitle",
      ellipsis: true,
      render: (text) => <span className="font-medium text-gray-800">{text}</span>
    },
    { 
      title: <span className="font-semibold text-gray-700">Subject</span>, 
      dataIndex: "subject", 
      key: "subject",
      render: (text) => (
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
          {text}
        </span>
      )
    },
    { 
      title: <span className="font-semibold text-gray-700">Level</span>, 
      dataIndex: "gradeLevel", 
      key: "gradeLevel",
      render: (text) => <span className="font-medium bg-gray-100 px-3 py-1 rounded-md text-gray-700">{text}</span>
    },
    { 
      title: <span className="font-semibold text-gray-700">Difficulty</span>, 
      dataIndex: "difficulty", 
      key: "difficulty",
      render: getDifficultyTag
    },
    { 
      title: <span className="font-semibold text-gray-700">Score</span>, 
      key: "score",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <Progress
            type="circle"
            percent={record.percentage || 0}
            width={50}
            strokeColor={getScoreColor(record.percentage)}
            format={percent => `${Math.round(percent)}%`}
            className="font-bold"
          />
          <div className="text-xs font-medium mt-1 text-gray-600">
            {record.score}/{record.totalMarks}
          </div>
        </div>
      )
    },
    { 
      title: <span className="font-semibold text-gray-700">Time Taken</span>, 
      dataIndex: "timeTaken", 
      key: "timeTaken",
      render: (val) => (
        <div className="flex items-center gap-1 font-medium text-gray-700">
          <ClockCircleOutlined className="text-purple-500" />
          {val ? `${val}s` : 'N/A'}
        </div>
      )
    },
    {
      title: <span className="font-semibold text-gray-700">Submitted</span>,
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (val) => (
        <div className="flex items-center gap-1 text-gray-600">
          <CalendarOutlined className="text-gray-400" />
          <Text className="text-xs font-medium">
            {val ? new Date(val).toLocaleDateString() : "-"}
          </Text>
        </div>
      )
    },
    { dataIndex: "studentId", key: "studentId", render: () => null },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Spin size="large" />
        <Text className="text-gray-500 font-medium">Loading Standard Assessment Attempts...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert 
          type="error" 
          message={error}
          showIcon
          closable
          className="rounded-lg"
          action={
            <Button size="small" type="primary" onClick={() => window.location.reload()} className="rounded-md">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow">
                <BarChartOutlined className="text-white text-lg" />
              </div>
              <Title level={2} className="m-0 text-gray-800">Standard Assessment Attempts</Title>
            </div>
            <Text className="text-gray-500">Detailed overview of all student attempts on standard assessments</Text>
          </div>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/admin-dashboard")}
            size="large"
            className="bg-blue-600 hover:bg-blue-700 border-0 shadow rounded-lg h-11 px-4 font-medium"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <div className="relative w-full md:w-96">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search students, assessments, or subjects..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Filters {hasActiveFilters ? `(${Object.values(filters).filter(f => f).length + (searchText ? 1 : 0)})` : ''}
              </Button>
              
              {hasActiveFilters && (
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="font-medium">{filteredData.length}</span>
              <span>of</span>
              <span className="font-medium">{data.length}</span>
              <span>records</span>
            </div>
          </div>

          {/* Expandable Filters Panel */}
          {showFilters && (
            <Card className="mb-6 rounded-lg border-0 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Select
                    value={filters.subject}
                    onChange={(value) => setFilters({...filters, subject: value})}
                    placeholder="All Subjects"
                    className="w-full"
                    allowClear
                  >
                    {uniqueSubjects.map(subject => (
                      <Option key={subject} value={subject}>{subject}</Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <Select
                    value={filters.difficulty}
                    onChange={(value) => setFilters({...filters, difficulty: value})}
                    placeholder="All Difficulties"
                    className="w-full"
                    allowClear
                  >
                    {uniqueDifficulties.map(difficulty => (
                      <Option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <Select
                    value={filters.class}
                    onChange={(value) => setFilters({...filters, class: value})}
                    placeholder="All Classes"
                    className="w-full"
                    allowClear
                  >
                    {uniqueClasses.map(cls => (
                      <Option key={cls} value={cls}>{cls}</Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
                  <Select
                    value={filters.scoreRange}
                    onChange={(value) => setFilters({...filters, scoreRange: value})}
                    placeholder="All Scores"
                    className="w-full"
                    allowClear
                  >
                    <Option value="high">High (80%+)</Option>
                    <Option value="medium">Medium (60-79%)</Option>
                    <Option value="low">Low (Below 60%)</Option>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Statistics Cards */}
          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl shadow-sm border-0 bg-white">
                <Statistic
                  title="Total Attempts"
                  value={stats.totalAttempts}
                  prefix={<TeamOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#2563eb' }}
                  className="font-bold"
                />
              </Card>
              <Card className="rounded-xl shadow-sm border-0 bg-white">
                <Statistic
                  title="Average Score"
                  value={stats.avgScore}
                  precision={2}
                  suffix="%"
                  prefix={<TrophyOutlined className="text-green-500" />}
                  valueStyle={{ color: '#059669' }}
                />
              </Card>
              <Card className="rounded-xl shadow-sm border-0 bg-white">
                <Statistic
                  title="Completion Rate"
                  value={stats.completionRate}
                  precision={2}
                  suffix="%"
                  prefix={<DashboardOutlined className="text-amber-500" />}
                  valueStyle={{ color: '#d97706' }}
                />
              </Card>
              <Card className="rounded-xl shadow-sm border-0 bg-white">
                <Statistic
                  title="High Scores"
                  value={stats.highScores}
                  prefix={<CrownOutlined className="text-purple-500" />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </div>
          )}
        </div>

        {/* Data Table */}
        <Card 
          className="rounded-xl shadow border-0 overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-5 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <EyeOutlined className="text-blue-600" />
              <Title level={4} className="m-0 text-gray-800">Attempt Records</Title>
            </div>
          </div>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="submissionId"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: "cursor-pointer transition-all hover:bg-gray-50"
            })}
            pagination={{
              position: ['bottomRight'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `Showing ${range[0]}-${range[1]} of ${total} attempts`,
              className: "px-5 py-3"
            }}
            scroll={{ x: 1000 }}
            className="rounded-b-xl"
          />
        </Card>

        {/* Student Profile Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <BarChartOutlined className="text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Student Performance Profile</span>
            </div>
          }
          open={profileVisible}
          onCancel={() => setProfileVisible(false)}
          footer={[
            <Button 
              key="close" 
              onClick={() => setProfileVisible(false)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 border-0 font-medium"
            >
              Close
            </Button>
          ]}
          width={700}
          className="rounded-xl"
          bodyStyle={{ padding: '20px' }}
        >
          {profileLoading ? (
            <div className="text-center py-8">
              <Spin size="large" tip="Loading student profile..." />
            </div>
          ) : profileError ? (
            <Alert 
              type="error" 
              message={profileError} 
              showIcon
              closable
              className="rounded-lg"
            />
          ) : profileData ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <Card className="rounded-lg border-0 bg-blue-50 shadow-sm">
                  <Statistic
                    title="Average Score"
                    value={profileData.avgScore}
                    suffix="%"
                    precision={2}
                    valueStyle={{ color: '#2563eb' }}
                  />
                </Card>
                <Card className="rounded-lg border-0 bg-green-50 shadow-sm">
                  <Statistic
                    title="Best Subject"
                    value={profileData.bestSubject}
                    valueStyle={{ color: '#059669' }}
                  />
                </Card>
                <Card className="rounded-lg border-0 bg-amber-50 shadow-sm">
                  <Statistic
                    title="Weakest Subject"
                    value={profileData.weakestSubject}
                    valueStyle={{ color: '#d97706' }}
                  />
                </Card>
              </div>

              <Title level={5} className="flex items-center gap-2 mb-3">
                <ClockCircleOutlined />
                Attempts History
              </Title>
              <div className="max-h-72 overflow-auto pr-2">
                {profileData.attempts.map((a) => (
                  <Card 
                    key={a.id} 
                    className="rounded-lg mb-2 shadow-sm border border-gray-200"
                    bodyStyle={{ padding: '12px' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-gray-800">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          {a.type} • {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "No date"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          type="circle"
                          percent={a.percentage || 0}
                          width={40}
                          strokeColor={getScoreColor(a.percentage)}
                          format={percent => `${Math.round(percent)}%`}
                        />
                        <div className="font-medium text-gray-700">
                          {a.score}/{a.totalMarks}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Alert message="No profile data available" type="warning" showIcon className="rounded-lg" />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminStandardAttempts;