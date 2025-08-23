import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { slotGenerationApi, SlotGenerationBatch, CreateSlotBatchData } from '../../services/api/slotGenerationApi';
import { slotAssignmentApi } from '../../services/api/slotAssignmentApi';
import { monthlyPlanApi } from '../../services/api/monthlyPlanApi';

interface SlotGenerationManagementProps {
  trainerId: number;
}

interface AvailableSlot {
  id: number;
  date?: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  batch_name: string;
  is_available: boolean;
}

interface MonthlyPlanSubscription {
  id: number;
  member_name: string;
  plan_name: string;
  status: string;
}

export const SlotGenerationManagement: React.FC<SlotGenerationManagementProps> = ({ trainerId }) => {
  const [batches, setBatches] = useState<SlotGenerationBatch[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [monthlyPlanSubscriptions, setMonthlyPlanSubscriptions] = useState<MonthlyPlanSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<SlotGenerationBatch | null>(null);
  const { showToast } = useToast();

  // Slot assignment state
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set()); // Multi-select slots
  const [assignmentForm, setAssignmentForm] = useState({
    monthly_plan_subscription_id: 0,
    assignment_type: 'personal',
    session_name: '',
    notes: ''
  });
  const [assignedSlots, setAssignedSlots] = useState<any[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<AvailableSlot[]>([]);

  // Form state
  const [formData, setFormData] = useState<Omit<CreateSlotBatchData, 'trainer_id'>>({
    batch_name: '',
    generation_start_date: '',
    generation_end_date: '',
    slot_duration: 60,
    break_duration: 15,
    selected_days: [],
    daily_start_time: '09:00',
    daily_end_time: '17:00',
    notes: ''
  });

  // Day selection options
  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [trainerId]);

  // Update checkbox indeterminate states
  useEffect(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (checkbox.hasAttribute('data-indeterminate')) {
        (checkbox as HTMLInputElement).indeterminate = true;
      }
    });
    
    // Debug: Log selected slots state
    console.log('Selected slots state updated:', Array.from(selectedSlots));
  }, [selectedSlots]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBatches(),
        loadMonthlyPlanSubscriptions()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      console.log('Loading slot batches for authenticated trainer');
      const response = await slotGenerationApi.getTrainerSlotBatches();
      console.log('Slot batches loaded successfully:', response.data);
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to load slot batches:', error);
      showToast('Failed to load slot generation batches', 'error');
    }
  };

  const loadAvailableSlots = async (startDate: string, endDate: string) => {
    // Validate that both dates are provided
    if (!startDate || !endDate) {
      console.warn('loadAvailableSlots called with invalid dates:', { startDate, endDate });
      return;
    }
    
    try {
      const response = await slotGenerationApi.getAvailableSlotsForDateRange(trainerId, startDate, endDate);
      setAvailableSlots(response.data);
      // Apply time filter if time range is selected
      if (selectedStartTime && selectedEndTime) {
        applyTimeFilter(response.data);
      } else {
        setFilteredSlots(response.data);
      }
    } catch (error) {
      console.error('Failed to load available slots:', error);
      showToast('Failed to load available slots for selected date range', 'error');
    }
  };

  const applyTimeFilter = (slots: AvailableSlot[]) => {
    if (!selectedStartTime || !selectedEndTime) {
      setFilteredSlots(slots);
      return;
    }

    console.log('Applying time filter:', {
      selectedStartTime,
      selectedEndTime,
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.is_available).length
    });

    const filtered = slots.filter(slot => {
      const slotStartTime = slot.start_time;
      const slotEndTime = slot.end_time;
      
      // More flexible time filtering: show slots that overlap with or are close to the selected time range
      // Convert times to minutes for easier comparison
      const selectedStartMinutes = timeToMinutes(selectedStartTime);
      const selectedEndMinutes = timeToMinutes(selectedEndTime);
      const slotStartMinutes = timeToMinutes(slotStartTime);
      const slotEndMinutes = timeToMinutes(slotEndTime);
      
      // Check if slots overlap with or are within 30 minutes of the selected time range
      const bufferMinutes = 30; // 30 minutes buffer
      
      const isInRange = (
        // Slot starts within the selected range (including buffer)
        (slotStartMinutes >= selectedStartMinutes - bufferMinutes && slotStartMinutes <= selectedEndMinutes + bufferMinutes) ||
        // Slot ends within the selected range (including buffer)
        (slotEndMinutes >= selectedStartMinutes - bufferMinutes && slotEndMinutes <= selectedEndMinutes + bufferMinutes) ||
        // Slot completely contains the selected range
        (slotStartMinutes <= selectedStartMinutes && slotEndMinutes >= selectedEndMinutes)
      );

      if (isInRange) {
        console.log('Slot in range:', {
          slotTime: `${slotStartTime}-${slotEndTime}`,
          slotMinutes: `${slotStartMinutes}-${slotEndMinutes}`,
          selectedMinutes: `${selectedStartMinutes}-${selectedEndMinutes}`,
          buffer: bufferMinutes
        });
      }

      return isInRange;
    });

    console.log('Time filter results:', {
      filteredCount: filtered.length,
      availableFiltered: filtered.filter(s => s.is_available).length
    });

    setFilteredSlots(filtered);
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to group slots by time
  const groupSlotsByTime = (slots: AvailableSlot[]) => {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    
    slots.forEach(slot => {
      // Include date in the key to ensure unique grouping
      const timeKey = `${slot.start_time}-${slot.end_time}`;
      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(slot);
    });
    
    // Sort slots within each group by date
    Object.keys(grouped).forEach(timeKey => {
      grouped[timeKey].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    });
    
    return grouped;
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get day name
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Helper function to get short day name
  const getShortDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const loadAssignedSlots = async (startDate: string, endDate: string) => {
    // Validate that both dates are provided
    if (!startDate || !endDate) {
      console.warn('loadAssignedSlots called with invalid dates:', { startDate, endDate });
      return;
    }
    
    try {
      const response = await slotAssignmentApi.getTrainerSlotAssignments(trainerId, startDate, endDate);
      setAssignedSlots(response.data);
    } catch (error) {
      console.error('Failed to load assigned slots:', error);
      showToast('Failed to load assigned slots', 'error');
    }
  };

  const loadMonthlyPlanSubscriptions = async () => {
    try {
      // For now, using mock data - this would be replaced with actual API call
      setMonthlyPlanSubscriptions([
        { id: 1, member_name: 'Mehlab', plan_name: 'Premium Plan', status: 'active' },
        { id: 2, member_name: 'John Doe', plan_name: 'Basic Plan', status: 'active' },
        { id: 3, member_name: 'Jane Smith', plan_name: 'Standard Plan', status: 'active' }
      ]);
    } catch (error) {
      console.error('Failed to load monthly plan subscriptions:', error);
      showToast('Failed to load monthly plan subscriptions', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      batch_name: '',
      generation_start_date: '',
      generation_end_date: '',
      slot_duration: 60,
      break_duration: 15,
      selected_days: [],
      daily_start_time: '09:00',
      daily_end_time: '17:00',
      notes: ''
    });
    setEditingBatch(null);
  };

  const resetAssignmentForm = () => {
    setSelectedStartDate('');
    setSelectedEndDate('');
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedSlot(null);
    setSelectedSlots(new Set());
    setFilteredSlots([]);
    setAssignmentForm({
      monthly_plan_subscription_id: 0,
      assignment_type: 'personal',
      session_name: '',
      notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const dayValue = parseInt(checkbox.value);
      
      setFormData(prev => ({
        ...prev,
        selected_days: checkbox.checked
          ? [...prev.selected_days, dayValue]
          : prev.selected_days.filter(day => day !== dayValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateRangeSelection = async (startDate: string, endDate: string) => {
    // Convert DD/MM/YYYY format to YYYY-MM-DD if needed
    const convertDateFormat = (dateStr: string): string => {
      // Check if it's in DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      return dateStr;
    };

    const convertedStartDate = convertDateFormat(startDate);
    const convertedEndDate = convertDateFormat(endDate);
    
    setSelectedStartDate(convertedStartDate);
    setSelectedEndDate(convertedEndDate);
    
    // Only make API calls if both dates are provided
    if (convertedStartDate && convertedEndDate) {
      await Promise.all([
        loadAvailableSlots(convertedStartDate, convertedEndDate),
        loadAssignedSlots(convertedStartDate, convertedEndDate)
      ]);
    } else {
      // Clear the slots when dates are not complete
      setAvailableSlots([]);
      setAssignedSlots([]);
      setFilteredSlots([]);
    }
  };

  const handleTimeRangeSelection = (startTime: string, endTime: string) => {
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    
    // Only apply time filter if both times are provided
    if (startTime && endTime) {
      applyTimeFilter(availableSlots);
    } else {
      // If time filter is incomplete, show all available slots
      setFilteredSlots(availableSlots);
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    if (selectedSlots.size === 0) {
      showToast('Please select at least one slot to assign', 'error');
      return;
    }

    if (!assignmentForm.monthly_plan_subscription_id || !assignmentForm.session_name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to assign ${selectedSlots.size} selected slots to this member?`)) {
      return;
    }

    try {
      setSaving(true);
      
      // Get all available slots (filtered or all)
      const allSlots = selectedStartTime && selectedEndTime ? filteredSlots : availableSlots;
      
      // Filter to only selected slots
      const slotsToAssign = allSlots.filter(slot => selectedSlots.has(slot.id));
      
      // Assign all selected slots
      const assignmentPromises = slotsToAssign.map(slot => {
        const assignmentData = {
          trainer_id: trainerId,
          slot_id: slot.id,
          monthly_plan_subscription_id: assignmentForm.monthly_plan_subscription_id,
          assignment_type: assignmentForm.assignment_type,
          start_date: slot.date || selectedStartDate,
          end_date: slot.date || selectedEndDate,
          is_permanent: false,
          notes: `${assignmentForm.session_name}${assignmentForm.notes ? ` - ${assignmentForm.notes}` : ''}`
        };
        return slotAssignmentApi.assignSlotToMonthlyPlan(assignmentData);
      });

      await Promise.all(assignmentPromises);
      showToast(`Successfully assigned ${selectedSlots.size} slots!`, 'success');
      
      // Clear selection and refresh data
      setSelectedSlots(new Set());
      if (selectedStartDate && selectedEndDate) {
        await Promise.all([
          loadAvailableSlots(selectedStartDate, selectedEndDate),
          loadAssignedSlots(selectedStartDate, selectedEndDate)
        ]);
      }
      
    } catch (error) {
      console.error('Failed to assign slots:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign slots';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassignSlot = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to unassign this slot? This will make it available again.')) {
      return;
    }

    try {
      await slotAssignmentApi.deleteSlotAssignment(assignmentId);
      showToast('Slot unassigned successfully!', 'success');
      // Refresh both available and assigned slots
      if (selectedStartDate && selectedEndDate) {
        await Promise.all([
          loadAvailableSlots(selectedStartDate, selectedEndDate),
          loadAssignedSlots(selectedStartDate, selectedEndDate)
        ]);
      }
    } catch (error) {
      console.error('Failed to unassign slot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unassign slot';
      showToast(errorMessage, 'error');
    }
  };

  const handleSlotSelection = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setShowAssignmentForm(true);
  };

  const handleSlotCheckboxChange = (slotId: number, checked: boolean) => {
    console.log('Checkbox changed:', { slotId, checked });
    
    // Debug: Log all slots to see their IDs
    const allSlots = selectedStartTime && selectedEndTime ? filteredSlots : availableSlots;
    const slotWithId = allSlots.find(slot => slot.id === slotId);
    console.log('Found slot with ID:', slotWithId);
    console.log('All slot IDs:', allSlots.map(s => ({ id: s.id, date: s.date, time: `${s.start_time}-${s.end_time}` })));
    
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(slotId);
      } else {
        newSet.delete(slotId);
      }
      console.log('Updated selected slots:', Array.from(newSet));
      return newSet;
    });
  };

  const handleSelectAllSlots = () => {
    const allSlots = selectedStartTime && selectedEndTime ? filteredSlots : availableSlots;
    const availableSlotIds = allSlots
      .filter(slot => slot.is_available)
      .map(slot => slot.id);
    console.log('Selecting all slots:', availableSlotIds);
    setSelectedSlots(new Set(availableSlotIds));
  };

  const handleClearSelection = () => {
    setSelectedSlots(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      console.log('Submitting slot batch with data:', formData);
      
      if (editingBatch) {
        await slotGenerationApi.updateSlotGenerationBatch(editingBatch.id, formData);
        showToast('Slot generation batch updated successfully!', 'success');
      } else {
        await slotGenerationApi.createSlotGenerationBatch(formData);
        showToast('Slot generation batch created successfully!', 'success');
      }
      
      setShowCreateForm(false);
      resetForm();
      loadBatches();
      
    } catch (error) {
      console.error('Failed to save slot batch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save slot batch';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !assignmentForm.monthly_plan_subscription_id || !assignmentForm.session_name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const assignmentData = {
        trainer_id: trainerId,
        slot_id: selectedSlot.id,
        monthly_plan_subscription_id: assignmentForm.monthly_plan_subscription_id,
        assignment_type: assignmentForm.assignment_type,
        start_date: selectedDate,
        end_date: selectedDate, // For now, single day assignment
        is_permanent: false,
        notes: `${assignmentForm.session_name}${assignmentForm.notes ? ` - ${assignmentForm.notes}` : ''}`
      };

      await slotAssignmentApi.assignSlotToMonthlyPlan(assignmentData);
      showToast('Slot assigned successfully!', 'success');
      
      setShowAssignmentForm(false);
      resetAssignmentForm();
      // Refresh both available and assigned slots
      if (selectedStartDate && selectedEndDate) {
        await Promise.all([
          loadAvailableSlots(selectedStartDate, selectedEndDate),
          loadAssignedSlots(selectedStartDate, selectedEndDate)
        ]);
      }
      
    } catch (error) {
      console.error('Failed to assign slot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign slot';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (batch: SlotGenerationBatch) => {
    setEditingBatch(batch);
    setFormData({
      batch_name: batch.batch_name,
      generation_start_date: new Date(batch.generation_start_date).toISOString().split('T')[0],
      generation_end_date: new Date(batch.generation_end_date).toISOString().split('T')[0],
      slot_duration: batch.slot_duration,
      break_duration: batch.break_duration,
      selected_days: batch.selected_days,
      daily_start_time: batch.daily_start_time,
      daily_end_time: batch.daily_end_time,
      notes: batch.notes || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (batchId: number) => {
    if (!window.confirm('Are you sure you want to delete this slot generation batch? This action cannot be undone.')) {
      return;
    }

    try {
      await slotGenerationApi.deleteSlotGenerationBatch(batchId);
      showToast('Slot generation batch deleted successfully!', 'success');
      loadBatches();
    } catch (error) {
      console.error('Failed to delete slot batch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete slot batch';
      showToast(errorMessage, 'error');
    }
  };

  const toggleBatchStatus = async (batchId: number, currentStatus: boolean) => {
    try {
      await slotGenerationApi.updateSlotGenerationBatch(batchId, { is_active: !currentStatus });
      showToast(`Slot generation batch ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      loadBatches();
    } catch (error) {
      console.error('Failed to toggle batch status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle batch status';
      showToast(errorMessage, 'error');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading slot generation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with neon glow */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-3 drop-shadow-lg">
            Slot Generation & Assignment
          </h2>
          <p className="text-gray-300 text-lg">Generate training slots and assign them to monthly plan members</p>
          <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full shadow-lg"></div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
            <span className="relative flex items-center">
              <i className="fas fa-plus mr-3 text-xl"></i>
              Generate New Slots
            </span>
          </button>
        </div>

        {/* Slot Assignment Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-user-plus text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Assign Slots to Monthly Plan Members
              </h3>
              <p className="text-gray-400">Select and assign training slots to your clients</p>
            </div>
          </div>
          
          {/* Instructions Card */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 mt-1">
                <i className="fas fa-info text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-blue-300 font-semibold mb-3 text-lg">
                  How to Assign Slots
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                      <span><strong>Select Date Range:</strong> Choose the period (e.g., September 1-30)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                      <span><strong>Select Time Range:</strong> Choose the time slot (e.g., 4:30-5:30 PM)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                      <span><strong>Review Available Slots:</strong> See all slots in that time range</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                      <span><strong>Select Slots:</strong> Use checkboxes to select multiple slots</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">5</span>
                      <span><strong>Fill Assignment Form:</strong> Choose member and session details</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">6</span>
                      <span><strong>Assign:</strong> Click "Assign Selected Slots" to assign all at once</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Date Range Selection */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-calendar text-white text-sm"></i>
              </div>
              <h4 className="text-xl font-semibold text-cyan-300">Select Date Range to View Slots</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-cyan-300 transition-colors">
                  <i className="fas fa-play mr-2"></i>Start Date
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    const endDate = selectedEndDate || startDate;
                    handleDateRangeSelection(startDate, endDate);
                  }}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-cyan-300 transition-colors">
                  <i className="fas fa-stop mr-2"></i>End Date
                </label>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => {
                    const endDate = e.target.value;
                    const startDate = selectedStartDate || endDate;
                    handleDateRangeSelection(startDate, endDate);
                  }}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
           
            {/* Manual Date Input */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <i className="fas fa-keyboard text-gray-400 mr-2"></i>
                <label className="text-sm font-medium text-gray-300">
                  Or Type Dates Manually (DD/MM/YYYY format)
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <input
                    type="text"
                    placeholder="01/09/2025"
                    onChange={(e) => {
                      const startDate = e.target.value;
                      if (startDate.length === 10 && startDate.includes('/')) {
                        const [day, month, year] = startDate.split('/');
                        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        const endDate = selectedEndDate || formattedDate;
                        handleDateRangeSelection(formattedDate, endDate);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <div className="group">
                  <input
                    type="text"
                    placeholder="30/09/2025"
                    onChange={(e) => {
                      const endDate = e.target.value;
                      if (endDate.length === 10 && endDate.includes('/')) {
                        const [day, month, year] = endDate.split('/');
                        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        const startDate = selectedStartDate || formattedDate;
                        handleDateRangeSelection(startDate, formattedDate);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
           
           <div className="mt-2 text-xs text-gray-400">
             💡 Tip: Use the date picker above or type dates in DD/MM/YYYY format in the manual input fields
           </div>
         </div>

          {/* Time Range Selection */}
          {selectedStartDate && selectedEndDate && availableSlots.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-clock text-white text-sm"></i>
                </div>
                <h4 className="text-xl font-semibold text-green-300">Select Time Range to Filter Slots (Optional)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-green-300 transition-colors">
                    <i className="fas fa-sun mr-2"></i>Start Time
                  </label>
                  <input
                    type="time"
                    value={selectedStartTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      const endTime = selectedEndTime || startTime;
                      handleTimeRangeSelection(startTime, endTime);
                    }}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-green-300 transition-colors">
                    <i className="fas fa-moon mr-2"></i>End Time
                  </label>
                  <input
                    type="time"
                    value={selectedEndTime}
                    onChange={(e) => {
                      const endTime = e.target.value;
                      const startTime = selectedStartTime || endTime;
                      handleTimeRangeSelection(startTime, endTime);
                    }}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center text-green-300 text-sm">
                  <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>
                  <span>💡 Tip: Leave time range empty to see all slots, or select a range to see slots that overlap or are within 30 minutes of your selected time</span>
                </div>
              </div>
            </div>
          )}

          {/* Available Slots Display */}
          {selectedStartDate && selectedEndDate && (filteredSlots.length > 0 || availableSlots.length > 0) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-calendar-check text-white text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {selectedStartTime && selectedEndTime 
                        ? `Filtered Slots`
                        : `Available Slots`
                      }
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
                      {selectedStartTime && selectedEndTime && (
                        <span className="ml-2 text-purple-300">
                          • {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {filteredSlots.length > 0 && (
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
                      <span className="text-purple-300 text-sm font-medium">
                        <i className="fas fa-filter mr-1"></i>
                        {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSelectAllSlots}
                      className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-check-double mr-2 group-hover:rotate-12 transition-transform"></i>
                      Select All
                    </button>
                    <button
                      onClick={handleClearSelection}
                      className="group px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <i className="fas fa-times mr-2 group-hover:rotate-12 transition-transform"></i>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
             
              {selectedSlots.size > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/40 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                        <i className="fas fa-check-circle text-white"></i>
                      </div>
                      <span className="text-blue-300 text-lg font-semibold">
                        {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <button
                      onClick={handleClearSelection}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}
             
             <div className="space-y-4">
               {Object.entries(groupSlotsByTime(selectedStartTime && selectedEndTime ? filteredSlots : availableSlots)).map(([timeKey, slots]) => {
                 const [startTime, endTime] = timeKey.split('-');
                 const availableSlotsInGroup = slots.filter(slot => slot.is_available);
                 const selectedSlotsInGroup = availableSlotsInGroup.filter(slot => selectedSlots.has(slot.id));
                 const allSelectedInGroup = availableSlotsInGroup.length > 0 && selectedSlotsInGroup.length === availableSlotsInGroup.length;
                 const someSelectedInGroup = selectedSlotsInGroup.length > 0 && selectedSlotsInGroup.length < availableSlotsInGroup.length;
                 
                 return (
                   <div
                     key={timeKey}
                     className={`p-4 rounded-lg border transition-all duration-200 ${
                       allSelectedInGroup
                         ? 'bg-blue-700 border-blue-500'
                         : someSelectedInGroup
                         ? 'bg-blue-600 border-blue-400'
                         : 'bg-gray-700 border-gray-600'
                     }`}
                   >
                     {/* Time Header */}
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex-1">
                         <div className="flex items-center mb-2">
                           <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                             <i className="fas fa-clock text-white"></i>
                           </div>
                           <div>
                             <div className="text-white font-bold text-xl">
                               {formatTime(startTime)} - {formatTime(endTime)}
                             </div>
                             <div className="text-gray-400 text-sm">
                               {slots[0]?.slot_duration} minutes • {slots[0]?.batch_name}
                             </div>
                           </div>
                         </div>
                       </div>
                       {availableSlotsInGroup.length > 0 && (
                         <div className="flex items-center space-x-4">
                           <div className="px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
                             <span className="text-green-300 text-sm font-medium">
                               <i className="fas fa-check-circle mr-1"></i>
                               {availableSlotsInGroup.length} available
                             </span>
                           </div>
                                                        <input
                               key={`group-${timeKey}`}
                               type="checkbox"
                               checked={allSelectedInGroup}
                               ref={(el) => {
                                 if (el) {
                                   el.indeterminate = someSelectedInGroup;
                                 }
                               }}
                               onChange={(e) => {
                               if (e.target.checked) {
                                 // Select all available slots in this group
                                 availableSlotsInGroup.forEach(slot => {
                                   setSelectedSlots(prev => new Set([...prev, slot.id]));
                                 });
                               } else {
                                 // Deselect all slots in this group
                                 availableSlotsInGroup.forEach(slot => {
                                   setSelectedSlots(prev => {
                                     const newSet = new Set(prev);
                                     newSet.delete(slot.id);
                                     return newSet;
                                   });
                                 });
                               }
                             }}
                             className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-400 focus:ring-2"
                           />
                         </div>
                       )}
                     </div>
                     
                                          {/* Dates Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {slots.map(slot => (
                         <div
                           key={`slot-container-${slot.id}-${slot.date}`}
                           className={`group p-3 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                             slot.is_available
                               ? selectedSlots.has(slot.id)
                                 ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400 text-white shadow-lg shadow-blue-500/25'
                                 : 'bg-gradient-to-br from-gray-600/50 to-gray-700/50 border-gray-500 text-gray-300 hover:bg-gray-500/70 hover:border-gray-400'
                               : 'bg-gradient-to-br from-gray-500/50 to-gray-600/50 border-gray-400 text-gray-400 opacity-50'
                           }`}
                         >
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex-1">
                               <div className="font-bold text-sm">
                                 {slot.date ? formatDateForDisplay(slot.date) : 'No date'}
                               </div>
                               <div className="text-xs text-gray-400 mt-1">
                                 {slot.date ? getDayName(slot.date) : ''}
                               </div>
                             </div>
                             {slot.is_available && (
                               <input
                                 key={`slot-${slot.id}-${slot.date}`}
                                 type="checkbox"
                                 checked={selectedSlots.has(slot.id)}
                                 onChange={(e) => {
                                   e.stopPropagation();
                                   console.log('Individual checkbox changed:', { 
                                     slotId: slot.id, 
                                     slotDate: slot.date,
                                     slotTime: `${slot.start_time}-${slot.end_time}`,
                                     checked: e.target.checked 
                                   });
                                   handleSlotCheckboxChange(slot.id, e.target.checked);
                                 }}
                                 className="ml-2 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-400 focus:ring-2 rounded"
                               />
                             )}
                           </div>
                           <div className={`flex items-center text-xs font-medium ${
                             slot.is_available ? 'text-green-400' : 'text-red-400'
                           }`}>
                             <div className={`w-2 h-2 rounded-full mr-2 ${
                               slot.is_available ? 'bg-green-400' : 'bg-red-400'
                             }`}></div>
                             {slot.is_available ? 'Available' : 'Assigned'}
                           </div>
                         </div>
                       ))}
                     </div>
                     
                     {/* Group Actions */}
                     {availableSlotsInGroup.length > 0 && (
                       <div className="mt-4 pt-4 border-t border-gray-600/50">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center">
                             <div className="px-3 py-1 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg">
                               <span className="text-blue-300 text-sm font-medium">
                                 <i className="fas fa-check mr-1"></i>
                                 {selectedSlotsInGroup.length} of {availableSlotsInGroup.length} selected (Total: {selectedSlots.size})
                               </span>
                             </div>
                           </div>
                           <button
                             onClick={() => {
                               if (availableSlotsInGroup.length === 1) {
                                 handleSlotSelection(availableSlotsInGroup[0]);
                               }
                             }}
                             disabled={availableSlotsInGroup.length !== 1}
                             className="group px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                           >
                             <i className="fas fa-user-plus mr-2 group-hover:rotate-12 transition-transform"></i>
                             {availableSlotsInGroup.length === 1 ? 'Assign Individual' : 'Select specific dates above'}
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           </div>
         )}

        {selectedStartDate && selectedEndDate && availableSlots.length === 0 && (
          <div className="text-center py-8 bg-gray-700 rounded-lg">
            <i className="fas fa-calendar-times text-3xl text-gray-500 mb-3"></i>
            <p className="text-gray-400">No available slots for {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}</p>
            <p className="text-gray-500 text-sm">Generate slots first or select a different date range</p>
          </div>
        )}

        {selectedStartDate && selectedEndDate && selectedStartTime && selectedEndTime && filteredSlots.length === 0 && availableSlots.length > 0 && (
          <div className="text-center py-8 bg-gray-700 rounded-lg">
            <i className="fas fa-clock text-3xl text-gray-500 mb-3"></i>
            <p className="text-gray-400">No slots found for the selected time range</p>
            <p className="text-gray-500 text-sm">Try adjusting the time range or clear it to see all available slots</p>
          </div>
        )}

        {/* Assigned Slots Display */}
        {selectedStartDate && selectedEndDate && assignedSlots.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-3">
              Assigned Slots ({formatDate(selectedStartDate)} - {formatDate(selectedEndDate)})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedSlots.map(slot => (
                <div
                  key={slot.id}
                  className="p-4 rounded-lg border border-blue-600 bg-gray-700"
                >
                  <div className="text-white font-medium">
                    {slot.assigned_to_name || 'Unknown Member'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(slot.start_date)} - {formatDate(slot.end_date)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {slot.start_time && slot.end_time && (
                      `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Type: {slot.assignment_type}
                  </div>
                  <div className="text-blue-400 text-xs font-medium mt-2">
                    Assigned
                  </div>
                  <button
                    onClick={() => handleUnassignSlot(slot.id)}
                    className="mt-3 w-full px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-undo mr-1"></i>
                    Make Available
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Bulk Assignment Form */}
          {selectedStartDate && selectedEndDate && (filteredSlots.length > 0 || (availableSlots.length > 0 && !selectedStartTime)) && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    Bulk Assignment
                  </h4>
                  {selectedSlots.size > 0 && (
                    <p className="text-orange-300 text-sm font-medium">
                      {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-orange-300 transition-colors">
                    <i className="fas fa-user mr-2"></i>Monthly Plan Member *
                  </label>
                  <select
                    name="monthly_plan_subscription_id"
                    value={assignmentForm.monthly_plan_subscription_id}
                    onChange={handleAssignmentFormChange}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm"
                    required
                  >
                    <option value="">Select a member</option>
                    {monthlyPlanSubscriptions.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.member_name} - {sub.plan_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-orange-300 transition-colors">
                    <i className="fas fa-dumbbell mr-2"></i>Session Type
                  </label>
                  <select
                    name="assignment_type"
                    value={assignmentForm.assignment_type}
                    onChange={handleAssignmentFormChange}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <option value="personal">Personal Training</option>
                    <option value="group">Group Training</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-orange-300 transition-colors">
                  <i className="fas fa-tag mr-2"></i>Session Name *
                </label>
                <input
                  type="text"
                  name="session_name"
                  value={assignmentForm.session_name}
                  onChange={handleAssignmentFormChange}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm"
                  placeholder="e.g., Mehlab's Personal Training"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-orange-300 transition-colors">
                  <i className="fas fa-sticky-note mr-2"></i>Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={assignmentForm.notes}
                  onChange={handleAssignmentFormChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Any additional notes about these sessions..."
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
                  <div className="text-green-300 text-sm font-medium">
                    {selectedSlots.size > 0 
                      ? (
                        <span>
                          <i className="fas fa-check-circle mr-2"></i>
                          Will assign {selectedSlots.size} selected slot{selectedSlots.size !== 1 ? 's' : ''}
                        </span>
                      )
                      : (
                        <span>
                          <i className="fas fa-info-circle mr-2"></i>
                          Select slots using checkboxes above to assign them
                        </span>
                      )
                    }
                  </div>
                </div>
                <button
                  onClick={handleBulkAssignment}
                  disabled={saving || selectedSlots.size === 0 || !assignmentForm.monthly_plan_subscription_id || !assignmentForm.session_name}
                  className="group px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <i className="fas fa-spinner fa-spin mr-3 text-xl"></i>
                      Assigning...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <i className="fas fa-users mr-3 text-xl group-hover:rotate-12 transition-transform"></i>
                      Assign Selected Slots
                    </span>
                  )}
                </button>
              </div>
          </div>
        )}
      </div>

      {/* Slot Assignment Form Modal */}
      {showAssignmentForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-pink-400 mb-4">Assign Slot</h3>
            
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-white font-medium">{formatDate(selectedSlot.date || selectedStartDate)}</p>
              <p className="text-gray-300">
                {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
              </p>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Plan Member *
                </label>
                <select
                  name="monthly_plan_subscription_id"
                  value={assignmentForm.monthly_plan_subscription_id}
                  onChange={handleAssignmentFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                  required
                >
                  <option value="">Select a member</option>
                  {monthlyPlanSubscriptions.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.member_name} - {sub.plan_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  name="session_name"
                  value={assignmentForm.session_name}
                  onChange={handleAssignmentFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                  placeholder="e.g., Mehlab's Personal Training"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Type
                </label>
                <select
                  name="assignment_type"
                  value={assignmentForm.assignment_type}
                  onChange={handleAssignmentFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                >
                  <option value="personal">Personal Training</option>
                  <option value="group">Group Training</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={assignmentForm.notes}
                  onChange={handleAssignmentFormChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors resize-none"
                  placeholder="Any additional notes about this session..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentForm(false);
                    resetAssignmentForm();
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
        </div>
      )}



      {/* Batches List */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <i className="fas fa-calendar-plus text-white text-lg"></i>
          </div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Generated Slot Batches
          </h3>
        </div>
        
        {batches.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-plus text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-300 text-xl mb-3 font-semibold">No slot batches found</p>
            <p className="text-gray-400">Create your first slot generation batch to get started</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {batches.map(batch => (
              <div key={batch.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <i className="fas fa-calendar text-white"></i>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                          {batch.batch_name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <i className="fas fa-calendar mr-2 text-indigo-400"></i>
                            {new Date(batch.generation_start_date).toLocaleDateString()} - {new Date(batch.generation_end_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-clock mr-2 text-purple-400"></i>
                            {formatTime(batch.daily_start_time)} - {formatTime(batch.daily_end_time)}
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-stopwatch mr-2 text-cyan-400"></i>
                            {batch.slot_duration} min slots
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      batch.is_active 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                    }`}>
                      <i className={`fas ${batch.is_active ? 'fa-play' : 'fa-pause'} mr-2`}></i>
                      {batch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl">
                      <i className="fas fa-coffee mr-3 text-blue-400 text-lg"></i>
                      <div>
                        <div className="text-blue-300 font-semibold">{batch.break_duration} min</div>
                        <div className="text-blue-400 text-xs">Break Duration</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl">
                      <i className="fas fa-calendar-week mr-3 text-purple-400 text-lg"></i>
                      <div>
                        <div className="text-purple-300 font-semibold">
                          {batch.selected_days.map(day => dayOptions.find(d => d.value === day)?.label).join(', ')}
                        </div>
                        <div className="text-purple-400 text-xs">Selected Days</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl">
                      <i className="fas fa-hashtag mr-3 text-green-400 text-lg"></i>
                      <div>
                        <div className="text-green-300 font-semibold">{batch.total_slots_generated || 0}</div>
                        <div className="text-green-400 text-xs">Slots Generated</div>
                      </div>
                    </div>
                  </div>
                </div>

                {batch.notes && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-sticky-note mr-2 text-gray-400"></i>
                      <span className="text-gray-300 font-medium">Notes</span>
                    </div>
                    <p className="text-gray-300 text-sm">{batch.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
                  <div className="text-sm text-gray-500">
                    <i className="fas fa-clock mr-2"></i>
                    Created: {new Date(batch.generation_date).toLocaleString()}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleBatchStatus(batch.id, batch.is_active)}
                      className={`group px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                        batch.is_active
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                      }`}
                    >
                      <i className={`fas ${batch.is_active ? 'fa-pause' : 'fa-play'} mr-2 group-hover:rotate-12 transition-transform`}></i>
                      {batch.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(batch)}
                      className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-edit mr-2 group-hover:rotate-12 transition-transform"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="group px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <i className="fas fa-trash mr-2 group-hover:rotate-12 transition-transform"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slot Assignment Form Modal */}
      {showAssignmentForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-pink-400 mb-4">Assign Slot</h3>
            {/* Individual slot assignment form content would go here */}
          </div>
        </div>
      )}

      {/* Create/Edit Batch Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-pink-400 mb-4">
              {editingBatch ? 'Edit Slot Generation Batch' : 'Create New Slot Generation Batch'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    name="batch_name"
                    value={formData.batch_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    placeholder="e.g., September Morning Slots"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slot Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="slot_duration"
                    value={formData.slot_duration}
                    onChange={handleInputChange}
                    min="15"
                    max="180"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="generation_start_date"
                    value={formData.generation_start_date}
                    onChange={handleInputChange}
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
                    name="generation_end_date"
                    value={formData.generation_end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="break_duration"
                    value={formData.break_duration}
                    onChange={handleInputChange}
                    min="0"
                    max="60"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Start Time *
                  </label>
                  <input
                    type="time"
                    name="daily_start_time"
                    value={formData.daily_start_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily End Time *
                  </label>
                  <input
                    type="time"
                    name="daily_end_time"
                    value={formData.daily_end_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Days *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dayOptions.map(day => (
                    <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={day.value}
                        checked={formData.selected_days.includes(day.value)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-400 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors resize-none"
                  placeholder="Any additional notes about this batch..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
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
                      {editingBatch ? 'Updating...' : 'Generating...'}
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-save mr-2"></i>
                      {editingBatch ? 'Update Batch' : 'Generate Slots'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
