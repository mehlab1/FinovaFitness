import { useState, useEffect } from 'react';
import { memberApi } from '../../services/api';

interface TrainersTabProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TrainersTab = ({ showToast }: TrainersTabProps) => {
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
          <i className="fas fa-spinner fa-spin text-4xl text-pink-400 mb-4"></i>
          <p className="text-gray-300">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Our Expert Trainers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.length === 0 ? (
            <p className="text-gray-400 text-center py-4 col-span-full">No trainers available</p>
          ) : (
            trainers.map((trainer) => (
              <div key={trainer.id} className="bg-gray-900 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-user text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">
                      {trainer.first_name} {trainer.last_name}
                    </h4>
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400"></i>
                      <span className="text-yellow-400 ml-1 mr-2">
                        {trainer.average_rating ? parseFloat(trainer.average_rating).toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({trainer.total_ratings || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-pink-400 font-semibold mb-2">Specializations:</h5>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialization && trainer.specialization.length > 0 ? (
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
                
                {trainer.bio && (
                  <p className="text-gray-300 text-sm mb-4">{trainer.bio}</p>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => showToast(`Booking session with ${trainer.first_name}`, 'info')}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Book Session
                  </button>
                  <button 
                    onClick={() => showToast(`Viewing ${trainer.first_name}'s profile`, 'info')}
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
    </div>
  );
};
