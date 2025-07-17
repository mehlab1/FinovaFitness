import { useState } from 'react';
import { User } from '../types';
import { useToast } from './Toast';

interface NutritionistPortalProps {
  user: User | null;
  onLogout: () => void;
}

export const NutritionistPortal = ({ user, onLogout }: NutritionistPortalProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <NutritionistDashboard user={user} showToast={showToast} />;
      case 'schedule':
        return <NutritionistSchedule showToast={showToast} />;
      case 'client-requests':
        return <DietPlanRequests showToast={showToast} />;
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
            { id: 'client-requests', icon: 'fas fa-user-friends', label: 'Diet Plan Requests', color: 'text-green-400' },
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const toggleAvailability = (time: string) => {
    const key = `${selectedDate}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast(`${time} marked as ${availability[key] ? 'available' : 'unavailable'}`, 'info');
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
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
          />
        </div>
        
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Consultation Schedule for {selectedDate}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {timeSlots.map((time) => {
              const key = `${selectedDate}-${time}`;
              const isAvailable = availability[key];
              return (
                <button
                  key={time}
                  onClick={() => toggleAvailability(time)}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    isAvailable 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{time}</div>
                  <div className="text-xs mt-1">
                    {isAvailable ? 'Unavailable' : 'Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DietPlanRequests = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [requests, setRequests] = useState([
    { id: 1, client: 'Emma Wilson', goal: 'Weight Loss', calories: 1500, dietary: 'Vegetarian', diary: 'food_diary_1.pdf', status: 'pending' },
    { id: 2, client: 'David Brown', goal: 'Muscle Gain', calories: 2500, dietary: 'None', diary: 'food_diary_2.pdf', status: 'pending' },
    { id: 3, client: 'Lisa Garcia', goal: 'Maintenance', calories: 2000, dietary: 'Gluten-Free', diary: 'food_diary_3.pdf', status: 'pending' }
  ]);

  const handleCreatePlan = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'completed' } : req
    ));
    showToast('Diet plan created and sent to client', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Diet Plan Requests</h3>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2">{request.client}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <strong>Goal:</strong> {request.goal}
                    </div>
                    <div>
                      <strong>Target Calories:</strong> {request.calories}
                    </div>
                    <div>
                      <strong>Dietary Restrictions:</strong> {request.dietary}
                    </div>
                    <div className="flex items-center space-x-2">
                      <strong>Food Diary:</strong>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <i className="fas fa-download mr-1"></i>
                        {request.diary}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {request.status === 'pending' ? (
                    <button
                      onClick={() => handleCreatePlan(request.id)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Create Plan
                    </button>
                  ) : (
                    <span className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MealPlanTemplates = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Weight Loss - 1500 Cal', type: 'Weight Loss', calories: 1500, meals: 5 },
    { id: 2, name: 'Muscle Gain - 2500 Cal', type: 'Muscle Gain', calories: 2500, meals: 6 },
    { id: 3, name: 'Maintenance - 2000 Cal', type: 'Maintenance', calories: 2000, meals: 4 },
    { id: 4, name: 'Vegetarian - 1800 Cal', type: 'Vegetarian', calories: 1800, meals: 5 }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', type: '', calories: '', meals: '' });

  const handleUpload = () => {
    if (newTemplate.name && newTemplate.type && newTemplate.calories && newTemplate.meals) {
      const template = {
        id: Date.now(),
        name: newTemplate.name,
        type: newTemplate.type,
        calories: parseInt(newTemplate.calories),
        meals: parseInt(newTemplate.meals)
      };
      setTemplates([...templates, template]);
      setNewTemplate({ name: '', type: '', calories: '', meals: '' });
      setShowUploadModal(false);
      showToast('Template uploaded successfully!', 'success');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-purple-400">Meal Plan Templates</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Upload Template
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-white mb-2">{template.name}</h4>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div><strong>Type:</strong> {template.type}</div>
              <div><strong>Calories:</strong> {template.calories}</div>
              <div><strong>Meals:</strong> {template.meals}</div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => showToast(`Editing ${template.name}`, 'info')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => showToast(`Using ${template.name} for new plan`, 'info')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Use
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Upload New Template</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
              />
              <select
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value="">Select type</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Keto">Keto</option>
              </select>
              <input
                type="number"
                placeholder="Calories"
                value={newTemplate.calories}
                onChange={(e) => setNewTemplate({ ...newTemplate, calories: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Number of meals"
                value={newTemplate.meals}
                onChange={(e) => setNewTemplate({ ...newTemplate, meals: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
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
