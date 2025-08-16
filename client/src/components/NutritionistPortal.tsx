import { useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './Toast';
import Chat from './Chat';
import { MessageSquare } from 'lucide-react';

interface NutritionistPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const NutritionistPortal = ({ user, onLogout }: NutritionistPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showChat, setShowChat] = useState(false);
  const [selectedChatRequest, setSelectedChatRequest] = useState<any>(null);
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <NutritionistDashboard user={user} showToast={showToast} />;
      case 'schedule':
        return <NutritionistSchedule showToast={showToast} />;
      case 'client-requests':
        // Redirect to My Requests tab for diet plan requests
        setCurrentPage('session-requests');
        return <SessionRequests 
          showToast={showToast} 
          setSelectedChatRequest={setSelectedChatRequest}
          setShowChat={setShowChat}
        />;
      case 'session-requests':
        return <SessionRequests 
          showToast={showToast} 
          setSelectedChatRequest={setSelectedChatRequest}
          setShowChat={setShowChat}
        />;
      case 'templates':
        return <MealPlanTemplates showToast={showToast} />;
      case 'notes':
        return <ClientNotes showToast={showToast} />;
      case 'announcements':
        return <NutritionistAnnouncements showToast={showToast} />;
      case 'subscription':
        return <NutritionistSubscription showToast={showToast} />;
      default:
        return <NutritionistDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <i className="fas fa-dumbbell text-2xl text-purple-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-purple-400' },
            { id: 'schedule', icon: 'fas fa-calendar', label: 'My Schedule', color: 'text-blue-400' },
            { id: 'session-requests', icon: 'fas fa-calendar-check', label: 'My Requests', color: 'text-cyan-400' },
            { id: 'templates', icon: 'fas fa-folder', label: 'Meal Plan Templates', color: 'text-pink-400' },
            { id: 'notes', icon: 'fas fa-sticky-note', label: 'Client Notes', color: 'text-orange-400' },
            { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
            { id: 'subscription', icon: 'fas fa-credit-card', label: 'Subscription', color: 'text-blue-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-400 hover:bg-opacity-10 transition-all ${
                currentPage === item.id ? 'bg-purple-400 bg-opacity-20' : ''
              }`}
            >
              <i className={`${item.icon} ${item.color}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        <div className="topbar px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">Nutritionist: {user?.name}</div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderPage()}
        </div>
      </div>

      {/* Chat Component */}
      {showChat && selectedChatRequest && (
        <Chat
          requestId={selectedChatRequest.id}
          currentUserId={user?.id || 0}
          currentUserRole="nutritionist"
          onClose={() => {
            setShowChat(false);
            setSelectedChatRequest(null);
          }}
        />
      )}
    </div>
  );
};

const NutritionistDashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-purple-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
        NUTRITIONIST DASHBOARD
      </h1>
      <p className="text-gray-300">Welcome back, {user?.name}! Here's your nutrition practice overview.</p>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card p-6 rounded-xl border-purple-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Today's Consultations</h3>
          <i className="fas fa-calendar-day text-purple-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">5</p>
        <p className="text-gray-300">2 remaining</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Active Clients</h3>
          <i className="fas fa-users text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">18</p>
        <p className="text-gray-300">2 new this week</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Plans Created</h3>
          <i className="fas fa-clipboard-list text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">12</p>
        <p className="text-gray-300">This week</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-orange-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400" style={{ fontFamily: 'Orbitron, monospace' }}>Success Rate</h3>
          <i className="fas fa-chart-line text-orange-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">92%</p>
        <p className="text-gray-300">Client satisfaction</p>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {[
        { icon: 'fas fa-calendar-check', title: 'VIEW SCHEDULE', description: 'Check today\'s consultations', color: 'border-blue-400' },
        { icon: 'fas fa-plus-circle', title: 'CREATE PLAN', description: 'Design new meal plan', color: 'border-green-400' },
        { icon: 'fas fa-folder-plus', title: 'NEW TEMPLATE', description: 'Add meal plan template', color: 'border-purple-400' }
      ].map((action, index) => (
        <button
          key={index}
          onClick={() => showToast(`${action.title} clicked!`, 'info')}
          className={`glass-card p-6 rounded-xl hover-glow transition-all duration-300 group ${action.color}`}
        >
          <i className={`${action.icon} text-3xl mb-4 group-hover:animate-pulse-glow`}></i>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>{action.title}</h3>
          <p className="text-gray-300">{action.description}</p>
        </button>
      ))}
    </div>

    {/* Recent Activity */}
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {[
          { type: 'Plan Created', client: 'Emma Wilson', time: '2 hours ago', description: '1800-calorie weight loss plan' },
          { type: 'Consultation', client: 'David Brown', time: '4 hours ago', description: 'Sports nutrition consultation' },
          { type: 'Plan Updated', client: 'Lisa Garcia', time: '1 day ago', description: 'Adjusted macros for training phase' }
        ].map((activity, index) => (
          <div key={index} className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">{activity.type} - {activity.client}</h4>
                <p className="text-gray-300">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NutritionistSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'setup' | 'view'>('setup');
  
  // Block time states
  const [blockDate, setBlockDate] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState<string>('09:00');
  const [blockEndTime, setBlockEndTime] = useState<string>('17:00');
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockingTime, setBlockingTime] = useState(false);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<any[]>([]);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const DAYS_OF_WEEK = [
    { value: 0, name: 'Sunday', short: 'Sun', color: 'text-purple-400' },
    { value: 1, name: 'Monday', short: 'Mon', color: 'text-blue-400' },
    { value: 2, name: 'Tuesday', short: 'Tue', color: 'text-green-400' },
    { value: 3, name: 'Wednesday', short: 'Wed', color: 'text-yellow-400' },
    { value: 4, name: 'Thursday', short: 'Thu', color: 'text-orange-400' },
    { value: 5, name: 'Friday', short: 'Fri', color: 'text-red-400' },
    { value: 6, name: 'Saturday', short: 'Sat', color: 'text-pink-400' }
  ];

  const SESSION_DURATIONS = [30, 45, 60, 75, 90, 120];
  const BREAK_DURATIONS = [0, 5, 10, 15, 20, 30];

  useEffect(() => {
    fetchExistingAvailability();
    fetchScheduleData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchScheduleData();
    }
  }, [selectedDate]);

  const fetchExistingAvailability = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nutritionists/availability', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Transform backend data to match our interface
          const transformedAvailability = DAYS_OF_WEEK.map(day => {
            const existingDay = data.find((d: any) => d.day_of_week === day.value);
            
            if (existingDay) {
              return {
                dayOfWeek: day.value,
                dayName: day.name,
                isAvailable: existingDay.is_available,
                startTime: existingDay.start_time,
                endTime: existingDay.end_time,
                sessionDuration: existingDay.session_duration_minutes,
                maxSessions: existingDay.max_sessions_per_day,
                breakDuration: existingDay.break_duration_minutes
              };
            } else {
              return {
                dayOfWeek: day.value,
                dayName: day.name,
                isAvailable: false,
                startTime: '09:00',
                endTime: '17:00',
                sessionDuration: 60,
                maxSessions: 8,
                breakDuration: 15
              };
            }
          });
          
          setAvailability(transformedAvailability);
        } else {
          // Initialize with default values if no existing availability
          initializeAvailability();
        }
      } else {
        // Initialize with default values on error
        initializeAvailability();
      }
    } catch (error) {
      console.error('Failed to fetch existing availability:', error);
      // Initialize with default values on error
      initializeAvailability();
    }
  };

  const initializeAvailability = () => {
    const initialAvailability = DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      dayName: day.name,
      isAvailable: day.value >= 1 && day.value <= 5, // Monday to Friday by default
      startTime: '09:00',
      endTime: '17:00',
      sessionDuration: 60,
      maxSessions: 8,
      breakDuration: 15
    }));
    setAvailability(initialAvailability);
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      // Get the generated time slots for the selected date
      const dayOfWeek = new Date(selectedDate).getDay();
      const response = await fetch(`http://localhost:3001/api/nutritionists/available-slots/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const slotsData = await response.json();
        
        // Transform the data to match our interface
        if (slotsData && slotsData.length > 0) {
          const slots = slotsData.map((slot: any) => ({
            id: slot.id.toString(),
            time: slot.time_slot,
            status: slot.booking_id ? 'booked' : (slot.status === 'unavailable' ? 'unavailable' : 'available'),
            clientName: slot.client_id ? `${slot.first_name || ''} ${slot.last_name || ''}`.trim() : '',
            sessionType: 'Nutrition Consultation'
          }));
          setTimeSlots(slots);
        } else {
          // If no slots found, generate them from availability for this day
          const dayAvailability = availability.find(day => day.dayOfWeek === dayOfWeek);
          if (dayAvailability && dayAvailability.isAvailable) {
            const generatedSlots = generateTimeSlots(dayAvailability);
            const slots = generatedSlots.map((time, index) => ({
              id: `generated-${index}`,
              time: time,
              status: 'available',
              clientName: '',
              sessionType: 'Nutrition Consultation'
            }));
            setTimeSlots(slots);
          } else {
            setTimeSlots([]);
          }
        }
      }

      // Fetch blocked time slots
      try {
        const scheduleResponse = await fetch('http://localhost:3001/api/nutritionists/schedule', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          if (scheduleData.timeOff) {
            setBlockedTimeSlots(scheduleData.timeOff);
          }
        }
      } catch (error) {
        console.error('Failed to fetch blocked time slots:', error);
      }
      
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
      showToast('Failed to load schedule data', 'error');
      // Fallback to generated slots from availability
      const dayOfWeek = new Date(selectedDate).getDay();
      const dayAvailability = availability.find(day => day.dayOfWeek === dayOfWeek);
      if (dayAvailability && dayAvailability.isAvailable) {
        const generatedSlots = generateTimeSlots(dayAvailability);
        const slots = generatedSlots.map((time, index) => ({
          id: `generated-${index}`,
          time: time,
          status: 'available',
          clientName: '',
          sessionType: 'Nutrition Consultation'
        }));
        setTimeSlots(timeSlots);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: keyof any, value: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [field]: value
    };
    setAvailability(updatedAvailability);
  };

  const generateTimeSlots = (day: any): string[] => {
    if (!day.isAvailable) return [];
    
    const slots: string[] = [];
    const startTime = new Date(`2000-01-01T${day.startTime}`);
    const endTime = new Date(`2000-01-01T${day.endTime}`);
    const sessionDurationMs = day.sessionDuration * 60 * 1000;
    const breakDurationMs = day.breakDuration * 60 * 1000;
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      slots.push(currentTime.toTimeString().slice(0, 5));
      currentTime = new Date(currentTime.getTime() + sessionDurationMs + breakDurationMs);
    }
    
    return slots;
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      // Save availability settings
      const response = await fetch('http://localhost:3001/api/nutritionists/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(availability)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save availability');
      }
      
      // Generate and save time slots
      console.log('Generating time slots...');
      const generateResponse = await fetch('http://localhost:3001/api/nutritionists/generate-time-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error('Generate time slots failed:', errorText);
        throw new Error(`Failed to generate time slots: ${errorText}`);
      }
      
      console.log('Time slots generated successfully');
      
      showToast('Schedule settings saved successfully!', 'success');
      setViewMode('view');
      fetchScheduleData();
    } catch (error) {
      console.error('Failed to save availability:', error);
      showToast('Failed to save schedule settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const blockTimeSlots = async () => {
    try {
      if (!blockDate) {
        showToast('Please select a date to block', 'error');
        return;
      }

      setBlockingTime(true);
      
      const response = await fetch('http://localhost:3001/api/nutritionists/block-time-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: blockDate,
          startTime: blockStartTime,
          endTime: blockEndTime,
          reason: blockReason || 'Personal time off'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to block time slots');
      }
      
      showToast('Time slots blocked successfully!', 'success');
      
      // Reset form
      setBlockDate('');
      setBlockStartTime('09:00');
      setBlockEndTime('17:00');
      setBlockReason('');
      setShowBlockForm(false);
      
      // Refresh schedule data
      fetchScheduleData();
      
    } catch (error) {
      console.error('Failed to block time slots:', error);
      showToast('Failed to block time slots', 'error');
    } finally {
      setBlockingTime(false);
    }
  };

  const unblockTimeSlots = async (blockId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/nutritionists/block-time-slots/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to unblock time slots');
      }
      
      showToast('Time slots unblocked successfully!', 'success');
      
      // Refresh schedule data
      fetchScheduleData();
      
    } catch (error) {
      console.error('Failed to unblock time slots:', error);
      showToast('Failed to unblock time slots', 'error');
    }
  };

  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400 text-lg">Loading schedule data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-400">My Schedule</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('setup')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'setup' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Setup Schedule
          </button>
          <button
            onClick={() => setViewMode('view')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'view' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            View Schedule
          </button>
        </div>
      </div>

      {viewMode === 'setup' ? (
        /* Setup Mode - Availability Configuration */
        <div className="space-y-6">
          {/* Availability Settings */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Weekly Availability Settings</h3>
            <div className="space-y-4">
              {availability.map((day, index) => (
                <div key={day.dayOfWeek} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                        className="w-4 h-4 text-purple-500 bg-gray-900 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className={`font-semibold ${DAYS_OF_WEEK[day.dayOfWeek].color}`}>
                        {day.dayName}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleDayExpansion(day.dayOfWeek)}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedDays.includes(day.dayOfWeek) ? '−' : '+'}
                    </button>
                  </div>
                  
                  {day.isAvailable && expandedDays.includes(day.dayOfWeek) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Start Time</label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">End Time</label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Session Duration (min)</label>
                        <select
                          value={day.sessionDuration}
                          onChange={(e) => handleAvailabilityChange(index, 'sessionDuration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                        >
                          {SESSION_DURATIONS.map(duration => (
                            <option key={duration} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Break Duration (min)</label>
                        <select
                          value={day.breakDuration}
                          onChange={(e) => handleAvailabilityChange(index, 'breakDuration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                        >
                          {BREAK_DURATIONS.map(duration => (
                            <option key={duration} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={saveAvailability}
                disabled={saving}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
              
              <button
                onClick={async () => {
                  try {
                    setSaving(true);
                    const response = await fetch('http://localhost:3001/api/nutritionists/generate-time-slots', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to generate time slots');
                    }
                    
                    showToast('Time slots generated successfully!', 'success');
                    fetchScheduleData();
                  } catch (error) {
                    console.error('Failed to generate time slots:', error);
                    showToast('Failed to generate time slots', 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Generating...' : 'Generate Time Slots'}
              </button>
            </div>
          </div>

          {/* Block Time Form */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Block Time Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Date</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Start Time</label>
                <input
                  type="time"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">End Time</label>
                <input
                  type="time"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Reason</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Personal time off"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={blockTimeSlots}
                disabled={blockingTime}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {blockingTime ? 'Blocking...' : 'Block Time'}
              </button>
            </div>
          </div>

          {/* Blocked Time Slots */}
          {blockedTimeSlots.length > 0 && (
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Blocked Time Slots</h3>
              <div className="space-y-2">
                {blockedTimeSlots.map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <span className="font-medium text-white">
                        {new Date(block.start_date).toLocaleDateString()}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {block.start_time} - {block.end_time}
                      </span>
                      {block.reason && (
                        <span className="text-gray-500 ml-2">({block.reason})</span>
                      )}
                    </div>
                    <button
                      onClick={() => unblockTimeSlots(block.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View Mode - Schedule Display */
        <div className="space-y-6">
          {/* Date Selection */}
          <div className="flex items-center space-x-4 mb-6">
            <label className="text-lg font-semibold text-white">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
            />
          </div>
          
          {/* Time Slots Display */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              Schedule for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            
            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No time slots available for this date
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg text-center transition-all duration-300 ${
                      slot.status === 'booked'
                        ? 'bg-blue-600 text-white'
                        : slot.status === 'unavailable'
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    <div className="text-sm font-semibold">{slot.time}</div>
                    <div className="text-xs mt-1">
                      {slot.status === 'booked' ? 'Booked' : slot.status === 'unavailable' ? 'Unavailable' : 'Available'}
                    </div>
                    {slot.clientName && (
                      <div className="text-xs mt-1 opacity-75">
                        {slot.clientName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DietPlanRequests = ({ 
  showToast, 
  setSelectedChatRequest, 
  setShowChat 
}: { 
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setSelectedChatRequest: (request: any) => void;
  setShowChat: (show: boolean) => void;
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [notes, setNotes] = useState('');
  const [mealPlan, setMealPlan] = useState('');

  // Fetch diet plan requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/nutritionists/diet-plan-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch requests:', response.statusText);
        showToast('Failed to fetch diet plan requests', 'error');
        setRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showToast('Failed to fetch diet plan requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/nutritionists/diet-plan-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'completed',
          nutritionist_notes: notes,
          meal_plan: actionType === 'approve' || actionType === 'complete' ? mealPlan : selectedRequest.meal_plan,

        })
      });

      if (response.ok) {
        // Refresh the requests list
        await fetchRequests();
        
        setShowActionModal(false);
        setSelectedRequest(null);
        setNotes('');
        setMealPlan('');
        
        const actionText = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'marked as completed';
        showToast(`Request ${actionText} successfully`, 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to update request', 'error');
      }
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast('Failed to update request', 'error');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return request.status === 'approved';
    if (activeTab === 'rejected') return request.status === 'rejected';
    if (activeTab === 'completed') return request.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case 'approved': return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'rejected': return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'completed': return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      default: return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
  };

  if (loading) {
  return (
    <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400 text-lg">Loading requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'pending', label: 'Pending Requests', icon: 'fas fa-clock' },
          { id: 'approved', label: 'Approved Requests', icon: 'fas fa-check-circle' },
          { id: 'rejected', label: 'Rejected Requests', icon: 'fas fa-times-circle' },
          { id: 'completed', label: 'Completed Plans', icon: 'fas fa-star' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className={tab.icon}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-purple-400 mb-4">
          {activeTab === 'pending' && 'Pending Requests'}
          {activeTab === 'approved' && 'Approved Requests'}
          {activeTab === 'rejected' && 'Rejected Requests'}
          {activeTab === 'completed' && 'Completed Plans'}
        </h3>
        
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-500 mb-4"></i>
            <p className="text-gray-400 text-lg">No {activeTab} requests found</p>
          </div>
        ) : (
        <div className="space-y-4">
            {filteredRequests.map((request) => (
            <div key={request.id} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-bold text-white text-lg">{request.client_name}</h4>
                      <span className={getStatusBadge(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                        <strong className="text-white">Fitness Goal:</strong> {request.fitness_goal}
                    </div>
                    <div>
                        <strong className="text-white">Current Weight:</strong> {request.current_weight} kg
                    </div>
                    <div>
                        <strong className="text-white">Target Weight:</strong> {request.target_weight} kg
                    </div>
                      <div>
                        <strong className="text-white">Monthly Budget:</strong> PKR {request.monthly_budget}
                    </div>
                      {request.dietary_restrictions && (
                        <div className="md:col-span-2">
                          <strong className="text-white">Dietary Restrictions:</strong> {request.dietary_restrictions}
                  </div>
                      )}
                      {request.nutritionist_notes && (
                        <div className="md:col-span-2">
                          <strong className="text-white">Your Notes:</strong> {request.nutritionist_notes}
                </div>
                      )}
                      {request.meal_plan && (
                        <div className="md:col-span-2">
                          <strong className="text-white">Meal Plan:</strong> {request.meal_plan}
                        </div>
                      )}
                      <div className="md:col-span-2 text-xs text-gray-500">
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 space-y-2">
                    {request.status === 'pending' && (
                      <>
                    <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType('approve');
                            setShowActionModal(true);
                          }}
                          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Approve
                    </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType('reject');
                            setShowActionModal(true);
                          }}
                          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {request.status === 'approved' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType('complete');
                            setShowActionModal(true);
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedChatRequest(request);
                            setShowChat(true);
                          }}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </button>
                      </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-400">
                {actionType === 'approve' && 'Approve Request'}
                {actionType === 'reject' && 'Reject Request'}
                {actionType === 'complete' && 'Mark as Complete'}
              </h3>
              <button onClick={() => setShowActionModal(false)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder={actionType === 'approve' ? 'Add approval notes...' : actionType === 'reject' ? 'Add rejection reason...' : 'Add completion notes...'}
                  rows={3}
                ></textarea>
              </div>
              
              {actionType === 'approve' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preparation Time <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                    placeholder="e.g., 2-3 days, 1 week, 3-5 business days"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    How long will it take to prepare the diet plan?
                  </p>
                </div>
              )}
              
              {(actionType === 'approve' || actionType === 'complete') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meal Plan {actionType === 'approve' && <span className="text-gray-400">(Optional)</span>}
                  </label>
                  <textarea
                    value={mealPlan}
                    onChange={(e) => setMealPlan(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                    placeholder={actionType === 'approve' ? 'You can add the meal plan now or later...' : 'Enter the meal plan details...'}
                    rows={4}
                  ></textarea>
                  {actionType === 'approve' && (
                    <p className="text-xs text-gray-400 mt-1">
                      You can add the meal plan now or add it later when it's ready.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAction}
                  disabled={actionType === 'approve' && !preparationTime.trim()}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    actionType === 'approve' && !preparationTime.trim()
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  {actionType === 'approve' && 'Approve'}
                  {actionType === 'reject' && 'Reject'}
                  {actionType === 'complete' && 'Complete'}
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MealPlanTemplates = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: '',
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fats: '',
    target_fiber: '',
    target_sodium: '',
    target_sugar: '',
    meal_count: '',
    duration_weeks: 1,
    difficulty_level: 'Beginner',
    dietary_restrictions: [],
    fitness_goal: '',
    age_group: '',
    activity_level: '',
    description: '',
    instructions: '',
    tips_and_notes: '',
    is_public: false,
    meals: []
  });

  const [currentMeal, setCurrentMeal] = useState({
    meal_name: '',
    meal_type: 'Breakfast',
    meal_order: 1,
    target_calories: '',
    target_protein: '',
    target_carbs: '',
    target_fats: '',
    description: '',
    preparation_time: '',
    cooking_time: '',
    difficulty: 'Easy',
    foods: []
  });

  const [currentFood, setCurrentFood] = useState({
    food_name: '',
    quantity: '',
    unit: 'g',
    calories_per_serving: '',
    protein_per_serving: '',
    carbs_per_serving: '',
    fats_per_serving: '',
    fiber_per_serving: '',
    notes: ''
  });

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/meal-plan-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      showToast('Failed to fetch templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setIsLoading(true);
      
      // Clean up the template data before sending
      const cleanTemplate = {
        ...newTemplate,
        // Convert empty strings to null for numeric fields
        target_protein: newTemplate.target_protein === '' ? null : newTemplate.target_protein,
        target_carbs: newTemplate.target_carbs === '' ? null : newTemplate.target_carbs,
        target_fats: newTemplate.target_fats === '' ? null : newTemplate.target_fats,
        target_fiber: newTemplate.target_fiber === '' ? null : newTemplate.target_fiber,
        target_sodium: newTemplate.target_sodium === '' ? null : newTemplate.target_sodium,
        target_sugar: newTemplate.target_sugar === '' ? null : newTemplate.target_sugar,
        // Ensure meal_count is a number
        meal_count: newTemplate.meals.length
      };
      
      const response = await fetch('http://localhost:3001/api/meal-plan-templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanTemplate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      showToast('Meal plan template created successfully!', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      showToast('Failed to create template', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewTemplate({
      template_name: '',
      template_type: '',
      target_calories: '',
      target_protein: '',
      target_carbs: '',
      target_fats: '',
      target_fiber: '',
      target_sodium: '',
      target_sugar: '',
      meal_count: '',
      duration_weeks: 1,
      difficulty_level: 'Beginner',
      dietary_restrictions: [],
      fitness_goal: '',
      age_group: '',
      activity_level: '',
      description: '',
      instructions: '',
      tips_and_notes: '',
      is_public: false,
      meals: []
    });
    setCurrentStep(1);
    setCurrentMeal({
      meal_name: '',
      meal_type: 'Breakfast',
      meal_order: 1,
      target_calories: '',
      target_protein: '',
      target_carbs: '',
      target_fats: '',
      description: '',
      preparation_time: '',
      cooking_time: '',
      difficulty: 'Easy',
      foods: []
    });
    setCurrentFood({
      food_name: '',
      quantity: '',
      unit: 'g',
      calories_per_serving: '',
      protein_per_serving: '',
      carbs_per_serving: '',
      fats_per_serving: '',
      fiber_per_serving: '',
      notes: ''
    });
  };

  const addMeal = () => {
    if (currentMeal.meal_name && currentMeal.meal_type) {
      // Validate that the meal has at least one food item
      if (currentMeal.foods.length === 0) {
        showToast('Please add at least one food item to the meal', 'error');
        return;
      }
      
      const mealToAdd = {
        ...currentMeal,
        id: Date.now(),
        foods: [...currentMeal.foods]
      };
      
      setNewTemplate(prev => ({
        ...prev,
        meals: [...prev.meals, mealToAdd],
        meal_count: prev.meals.length + 1
      }));
      
      // Reset current meal with next meal order
      setCurrentMeal({
        meal_name: '',
        meal_type: 'Breakfast',
        meal_order: newTemplate.meals.length + 2,
        target_calories: '',
        target_protein: '',
        target_carbs: '',
        target_fats: '',
        description: '',
        preparation_time: '',
        cooking_time: '',
        difficulty: 'Easy',
        foods: []
      });
      
      showToast('Meal added successfully! You can now add another meal or create the template.', 'success');
    } else {
      showToast('Please fill in meal name and type', 'error');
    }
  };

  const addFood = () => {
    if (currentFood.food_name && currentFood.quantity && currentFood.unit) {
      const foodToAdd = {
        ...currentFood,
        id: Date.now()
      };
      
      setCurrentMeal(prev => ({
        ...prev,
        foods: [...prev.foods, foodToAdd]
      }));
      
      setCurrentFood({
        food_name: '',
        quantity: '',
        unit: 'g',
        calories_per_serving: '',
        protein_per_serving: '',
        carbs_per_serving: '',
        fats_per_serving: '',
        fiber_per_serving: '',
        notes: ''
      });
      
      showToast('Food item added successfully!', 'success');
    } else {
      showToast('Please fill in food name, quantity, and unit', 'error');
    }
  };

  const removeMeal = (mealId) => {
    setNewTemplate(prev => ({
      ...prev,
      meals: prev.meals.filter(meal => meal.id !== mealId),
      meal_count: prev.meals.length - 1
    }));
  };

  const removeFood = (foodId) => {
    setCurrentMeal(prev => ({
      ...prev,
      foods: prev.foods.filter(food => food.id !== foodId)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!newTemplate.template_name || !newTemplate.template_type || !newTemplate.target_calories) {
          showToast('Please fill in all required fields: Template Name, Template Type, and Target Calories', 'error');
          return false;
        }
        if (newTemplate.target_calories < 100 || newTemplate.target_calories > 9999) {
          showToast('Target calories must be between 100 and 9999', 'error');
          return false;
        }
        return true;
      case 2:
        // Step 2 is optional, so always allow proceeding
        return true;
      case 3:
        if (newTemplate.meals.length === 0) {
          showToast('Please add at least one meal to the template', 'error');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-purple-400">Meal Plan Templates</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <i className="fas fa-plus mr-2"></i>
          Create New Template
        </button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700/50">
            <i className="fas fa-utensils text-3xl text-gray-600"></i>
          </div>
          <p className="text-lg font-medium text-gray-400">No templates yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first meal plan template to get started</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
            <div key={template.id} className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-bold text-white text-lg">{template.template_name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.template_type === 'Weight Loss' ? 'bg-red-500/20 text-red-300' :
                  template.template_type === 'Muscle Gain' ? 'bg-blue-500/20 text-blue-300' :
                  template.template_type === 'Maintenance' ? 'bg-green-500/20 text-green-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {template.template_type}
                </span>
              </div>
              
            <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span className="font-semibold">{template.target_calories}</span>
            </div>
                <div className="flex justify-between">
                  <span>Meals:</span>
                  <span className="font-semibold">{template.meal_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{template.duration_weeks} week{template.duration_weeks > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-semibold">{template.difficulty_level}</span>
                </div>
              </div>
              
            <div className="flex space-x-2">
              <button 
                  onClick={() => showToast(`Editing ${template.template_name}`, 'info')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                  <i className="fas fa-edit mr-1"></i>
                Edit
              </button>
              <button 
                  onClick={() => showToast(`Using ${template.template_name} for new plan`, 'info')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                  <i className="fas fa-play mr-1"></i>
                Use
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-400">Create Meal Plan Template</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }} 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-purple-500' : 'bg-gray-600'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Step {currentStep} of 3</span>
                <span className="text-sm text-purple-400">{Math.round((currentStep / 3) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Basic Template Info */}
            {currentStep === 1 && (
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Basic Template Information</h4>
                    <p className="text-sm text-gray-400">Start with the essential details of your meal plan</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                    placeholder="Template Name *"
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  />
                  
              <select
                    value={newTemplate.template_type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template_type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  >
                    <option value="">Select Template Type *</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
                    <option value="Athletic Performance">Athletic Performance</option>
                    <option value="General Health">General Health</option>
                    <option value="Special Diet">Special Diet</option>
              </select>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Calories *</label>
              <input
                type="number"
                      min="0"
                      max="9999"
                      step="1"
                      placeholder="0-9999 calories"
                      value={newTemplate.target_calories}
                      onChange={(e) => {
                        const value = Math.min(9999, Math.max(0, parseInt(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_calories: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <select
                    value={newTemplate.fitness_goal}
                    onChange={(e) => setNewTemplate({ ...newTemplate, fitness_goal: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  >
                    <option value="">Select Fitness Goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Strength">Strength</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                  
                  <select
                    value={newTemplate.difficulty_level}
                    onChange={(e) => setNewTemplate({ ...newTemplate, difficulty_level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  
                  <select
                    value={newTemplate.age_group}
                    onChange={(e) => setNewTemplate({ ...newTemplate, age_group: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  >
                    <option value="">Select Age Group</option>
                    <option value="Teen">Teen (13-19)</option>
                    <option value="Adult">Adult (20-64)</option>
                    <option value="Senior">Senior (65+)</option>
                  </select>
                </div>
                
                <textarea
                  placeholder="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  rows={3}
                />
              </div>
            )}

            {/* Step 2: Nutritional Targets */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Nutritional Targets</h4>
                    <p className="text-sm text-gray-400">Set your macro and micronutrient goals</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Protein (g)</label>
              <input
                type="number"
                      min="0"
                      max="999"
                      step="0.1"
                      placeholder="0-999g"
                      value={newTemplate.target_protein}
                      onChange={(e) => {
                        const value = Math.min(999, Math.max(0, parseFloat(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_protein: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Carbs (g)</label>
              <input
                      type="number"
                      min="0"
                      max="999"
                      step="0.1"
                      placeholder="0-999g"
                      value={newTemplate.target_carbs}
                      onChange={(e) => {
                        const value = Math.min(999, Math.max(0, parseFloat(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_carbs: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Fats (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      step="0.1"
                      placeholder="0-999g"
                      value={newTemplate.target_fats}
                      onChange={(e) => {
                        const value = Math.min(999, Math.max(0, parseFloat(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_fats: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Fiber (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      step="0.1"
                      placeholder="0-999g"
                      value={newTemplate.target_fiber}
                      onChange={(e) => {
                        const value = Math.min(999, Math.max(0, parseFloat(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_fiber: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Sodium (mg)</label>
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      step="1"
                      placeholder="0-9999mg"
                      value={newTemplate.target_sodium}
                      onChange={(e) => {
                        const value = Math.min(9999, Math.max(0, parseInt(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_sodium: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Sugar (g)</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      step="0.1"
                      placeholder="0-999g"
                      value={newTemplate.target_sugar}
                      onChange={(e) => {
                        const value = Math.min(999, Math.max(0, parseFloat(e.target.value) || 0));
                        setNewTemplate({ ...newTemplate, target_sugar: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      step="1"
                      placeholder="1-52 weeks"
                      value={newTemplate.duration_weeks}
                      onChange={(e) => {
                        const value = Math.min(52, Math.max(1, parseInt(e.target.value) || 1));
                        setNewTemplate({ ...newTemplate, duration_weeks: value });
                      }}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                    />
                  </div>
                  
                  <select
                    value={newTemplate.activity_level}
                    onChange={(e) => setNewTemplate({ ...newTemplate, activity_level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                  >
                    <option value="">Select Activity Level</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Lightly Active">Lightly Active</option>
                    <option value="Moderately Active">Moderately Active</option>
                    <option value="Very Active">Very Active</option>
                    <option value="Extremely Active">Extremely Active</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={newTemplate.is_public}
                      onChange={(e) => setNewTemplate({ ...newTemplate, is_public: e.target.checked })}
                      className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Make this template public for other nutritionists</span>
                  </label>
                </div>
                
                {/* Helpful Tips */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-info text-white text-xs"></i>
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold text-blue-400 mb-2">Nutritional Guidelines</h6>
                      <div className="text-xs text-blue-200 space-y-1">
                        <p>• <strong>Protein, Carbs, Fats, Fiber, Sugar:</strong> 0-999g (decimal values allowed)</p>
                        <p>• <strong>Sodium:</strong> 0-9999mg (whole numbers)</p>
                        <p>• <strong>Calories:</strong> 100-9999 calories</p>
                        <p>• <strong>Duration:</strong> 1-52 weeks</p>
                        <p>• All nutritional fields are optional but recommended for comprehensive planning</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Meals and Foods */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Meals and Foods</h4>
                    <p className="text-sm text-gray-400">Build your daily meal structure with detailed food items</p>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fas fa-lightbulb text-white text-xs"></i>
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold text-blue-400 mb-2">Meal Creation Process</h6>
                      <div className="text-xs text-blue-200 space-y-1">
                        <p>• <strong>Step 1:</strong> Fill in meal details (name, type, order, difficulty)</p>
                        <p>• <strong>Step 2:</strong> Add food items with quantities and units</p>
                        <p>• <strong>Step 3:</strong> Click "Add Meal to Template" to save the meal</p>
                        <p>• <strong>Step 4:</strong> Repeat for additional meals or create template</p>
                        <p>• <strong>Note:</strong> Each meal must have at least one food item</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Current Meals */}
                {newTemplate.meals.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-lg font-semibold text-purple-300">Added Meals ({newTemplate.meals.length})</h5>
                      <span className="text-sm text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
                        ✓ Template Ready
                      </span>
                    </div>
                    {newTemplate.meals.map((meal, index) => (
                      <div key={meal.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{meal.meal_order}</span>
                            </div>
                            <h6 className="font-semibold text-white">{meal.meal_name}</h6>
                            <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                              {meal.meal_type}
                            </span>
                          </div>
                <button
                            onClick={() => removeMeal(meal.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/20 rounded"
                            title="Remove meal"
                >
                            <i className="fas fa-trash"></i>
                </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-3">
                          <div>
                            <span className="text-gray-400">Difficulty:</span> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              meal.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                              meal.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {meal.difficulty}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Food Items:</span> 
                            <span className="ml-2 text-white font-medium">{meal.foods.length}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Foods: {meal.foods.map(food => `${food.food_name} (${food.quantity} ${food.unit})`).join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add New Meal */}
                <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-purple-300">Add New Meal</h5>
                    <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                      Step {newTemplate.meals.length + 1} of your meal plan
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meal Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Protein Smoothie Bowl"
                        value={currentMeal.meal_name}
                        onChange={(e) => setCurrentMeal({ ...currentMeal, meal_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meal Type *</label>
                      <select
                        value={currentMeal.meal_type}
                        onChange={(e) => setCurrentMeal({ ...currentMeal, meal_type: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                        <option value="Pre-Workout">Pre-Workout</option>
                        <option value="Post-Workout">Post-Workout</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meal Order</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        placeholder="1-10"
                        value={currentMeal.meal_order}
                        onChange={(e) => {
                          const value = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                          setCurrentMeal({ ...currentMeal, meal_order: value });
                        }}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                      <select
                        value={currentMeal.difficulty}
                        onChange={(e) => setCurrentMeal({ ...currentMeal, difficulty: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Add Food to Current Meal */}
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="text-sm font-semibold text-purple-300">Add Food Items</h6>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                        {currentMeal.foods.length} food(s) added
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Food Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Greek Yogurt"
                          value={currentFood.food_name}
                          onChange={(e) => setCurrentFood({ ...currentFood, food_name: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:border-purple-400/70 focus:outline-none text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="0.1"
                          max="9999"
                          step="0.1"
                          placeholder="0.1-9999"
                          value={currentFood.quantity}
                          onChange={(e) => {
                            const value = Math.min(9999, Math.max(0.1, parseFloat(e.target.value) || 0.1));
                            setCurrentFood({ ...currentFood, quantity: value });
                          }}
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:border-purple-400/70 focus:outline-none text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Unit *</label>
                        <select
                          value={currentFood.unit}
                          onChange={(e) => setCurrentFood({ ...currentFood, unit: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700/70 border border-gray-600/50 rounded-lg focus:border-purple-400/70 focus:outline-none text-white text-sm"
                        >
                          <option value="g">grams (g)</option>
                          <option value="oz">ounces (oz)</option>
                          <option value="cup">cups</option>
                          <option value="tbsp">tablespoons (tbsp)</option>
                          <option value="tsp">teaspoons (tsp)</option>
                          <option value="piece">piece(s)</option>
                          <option value="slice">slice(s)</option>
                        </select>
                      </div>
                    </div>
                    
                <button
                      onClick={addFood}
                      disabled={!currentFood.food_name || !currentFood.quantity || !currentFood.unit}
                      className={`w-full py-2 rounded-lg font-semibold transition-colors text-sm ${
                        !currentFood.food_name || !currentFood.quantity || !currentFood.unit
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Add Food Item
                </button>
                    
                    {/* Food Quantity Tips */}
                    <div className="mt-3 text-xs text-gray-400 text-center">
                      <p>💡 <strong>Tip:</strong> Food quantities support decimal values (e.g., 0.5, 1.25)</p>
                      <p>📏 <strong>Range:</strong> 0.1 to 9999 units</p>
              </div>
            </div>
                  
                  {/* Current Foods in Meal */}
                  {currentMeal.foods.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Foods in this meal:</h6>
                      <div className="space-y-2">
                        {currentMeal.foods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-sm text-white font-medium">{food.food_name}</span>
                              <span className="text-xs text-gray-400 bg-gray-600/50 px-2 py-1 rounded">
                                {food.quantity} {food.unit}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFood(food.id)}
                              className="text-red-400 hover:text-red-300 transition-colors text-sm p-1 hover:bg-red-500/20 rounded"
                              title="Remove food item"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add Meal Button */}
                  <div className="space-y-3">
                    <button
                      onClick={addMeal}
                      disabled={!currentMeal.meal_name || !currentMeal.meal_type || currentMeal.foods.length === 0}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        !currentMeal.meal_name || !currentMeal.meal_type || currentMeal.foods.length === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Meal to Template
                    </button>
                    
                    {currentMeal.foods.length === 0 && (
                      <p className="text-xs text-yellow-400 text-center">
                        ⚠️ Add at least one food item before adding the meal
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Template Summary */}
                {newTemplate.meals.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white text-xs"></i>
                      </div>
                      <div>
                        <h6 className="font-semibold text-green-400">Template Summary</h6>
                        <p className="text-sm text-green-200">
                          Your template "{newTemplate.template_name}" is ready with {newTemplate.meals.length} meal(s). 
                          You can add more meals or create the template now.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{newTemplate.meals.length}</div>
                        <div className="text-green-200">Meals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{newTemplate.meals.reduce((total, meal) => total + meal.foods.length, 0)}</div>
                        <div className="text-green-200">Food Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{newTemplate.target_calories || 'N/A'}</div>
                        <div className="text-green-200">Target Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{newTemplate.template_type || 'N/A'}</div>
                        <div className="text-green-200">Type</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  {newTemplate.meals.length === 0 && (
                    <span className="text-sm text-yellow-400 bg-yellow-500/20 px-3 py-2 rounded-lg">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Add at least one meal to continue
                    </span>
                  )}
                  <button
                    onClick={handleCreateTemplate}
                    disabled={isLoading || newTemplate.meals.length === 0}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isLoading || newTemplate.meals.length === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Create Template
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientNotes = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const clients = [
    { id: 1, name: 'Emma Wilson', lastConsult: '2024-01-15', goal: 'Weight Loss' },
    { id: 2, name: 'David Brown', lastConsult: '2024-01-14', goal: 'Muscle Gain' },
    { id: 3, name: 'Lisa Garcia', lastConsult: '2024-01-13', goal: 'Maintenance' }
  ];

  const handleSaveNote = (clientId: number) => {
    showToast('Client notes saved!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="space-y-6">
        {clients.map((client) => (
          <div key={client.id} className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {client.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
              <div><strong>Last Consultation:</strong> {client.lastConsult}</div>
              <div><strong>Goal:</strong> {client.goal}</div>
            </div>
            <textarea
              value={notes[client.id] || ''}
              onChange={(e) => setNotes({ ...notes, [client.id]: e.target.value })}
              placeholder="Add consultation notes, progress updates, observations..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
              rows={4}
            />
            <button
              onClick={() => handleSaveNote(client.id)}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Save Notes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SessionRequests = ({ showToast, setSelectedChatRequest, setShowChat }: { 
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setSelectedChatRequest?: (request: any) => void;
  setShowChat?: (show: boolean) => void;
}) => {
  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState<'session-requests' | 'diet-plan-requests'>('session-requests');
  
  // Session requests state
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [selectedSessionRequest, setSelectedSessionRequest] = useState<any>(null);
  const [showSessionActionModal, setShowSessionActionModal] = useState(false);
  const [sessionActionType, setSessionActionType] = useState<'approve' | 'reject'>('approve');
  const [sessionResponse, setSessionResponse] = useState('');
  const [approvedDate, setApprovedDate] = useState('');
  const [approvedTime, setApprovedTime] = useState('');
  const [sessionPrice, setSessionPrice] = useState('');

  // Diet plan requests state
  const [dietPlanRequests, setDietPlanRequests] = useState<any[]>([]);
  const [dietPlanLoading, setDietPlanLoading] = useState(true);
  const [activeDietTab, setActiveDietTab] = useState<'pending' | 'approved' | 'rejected' | 'completed'>('pending');
  const [selectedDietRequest, setSelectedDietRequest] = useState<any>(null);
  const [showDietActionModal, setShowDietActionModal] = useState(false);
  const [dietActionType, setDietActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [dietResponse, setDietResponse] = useState('');
  const [mealPlan, setMealPlan] = useState('');

  useEffect(() => {
    if (activeMainTab === 'session-requests') {
      fetchSessionRequests();
    } else {
      fetchDietPlanRequests();
    }
  }, [activeMainTab]);

  const fetchSessionRequests = async () => {
    try {
      setSessionLoading(true);
      const response = await fetch('http://localhost:3001/api/nutritionists/session-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionRequests(data);
      } else {
        console.error('Failed to fetch session requests:', response.statusText);
        showToast('Failed to fetch session requests', 'error');
        setSessionRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch session requests:', error);
      showToast('Failed to fetch session requests', 'error');
      setSessionRequests([]);
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchDietPlanRequests = async () => {
    try {
      setDietPlanLoading(true);
      const response = await fetch('http://localhost:3001/api/nutritionists/diet-plan-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDietPlanRequests(data);
      } else {
        console.error('Failed to fetch diet plan requests:', response.statusText);
        showToast('Failed to fetch diet plan requests', 'error');
        setDietPlanRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch diet plan requests:', error);
      showToast('Failed to fetch diet plan requests', 'error');
      setDietPlanRequests([]);
    } finally {
      setDietPlanLoading(false);
    }
  };

  const handleSessionAction = async () => {
    try {
      const fetchResponse = await fetch(`http://localhost:3001/api/nutritionists/session-requests/${selectedSessionRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: sessionActionType === 'approve' ? 'approved' : 'rejected',
          nutritionist_response: sessionResponse,
          approved_date: sessionActionType === 'approve' ? approvedDate : undefined,
          approved_time: sessionActionType === 'approve' ? approvedTime : undefined,
          session_price: sessionActionType === 'approve' ? parseFloat(sessionPrice) : undefined
        })
      });

      if (fetchResponse.ok) {
        await fetchSessionRequests();
        setShowSessionActionModal(false);
        setSelectedSessionRequest(null);
        setSessionResponse('');
        setApprovedDate('');
        setApprovedTime('');
        setSessionPrice('');
        
        const actionText = sessionActionType === 'approve' ? 'approved' : 'rejected';
        showToast(`Session request ${actionText} successfully`, 'success');
      } else {
        const errorData = await fetchResponse.json();
        showToast(errorData.error || 'Failed to update request', 'error');
      }
    } catch (error) {
      console.error('Failed to update session request:', error);
      showToast('Failed to update session request', 'error');
    }
  };

  const handleDietPlanAction = async () => {
    try {
      const fetchResponse = await fetch(`http://localhost:3001/api/nutritionists/diet-plan-requests/${selectedDietRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: dietActionType === 'approve' ? 'approved' : dietActionType === 'reject' ? 'rejected' : 'completed',
          nutritionist_notes: dietResponse,
          meal_plan: dietActionType === 'approve' || dietActionType === 'complete' ? mealPlan : undefined,

        })
      });

      if (fetchResponse.ok) {
        await fetchDietPlanRequests();
        setShowDietActionModal(false);
        setSelectedDietRequest(null);
        setDietResponse('');
        setMealPlan('');
        
        const actionText = dietActionType === 'approve' ? 'approved' : dietActionType === 'reject' ? 'rejected' : 'completed';
        showToast(`Diet plan request ${actionText} successfully`, 'success');
      } else {
        const errorData = await fetchResponse.json();
        showToast(errorData.error || 'Failed to update request', 'error');
      }
    } catch (error) {
      console.error('Failed to update diet plan request:', error);
      showToast('Failed to update diet plan request', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case 'approved': return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'rejected': return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'completed': return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      default: return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
  };

  if (sessionLoading && activeMainTab === 'session-requests') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400 text-lg">Loading session requests...</div>
        </div>
      </div>
    );
  }

  if (dietPlanLoading && activeMainTab === 'diet-plan-requests') {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400 text-lg">Loading diet plan requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">My Requests</h2>
      
      {/* Main Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveMainTab('session-requests')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeMainTab === 'session-requests'
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-calendar-check mr-2"></i>
          Session Requests
        </button>
        <button
          onClick={() => setActiveMainTab('diet-plan-requests')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeMainTab === 'diet-plan-requests'
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <i className="fas fa-utensils mr-2"></i>
          Diet Plan Requests
        </button>
      </div>

      {/* Session Requests Tab */}
      {activeMainTab === 'session-requests' && (
        <div>
          {sessionRequests.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-calendar-times text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400 text-lg">No session requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionRequests.map((request) => (
                <div key={request.id} className="glass-card p-6 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-bold text-white text-lg">
                          {request.first_name} {request.last_name}
                        </h4>
                        <span className={getStatusBadge(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <strong className="text-white">Session Type:</strong> {request.session_type.replace(/_/g, ' ')}
                        </div>
                        <div>
                          <strong className="text-white">Preferred Date:</strong> {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'Not specified'}
                        </div>
                        <div>
                          <strong className="text-white">Preferred Time:</strong> {request.preferred_time || 'Not specified'}
                        </div>
                        <div>
                          <strong className="text-white">Requested on:</strong> {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        {request.message && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Message:</strong> {request.message}
                          </div>
                        )}
                        {request.nutritionist_response && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Your Response:</strong> {request.nutritionist_response}
                          </div>
                        )}
                        {request.approved_date && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Approved Date:</strong> {new Date(request.approved_date).toLocaleDateString()} at {request.approved_time}
                          </div>
                        )}
                        {request.session_price && (
                          <div className="md:col-span-2">
                            <strong className="text-white">Session Price:</strong> PKR {request.session_price}
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons for pending requests */}
                      {request.status === 'pending' && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSessionRequest(request);
                              setSessionActionType('approve');
                              setShowSessionActionModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSessionRequest(request);
                              setSessionActionType('reject');
                              setShowSessionActionModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          {setSelectedChatRequest && setShowChat && (
                            <button
                              onClick={() => {
                                setSelectedChatRequest(request);
                                setShowChat(true);
                              }}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                              <i className="fas fa-comments mr-2"></i>
                              Chat
                            </button>
                          )}
                        </div>
                      )}

                      {/* Chat button for all session requests */}
                      {setSelectedChatRequest && setShowChat && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedChatRequest(request);
                              setShowChat(true);
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          >
                            <i className="fas fa-comments mr-2"></i>
                            Chat with Client
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diet Plan Requests Tab */}
      {activeMainTab === 'diet-plan-requests' && (
        <div>
          {/* Diet Plan Sub-tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
            {['pending', 'approved', 'rejected', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDietTab(tab as any)}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeDietTab === tab
                    ? 'bg-green-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Filtered diet plan requests */}
          {(() => {
            const filteredRequests = dietPlanRequests.filter(request => request.status === activeDietTab);
            
            if (filteredRequests.length === 0) {
              return (
                <div className="text-center py-12">
                  <i className="fas fa-utensils text-4xl text-gray-500 mb-4"></i>
                  <p className="text-gray-400 text-lg">No {activeDietTab} diet plan requests found</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="glass-card p-6 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="font-bold text-white text-lg">
                            {request.client_name}
                          </h4>
                          <span className={getStatusBadge(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                          <div>
                            <strong className="text-white">Fitness Goal:</strong> {request.fitness_goal}
                          </div>
                          <div>
                            <strong className="text-white">Current Weight:</strong> {request.current_weight} kg
                          </div>
                          <div>
                            <strong className="text-white">Target Weight:</strong> {request.target_weight} kg
                          </div>
                          <div>
                            <strong className="text-white">Monthly Budget:</strong> PKR {request.monthly_budget}
                          </div>
                          {request.dietary_restrictions && (
                            <div className="md:col-span-2">
                              <strong className="text-white">Dietary Restrictions:</strong> {request.dietary_restrictions}
                            </div>
                          )}
                          {request.additional_notes && (
                            <div className="md:col-span-2">
                              <strong className="text-white">Additional Notes:</strong> {request.additional_notes}
                            </div>
                          )}
                          {request.nutritionist_notes && (
                            <div className="md:col-span-2">
                              <strong className="text-white">Your Notes:</strong> {request.nutritionist_notes}
                            </div>
                          )}
                          {request.meal_plan && (
                            <div className="md:col-span-2">
                              <strong className="text-white">Meal Plan:</strong> {request.meal_plan}
                            </div>
                          )}

                        </div>
                        
                        {/* Action buttons based on status */}
                        {request.status === 'pending' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDietRequest(request);
                                setDietActionType('approve');
                                setShowDietActionModal(true);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDietRequest(request);
                                setDietActionType('reject');
                                setShowDietActionModal(true);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                            {setSelectedChatRequest && setShowChat && (
                              <button
                                onClick={() => {
                                  setSelectedChatRequest(request);
                                  setShowChat(true);
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                <i className="fas fa-comments mr-2"></i>
                                Chat
                              </button>
                            )}
                          </div>
                        )}
                        
                        {request.status === 'approved' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDietRequest(request);
                                setDietActionType('complete');
                                setShowDietActionModal(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Mark as Completed
                            </button>
                            {setSelectedChatRequest && setShowChat && (
                              <button
                                onClick={() => {
                                  setSelectedChatRequest(request);
                                  setShowChat(true);
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                <i className="fas fa-comments mr-2"></i>
                                Chat
                              </button>
                            )}
                          </div>
                        )}

                        {/* Chat button for all diet plan requests */}
                        {setSelectedChatRequest && setShowChat && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedChatRequest(request);
                                setShowChat(true);
                              }}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                              <i className="fas fa-comments mr-2"></i>
                              Chat with Client
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Session Action Modal */}
      {showSessionActionModal && selectedSessionRequest && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-purple-400">
                {sessionActionType === 'approve' ? 'Approve' : 'Reject'} Session Request
              </h3>
              <button 
                onClick={() => setShowSessionActionModal(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg" 
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Response</label>
                <textarea
                  value={sessionResponse}
                  onChange={(e) => setSessionResponse(e.target.value)}
                  placeholder={sessionActionType === 'approve' ? 'Add any notes or instructions...' : 'Reason for rejection...'}
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                  rows={3}
                />
              </div>
              
              {sessionActionType === 'approve' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Approved Date</label>
                      <input
                        type="date"
                        value={approvedDate}
                        onChange={(e) => setApprovedDate(e.target.value)}
                        className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Approved Time</label>
                      <input
                        type="time"
                        value={approvedTime}
                        onChange={(e) => setApprovedTime(e.target.value)}
                        className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Session Price (PKR)</label>
                    <input
                      type="number"
                      value={sessionPrice}
                      onChange={(e) => setSessionPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSessionActionModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSessionAction}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    sessionActionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {sessionActionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diet Plan Action Modal */}
      {showDietActionModal && selectedDietRequest && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-purple-400">
                {dietActionType === 'approve' ? 'Approve' : dietActionType === 'reject' ? 'Reject' : 'Complete'} Diet Plan Request
              </h3>
              <button 
                onClick={() => setShowDietActionModal(false)} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg" 
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {dietActionType === 'approve' ? 'Notes' : dietActionType === 'reject' ? 'Reason for Rejection' : 'Completion Notes'}
                </label>
                <textarea
                  value={dietResponse}
                  onChange={(e) => setDietResponse(e.target.value)}
                  placeholder={
                    dietActionType === 'approve' ? 'Add any notes or instructions...' : 
                    dietActionType === 'reject' ? 'Reason for rejection...' : 
                    'Add completion notes...'
                  }
                  className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                  rows={3}
                />
              </div>
              
              {(dietActionType === 'approve' || dietActionType === 'complete') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Meal Plan</label>
                    <textarea
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      placeholder="Enter the meal plan details..."
                      className="w-full px-3 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                      rows={4}
                    />
                  </div>

                </>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDietActionModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDietPlanAction}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    dietActionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : dietActionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {dietActionType === 'approve' ? 'Approve' : dietActionType === 'reject' ? 'Reject' : 'Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NutritionistSubscription = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'Emma Wilson',
      plan: 'Weight Loss Plan',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      status: 'active',
      consultationsRemaining: 3,
      totalConsultations: 4,
      price: 'PKR 15,000'
    },
    {
      id: 2,
      name: 'David Brown',
      plan: 'Sports Nutrition',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      consultationsRemaining: 2,
      totalConsultations: 3,
      price: 'PKR 12,000'
    },
    {
      id: 3,
      name: 'Lisa Garcia',
      plan: 'Maintenance Plan',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      status: 'paused',
      consultationsRemaining: 1,
      totalConsultations: 2,
      price: 'PKR 8,000'
    },
    {
      id: 4,
      name: 'Mike Johnson',
      plan: 'Muscle Gain Plan',
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      status: 'cancelled',
      consultationsRemaining: 0,
      totalConsultations: 4,
      price: 'PKR 18,000'
    }
  ]);

  const handleSubscriptionAction = (clientId: number, action: 'pause' | 'cancel' | 'resume') => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        let newStatus = client.status;
        if (action === 'pause') newStatus = 'paused';
        else if (action === 'cancel') newStatus = 'cancelled';
        else if (action === 'resume') newStatus = 'active';
        
        return { ...client, status: newStatus };
      }
      return client;
    }));
    
    showToast(`Client subscription ${action}d successfully`, 'success');
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Client Subscriptions
        </h2>
        <p className="text-gray-300">Manage your clients' nutrition plans and consultations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                <p className="text-gray-300">{client.plan}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(client.status)} text-white`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Start Date:</span>
                <span className="text-white">{client.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">End Date:</span>
                <span className="text-white">{client.endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price:</span>
                <span className="text-green-400 font-semibold">{client.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Consultations:</span>
                <span className="text-blue-400">{client.consultationsRemaining}/{client.totalConsultations}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(((client.totalConsultations - client.consultationsRemaining) / client.totalConsultations) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  style={{ width: `${((client.totalConsultations - client.consultationsRemaining) / client.totalConsultations) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {client.status === 'active' ? (
                <>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'pause')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'cancel')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : client.status === 'paused' ? (
                <>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'resume')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction(client.id, 'cancel')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSubscriptionAction(client.id, 'resume')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NutritionistAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const announcements = [
    {
      id: 1,
      title: 'New Equipment Arrival',
      message: 'We have new cardio machines arriving next week!',
      priority: 'high',
      date: '2024-01-20',
      target: 'all'
    },
    {
      id: 2,
      title: 'Nutritionist Meeting',
      message: 'Monthly nutritionist meeting this Friday at 2 PM',
      priority: 'medium',
      date: '2024-01-18',
      target: 'nutritionists'
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      priority: 'high',
      date: '2024-01-15',
      target: 'all'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Announcements
        </h2>
        <p className="text-gray-300">Stay updated with the latest gym announcements</p>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="glass-card p-6 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                  <span className={`text-sm font-semibold ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{announcement.message}</p>
                <p className="text-sm text-gray-400">Posted: {announcement.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
