import { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  classType: string;
  date: string;
  time: string;
}

export const BookingModal = ({ isOpen, onClose, onSuccess }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    classType: '',
    date: '',
    time: ''
  });

  if (!isOpen) return null;

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    onSuccess('Booking confirmed! We\'ll contact you soon.');
    onClose();
    setStep(1);
    setBookingData({
      name: '',
      email: '',
      phone: '',
      classType: '',
      date: '',
      time: ''
    });
  };

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
      <div className="glass-card p-8 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Book Free Class
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              1
            </div>
            <span className={`ml-2 font-semibold ${step >= 1 ? 'text-blue-400' : 'text-gray-400'}`}>
              Basic Info
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-600 mx-4">
            <div className={`h-full progress-bar ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              2
            </div>
            <span className={`ml-2 font-semibold ${step >= 2 ? 'text-blue-400' : 'text-gray-400'}`}>
              Preferences
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-600 mx-4">
            <div className={`h-full progress-bar ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 3 ? 'bg-blue-500' : 'bg-gray-600'}`}>
              3
            </div>
            <span className={`ml-2 font-semibold ${step >= 3 ? 'text-blue-400' : 'text-gray-400'}`}>
              Confirm
            </span>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => updateBookingData('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => updateBookingData('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => updateBookingData('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Class Type</label>
                <select
                  value={bookingData.classType}
                  onChange={(e) => updateBookingData('classType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select a class type</option>
                  <option value="CrossFit">CrossFit</option>
                  <option value="Boxing">Boxing</option>
                  <option value="Yoga">Yoga</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Pilates">Pilates</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => updateBookingData('date', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Preferred Time</label>
                <select
                  value={bookingData.time}
                  onChange={(e) => updateBookingData('time', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select preferred time</option>
                  <option value="Morning (6:00 AM - 12:00 PM)">Morning (6:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 6:00 PM)">Afternoon (12:00 PM - 6:00 PM)</option>
                  <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevStep}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-blue-400 mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
                Booking Summary
              </h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Name:</strong> {bookingData.name}</p>
                <p><strong>Email:</strong> {bookingData.email}</p>
                <p><strong>Phone:</strong> {bookingData.phone}</p>
                <p><strong>Class:</strong> {bookingData.classType}</p>
                <p><strong>Date:</strong> {bookingData.date}</p>
                <p><strong>Time:</strong> {bookingData.time}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
