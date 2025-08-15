import { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api/trainerApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Users, Settings, Ban } from 'lucide-react';

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
  { value: 0, name: 'Sunday', short: 'Sun' },
  { value: 1, name: 'Monday', short: 'Mon' },
  { value: 2, name: 'Tuesday', short: 'Tue' },
  { value: 3, name: 'Wednesday', short: 'Wed' },
  { value: 4, name: 'Thursday', short: 'Thu' },
  { value: 5, name: 'Friday', short: 'Fri' },
  { value: 6, name: 'Saturday', short: 'Sat' }
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

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINER SCHEDULE
        </h1>
        <p className="text-gray-300">Design your training schedule and manage availability.</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'setup' ? 'default' : 'outline'}
            onClick={() => setViewMode('setup')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Setup Schedule</span>
          </Button>
          <Button
            variant={viewMode === 'view' ? 'default' : 'outline'}
            onClick={() => setViewMode('view')}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>View Schedule</span>
          </Button>
        </div>
        
        {viewMode === 'setup' && (
          <Button
            onClick={saveAvailability}
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        )}
      </div>

      {viewMode === 'setup' ? (
        /* Schedule Setup Mode */
        <div className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Global Schedule Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your default working hours and session parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultStartTime">Default Start Time</Label>
                  <Input
                    id="defaultStartTime"
                    type="time"
                    value={availability.length > 0 ? availability[0].startTime : '09:00'}
                    onChange={(e) => {
                      const newAvailability = availability.map(day => ({
                        ...day,
                        startTime: e.target.value
                      }));
                      setAvailability(newAvailability);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultEndTime">Default End Time</Label>
                  <Input
                    id="defaultEndTime"
                    type="time"
                    value={availability.length > 0 ? availability[0].endTime : '17:00'}
                    onChange={(e) => {
                      const newAvailability = availability.map(day => ({
                        ...day,
                        endTime: e.target.value
                      }));
                      setAvailability(newAvailability);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultSessionDuration">Default Session Duration</Label>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_DURATIONS.map(duration => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Daily Schedule Configuration</span>
              </CardTitle>
              <CardDescription>
                Set your availability for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availability.map((day, index) => (
                  <div key={day.dayOfWeek} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={day.isAvailable}
                          onCheckedChange={(checked) => 
                            handleAvailabilityChange(index, 'isAvailable', checked)
                          }
                        />
                        <Label className="text-lg font-medium">{day.dayName}</Label>
                        <Badge variant={day.isAvailable ? 'default' : 'secondary'}>
                          {day.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
      </div>

                    {day.isAvailable && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-8">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => 
                              handleAvailabilityChange(index, 'startTime', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => 
                              handleAvailabilityChange(index, 'endTime', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Session Duration</Label>
                          <Select
                            value={day.sessionDuration.toString()}
                            onValueChange={(value) => 
                              handleAvailabilityChange(index, 'sessionDuration', parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SESSION_DURATIONS.map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} min
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Break Between Sessions</Label>
                          <Select
                            value={day.breakDuration.toString()}
                            onValueChange={(value) => 
                              handleAvailabilityChange(index, 'breakDuration', parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BREAK_DURATIONS.map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} min
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    {/* Preview of generated time slots */}
                    {day.isAvailable && (
                      <div className="mt-4 ml-8">
                        <Label className="text-sm text-gray-400">Preview Time Slots:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {generateTimeSlots(day).map((slot, slotIndex) => (
                            <Badge key={slotIndex} variant="outline" className="text-xs">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Block Time Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ban className="w-5 h-5" />
                <span>Block Time Slots</span>
              </CardTitle>
              <CardDescription>
                Block specific dates or time ranges when you're unavailable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="blockDate">Date to Block</Label>
                  <Input
                    id="blockDate"
                    type="date"
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="blockStartTime">Start Time</Label>
                  <Input
                    id="blockStartTime"
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="blockEndTime">End Time</Label>
                  <Input
                    id="blockEndTime"
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="blockReason">Reason (Optional)</Label>
                  <Input
                    id="blockReason"
                    placeholder="e.g., Personal time off, Holiday"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={blockTimeSlots}
                  disabled={blockingTime || !blockDate}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {blockingTime ? 'Blocking...' : 'Block Time Slots'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Schedule View Mode */
        <div className="space-y-6">
          {/* Date Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Label htmlFor="scheduleDate">Select Date:</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border ${
                        slot.status === 'booked' 
                          ? 'bg-red-500/20 border-red-500' 
                          : slot.status === 'unavailable'
                          ? 'bg-gray-500/20 border-gray-500'
                          : 'bg-green-500/20 border-green-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{slot.time}</span>
                        <Badge variant={
                          slot.status === 'booked' ? 'destructive' : 
                          slot.status === 'unavailable' ? 'secondary' : 
                          'default'
                        }>
                          {slot.status === 'booked' ? 'Booked' : 
                           slot.status === 'unavailable' ? 'Blocked' : 
                           'Available'}
                        </Badge>
                      </div>
                      {slot.status === 'booked' && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Client:</strong> {slot.clientName}</p>
                          <p><strong>Type:</strong> {slot.sessionType}</p>
                        </div>
                      )}
                      {slot.status === 'unavailable' && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Status:</strong> Time slot blocked</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No time slots available for this date.</p>
                  <p className="text-sm">Make sure you have set up your availability schedule.</p>
                </div>
              )}
            </CardContent>
          </Card>

                    {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Slots</p>
                    <p className="text-2xl font-bold">
                      {timeSlots.filter(slot => slot.status === 'available').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booked Sessions</p>
                    <p className="text-2xl font-bold">
                      {timeSlots.filter(slot => slot.status === 'booked').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-500/20 rounded-lg">
                    <Ban className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blocked Slots</p>
                    <p className="text-2xl font-bold">
                      {timeSlots.filter(slot => slot.status === 'unavailable').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Slots</p>
                    <p className="text-2xl font-bold">{timeSlots.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blocked Time Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ban className="w-5 h-5" />
                <span>Blocked Time Management</span>
              </CardTitle>
              <CardDescription>
                View and manage your blocked time periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockedTimeSlots.length > 0 ? (
                  blockedTimeSlots.map((blockedSlot) => (
                    <div key={blockedSlot.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium">
                          {new Date(blockedSlot.start_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {blockedSlot.start_time} - {blockedSlot.end_time}
                        </p>
                        {blockedSlot.reason && (
                          <p className="text-sm text-gray-500">Reason: {blockedSlot.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockTimeSlots(blockedSlot.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Ban className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No blocked time periods found.</p>
                    <p className="text-sm">Use the Setup Schedule mode to block time slots.</p>
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
