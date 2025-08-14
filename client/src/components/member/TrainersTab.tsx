import { useState, useEffect } from 'react';
import { memberApi } from '../../services/api/memberApi';

interface TrainersTabProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface TrainingSession {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  price: number;
  notes?: string;
  trainer_id: number;
  trainer_first_name: string;
  trainer_last_name: string;
  trainer_email: string;
  payment_status?: string;
}

export const TrainersTab = ({ showToast }: TrainersTabProps) => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trainers' | 'upcoming' | 'completed'>('trainers');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: '',
    training_effectiveness: 5,
    communication: 5,
    punctuality: 5,
    professionalism: 5
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Trainer schedule modal state
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Generate schedule data for trainers with real database integration
  const generateSchedule = async (trainerId: number) => {
    console.log(`Generating schedule for trainer ${trainerId}`);
    
    const baseSchedule: { [key: number]: { [key: string]: string } } = {
      1: { // Monday
        '07:00': 'Available', '08:00': 'Available', '09:00': 'Available',
        '10:00': 'Available', '11:00': 'Available', '12:00': 'Available', '13:00': 'Available',
        '14:00': 'Available', '15:00': 'Available', '16:00': 'Available', '17:00': 'Available',
        '18:00': 'Available'
      },
      2: { // Tuesday
        '07:00': 'Available', '08:00': 'Available', '09:00': 'Available',
        '10:00': 'Available', '11:00': 'Available', '12:00': 'Available', '13:00': 'Available',
        '14:00': 'Available', '15:00': 'Available', '16:00': 'Available', '17:00': 'Available',
        '18:00': 'Available'
      },
      3: { // Wednesday
        '07:00': 'Available', '08:00': 'Available', '09:00': 'Available',
        '10:00': 'Available', '11:00': 'Available', '12:00': 'Available', '13:00': 'Available',
        '14:00': 'Available', '15:00': 'Available', '16:00': 'Available', '17:00': 'Available',
        '18:00': 'Available'
      },
      4: { // Thursday
        '07:00': 'Available', '08:00': 'Available', '09:00': 'Available',
        '10:00': 'Available', '11:00': 'Available', '12:00': 'Available', '13:00': 'Available',
        '14:00': 'Available', '15:00': 'Available', '16:00': 'Available', '17:00': 'Available',
        '18:00': 'Available'
      },
      5: { // Friday
        '07:00': 'Available', '08:00': 'Available', '09:00': 'Available',
        '10:00': 'Available', '11:00': 'Available', '12:00': 'Available', '13:00': 'Available',
        '14:00': 'Available', '15:00': 'Available', '16:00': 'Available'
      },
      6: { // Saturday
        '08:00': 'Available', '09:00': 'Available', '10:00': 'Available', '11:00': 'Available',
        '12:00': 'Available', '13:00': 'Available', '14:00': 'Available', '15:00': 'Available'
      }
    };

    try {
      // Get the trainer's schedule from the trainer_schedules table
      const scheduleResponse = await memberApi.getTrainerSchedule(trainerId, new Date().toISOString().split('T')[0]);
      console.log(`Schedule for trainer ${trainerId}:`, scheduleResponse);
      
      if (Array.isArray(scheduleResponse)) {
        scheduleResponse.forEach((slot: any) => {
          const dayOfWeek = slot.day_of_week;
          const timeSlot = slot.time_slot;
          const status = slot.status;
          
          if (baseSchedule[dayOfWeek] && baseSchedule[dayOfWeek][timeSlot]) {
            // Update the slot status based on database
            if (status === 'booked') {
              baseSchedule[dayOfWeek][timeSlot] = 'Booked';
              console.log(`Slot ${timeSlot} on day ${dayOfWeek} is marked as Booked`);
            } else if (status === 'unavailable') {
              baseSchedule[dayOfWeek][timeSlot] = 'Unavailable';
            } else if (status === 'break') {
              baseSchedule[dayOfWeek][timeSlot] = 'Break';
            }
          }
        });
      }

      // Also check for any existing bookings that might not be reflected in trainer_schedules
      const bookedSlotsResponse = await memberApi.getTrainerBookedSlots(trainerId);
      console.log(`Booked slots for trainer ${trainerId}:`, bookedSlotsResponse);
      
      if (Array.isArray(bookedSlotsResponse)) {
        bookedSlotsResponse.forEach((booking: any) => {
          const bookingDate = new Date(booking.session_date);
          let dayOfWeek = bookingDate.getDay();
          // Convert to our schedule format (1=Monday, 2=Tuesday, etc.)
          if (dayOfWeek === 0) dayOfWeek = 7; // Sunday becomes 7
          else dayOfWeek = dayOfWeek; // Monday=1, Tuesday=2, etc.
          
          const startTime = booking.start_time;
          
          // Only mark as booked if it's in the future and the slot exists
          if (bookingDate >= new Date() && baseSchedule[dayOfWeek] && baseSchedule[dayOfWeek][startTime]) {
            baseSchedule[dayOfWeek][startTime] = 'Booked';
            console.log(`Marked slot ${startTime} on day ${dayOfWeek} (${bookingDate.toDateString()}) as Booked for trainer ${trainerId}`);
          }
        });
      }

    } catch (error) {
      console.error('Failed to fetch trainer schedule:', error);
    }

    console.log(`Final schedule for trainer ${trainerId}:`, baseSchedule);
    return baseSchedule;
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableTimeSlots = (trainer: any, selectedDate: Date) => {
    const dayOfWeek = selectedDate.getDay();
    const schedule = trainer.schedule[dayOfWeek];
    
    if (!schedule) return [];
    
    return Object.entries(schedule)
      .filter(([time, status]) => status === 'Available')
      .map(([time]) => time);
  };

  const getAllTimeSlots = (trainer: any, selectedDate: Date) => {
    const dayOfWeek = selectedDate.getDay();
    const schedule = trainer.schedule[dayOfWeek];
    
    if (!schedule) return [];
    
    // Return all time slots (both available and booked)
    return Object.keys(schedule).sort();
  };

  const isTimeSlotBooked = (trainer: any, selectedDate: Date, timeSlot: string) => {
    // Convert JavaScript getDay() (0=Sunday, 1=Monday) to our schedule format (1=Monday, 2=Tuesday)
    let dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Sunday becomes 7 in our schedule
    else dayOfWeek = dayOfWeek; // Monday=1, Tuesday=2, etc.
    
    const schedule = trainer.schedule[dayOfWeek];
    
    if (!schedule || !schedule[timeSlot]) return false;
    
    // Check if the slot is marked as Booked in the schedule
    const isBooked = schedule[timeSlot] === 'Booked';
    
    // Also check if there's an actual booking in the upcoming sessions
    const hasExistingBooking = upcomingSessions.some(session => 
      session.trainer_id === trainer.id &&
      session.session_date === selectedDate.toISOString().split('T')[0] &&
      session.start_time === timeSlot &&
      ['scheduled', 'confirmed'].includes(session.status)
    );
    
    console.log(`Checking if slot ${timeSlot} on day ${dayOfWeek} (${selectedDate.toDateString()}) is booked:`, {
      schedule: schedule,
      slotStatus: schedule[timeSlot],
      isBooked: isBooked,
      hasExistingBooking: hasExistingBooking,
      result: isBooked || hasExistingBooking
    });
    
    return isBooked || hasExistingBooking;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      // Calculate end time (1 hour session)
      const startTime = new Date(`2000-01-01 ${selectedTimeSlot}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const endTimeString = endTime.toTimeString().slice(0, 5);

      console.log('Attempting to book session with details:', {
        trainer_id: selectedTrainer.id,
        trainer_name: `${selectedTrainer.first_name} ${selectedTrainer.last_name}`,
        session_date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTimeSlot,
        end_time: endTimeString,
        session_type: 'personal_training',
        notes: sessionNotes
      });

      // Book the session in the database
      try {
        const response = await memberApi.bookTrainingSession({
          trainer_id: selectedTrainer.id,
          session_date: selectedDate.toISOString().split('T')[0],
          start_time: selectedTimeSlot,
          end_time: endTimeString,
          session_type: 'personal_training',
          notes: sessionNotes
        });

        console.log('Booking response:', response);

        if (response.success) {
          showToast(response.message, 'success');
          
          // Update the local schedule to mark the slot as booked
          const updatedTrainers = trainers.map(trainer => {
            if (trainer.id === selectedTrainer.id) {
              const dayOfWeek = selectedDate.getDay();
              if (trainer.schedule[dayOfWeek]) {
                trainer.schedule[dayOfWeek][selectedTimeSlot] = 'Booked';
              }
            }
            return trainer;
          });
          setTrainers(updatedTrainers);
          
          // Refresh the trainer data to show updated availability
          try {
            console.log('Refreshing trainer schedules after successful booking...');
            const refreshedTrainers = await Promise.all(trainers.map(async (trainer) => ({
              ...trainer,
              schedule: await generateSchedule(trainer.id)
            })));
            setTrainers(refreshedTrainers);
            console.log('Trainer schedules refreshed successfully');
          } catch (error) {
            console.error('Failed to refresh trainer schedules:', error);
          }
          
          // Close the modal and reset form
          setSelectedTrainer(null);
          setSelectedTimeSlot('');
          setSelectedDate(new Date());
          setSessionNotes('');
          
          // Refresh upcoming sessions
          try {
            const upcomingData = await memberApi.getUpcomingSessions();
            if (Array.isArray(upcomingData)) {
              setUpcomingSessions(upcomingData);
            } else if (upcomingData.success) {
              setUpcomingSessions(upcomingData.data || []);
            }
          } catch (error) {
            console.error('Failed to refresh upcoming sessions:', error);
          }
        } else {
          showToast(response.error || 'Failed to book session', 'error');
        }
      } catch (bookingError: any) {
        console.error('Booking error:', bookingError);
        
        if (bookingError.message) {
          if (bookingError.message.includes('already booked')) {
            showToast('This time slot is not available. Please choose a different time.', 'error');
          } else {
            showToast(bookingError.message, 'error');
          }
        } else {
          showToast('Failed to book session. Please try again.', 'error');
        }
        return; // Exit early to avoid the generic error handling below
      }
    } catch (error) {
      console.error('Generic booking error:', error);
      
      // Extract the specific error message from the backend
      let errorMessage = 'Failed to book session. Please try again.';
      
      if (error instanceof Error) {
        console.log('Generic error message:', error.message);
        
        // Check if it's a "time slot already booked" error
        if (error.message.includes('already booked')) {
          errorMessage = 'This time slot is already booked. Please choose a different time.';
        } else if (error.message.includes('400')) {
          // Try to parse the error response for more details
          errorMessage = error.message.replace('Error: ', '');
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainersData, upcomingData, completedData] = await Promise.all([
        memberApi.getTrainers(),
        memberApi.getUpcomingSessions(),
        memberApi.getCompletedSessions()
      ]);
      
      // Add schedule data for trainers
      const trainersWithSchedule = await Promise.all(trainersData.map(async (trainer: any) => {
        console.log(`Processing trainer ${trainer.id}: ${trainer.first_name} ${trainer.last_name}`);
        const schedule = await generateSchedule(trainer.id);
        console.log(`Schedule for trainer ${trainer.id}:`, schedule);
        return {
          ...trainer,
          schedule: schedule
        };
      }));
      
      setTrainers(trainersWithSchedule);
      setUpcomingSessions(upcomingData);
      setCompletedSessions(completedData);
      
      // Debug logging
      console.log('Trainers with schedules:', trainersWithSchedule);
      console.log('Upcoming sessions:', upcomingData);
      console.log('Completed sessions:', completedData);
      
      // Validate data structure
      if (!Array.isArray(trainersData)) {
        console.warn('Trainers data is not an array:', trainersData);
        setTrainers([]);
      }
      if (!Array.isArray(upcomingData)) {
        console.warn('Upcoming sessions data is not an array:', upcomingData);
        setUpcomingSessions([]);
      }
      if (!Array.isArray(completedData)) {
        console.warn('Completed sessions data is not an array:', completedData);
        setCompletedSessions([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load data', 'error');
      
      // Set empty arrays as fallback
      setTrainers([]);
      setUpcomingSessions([]);
      setCompletedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showToast]);

  const handleReviewSubmit = async () => {
    if (!selectedSession) return;

    // Validate review form
    if (!reviewForm.review_text.trim()) {
      showToast('Please provide a review text', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await memberApi.submitSessionReview({
        session_id: selectedSession.id,
        ...reviewForm
      });

      if (response.success) {
        showToast('Review submitted successfully!', 'success');
        setShowReviewModal(false);
        setSelectedSession(null);
        setReviewForm({
          rating: 5,
          review_text: '',
          training_effectiveness: 5,
          communication: 5,
          punctuality: 5,
          professionalism: 5
        });
        
        // Refresh completed sessions to show the reviewed session
        try {
          const updatedCompleted = await memberApi.getCompletedSessions();
          setCompletedSessions(updatedCompleted);
          showToast('Data refreshed successfully!', 'success');
        } catch (refreshError) {
          console.error('Failed to refresh completed sessions:', refreshError);
          // Don't show error toast for refresh failure, but try to refresh all data
          try {
            await fetchData();
          } catch (finalError) {
            console.error('Failed to refresh data after review:', finalError);
          }
        }
      } else {
        showToast(response.error || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewModal = (session: TrainingSession) => {
    if (!session || !session.id) {
      showToast('Invalid session data', 'error');
      return;
    }
    setSelectedSession(session);
    setShowReviewModal(true);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const sessionDate = new Date(date);
      if (isNaN(sessionDate.getTime())) {
        return 'Invalid date';
      }
      const timeString = time ? time.substring(0, 5) : '00:00'; // Remove seconds if present
      return `${sessionDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} at ${timeString}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getSessionTypeColor = (type: string) => {
    if (!type) return 'bg-gray-500';
    switch (type) {
      case 'personal_training': return 'bg-blue-500';
      case 'group_session': return 'bg-green-500';
      case 'consultation': return 'bg-purple-500';
      case 'demo': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    if (!type) return 'Unknown Session Type';
    switch (type) {
      case 'personal_training': return 'Personal Training';
      case 'group_session': return 'Group Session';
      case 'consultation': return 'Consultation';
      case 'demo': return 'Demo Session';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading trainers and sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Tab Navigation */}
      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Trainers & Sessions</h2>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'trainers', label: 'Available Trainers', icon: 'fas fa-users', count: trainers.length },
            { id: 'upcoming', label: 'Upcoming Sessions', icon: 'fas fa-calendar-alt', count: upcomingSessions.length },
            { id: 'completed', label: 'Completed Sessions', icon: 'fas fa-check-circle', count: completedSessions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className={tab.icon}></i>
              <span className="font-medium">{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'trainers' && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Our Expert Trainers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.length === 0 ? (
              <p className="text-gray-400 text-center py-4 col-span-full">No trainers available</p>
            ) : (
              trainers.filter(trainer => trainer && trainer.id && trainer.first_name).map((trainer) => (
                <div key={trainer.id} className="bg-gray-900 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-user text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">
                        {trainer.first_name || 'Unknown'} {trainer.last_name || 'Trainer'}
                      </h4>
                      <div className="flex items-center">
                        <i className="fas fa-star text-yellow-400"></i>
                        <span className="text-yellow-400 ml-1 mr-2">
                          {trainer.average_rating && !isNaN(parseFloat(trainer.average_rating)) ? parseFloat(trainer.average_rating).toFixed(1) : '0.0'}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ({trainer.total_ratings && !isNaN(parseInt(trainer.total_ratings)) ? parseInt(trainer.total_ratings) : 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-pink-400 font-semibold mb-2">Specializations:</h5>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialization && Array.isArray(trainer.specialization) && trainer.specialization.length > 0 ? (
                        trainer.specialization.map((spec: string, index: number) => (
                          <span key={index} className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No specializations listed</span>
                      )}
                    </div>
                  </div>
                  
                  {trainer.bio && trainer.bio.trim() && (
                    <p className="text-gray-300 text-sm mb-4">{trainer.bio}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedTrainer(trainer)}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Book Session
                    </button>
                    <button 
                      onClick={() => showToast(`Viewing ${trainer.first_name || 'Unknown'}'s profile`, 'info')}
                      className="px-4 py-2 border border-pink-400 text-pink-400 rounded-lg hover:bg-pink-400 hover:text-white transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-green-400 mb-4">Upcoming Training Sessions</h3>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-alt text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-400 text-lg mb-2">No upcoming sessions</p>
              <p className="text-gray-500 text-sm">Book a session with one of our trainers to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.filter(session => session && session.id && session.trainer_first_name).map((session) => (
                <div key={session.id} className="bg-gray-900 p-6 rounded-xl border-l-4 border-green-400 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                             <div className="flex items-center mb-3">
                         <span className={`${getSessionTypeColor(session.session_type)} text-white px-3 py-1 rounded-full text-sm font-medium mr-3`}>
                           {getSessionTypeLabel(session.session_type)}
                         </span>
                         <span className={`px-2 py-1 rounded-full text-xs ${
                           session.status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                         }`}>
                           {session.status === 'confirmed' ? 'Confirmed' : (session.status || 'Scheduled')}
                         </span>
                       </div>
                       
                       <h4 className="text-lg font-semibold text-white mb-2">
                         Session with {session.trainer_first_name || 'Unknown'} {session.trainer_last_name || 'Trainer'}
                       </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-calendar text-green-400"></i>
                          <span className="text-gray-300">
                            {formatDateTime(session.session_date, session.start_time)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-clock text-blue-400"></i>
                          <span className="text-gray-300">
                            {session.start_time ? session.start_time.substring(0, 5) : '00:00'} - {session.end_time ? session.end_time.substring(0, 5) : '00:00'}
                          </span>
                        </div>
                      </div>
                      
                      {session.notes && session.notes.trim() && (
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            <i className="fas fa-sticky-note text-yellow-400 mr-2"></i>
                            {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        ${session.price || 0}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {session.payment_status ? (session.payment_status === 'paid' ? 'Paid' : 'Payment Pending') : 'Payment Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Completed Training Sessions</h3>
          {completedSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-400 text-lg mb-2">No completed sessions</p>
              <p className="text-gray-500 text-sm">Complete your first training session to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.filter(session => session && session.id && session.trainer_first_name).map((session) => (
                <div key={session.id} className="bg-gray-900 p-6 rounded-xl border-l-4 border-purple-400 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                             <div className="flex items-center mb-3">
                         <span className={`${getSessionTypeColor(session.session_type)} text-white px-3 py-1 rounded-full text-sm font-medium mr-3`}>
                           {getSessionTypeLabel(session.session_type)}
                         </span>
                         <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                           Completed
                         </span>
                       </div>
                       
                       <h4 className="text-lg font-semibold text-white mb-2">
                         Session with {session.trainer_first_name || 'Unknown'} {session.trainer_last_name || 'Trainer'}
                       </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-calendar text-purple-400"></i>
                          <span className="text-gray-300">
                            {formatDateTime(session.session_date, session.start_time)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-clock text-blue-400"></i>
                          <span className="text-gray-300">
                            {session.start_time ? session.start_time.substring(0, 5) : '00:00'} - {session.end_time ? session.end_time.substring(0, 5) : '00:00'}
                          </span>
                        </div>
                      </div>
                      
                      {session.notes && session.notes.trim() && (
                        <div className="bg-gray-800 p-3 rounded-lg mb-3">
                          <p className="text-gray-300 text-sm">
                            <i className="fas fa-sticky-note text-yellow-400 mr-2"></i>
                            {session.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        ${session.price || 0}
                      </div>
                      <div className="text-green-400 text-sm mb-3">
                        Paid
                      </div>
                      <button
                        onClick={() => openReviewModal(session)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Review Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-400">Review Your Session</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Session Details
                </h4>
                <p className="text-gray-300">
                  <strong>Trainer:</strong> {selectedSession.trainer_first_name || 'Unknown'} {selectedSession.trainer_last_name || 'Trainer'}
                </p>
                <p className="text-gray-300">
                  <strong>Date:</strong> {formatDateTime(selectedSession.session_date, selectedSession.start_time)}
                </p>
                <p className="text-gray-300">
                  <strong>Type:</strong> {getSessionTypeLabel(selectedSession.session_type)}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Overall Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl transition-colors ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-400'
                      } hover:text-yellow-300`}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'training_effectiveness', label: 'Training Effectiveness', icon: 'fas fa-dumbbell' },
                  { key: 'communication', label: 'Communication', icon: 'fas fa-comments' },
                  { key: 'punctuality', label: 'Punctuality', icon: 'fas fa-clock' },
                  { key: 'professionalism', label: 'Professionalism', icon: 'fas fa-user-tie' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      <i className={`${item.icon} mr-2 text-blue-400`}></i>
                      {item.label}
                    </label>
                    <select
                      value={reviewForm[item.key as keyof typeof reviewForm] as number}
                      onChange={(e) => setReviewForm({ 
                        ...reviewForm, 
                        [item.key]: parseInt(e.target.value) 
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num} - {num === 1 ? 'Poor' : num === 2 ? 'Fair' : num === 3 ? 'Good' : num === 4 ? 'Very Good' : 'Excellent'}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.review_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                  placeholder="Share your experience with this training session..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview || !reviewForm.review_text.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
              >
                {submittingReview ? (
                  <div className="flex items-center justify-center space-x-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Schedule Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-blue-400">
                {selectedTrainer.first_name} {selectedTrainer.last_name}'s Schedule
              </h3>
              <button 
                onClick={() => {
                  setSelectedTrainer(null);
                  setSelectedTimeSlot('');
                  setSelectedDate(new Date());
                }} 
                className="close-button text-gray-300 hover:text-white p-2 rounded-lg" 
                title="Close"
              >
                <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trainer Info */}
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-green-400 mb-2">About {selectedTrainer.first_name}</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {selectedTrainer.bio || 'Experienced fitness professional dedicated to helping clients achieve their fitness goals.'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span className="text-white">{selectedTrainer.average_rating ? parseFloat(selectedTrainer.average_rating).toFixed(1) : '5.0'}</span>
                    </div>
                    <div className="text-gray-400">
                      ({selectedTrainer.total_ratings || 0} reviews)
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-400 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrainer.specialization && selectedTrainer.specialization.length > 0 ? (
                      selectedTrainer.specialization.map((spec: string, index: number) => (
                        <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">Personal Training, Strength Training, Cardio</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar and Time Slots */}
              <div className="space-y-4">
                {/* Helpful Guidance */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-info-circle text-blue-400 mt-1"></i>
                    <div className="text-blue-200 text-sm">
                      <p className="font-medium mb-1">Booking Guide:</p>
                      <ul className="text-xs space-y-1 text-blue-100">
                        <li>• <span className="bg-green-600 text-white px-1 rounded">Green</span> slots are available for booking</li>
                        <li>• <span className="bg-red-600 text-white px-1 rounded">Red</span> slots are already booked</li>
                        <li>• <span className="bg-gray-500 text-white px-1 rounded">Gray</span> slots are unavailable</li>
                        <li>• <span className="bg-yellow-600 text-white px-1 rounded">Yellow</span> slots are trainer breaks</li>
                        <li>• Book at least 24 hours in advance</li>
                        <li>• Sessions are 1 hour long</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Date Selection */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-400 mb-3">Select Date</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      const dayOfWeek = date.getDay();
                      const hasAvailability = selectedTrainer.schedule[dayOfWeek];
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handleDateSelect(date)}
                          disabled={!hasAvailability}
                          className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : hasAvailability
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-bold">{getDayName(dayOfWeek).slice(0, 3)}</div>
                          <div>{date.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-green-400 mb-3">
                    Time Slots for {getDayName(selectedDate.getDay())}, {selectedDate.toLocaleDateString()}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {getAllTimeSlots(selectedTrainer, selectedDate).map((timeSlot) => {
                      const isBooked = isTimeSlotBooked(selectedTrainer, selectedDate, timeSlot);
                      const isAvailable = !isBooked;
                      const isSelected = selectedTimeSlot === timeSlot;
                      
                      // Get the slot status from the trainer's schedule
                      const dayOfWeek = selectedDate.getDay();
                      const slotStatus = selectedTrainer.schedule[dayOfWeek]?.[timeSlot] || 'Available';
                      
                      return (
                        <button
                          key={timeSlot}
                          onClick={() => isAvailable ? handleTimeSlotSelect(timeSlot) : null}
                          disabled={isBooked}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            slotStatus === 'Booked' || isBooked
                              ? 'bg-red-600 text-white cursor-not-allowed opacity-75'
                              : slotStatus === 'Unavailable'
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                              : slotStatus === 'Break'
                              ? 'bg-yellow-600 text-white cursor-not-allowed opacity-75'
                              : isSelected
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-700 text-white hover:bg-green-600 hover:text-white'
                          }`}
                          title={
                            slotStatus === 'Booked' || isBooked
                              ? 'This slot is already booked'
                              : slotStatus === 'Unavailable'
                              ? 'This slot is unavailable'
                              : slotStatus === 'Break'
                              ? 'Trainer is on break during this time'
                              : 'Click to select this time slot'
                          }
                        >
                          {timeSlot}
                          {slotStatus === 'Booked' && (
                            <div className="text-xs mt-1 opacity-90">
                              <i className="fas fa-lock mr-1"></i>Booked
                            </div>
                          )}
                          {slotStatus === 'Unavailable' && (
                            <div className="text-xs mt-1 opacity-90">
                              <i className="fas fa-times mr-1"></i>Unavailable
                            </div>
                          )}
                          {slotStatus === 'Break' && (
                            <div className="text-xs mt-1 opacity-90">
                              <i className="fas fa-coffee mr-1"></i>Break
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {getAllTimeSlots(selectedTrainer, selectedDate).length === 0 && (
                    <p className="text-gray-400 text-center py-4">No time slots available for this day</p>
                  )}
                </div>

                {/* Session Notes */}
                {selectedTimeSlot && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-400 mb-3">Session Notes (Optional)</h4>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Any specific goals or notes for this session..."
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none text-white resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Booking Button */}
                {selectedTimeSlot && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-400 mb-3">Confirm Booking</h4>
                    <p className="text-gray-300 text-sm mb-4">
                      You're booking a session with {selectedTrainer.first_name} on{' '}
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {selectedTimeSlot}
                    </p>
                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Booking...</span>
                        </div>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
