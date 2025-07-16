import { useState } from 'react';
import { User } from '../types';
import { facilities, exercises } from '../data/mockData';
import { useToast } from './Toast';

interface MemberPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const MemberPortal = ({ user, onLogout }: MemberPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} showToast={showToast} />;
      case 'profile':
        return <Profile user={user} showToast={showToast} />;
      case 'membership':
        return <Membership user={user} showToast={showToast} />;
      case 'workout':
        return <WorkoutSchedule showToast={showToast} />;
      case 'book-sessions':
        return <BookSessions showToast={showToast} />;
      case 'facilities':
        return <FacilitiesBooking showToast={showToast} />;
      case 'store':
        return <MemberStore showToast={showToast} />;
      case 'loyalty':
        return <LoyaltyReferrals user={user} showToast={showToast} />;
      case 'history':
        return <HistoryReviews showToast={showToast} />;
      default:
        return <Dashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <i className="fas fa-dumbbell text-2xl text-blue-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-blue-400' },
            { id: 'profile', icon: 'fas fa-user', label: 'My Profile', color: 'text-green-400' },
            { id: 'membership', icon: 'fas fa-id-card', label: 'Membership', color: 'text-pink-400' },
            { id: 'workout', icon: 'fas fa-dumbbell', label: 'Workout Schedule', color: 'text-purple-400' },
            { id: 'book-sessions', icon: 'fas fa-calendar-plus', label: 'Book Sessions', color: 'text-orange-400' },
            { id: 'facilities', icon: 'fas fa-swimming-pool', label: 'Facilities', color: 'text-blue-400' },
            { id: 'store', icon: 'fas fa-shopping-cart', label: 'Store', color: 'text-green-400' },
            { id: 'loyalty', icon: 'fas fa-gift', label: 'Loyalty & Referrals', color: 'text-pink-400' },
            { id: 'history', icon: 'fas fa-history', label: 'History & Reviews', color: 'text-purple-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-400 hover:bg-opacity-10 transition-all ${
                currentPage === item.id ? 'bg-blue-400 bg-opacity-20' : ''
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
              <div className="text-sm text-gray-300">Welcome back, {user?.name}!</div>
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
    </div>
  );
};

const Dashboard = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-blue-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
        MEMBER DASHBOARD
      </h1>
      <p className="text-gray-300">Welcome back, {user?.name}! Here's your fitness overview.</p>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Current Plan</h3>
          <i className="fas fa-crown text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{user?.membershipPlan || 'QUARTERLY'}</p>
        <p className="text-gray-300">67 days remaining</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Loyalty Points</h3>
          <i className="fas fa-star text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{user?.loyaltyPoints || 1247}</p>
        <button 
          onClick={() => showToast('Redirecting to loyalty page...', 'info')}
          className="text-green-400 hover:text-green-300 text-sm"
        >
          Redeem Now
        </button>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-pink-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Streak</h3>
          <i className="fas fa-fire text-pink-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{user?.consistencyStreak || 90} days</p>
        <p className="text-gray-300">Personal best!</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-yellow-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-yellow-400" style={{ fontFamily: 'Orbitron, monospace' }}>Referrals</h3>
          <i className="fas fa-users text-yellow-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">{user?.referralCount || 5}</p>
        <p className="text-gray-300">Friends joined</p>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { icon: 'fas fa-calendar-plus', title: 'BOOK SESSION', description: 'Schedule with trainer', color: 'border-blue-400' },
        { icon: 'fas fa-swimming-pool', title: 'BOOK FACILITY', description: 'Reserve pool/sauna', color: 'border-green-400' },
        { icon: 'fas fa-dumbbell', title: 'WORKOUT PLAN', description: 'View your schedule', color: 'border-pink-400' },
        { icon: 'fas fa-shopping-cart', title: 'VISIT STORE', description: 'Member discounts', color: 'border-yellow-400' }
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

    {/* Consistency Reward */}
    {(user?.consistencyStreak || 90) >= 90 && (
      <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              🏆 CONSISTENCY REWARD
            </h3>
            <p className="text-white">You've maintained a 90-day streak! Claim your voucher.</p>
          </div>
          <button 
            onClick={() => showToast('Voucher FITNESS90 claimed!', 'success')}
            className="bg-white text-pink-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            CLAIM FITNESS90
          </button>
        </div>
      </div>
    )}
  </div>
);

const Profile = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    fitnessGoals: 'Build muscle and improve endurance',
    healthNotes: 'No known allergies or medical conditions'
  });

  const handleSave = () => {
    showToast('Profile saved successfully!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-8 rounded-2xl max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Edit Profile
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Fitness Goals</label>
            <textarea
              value={profile.fitnessGoals}
              onChange={(e) => setProfile({ ...profile, fitnessGoals: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Health Notes</label>
            <textarea
              value={profile.healthNotes}
              onChange={(e) => setProfile({ ...profile, healthNotes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold hover-glow transition-all duration-300"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const Membership = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-8 rounded-2xl max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Membership Details
        </h2>
        
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-green-400 mb-4">Current Plan</h3>
            <div className="space-y-2">
              <p><strong>Plan:</strong> {user?.membershipPlan || 'Quarterly'}</p>
              <p><strong>Start Date:</strong> January 1, 2024</p>
              <p><strong>End Date:</strong> March 31, 2024</p>
              <p><strong>Price:</strong> $199</p>
              <p><strong>Status:</strong> <span className="text-green-400">Active</span></p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto-Renew</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => {
                    setAutoRenew(e.target.checked);
                    showToast(`Auto-renew ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => showToast('Subscription paused for 30 days', 'info')}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Pause Subscription
              </button>
              <button
                onClick={() => showToast('Subscription cancelled. You can reactivate anytime.', 'info')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutSchedule = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [schedule, setSchedule] = useState<{ [key: string]: string }>({});
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['Morning', 'Afternoon', 'Evening'];

  const handleExerciseChange = (day: string, time: string, exercise: string) => {
    setSchedule({ ...schedule, [`${day}-${time}`]: exercise });
  };

  const handleSaveSchedule = () => {
    showToast('Workout schedule saved!', 'success');
  };

  const handleAddExercise = () => {
    if (newExercise.trim()) {
      showToast(`Exercise "${newExercise}" added!`, 'success');
      setNewExercise('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Weekly Workout Schedule
          </h2>
          <div className="space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Add New Exercise
            </button>
            <button
              onClick={handleSaveSchedule}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-8 gap-4 mb-4">
              <div className="font-bold text-center"></div>
              {days.map(day => (
                <div key={day} className="font-bold text-center text-blue-400">{day}</div>
              ))}
            </div>
            
            {times.map(time => (
              <div key={time} className="grid grid-cols-8 gap-4 mb-4">
                <div className="font-semibold text-center">{time}</div>
                {days.map(day => (
                  <div key={`${day}-${time}`} className="text-center">
                    <select
                      value={schedule[`${day}-${time}`] || ''}
                      onChange={(e) => handleExerciseChange(day, time, e.target.value)}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-sm focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">Select Exercise</option>
                      {exercises.map(exercise => (
                        <option key={exercise} value={exercise}>{exercise}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-green-400">Add New Exercise</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                placeholder="Exercise name"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleAddExercise}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Add Exercise
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
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

const BookSessions = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeTab, setActiveTab] = useState('trainers');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('trainers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'trainers' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Trainers
          </button>
          <button
            onClick={() => setActiveTab('nutritionists')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'nutritionists' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Nutritionists
          </button>
        </div>
        
        {activeTab === 'trainers' && (
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', specialty: 'HIIT Specialist', slots: ['9:00 AM', '2:00 PM', '6:00 PM'] },
              { name: 'Mike Chen', specialty: 'Strength Coach', slots: ['10:00 AM', '3:00 PM', '7:00 PM'] },
              { name: 'Alex Rodriguez', specialty: 'Yoga Instructor', slots: ['8:00 AM', '1:00 PM', '5:00 PM'] }
            ].map((trainer, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-green-400 mb-2">{trainer.name}</h3>
                <p className="text-gray-300 mb-4">{trainer.specialty}</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.slots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => showToast(`Booked session with ${trainer.name} at ${slot}`, 'success')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'nutritionists' && (
          <div className="space-y-4">
            {[
              { name: 'Dr. Emily Wilson', specialty: 'Sports Nutrition', slots: ['11:00 AM', '4:00 PM'] },
              { name: 'Dr. Maria Garcia', specialty: 'Weight Management', slots: ['10:00 AM', '3:00 PM'] }
            ].map((nutritionist, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-purple-400 mb-2">{nutritionist.name}</h3>
                <p className="text-gray-300 mb-4">{nutritionist.specialty}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  <span className="text-sm text-gray-400">Upload Food Diary</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nutritionist.slots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => showToast(`Requested consultation with ${nutritionist.name} at ${slot}`, 'success')}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Request Plan - {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FacilitiesBooking = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<{ [key: string]: boolean }>({});

  const handleReserve = (facility: string, time: string) => {
    const key = `${facility}-${time}`;
    setBookings({ ...bookings, [key]: true });
    showToast(`${facility} reserved for ${time}`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-lg font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
          />
        </div>
        
        <div className="space-y-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4">{facility.name}</h3>
              <p className="text-gray-300 mb-4">Capacity: {facility.capacity} people</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {facility.timeSlots.map((time) => {
                  const key = `${facility.name}-${time}`;
                  const isBooked = bookings[key];
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && handleReserve(facility.name, time)}
                      className={`facility-slot p-4 rounded-lg text-center transition-all duration-300 ${
                        isBooked 
                          ? 'reserved cursor-not-allowed' 
                          : 'available hover:scale-105'
                      }`}
                      disabled={isBooked}
                    >
                      <div className="text-sm font-semibold">{time}</div>
                      <div className="text-xs mt-1">
                        {isBooked ? 'Reserved' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemberStore = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    showToast(`${product.name} added to cart`, 'success');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.memberPrice, 0).toFixed(2);
  };

  const products = [
    { id: 1, name: 'Whey Protein Powder', price: 49.99, memberPrice: 44.99, category: 'Supplements' },
    { id: 2, name: 'Resistance Bands Set', price: 29.99, memberPrice: 26.99, category: 'Equipment' },
    { id: 3, name: 'Finova Fitness T-Shirt', price: 24.99, memberPrice: 22.49, category: 'Apparel' },
    { id: 4, name: 'Pre-Workout Supplement', price: 39.99, memberPrice: 35.99, category: 'Supplements' },
    { id: 5, name: 'Yoga Mat', price: 34.99, memberPrice: 31.49, category: 'Equipment' },
    { id: 6, name: 'Gym Hoodie', price: 49.99, memberPrice: 44.99, category: 'Apparel' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          Member Store
        </h2>
        <button
          onClick={() => setShowCart(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Cart ({cart.length})
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="product-card p-6 rounded-2xl">
            <div className="bg-gray-800 h-48 rounded-lg mb-4 flex items-center justify-center">
              <i className="fas fa-image text-4xl text-gray-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{product.category}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg line-through text-gray-500">${product.price}</span>
                <span className="text-xl font-bold text-green-400 ml-2">${product.memberPrice}</span>
                <div className="text-sm text-green-400">Member Price (10% off)</div>
              </div>
            </div>
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-400">Shopping Cart</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center">Your cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-green-400">${item.memberPrice}</span>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <strong>Total: ${getTotalPrice()}</strong>
                </div>
                <button
                  onClick={() => {
                    showToast(`Order placed! Total: $${getTotalPrice()}`, 'success');
                    setCart([]);
                    setShowCart(false);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LoyaltyReferrals = ({ user, showToast }: { user: User | null; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [referralLink] = useState('https://finovafitness.com/ref/johndoe123');

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied!', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Points Wallet */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-green-400 mb-4">Points Wallet</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{user?.loyaltyPoints || 1247}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">345</div>
            <div className="text-sm text-gray-400">Points Spent</div>
          </div>
        </div>
        <button
          onClick={() => showToast('Redeeming 500 points for $25 credit', 'success')}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Redeem Points
        </button>
      </div>
      
      {/* Referrals */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Referral Program</h3>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">Your Referral Link</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{user?.referralCount || 5}</div>
              <div className="text-sm text-gray-400">Invites Sent</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">250</div>
              <div className="text-sm text-gray-400">Points Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryReviews = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const bookings = [
    { id: 1, date: '2024-01-15', type: 'Personal Training', trainer: 'Sarah Johnson' },
    { id: 2, date: '2024-01-12', type: 'Facility Booking', facility: 'Pool' },
    { id: 3, date: '2024-01-10', type: 'Personal Training', trainer: 'Mike Chen' },
    { id: 4, date: '2024-01-08', type: 'Nutrition Consultation', nutritionist: 'Dr. Emily Wilson' }
  ];

  const handleReview = (booking: any) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    showToast('Thank you for your review!', 'success');
    setShowReviewModal(false);
    setRating(5);
    setComment('');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Booking History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="table-row">
                  <td className="p-3">{booking.date}</td>
                  <td className="p-3">{booking.type}</td>
                  <td className="p-3">
                    {booking.trainer || booking.facility || booking.nutritionist}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleReview(booking)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-400 mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={submitReview}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
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
