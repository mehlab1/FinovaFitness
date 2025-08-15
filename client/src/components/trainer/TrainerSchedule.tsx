import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Users, Settings, Ban, Plus, X, Edit3, Eye, EyeOff, Zap, Target, TrendingUp, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../Toast';

interface TrainerScheduleProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface AvailabilityDay {
  dayOfWeek: number;
  dayName: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  maxSessions: number;
  breakDuration: number;
}

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'unavailable';
  clientName?: string;
  sessionType?: string;
}

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

export const TrainerSchedule = ({ showToast }: TrainerScheduleProps) => {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
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
      const data = await trainerApi.getAvailability();
      
      if (data && data.length > 0) {
        // Transform backend data to match our interface
        const transformedAvailability: AvailabilityDay[] = DAYS_OF_WEEK.map(day => {
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
    } catch (error) {
      console.error('Failed to fetch existing availability:', error);
      // Initialize with default values on error
      initializeAvailability();
    }
  };

  const initializeAvailability = () => {
    const initialAvailability: AvailabilityDay[] = DAYS_OF_WEEK.map(day => ({
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
      const slotsData = await trainerApi.getAvailableSlots(selectedDate);
      
      // Transform the data to match our interface
      if (slotsData && slotsData.length > 0) {
        const slots: TimeSlot[] = slotsData.map((slot: any) => ({
          id: slot.id.toString(),
          time: slot.time_slot,
          status: slot.booking_id ? 'booked' : (slot.status === 'unavailable' ? 'unavailable' : 'available'),
          clientName: slot.client_id ? `${slot.first_name || ''} ${slot.last_name || ''}`.trim() : '',
          sessionType: slot.session_type || 'Personal Training'
        }));
        setTimeSlots(slots);
      } else {
        // If no slots found, generate them from availability for this day
        const dayAvailability = availability.find(day => day.dayOfWeek === dayOfWeek);
        if (dayAvailability && dayAvailability.isAvailable) {
          const generatedSlots = generateTimeSlots(dayAvailability);
          const slots: TimeSlot[] = generatedSlots.map((time, index) => ({
            id: `generated-${index}`,
            time: time,
            status: 'available',
            clientName: '',
            sessionType: 'Personal Training'
          }));
          setTimeSlots(slots);
        } else {
          setTimeSlots([]);
        }
      }

      // Fetch blocked time slots
      try {
        const scheduleData = await trainerApi.getSchedule();
        if (scheduleData.timeOff) {
          setBlockedTimeSlots(scheduleData.timeOff);
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
        const slots: TimeSlot[] = generatedSlots.map((time, index) => ({
          id: `generated-${index}`,
          time: time,
          status: 'available',
          clientName: '',
          sessionType: 'Personal Training'
        }));
        setTimeSlots(slots);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: keyof AvailabilityDay, value: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [field]: value
    };
    setAvailability(updatedAvailability);
  };

  const generateTimeSlots = (day: AvailabilityDay): string[] => {
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
      await trainerApi.updateAvailability(availability);
      
      // Generate and save time slots
      await trainerApi.generateTimeSlots(availability);
      
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
      
      await trainerApi.blockTimeSlots({
        date: blockDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        reason: blockReason || 'Personal time off'
      });
      
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
      await trainerApi.unblockTimeSlots(blockId);
      showToast('Time slots unblocked successfully!', 'success');
      
      // Refresh schedule data
      fetchScheduleData();
      
    } catch (error) {
      console.error('Failed to unblock time slots:', error);
      showToast('Failed to unblock time slots', 'error');
    }
  };

  const getDayStatusColor = (day: AvailabilityDay) => {
    if (!day.isAvailable) return 'bg-gray-500';
    if (day.isAvailable && day.startTime && day.endTime) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const getDayStatusText = (day: AvailabilityDay) => {
    if (!day.isAvailable) return 'Unavailable';
    if (day.isAvailable && day.startTime && day.endTime) return 'Available';
    return 'Incomplete';
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
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
          My Schedule
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto">
          Design your training schedule, manage availability, and control when you're available for sessions.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-xl p-1 flex space-x-1">
          <Button
            variant={viewMode === 'setup' ? 'default' : 'ghost'}
            onClick={() => setViewMode('setup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'setup' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium text-sm">Setup</span>
          </Button>
          <Button
            variant={viewMode === 'view' ? 'default' : 'ghost'}
            onClick={() => setViewMode('view')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'view' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium text-sm">View</span>
          </Button>
        </div>
      </div>

      {viewMode === 'setup' ? (
        /* Schedule Setup Mode - Compact Layout */
        <div className="space-y-6">
          {/* Global Settings & Block Time Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Settings Card */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Global Settings</CardTitle>
                    <CardDescription className="text-gray-300 text-sm">
                      Default session parameters
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs font-medium">Session Duration</Label>
                    <Select
                      value={availability.length > 0 ? availability[0].sessionDuration.toString() : '60'}
                      onValueChange={(value) => {
                        const newAvailability = availability.map(day => ({
                          ...day,
                          sessionDuration: parseInt(value)
                        }));
                        setAvailability(newAvailability);
                      }}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {SESSION_DURATIONS.map(duration => (
                          <SelectItem key={duration} value={duration.toString()} className="text-white hover:bg-gray-700">
                            {duration} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs font-medium">Break Duration</Label>
                    <Select
                      value={availability.length > 0 ? availability[0].breakDuration.toString() : '15'}
                      onValueChange={(value) => {
                        const newAvailability = availability.map(day => ({
                          ...day,
                          breakDuration: parseInt(value)
                        }));
                        setAvailability(newAvailability);
                      }}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {BREAK_DURATIONS.map(duration => (
                          <SelectItem key={duration} value={duration.toString()} className="text-white hover:bg-gray-700">
                            {duration} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-xs font-medium">Max Sessions</Label>
                    <Input
                      type="number"
                      value={availability.length > 0 ? availability[0].maxSessions : 8}
                      onChange={(e) => {
                        const newAvailability = availability.map(day => ({
                          ...day,
                          maxSessions: parseInt(e.target.value)
                        }));
                        setAvailability(newAvailability);
                      }}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                      min="1"
                      max="24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Block Time Card */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Ban className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Block Time</CardTitle>
                    <CardDescription className="text-gray-300 text-sm">
                      Block specific dates/times
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!showBlockForm ? (
                  <Button
                    onClick={() => setShowBlockForm(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Block Time Slots
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Date</Label>
                        <Input
                          type="date"
                          value={blockDate}
                          onChange={(e) => setBlockDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Start</Label>
                        <Input
                          type="time"
                          value={blockStartTime}
                          onChange={(e) => setBlockStartTime(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">End</Label>
                        <Input
                          type="time"
                          value={blockEndTime}
                          onChange={(e) => setBlockEndTime(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Reason</Label>
                        <Input
                          placeholder="Optional"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBlockForm(false)}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={blockTimeSlots}
                        disabled={blockingTime || !blockDate}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-8 text-xs"
                      >
                        {blockingTime ? 'Blocking...' : 'Block'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Schedule Configuration - Compact */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Daily Schedule</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Set availability for each day
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {availability.map((day, index) => (
                <div key={day.dayOfWeek} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={day.isAvailable}
                        onCheckedChange={(checked) => 
                          handleAvailabilityChange(index, 'isAvailable', checked)
                        }
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                      />
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-base font-bold ${DAYS_OF_WEEK[day.dayOfWeek].color}`}>
                          {day.dayName}
                        </h3>
                        <Badge 
                          variant={day.isAvailable ? 'default' : 'secondary'}
                          className={`text-xs ${
                            day.isAvailable 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gray-600'
                          }`}
                        >
                          {getDayStatusText(day)}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDayExpansion(index)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      {expandedDays.includes(index) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedDays.includes(index) && day.isAvailable && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Start</Label>
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, 'startTime', e.target.value)
                          }
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">End</Label>
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, 'endTime', e.target.value)
                          }
                          className="bg-gray-700 border-gray-600 text-white h-8 text-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Duration</Label>
                        <Select
                          value={day.sessionDuration.toString()}
                          onValueChange={(value) => 
                            handleAvailabilityChange(index, 'sessionDuration', parseInt(value))
                          }
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {SESSION_DURATIONS.map(duration => (
                              <SelectItem key={duration} value={duration.toString()} className="text-white hover:bg-gray-700">
                                {duration} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-gray-300 text-xs font-medium">Break</Label>
                        <Select
                          value={day.breakDuration.toString()}
                          onValueChange={(value) => 
                            handleAvailabilityChange(index, 'breakDuration', parseInt(value))
                          }
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {BREAK_DURATIONS.map(duration => (
                              <SelectItem key={duration} value={duration.toString()} className="text-white hover:bg-gray-700">
                                {duration} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* Preview of generated time slots */}
                  {expandedDays.includes(index) && day.isAvailable && (
                    <div className="mt-3">
                      <Label className="text-gray-400 text-xs font-medium">Preview:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generateTimeSlots(day).slice(0, 6).map((slot, slotIndex) => (
                          <Badge key={slotIndex} variant="outline" className="text-xs bg-gray-600/50 border-gray-500 text-gray-200">
                            {slot}
                          </Badge>
                        ))}
                        {generateTimeSlots(day).length > 6 && (
                          <Badge variant="outline" className="text-xs bg-gray-600/50 border-gray-500 text-gray-200">
                            +{generateTimeSlots(day).length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="text-center">
            <Button
              onClick={saveAvailability}
              disabled={saving}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl transform hover:scale-105 transition-all"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  Save & Generate Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Schedule View Mode - Compact Layout */
        <div className="space-y-6">
          {/* Date Selector & Quick Stats Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Selector */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <Label htmlFor="scheduleDate" className="text-gray-300 font-medium">Select Date:</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-gray-700 border-gray-600 text-white w-40"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats - Compact */}
            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg">
                <CardContent className="pt-4 text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-1">
                    {timeSlots.filter(slot => slot.status === 'available').length}
                  </p>
                  <p className="text-green-300 text-xs font-medium">Available</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 shadow-lg">
                <CardContent className="pt-4 text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-red-400 mb-1">
                    {timeSlots.filter(slot => slot.status === 'booked').length}
                  </p>
                  <p className="text-red-300 text-xs font-medium">Booked</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-500/50 shadow-lg">
                <CardContent className="pt-4 text-center">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Ban className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-400 mb-1">
                    {timeSlots.filter(slot => slot.status === 'unavailable').length}
                  </p>
                  <p className="text-gray-300 text-xs font-medium">Blocked</p>
                </CardContent>
              </Card>
            </div>
      </div>

          {/* Schedule Overview - Compact Grid */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {timeSlots.length} total time slots
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border transition-all transform hover:scale-105 ${
                        slot.status === 'booked' 
                          ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-red-600/20' 
                          : slot.status === 'unavailable'
                          ? 'border-gray-500 bg-gradient-to-br from-gray-500/20 to-gray-600/20'
                          : 'border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white mb-2">{slot.time}</div>
                        <Badge 
                          variant={slot.status === 'booked' ? 'destructive' : 'secondary'}
                          className={`text-xs px-2 py-1 rounded-full ${
                            slot.status === 'booked' 
                              ? 'bg-red-500 text-white' 
                              : slot.status === 'unavailable'
                              ? 'bg-gray-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {slot.status === 'booked' ? 'Booked' : 
                           slot.status === 'unavailable' ? 'Blocked' : 
                           'Available'}
                        </Badge>
                        
                        {slot.status === 'booked' && (
                          <div className="mt-2 text-xs text-gray-300">
                            <p className="truncate">{slot.clientName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-base">No time slots available for this date.</p>
                  <p className="text-sm">Set up your availability schedule first.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blocked Time Management - Compact */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Ban className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Blocked Time</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    {blockedTimeSlots.length} blocked periods
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedTimeSlots.length > 0 ? (
                  blockedTimeSlots.map((blockedSlot) => (
                    <div key={blockedSlot.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <CalendarDays className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {new Date(blockedSlot.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {blockedSlot.start_time} - {blockedSlot.end_time}
                          </p>
      </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockTimeSlots(blockedSlot.id)}
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all h-7 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Unblock
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Ban className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm">No blocked time periods found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
