import { useState, useEffect } from 'react';
import { memberApi } from '../../services/api/memberApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, MapPin, Star, Users, BookOpen, Search, Filter, Zap, Target, TrendingUp, Heart, Award } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Specializations');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price' | 'sessions'>('rating');
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

  const SPECIALIZATIONS = [
    'All Specializations',
    'Strength Training',
    'Cardio Training',
    'Weight Loss',
    'Muscle Building',
    'Sports Performance',
    'Rehabilitation',
    'Flexibility',
    'Nutrition',
    'CrossFit',
    'Yoga',
    'Pilates'
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

  // Filter and sort trainers
  const filteredTrainers = trainers
    .filter(trainer => {
      const matchesSearch = trainer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trainer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'All Specializations' || 
                                   trainer.specialization === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience_years - a.experience_years;
        case 'price':
          return a.hourly_rate - b.hourly_rate;
        case 'sessions':
          return b.total_sessions - a.total_sessions;
        default:
          return 0;
      }
    });



  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Find Your Perfect Trainer
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto">
          Browse certified trainers, view their schedules, and book personal training sessions that fit your goals.
        </p>
        </div>
        
      {/* Search & Filter Bar */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
      </div>

            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec} className="text-white hover:bg-gray-700">
                            {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="rating" className="text-white hover:bg-gray-700">Highest Rating</SelectItem>
                <SelectItem value="experience" className="text-white hover:bg-gray-700">Most Experience</SelectItem>
                <SelectItem value="price" className="text-white hover:bg-gray-700">Lowest Price</SelectItem>
                <SelectItem value="sessions" className="text-white hover:bg-gray-700">Most Sessions</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-right">
              <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-400">
                {filteredTrainers.length} trainers found
              </Badge>
                  </div>
                </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainers List - Compact */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
              </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Available Trainers</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Select a trainer to view schedule
                  </CardDescription>
            </div>
                       </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-blue-400 ${
                    selectedTrainer?.id === trainer.id 
                      ? 'border-blue-400 bg-blue-400/10' 
                      : 'border-gray-600 hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleTrainerSelect(trainer)}
                >
                        <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={trainer.profile_image} />
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {trainer.first_name[0]}{trainer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {trainer.first_name} {trainer.last_name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">{trainer.specialization}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-300">{trainer.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-300">{trainer.experience_years}y</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-green-400">${trainer.hourly_rate}</span>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
            </div>
        
        {/* Schedule and Booking Section - Compact */}
        <div className="lg:col-span-2">
          {selectedTrainer ? (
            <div className="space-y-4">
              {/* Trainer Info - Compact */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedTrainer.profile_image} />
                      <AvatarFallback className="bg-blue-500 text-white text-lg">
                        {selectedTrainer.first_name[0]}{selectedTrainer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-xl font-bold text-white">
                          {selectedTrainer.first_name} {selectedTrainer.last_name}
                        </h2>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {selectedTrainer.specialization}
                        </Badge>
                       </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                        </div>
                          <p className="text-yellow-400 font-bold">{selectedTrainer.rating}</p>
                          <p className="text-gray-400 text-xs">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                            <Award className="w-4 h-4 text-green-400" />
                      </div>
                          <p className="text-green-400 font-bold">{selectedTrainer.experience_years}y</p>
                          <p className="text-gray-400 text-xs">Experience</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                            <Target className="w-4 h-4 text-purple-400" />
                    </div>
                          <p className="text-purple-400 font-bold">{selectedTrainer.total_sessions}</p>
                          <p className="text-gray-400 text-xs">Sessions</p>
                      </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date Selection & Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <Label htmlFor="sessionDate" className="text-gray-300 text-sm">Date:</Label>
            </div>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-gray-700 border-gray-600 text-white mt-2 h-9 text-sm"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg">
                  <CardContent className="pt-4 text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-4 h-4 text-white" />
              </div>
                    <p className="text-xl font-bold text-green-400 mb-1">
                      {getAvailableSlotsCount()}
                    </p>
                    <p className="text-green-300 text-xs font-medium">Available</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 shadow-lg">
                  <CardContent className="pt-4 text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-4 h-4 text-white" />
                </div>
                    <p className="text-xl font-bold text-red-400 mb-1">
                      {getBookedSlotsCount()}
                    </p>
                    <p className="text-red-300 text-xs font-medium">Booked</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-500/50 shadow-lg">
                  <CardContent className="pt-4 text-center">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-4 h-4 text-white" />
                  </div>
                    <p className="text-xl font-bold text-gray-400 mb-1">
                      {getBlockedSlotsCount()}
                    </p>
                    <p className="text-gray-300 text-xs font-medium">Blocked</p>
                  </CardContent>
                </Card>
              </div>

              {/* Available Time Slots - Compact Grid */}
              {selectedDate && (
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
              <div>
                        <CardTitle className="text-lg font-bold text-white">Available Time Slots</CardTitle>
                        <CardDescription className="text-gray-300 text-sm">
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
              </div>
            </div>
                  </CardHeader>
                  <CardContent>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              slot.status === 'available'
                                ? 'border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30'
                                : slot.status === 'booked'
                                ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-red-600/20 cursor-not-allowed'
                                : 'border-gray-500 bg-gradient-to-br from-gray-500/20 to-gray-600/20 cursor-not-allowed'
                            }`}
                            onClick={() => slot.status === 'available' ? handleSlotSelect(slot) : undefined}
                          >
                            <div className="text-center">
                              <p className="font-medium text-lg text-white mb-2">{slot.time}</p>
                              <Badge 
                                variant={slot.status === 'available' ? 'default' : 'secondary'}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  slot.status === 'available' 
                                    ? 'bg-green-500 text-white' 
                                    : slot.status === 'booked' 
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-500 text-white'
                                }`}
                              >
                                {slot.status === 'available' ? 'Available' : 
                                 slot.status === 'booked' ? 'Booked' : 'Unavailable'}
                              </Badge>
                  </div>
            </div>
                        ))}
          </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                        <p className="text-base">No time slots available for this date.</p>
                        <p className="text-sm">This trainer may not be working on this day.</p>
        </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Booking Form - Compact */}
              {showBookingForm && (
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
            </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">Book Training Session</CardTitle>
                        <CardDescription className="text-gray-300 text-sm">
                          Complete your booking details
                        </CardDescription>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sessionDate" className="text-gray-300 text-sm font-medium">Date</Label>
                          <Input
                            id="sessionDate"
                            type="date"
                            value={bookingForm.sessionDate}
                            disabled
                            className="bg-gray-700 border-gray-600 text-gray-400 h-9"
                          />
                  </div>
                        <div className="space-y-2">
                          <Label htmlFor="startTime" className="text-gray-300 text-sm font-medium">Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={bookingForm.startTime}
                            disabled
                            className="bg-gray-700 border-gray-600 text-gray-400 h-9"
                          />
                </div>
              </div>

                      <div className="space-y-2">
                        <Label htmlFor="sessionType" className="text-gray-300 text-sm font-medium">Session Type</Label>
                        <Select
                          value={bookingForm.sessionType}
                          onValueChange={(value) => setBookingForm({...bookingForm, sessionType: value})}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9">
                            <SelectValue placeholder="Select session type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {SESSION_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-gray-300 text-sm font-medium">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          placeholder="Any special requirements or goals..."
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white h-9"
                    />
                  </div>
                      
                      <div className="flex space-x-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={bookingLoading || !bookingForm.sessionType}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      {bookingLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Booking...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Book Session
                            </>
                          )}
                        </Button>
                  </div>
                    </form>
                  </CardContent>
                </Card>
                )}
              </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardContent className="pt-12 pb-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Trainer</h3>
                <p className="text-gray-400 text-sm">Choose a trainer from the list to view their schedule and book sessions.</p>
              </CardContent>
            </Card>
          )}
            </div>
          </div>
    </div>
  );
};
