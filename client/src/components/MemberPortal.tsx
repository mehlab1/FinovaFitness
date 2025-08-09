import { useState, useEffect } from 'react';
import { User } from '../types';
import { facilities, exercises } from '../data/mockData';
import { useToast } from './Toast';
import { memberApi } from '../services/api/memberApi';

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
      case 'trainers':
        return <TrainersTab showToast={showToast} />;
      case 'nutritionists':
        return <NutritionistsTab showToast={showToast} />;
      case 'facilities':
        return <FacilitiesBooking showToast={showToast} />;
      case 'store':
        return <MemberStore showToast={showToast} />;
      case 'loyalty':
        return <LoyaltyReferrals user={user} showToast={showToast} />;
      case 'announcements':
        return <MemberAnnouncements showToast={showToast} />;
      case 'reviews':
        return <Reviews showToast={showToast} />;
      default:
        return <Dashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 h-screen fixed left-0 top-0 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
          <i className="fas fa-dumbbell text-2xl text-blue-400 neon-glow"></i>
          <h1 className="text-xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            FINOVA FITNESS
          </h1>
        </div>
        
        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-800 pr-2">
            <nav className="space-y-2 pb-4">
              {[
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'text-blue-400' },
                { id: 'profile', icon: 'fas fa-user', label: 'My Profile', color: 'text-green-400' },
                { id: 'membership', icon: 'fas fa-id-card', label: 'Membership', color: 'text-pink-400' },
                { id: 'workout', icon: 'fas fa-dumbbell', label: 'Workout Schedule', color: 'text-purple-400' },
                { id: 'trainers', icon: 'fas fa-user-tie', label: 'Trainers', color: 'text-orange-400' },
                { id: 'nutritionists', icon: 'fas fa-apple-alt', label: 'Nutritionists', color: 'text-purple-400' },
                { id: 'facilities', icon: 'fas fa-swimming-pool', label: 'Facilities', color: 'text-blue-400' },
                { id: 'store', icon: 'fas fa-shopping-cart', label: 'Store', color: 'text-green-400' },
                { id: 'loyalty', icon: 'fas fa-gift', label: 'Loyalty & Referrals', color: 'text-pink-400' },
                { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', color: 'text-yellow-400' },
                { id: 'reviews', icon: 'fas fa-star', label: 'Reviews', color: 'text-purple-400' }
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
        </div>
        
        {/* Scroll Indicators */}
        <div className="flex-shrink-0 mt-4 text-center">
          <div className="text-xs text-gray-400 mb-2">Scroll to see all tabs</div>
          <div className="flex justify-center space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
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

    {/* Progress Widgets */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="metric-card p-6 rounded-xl border-green-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Weight Change</h3>
          <i className="fas fa-weight text-green-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">–3 kg</p>
        <p className="text-gray-300">since last month</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>BMI</h3>
          <i className="fas fa-chart-line text-blue-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">24.1</p>
        <p className="text-gray-300">Your BMI</p>
      </div>
      
      <div className="metric-card p-6 rounded-xl border-pink-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Workout Completion</h3>
          <i className="fas fa-check-circle text-pink-400 text-2xl"></i>
        </div>
        <p className="text-2xl font-bold text-white">12/15</p>
        <p className="text-gray-300">scheduled workouts done</p>
      </div>
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
                onClick={() => showToast('Launching membership wizard...', 'info')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Change Plan
              </button>
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
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState('');

  const workoutData: { [key: string]: { [key: string]: string[] } } = {
    Monday: {
      Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises'],
      Chest: ['Bench Press', 'Push-ups', 'Dumbbell Flyes'],
      Biceps: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls']
    },
    Tuesday: {
      Back: ['Pull-ups', 'Deadlifts', 'Rows'],
      Triceps: ['Dips', 'Skull Crushers', 'Tricep Extensions'],
      Legs: ['Squats', 'Lunges', 'Calf Raises']
    },
    Wednesday: {
      Chest: ['Incline Bench Press', 'Decline Bench Press', 'Cable Flyes', 'Dumbbell Press', 'Push-ups'],
      Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 'Arnold Press'],
      Biceps: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Incline Curls'],
      Triceps: ['Dips', 'Skull Crushers', 'Tricep Extensions', 'Overhead Extensions', 'Rope Pushdowns'],
      Back: ['Pull-ups', 'Deadlifts', 'Rows', 'Lat Pulldowns', 'Face Pulls'],
      Legs: ['Squats', 'Lunges', 'Calf Raises', 'Leg Press', 'Romanian Deadlifts']
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddColumn = () => {
    if (newColumn.trim() && expandedDay) {
      if (workoutData[expandedDay]) {
        workoutData[expandedDay][newColumn] = [];
      }
      setNewColumn('');
      setShowAddColumn(false);
      showToast(`Added new muscle group: ${newColumn}`, 'success');
    }
  };

  const handleAddExercise = (day: string, muscleGroup: string) => {
    const exerciseName = prompt(`Add exercise for ${muscleGroup}:`);
    if (exerciseName && workoutData[day] && workoutData[day][muscleGroup]) {
      workoutData[day][muscleGroup].push(exerciseName);
      showToast(`Added exercise: ${exerciseName}`, 'success');
    }
  };

  const getAISuggestion = (day: string) => {
    if (day === 'Monday' || day === 'Tuesday') {
      return { message: 'Perfect plan for your goals and BMI!', color: 'text-green-400', bgColor: 'bg-green-500' };
    } else if (day === 'Wednesday') {
      return { message: 'This is not healthy! Please consult professional help.', color: 'text-red-400', bgColor: 'bg-red-500' };
    }
    return { message: 'Good workout plan!', color: 'text-blue-400', bgColor: 'bg-blue-500' };
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
          Weekly Workout Schedule
        </h2>
        
        {/* Weekly Overview */}
        <div className="glass-card p-6 rounded-2xl mb-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  expandedDay === day 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-bold">{day}</div>
                <div className="text-sm opacity-75">
                  {workoutData[day as keyof typeof workoutData] ? 
                    Object.keys(workoutData[day as keyof typeof workoutData]).length + ' groups' : 
                    'No plan'
                  }
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Day View */}
        {expandedDay && workoutData[expandedDay as keyof typeof workoutData] && (
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">{expandedDay} Workout</h3>
              <button
                onClick={() => setShowAddColumn(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Muscle Group
              </button>
            </div>

            {/* Workout Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-blue-400">Muscle Group</th>
                    <th className="text-left p-3 text-blue-400">Exercises</th>
                    <th className="text-left p-3 text-blue-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(workoutData[expandedDay as keyof typeof workoutData]).map(([muscleGroup, exercises]) => (
                    <tr key={muscleGroup} className="border-b border-gray-700">
                      <td className="p-3 font-semibold text-green-400">{muscleGroup}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {exercises.map((exercise, index) => (
                            <div key={index} className="text-gray-300">• {exercise}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleAddExercise(expandedDay, muscleGroup)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <i className="fas fa-plus mr-1"></i>Add Exercise
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Suggestions Bar */}
            <div className={`mt-6 p-4 rounded-lg ${getAISuggestion(expandedDay).bgColor} bg-opacity-20 border border-current`}>
              <div className="flex items-center">
                <i className="fas fa-robot mr-3 text-2xl"></i>
                <div>
                  <div className={`font-bold ${getAISuggestion(expandedDay).color}`}>AI Suggestion:</div>
                  <div className={`${getAISuggestion(expandedDay).color}`}>
                    {getAISuggestion(expandedDay).message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Column Modal */}
        {showAddColumn && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-green-400">Add Muscle Group</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  placeholder="Muscle group name"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddColumn}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
                  >
                    Add Group
                  </button>
                  <button
                    onClick={() => setShowAddColumn(false)}
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
    {
      id: 1,
      name: 'Whey Protein Powder',
      price: 13999,
      memberPrice: 12599,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Resistance Bands Set',
      price: 8399,
      memberPrice: 7559,
      category: 'Equipment',
      image: 'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Finova Fitness T-Shirt',
      price: 6999,
      memberPrice: 6299,
      category: 'Apparel',
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      name: 'Pre-Workout Supplement',
      price: 11199,
      memberPrice: 10079,
      category: 'Supplements',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 5,
      name: 'Yoga Mat',
      price: 9799,
      memberPrice: 8819,
      category: 'Equipment',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 6,
      name: 'Gym Hoodie',
      price: 13999,
      memberPrice: 12599,
      category: 'Apparel',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80'
    }
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
            <div className="bg-gray-800 h-48 rounded-lg mb-4 flex items-center justify-center relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center absolute inset-0">
                <i className="fas fa-image text-4xl text-gray-600"></i>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{product.category}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg line-through text-gray-500">PKR {product.price.toLocaleString()}</span>
                <span className="text-xl font-bold text-green-400 ml-2">PKR {product.memberPrice.toLocaleString()}</span>
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
              <button onClick={() => setShowCart(false)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center">Your cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-green-400">PKR {item.memberPrice.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <strong>Total: PKR {getTotalPrice()}</strong>
                </div>
                <button
                  onClick={() => {
                    showToast(`Order placed! Total: PKR ${getTotalPrice()}`, 'success');
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

const Reviews = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
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

const TrainersTab = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await memberApi.getTrainers();
        setTrainers(data);
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
        showToast('Failed to load trainers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [showToast]);

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-300">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Trainers
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.length === 0 ? (
          <p className="text-gray-400 text-center py-4 col-span-full">No trainers available</p>
        ) : (
          trainers.map((trainer) => (
            <div key={trainer.id} className="glass-card p-6 rounded-2xl text-center hover-glow transition-all duration-300">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-400">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                  alt={`${trainer.first_name} ${trainer.last_name}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">
                {trainer.first_name} {trainer.last_name}
              </h3>
              <p className="text-green-400 mb-2">
                {trainer.specialization?.[0] || 'Personal Trainer'}
              </p>
              <p className="text-gray-300 text-sm mb-2">
                {trainer.bio || 'Experienced fitness professional'}
              </p>
              <p className="text-yellow-400 text-sm mb-4">
                ⭐ {trainer.average_rating ? parseFloat(trainer.average_rating).toFixed(1) : '5.0'} 
                ({trainer.total_ratings || 0} reviews)
              </p>
              <button
                onClick={() => setSelectedTrainer(trainer)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Book Session
              </button>
            </div>
          ))
        )}
      </div>

      {/* Trainer Schedule Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">{selectedTrainer.name}'s Schedule</h3>
              <button onClick={() => setSelectedTrainer(null)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">{selectedTrainer.bio}</p>
              <div>
                <h4 className="font-bold text-green-400 mb-2">Available Times:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTrainer.schedule.map((time: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        showToast(`Booked session with ${selectedTrainer.name} at ${time}`, 'success');
                        setSelectedTrainer(null);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MemberAnnouncements = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
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
      title: 'Holiday Schedule',
      message: 'Gym will be closed on Independence Day',
      priority: 'high',
      date: '2024-01-15',
      target: 'all'
    },
    {
      id: 3,
      title: 'New Classes Available',
      message: 'Check out our new HIIT and Yoga classes starting next month!',
      priority: 'medium',
      date: '2024-01-10',
      target: 'members'
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
        <h2 className="text-2xl font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
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

const NutritionistsTab = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietForm, setDietForm] = useState({
    fitnessGoal: '',
    currentWeight: '',
    targetWeight: '',
    budget: '',
    dietaryRestrictions: ''
  });

  const nutritionists = [
    {
      id: '1',
      name: 'Dr. Emily Wilson',
      specialty: 'Sports Nutrition',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      bio: 'Dr. Wilson specializes in sports nutrition and performance optimization.',
      schedule: ['11:00 AM', '4:00 PM', '6:00 PM']
    },
    {
      id: '2',
      name: 'Dr. Maria Garcia',
      specialty: 'Weight Management',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      bio: 'Dr. Garcia focuses on sustainable weight management and healthy eating habits.',
      schedule: ['10:00 AM', '3:00 PM', '5:30 PM']
    }
  ];

  const handleDietRequest = () => {
    showToast('Diet plan request submitted successfully!', 'success');
    setShowDietForm(false);
    setDietForm({
      fitnessGoal: '',
      currentWeight: '',
      targetWeight: '',
      budget: '',
      dietaryRestrictions: ''
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Nutritionists
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nutritionists.map((nutritionist) => (
          <div key={nutritionist.id} className="glass-card p-6 rounded-2xl text-center hover-glow transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400">
              <img src={nutritionist.image} alt={nutritionist.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">{nutritionist.name}</h3>
            <p className="text-green-400 mb-2">{nutritionist.specialty}</p>
            <p className="text-gray-300 text-sm mb-4">{nutritionist.bio}</p>
            <button
              onClick={() => setShowDietForm(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Request Diet Plan
            </button>
          </div>
        ))}
      </div>

      {/* Diet Plan Request Modal */}
      {showDietForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-400">Request Diet Plan</h3>
              <button onClick={() => setShowDietForm(false)} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fitness Goal</label>
                <select
                  value={dietForm.fitnessGoal}
                  onChange={(e) => setDietForm({...dietForm, fitnessGoal: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select Goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  value={dietForm.currentWeight}
                  onChange={(e) => setDietForm({...dietForm, currentWeight: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={dietForm.targetWeight}
                  onChange={(e) => setDietForm({...dietForm, targetWeight: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Budget (PKR)</label>
                <input
                  type="number"
                  value={dietForm.budget}
                  onChange={(e) => setDietForm({...dietForm, budget: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                <textarea
                  value={dietForm.dietaryRestrictions}
                  onChange={(e) => setDietForm({...dietForm, dietaryRestrictions: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Any allergies or dietary preferences..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleDietRequest}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowDietForm(false)}
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
