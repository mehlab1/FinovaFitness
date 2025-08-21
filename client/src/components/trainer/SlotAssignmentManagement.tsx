import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { slotAssignmentApi, SlotAssignment, AssignToMonthlyPlanData, AssignToOneTimeSessionData } from '../../services/api/slotAssignmentApi';
import { slotGenerationApi } from '../../services/api/slotGenerationApi';
import { monthlyPlanApi } from '../../services/api/monthlyPlanApi';

interface SlotAssignmentManagementProps {
  trainerId: number;
}

export const SlotAssignmentManagement: React.FC<SlotAssignmentManagementProps> = ({ trainerId }) => {
  const [assignments, setAssignments] = useState<SlotAssignment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [monthlyPlanSubscriptions, setMonthlyPlanSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'monthly_plan' | 'one_time'>('monthly_plan');
  const { showToast } = useToast();

  // Form state for monthly plan assignment
  const [monthlyPlanForm, setMonthlyPlanForm] = useState<AssignToMonthlyPlanData>({
    trainer_id: trainerId,
    slot_id: 0,
    monthly_plan_subscription_id: 0,
    assignment_type: 'personal',
    start_date: '',
    end_date: '',
    is_permanent: true,
    notes: ''
  });

  // Form state for one-time session assignment
  const [oneTimeForm, setOneTimeForm] = useState<AssignToOneTimeSessionData>({
    trainer_id: trainerId,
    slot_id: 0,
    client_id: 0,
    session_date: '',
    session_type: 'personal',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [trainerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAssignments(),
        loadAvailableSlots(),
        loadMonthlyPlanSubscriptions()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load slot assignment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await slotAssignmentApi.getTrainerSlotAssignments(trainerId);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      showToast('Failed to load slot assignments', 'error');
    }
  };

  const loadAvailableSlots = async () => {
    try {
      // For now, we'll get slots from slot generation batches
      const response = await slotGenerationApi.getTrainerSlotBatches(trainerId);
      // This is a simplified approach - in a real implementation, you'd need to get available slots
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      showToast('Failed to load available slots', 'error');
    }
  };

  const loadMonthlyPlanSubscriptions = async () => {
    try {
      // This would need to be implemented in the monthly plan API
      // For now, we'll use mock data
      setMonthlyPlanSubscriptions([
        { id: 1, member_name: 'John Doe', plan_name: 'Premium Plan', status: 'active' },
        { id: 2, member_name: 'Jane Smith', plan_name: 'Basic Plan', status: 'active' }
      ]);
    } catch (error) {
      console.error('Failed to load monthly plan subscriptions:', error);
      showToast('Failed to load monthly plan subscriptions', 'error');
    }
  };

  const resetForms = () => {
    setMonthlyPlanForm({
      trainer_id: trainerId,
      slot_id: 0,
      monthly_plan_subscription_id: 0,
      assignment_type: 'personal',
      start_date: '',
      end_date: '',
      is_permanent: true,
      notes: ''
    });
    setOneTimeForm({
      trainer_id: trainerId,
      slot_id: 0,
      client_id: 0,
      session_date: '',
      session_type: 'personal',
      notes: ''
    });
  };

  const handleMonthlyPlanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setMonthlyPlanForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleOneTimeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setOneTimeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (assignmentType === 'monthly_plan') {
        // Validate monthly plan form
        if (!monthlyPlanForm.slot_id || !monthlyPlanForm.monthly_plan_subscription_id || 
            !monthlyPlanForm.start_date || !monthlyPlanForm.end_date) {
          showToast('Please fill in all required fields', 'error');
          return;
        }

        await slotAssignmentApi.assignSlotToMonthlyPlan(monthlyPlanForm);
        showToast('Slot assigned to monthly plan member successfully!', 'success');
      } else {
        // Validate one-time form
        if (!oneTimeForm.slot_id || !oneTimeForm.client_id || !oneTimeForm.session_date) {
          showToast('Please fill in all required fields', 'error');
          return;
        }

        await slotAssignmentApi.assignSlotForOneTimeSession(oneTimeForm);
        showToast('Slot assigned for one-time training session successfully!', 'success');
      }
      
      setShowAssignmentForm(false);
      resetForms();
      loadData();
      
    } catch (error) {
      console.error('Failed to assign slot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign slot';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this slot assignment? This action cannot be undone.')) {
      return;
    }

    try {
      await slotAssignmentApi.deleteSlotAssignment(assignmentId);
      showToast('Slot assignment deleted successfully!', 'success');
      loadAssignments();
    } catch (error) {
      console.error('Failed to delete slot assignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete slot assignment';
      showToast(errorMessage, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading slot assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-pink-400 mb-2">Slot Assignment Management</h2>
          <p className="text-gray-300">Assign generated slots to monthly plan members or one-time training sessions</p>
        </div>
        <button
          onClick={() => {
            resetForms();
            setShowAssignmentForm(true);
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 neon-glow"
        >
          <i className="fas fa-plus mr-2"></i>
          Assign Slot
        </button>
      </div>

      {/* Assignment Form */}
      {showAssignmentForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-pink-400 mb-4">Assign Slot</h3>
          
          {/* Assignment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Assignment Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="monthly_plan"
                  checked={assignmentType === 'monthly_plan'}
                  onChange={(e) => setAssignmentType(e.target.value as 'monthly_plan' | 'one_time')}
                  className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-400 focus:ring-2"
                />
                <span className="text-gray-300">Monthly Plan Member</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="one_time"
                  checked={assignmentType === 'one_time'}
                  onChange={(e) => setAssignmentType(e.target.value as 'monthly_plan' | 'one_time')}
                  className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-400 focus:ring-2"
                />
                <span className="text-gray-300">One-time Session</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {assignmentType === 'monthly_plan' ? (
              /* Monthly Plan Assignment Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Monthly Plan Subscription *
                    </label>
                    <select
                      name="monthly_plan_subscription_id"
                      value={monthlyPlanForm.monthly_plan_subscription_id}
                      onChange={handleMonthlyPlanFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                      required
                    >
                      <option value="">Select a subscription</option>
                      {monthlyPlanSubscriptions.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.member_name} - {sub.plan_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assignment Type
                    </label>
                    <select
                      name="assignment_type"
                      value={monthlyPlanForm.assignment_type}
                      onChange={handleMonthlyPlanFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    >
                      <option value="personal">Personal Training</option>
                      <option value="group">Group Training</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={monthlyPlanForm.start_date}
                      onChange={handleMonthlyPlanFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={monthlyPlanForm.end_date}
                      onChange={handleMonthlyPlanFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={monthlyPlanForm.notes}
                    onChange={handleMonthlyPlanFormChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors resize-none"
                    placeholder="Any additional notes about this assignment..."
                  />
                </div>
              </div>
            ) : (
              /* One-time Session Assignment Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client ID *
                    </label>
                    <input
                      type="number"
                      name="client_id"
                      value={oneTimeForm.client_id}
                      onChange={handleOneTimeFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                      placeholder="Enter client ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Type
                    </label>
                    <select
                      name="session_type"
                      value={oneTimeForm.session_type}
                      onChange={handleOneTimeFormChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    >
                      <option value="personal">Personal Training</option>
                      <option value="group">Group Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Date *
                  </label>
                  <input
                    type="date"
                    name="session_date"
                    value={oneTimeForm.session_date}
                    onChange={handleOneTimeFormChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={oneTimeForm.notes}
                    onChange={handleOneTimeFormChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors resize-none"
                    placeholder="Any additional notes about this session..."
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowAssignmentForm(false);
                  resetForms();
                }}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {saving ? (
                  <span>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Assigning...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-save mr-2"></i>
                    Assign Slot
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-pink-400">Slot Assignments</h3>
        
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <i className="fas fa-calendar-times text-4xl text-gray-500 mb-4"></i>
            <p className="text-gray-400 text-lg mb-2">No slot assignments found</p>
            <p className="text-gray-500">Assign slots to monthly plan members or create one-time training sessions</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {assignment.assigned_to_name || 'Unknown'}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {slotAssignmentApi.formatDate(assignment.start_date)} - {slotAssignmentApi.formatDate(assignment.end_date)}
                      </span>
                      {assignment.start_time && assignment.end_time && (
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {slotAssignmentApi.formatTime(assignment.start_time)} - {slotAssignmentApi.formatTime(assignment.end_time)}
                        </span>
                      )}
                      <span>
                        <i className="fas fa-tag mr-1"></i>
                        {slotAssignmentApi.getAssignmentTypeDisplay(assignment.assignment_type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assignment.assignment_category === 'monthly_plan'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-green-900 text-green-300'
                    }`}>
                      {slotAssignmentApi.getAssignmentCategoryDisplay(assignment.assignment_category || '')}
                    </span>
                    {assignment.is_permanent && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                        Permanent
                      </span>
                    )}
                  </div>
                </div>

                {assignment.notes && (
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 text-sm">{assignment.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(assignment.created_at).toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
