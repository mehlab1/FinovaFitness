import { useState, useEffect } from 'react';
import { memberApi } from '../../services/api/memberApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, MapPin, Star, Users, BookOpen } from 'lucide-react';
import { useToast } from '../Toast';

interface Trainer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  profile_image?: string;
  bio?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'unavailable';
  session_duration?: number;
}

interface BookingForm {
  trainerId: number;
  sessionDate: string;
  startTime: string;
  sessionType: string;
  notes: string;
}

export const TrainersTab = ({ showToast }: { showToast: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    trainerId: 0,
    sessionDate: '',
    startTime: '',
    sessionType: '',
    notes: ''
  });

  const SESSION_TYPES = [
    'Personal Training',
    'Strength Training',
    'Cardio Training',
    'Flexibility & Mobility',
    'Weight Loss',
    'Muscle Building',
    'Sports Performance',
    'Rehabilitation'
  ];

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (selectedTrainer && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedTrainer, selectedDate]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await memberApi.getTrainers();
      setTrainers(data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      showToast('Failed to load trainers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedTrainer || !selectedDate) return;
    
    try {
      const data = await memberApi.getTrainerSchedule(selectedTrainer.id, selectedDate);
      setAvailableSlots(data);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      showToast('Failed to load available slots', 'error');
    }
  };

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setSelectedDate('');
    setAvailableSlots([]);
    setShowBookingForm(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowBookingForm(false);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setBookingForm({
        ...bookingForm,
        trainerId: selectedTrainer!.id,
        sessionDate: selectedDate,
        startTime: slot.time,
        sessionType: ''
      });
      setShowBookingForm(true);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.sessionType) {
      showToast('Please select a session type', 'error');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Calculate end time based on session duration (default 60 minutes)
      const startTime = new Date(`2000-01-01T${bookingForm.startTime}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      
      await memberApi.bookTrainingSession({
        trainer_id: bookingForm.trainerId,
        session_date: bookingForm.sessionDate,
        start_time: bookingForm.startTime,
        end_time: endTime.toTimeString().slice(0, 5),
        session_type: bookingForm.sessionType,
        notes: bookingForm.notes
      });

      showToast('Training session booked successfully!', 'success');
      setShowBookingForm(false);
      setBookingForm({
        trainerId: 0,
        sessionDate: '',
        startTime: '',
        sessionType: '',
        notes: ''
      });
      
      // Refresh available slots
      fetchAvailableSlots();
    } catch (error) {
      console.error('Failed to book session:', error);
      showToast('Failed to book training session', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const getAvailableSlotsCount = () => {
    return availableSlots.filter(slot => slot.status === 'available').length;
  };

  const getBookedSlotsCount = () => {
    return availableSlots.filter(slot => slot.status === 'booked').length;
  };

  const getBlockedSlotsCount = () => {
    return availableSlots.filter(slot => slot.status === 'unavailable').length;
  };

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-2 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
          TRAINERS & BOOKINGS
        </h1>
        <p className="text-gray-300">Browse available trainers and book personal training sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Available Trainers</span>
              </CardTitle>
              <CardDescription>
                Select a trainer to view their schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-400 ${
                    selectedTrainer?.id === trainer.id 
                      ? 'border-blue-400 bg-blue-400/10' 
                      : 'border-gray-600 hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleTrainerSelect(trainer)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={trainer.profile_image} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {trainer.first_name[0]}{trainer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {trainer.first_name} {trainer.last_name}
                      </h3>
                      <p className="text-sm text-gray-400">{trainer.specialization}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-300">{trainer.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-300">{trainer.experience_years}y exp</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-green-400">${trainer.hourly_rate}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
                       </div>
                       
        {/* Schedule and Booking Section */}
        <div className="lg:col-span-2">
          {selectedTrainer ? (
            <div className="space-y-6">
              {/* Trainer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedTrainer.profile_image} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {selectedTrainer.first_name[0]}{selectedTrainer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedTrainer.first_name} {selectedTrainer.last_name}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedTrainer.bio || `${selectedTrainer.specialization} specialist with ${selectedTrainer.experience_years} years of experience`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{selectedTrainer.rating}</p>
                      <p className="text-sm text-gray-400">Rating</p>
                        </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{selectedTrainer.total_sessions}</p>
                      <p className="text-sm text-gray-400">Sessions</p>
                        </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-400">{selectedTrainer.experience_years}</p>
                      <p className="text-sm text-gray-400">Years</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-400">${selectedTrainer.hourly_rate}</p>
                      <p className="text-sm text-gray-400">Per Hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date Selection */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="sessionDate">Select Date:</Label>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </CardTitle>
                    <CardDescription>
                      Click on an available slot to book your session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availableSlots.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {availableSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                slot.status === 'available'
                                  ? 'border-green-500 bg-green-500/20 hover:bg-green-500/30'
                                  : slot.status === 'booked'
                                  ? 'border-red-500 bg-red-500/20 cursor-not-allowed'
                                  : 'border-gray-500 bg-gray-500/20 cursor-not-allowed'
                              }`}
                              onClick={() => slot.status === 'available' ? handleSlotSelect(slot) : undefined}
                            >
                              <div className="text-center">
                                <p className="font-medium text-lg">{slot.time}</p>
                                <Badge 
                                  variant={slot.status === 'available' ? 'default' : 'secondary'}
                                  className="mt-2"
                                >
                                  {slot.status === 'available' ? 'Available' : 
                                   slot.status === 'booked' ? 'Booked' : 'Unavailable'}
                                </Badge>
            </div>
          </div>
                          ))}
            </div>
            
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{getAvailableSlotsCount()}</p>
                            <p className="text-sm text-gray-400">Available</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{getBookedSlotsCount()}</p>
                            <p className="text-sm text-gray-400">Booked</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-400">{getBlockedSlotsCount()}</p>
                            <p className="text-sm text-gray-400">Blocked</p>
                          </div>
                        </div>
                </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No time slots available for this date.</p>
                        <p className="text-sm">This trainer may not be working on this day.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Booking Form */}
              {showBookingForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Book Training Session</span>
                    </CardTitle>
                    <CardDescription>
                      Complete your booking details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sessionDate">Date</Label>
                          <Input
                            id="sessionDate"
                            type="date"
                            value={bookingForm.sessionDate}
                            disabled
                          />
                    </div>
                        <div>
                          <Label htmlFor="startTime">Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={bookingForm.startTime}
                            disabled
                          />
                  </div>
                </div>
                      
                      <div>
                        <Label htmlFor="sessionType">Session Type</Label>
                        <Select
                          value={bookingForm.sessionType}
                          onValueChange={(value) => setBookingForm({...bookingForm, sessionType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select session type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SESSION_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          placeholder="Any specific requirements or goals for this session..."
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="submit"
                          disabled={bookingLoading || !bookingForm.sessionType}
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                        >
                          {bookingLoading ? 'Booking...' : 'Book Session'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                        >
                          Cancel
                        </Button>
                            </div>
                    </form>
                  </CardContent>
                </Card>
                          )}
                            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a Trainer</h3>
                  <p>Choose a trainer from the list to view their schedule and book sessions.</p>
                </div>
              </CardContent>
            </Card>
                )}
              </div>
            </div>
    </div>
  );
};
