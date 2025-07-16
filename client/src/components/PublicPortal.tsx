import { useState } from 'react';
import { trainers, classes, membershipPlans, products, blogPosts } from '../data/mockData';

interface PublicPortalProps {
  onLogin: () => void;
  onBookClass: () => void;
}

export const PublicPortal = ({ onLogin, onBookClass }: PublicPortalProps) => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onLogin={onLogin} onBookClass={onBookClass} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'membership':
        return <MembershipPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'trainers':
        return <TrainersPage />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      case 'store':
        return <StorePage />;
      default:
        return <HomePage onLogin={onLogin} onBookClass={onBookClass} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="topbar px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <i className="fas fa-dumbbell text-2xl text-blue-400 neon-glow"></i>
            <h1 className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              FINOVA FITNESS
            </h1>
          </div>
          <div className="hidden md:flex space-x-6">
            {['home', 'about', 'services', 'schedule', 'membership', 'gallery', 'trainers', 'blog', 'contact', 'store'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize hover:text-blue-400 transition-colors ${
                  currentPage === page ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg hover-glow transition-all duration-300"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{renderPage()}</main>
    </div>
  );
};

const HomePage = ({ onLogin, onBookClass }: { onLogin: () => void; onBookClass: () => void }) => (
  <div className="animate-fade-in">
    {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 text-center max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-blue-400 neon-glow mb-6 animate-pulse" style={{ fontFamily: 'Orbitron, monospace' }}>
          FUNCTIONAL TRAINING
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Orbitron, monospace' }}>
          FOR EVERYONE
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Transform your body and mind with cutting-edge training methods and world-class facilities
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={onLogin}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg hover-glow transition-all duration-300 transform hover:scale-105"
          >
            <i className="fas fa-rocket mr-2"></i>
            JOIN NOW
          </button>
          <button
            onClick={onBookClass}
            className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-bold text-lg rounded-lg hover-glow transition-all duration-300 transform hover:scale-105"
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            BOOK FREE CLASS
          </button>
        </div>
      </div>
    </section>

    {/* Features Strip */}
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
              <i className="fas fa-clock text-3xl text-blue-400 neon-glow"></i>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>24/7 Access</h3>
            <p className="text-gray-300">Train whenever you want with round-the-clock facility access</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
              <i className="fas fa-user-graduate text-3xl text-green-400 neon-glow"></i>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>Certified Trainers</h3>
            <p className="text-gray-300">Expert guidance from internationally certified fitness professionals</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-pink-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300">
              <i className="fas fa-swimming-pool text-3xl text-pink-400 neon-glow"></i>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>Pool & Sauna</h3>
            <p className="text-gray-300">Relax and recover in our premium wellness facilities</p>
          </div>
        </div>
      </div>
    </section>

    {/* Quick Stats */}
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>5000+</div>
            <div className="text-gray-300">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>50+</div>
            <div className="text-gray-300">Expert Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>10+</div>
            <div className="text-gray-300">Locations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>24/7</div>
            <div className="text-gray-300">Support</div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const AboutPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
          About Finova Fitness
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Story</h2>
            <p className="text-gray-300 leading-relaxed">
              Founded in 2010, Finova Fitness emerged from a simple belief: everyone deserves access to functional training that transforms both body and mind. We started with a single location and a vision to revolutionize how people approach fitness. Today, we're proud to serve over 5,000 members across 10 state-of-the-art facilities, each equipped with cutting-edge technology and staffed by world-class professionals.
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              Our mission is to empower individuals to achieve their fitness goals through innovative training methods, personalized guidance, and a supportive community. We believe that fitness should be accessible, enjoyable, and sustainable for everyone, regardless of age, fitness level, or background. Every day, we work to create an environment where members can push their limits, discover their potential, and transform their lives.
            </p>
          </div>
        </div>
        
        {/* Location Map */}
        <div className="glass-card p-8 rounded-2xl mb-16">
          <h2 className="text-2xl font-bold mb-6 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>Our Locations</h2>
          <div className="mb-6">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <i className="fas fa-map-marker-alt text-4xl text-blue-400 mb-4"></i>
              <h3 className="text-xl font-bold mb-4">Interactive Map</h3>
              <p className="text-gray-300">Find the nearest Finova Fitness location</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-green-400 mb-2">Downtown Location</h3>
              <p className="text-gray-300">123 Main Street, Downtown, NY 10001</p>
            </div>
            <div>
              <h3 className="font-bold text-green-400 mb-2">Uptown Location</h3>
              <p className="text-gray-300">456 Broadway Ave, Uptown, NY 10002</p>
            </div>
          </div>
        </div>
        
        {/* Target Audience */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center glass-card p-8 rounded-2xl">
            <i className="fas fa-mars text-4xl text-blue-400 mb-4 neon-glow"></i>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Men</h3>
            <p className="text-gray-300">Tailored strength training, bodybuilding, and functional fitness programs designed for men's specific goals and physiology.</p>
          </div>
          
          <div className="text-center glass-card p-8 rounded-2xl">
            <i className="fas fa-venus text-4xl text-pink-400 mb-4 neon-glow"></i>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>Women</h3>
            <p className="text-gray-300">Empowering fitness programs including strength training, cardio, and specialized classes for women's health and wellness.</p>
          </div>
          
          <div className="text-center glass-card p-8 rounded-2xl">
            <i className="fas fa-users text-4xl text-green-400 mb-4 neon-glow"></i>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>All Ages</h3>
            <p className="text-gray-300">Inclusive programs for teens, adults, and seniors with age-appropriate training methods and safety protocols.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ServicesPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Services
      </h1>
      
      {/* Main Facilities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
          { icon: 'fas fa-dumbbell', title: 'Weight Training', color: 'text-green-400', description: 'State-of-the-art strength training equipment including free weights, machines, and functional training tools for all fitness levels.' },
          { icon: 'fas fa-heartbeat', title: 'Cardio Zone', color: 'text-pink-400', description: 'Premium cardio equipment including treadmills, ellipticals, rowing machines, and bikes with entertainment systems.' },
          { icon: 'fas fa-fist-raised', title: 'CrossFit', color: 'text-purple-400', description: 'Dedicated CrossFit area with Olympic lifting platforms, battle ropes, and functional training equipment.' },
          { icon: 'fas fa-hand-rock', title: 'Boxing', color: 'text-orange-400', description: 'Professional boxing ring, heavy bags, speed bags, and training equipment for all levels from beginner to pro.' },
          { icon: 'fas fa-hot-tub', title: 'Sauna & Steam', color: 'text-blue-400', description: 'Luxury sauna and steam rooms for post-workout recovery and relaxation. Separate facilities for men and women.' },
          { icon: 'fas fa-swimming-pool', title: 'Swimming Pool', color: 'text-green-400', description: 'Olympic-sized swimming pool with designated lanes for lap swimming, water aerobics, and recreational swimming.' }
        ].map((service, index) => (
          <div key={index} className={`glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300 ${service.color}`}>
            <i className={`${service.icon} text-4xl mb-4 neon-glow`}></i>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>{service.title}</h3>
            <p className="text-gray-300">{service.description}</p>
          </div>
        ))}
      </div>
      
      {/* Additional Services */}
      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-8 text-blue-400 text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
          Additional Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <i className="fas fa-user-tie text-3xl text-pink-400 mb-4 neon-glow"></i>
            <h3 className="text-lg font-bold mb-2">Personal Training</h3>
            <p className="text-gray-300 text-sm">One-on-one training sessions with certified personal trainers customized to your goals and fitness level.</p>
          </div>
          
          <div className="text-center">
            <i className="fas fa-apple-alt text-3xl text-green-400 mb-4 neon-glow"></i>
            <h3 className="text-lg font-bold mb-2">Nutrition Plans</h3>
            <p className="text-gray-300 text-sm">Personalized meal plans and nutrition counseling from registered dietitians and nutritionists.</p>
          </div>
          
          <div className="text-center">
            <i className="fas fa-hand-holding-heart text-3xl text-orange-400 mb-4 neon-glow"></i>
            <h3 className="text-lg font-bold mb-2">Physiotherapy</h3>
            <p className="text-gray-300 text-sm">Professional physiotherapy services for injury recovery, prevention, and movement optimization.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SchedulePage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Class Schedule
      </h1>
      
      {/* Filter Bar */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div>
            <label className="block text-sm font-medium mb-2">Trainer</label>
            <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
              <option value="">All Trainers</option>
              {trainers.map(trainer => (
                <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none">
              <option value="">All Times</option>
              <option value="morning">Morning (6-12)</option>
              <option value="afternoon">Afternoon (12-18)</option>
              <option value="evening">Evening (18-22)</option>
            </select>
          </div>
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover-glow transition-all duration-300">
            Filter
          </button>
        </div>
      </div>
      
      {/* Weekly Schedule */}
      <div className="glass-card p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
            <div key={day} className="text-center">
              <h3 className="font-bold text-blue-400 mb-4 p-4" style={{ fontFamily: 'Orbitron, monospace' }}>{day}</h3>
              <div className="space-y-2">
                {classes.filter(cls => cls.day === day).map(cls => (
                  <div key={cls.id} className="glass-card p-3 rounded-lg cursor-pointer hover-glow transition-all duration-300">
                    <div className="text-sm font-bold text-green-400">{cls.name}</div>
                    <div className="text-xs text-gray-300">{cls.time}</div>
                    <div className="text-xs text-gray-400">{cls.trainer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MembershipPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Membership Plans
      </h1>
      
      {/* Auto-renew Toggle */}
      <div className="text-center mb-8">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-300">Auto-renew subscription</span>
        </label>
      </div>
      
      {/* Pricing Table */}
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        {membershipPlans.map((plan, index) => (
          <div key={plan.id} className={`glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300 ${plan.popular ? 'neon-border border-green-400' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-2xl font-bold mb-4 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>{plan.name}</h3>
            <div className="text-4xl font-bold mb-2">${plan.price}</div>
            <div className="text-gray-400 mb-6">{plan.duration}</div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <i className="fas fa-check text-green-400 mr-3"></i>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold hover-glow transition-all duration-300 ${
              plan.popular 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>
      
      {/* Special Discount Badges */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: 'fas fa-graduation-cap', title: 'Student Discount', description: '15% off all memberships with valid student ID', color: 'text-green-400' },
          { icon: 'fas fa-heart', title: 'Couple Package', description: '20% off when two people sign up together', color: 'text-pink-400' },
          { icon: 'fas fa-users', title: 'Family Plan', description: '25% off for families of 3 or more', color: 'text-purple-400' }
        ].map((discount, index) => (
          <div key={index} className={`glass-card p-6 rounded-2xl text-center ${discount.color}`}>
            <i className={`${discount.icon} text-3xl mb-4`}></i>
            <h3 className="text-lg font-bold mb-2">{discount.title}</h3>
            <p className="text-gray-300 mb-4">{discount.description}</p>
            <div className="font-bold">Special Offer</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GalleryPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Gallery
      </h1>
      
      {/* Photo Gallery */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>Photo Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
          ].map((image, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300">
              <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-64 object-cover" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Virtual Tour */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>360° Virtual Tour</h2>
        <div className="glass-card p-8 rounded-2xl">
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <i className="fas fa-vr-cardboard text-6xl text-pink-400 mb-4"></i>
            <h3 className="text-xl font-bold mb-4">Experience Our Gym Virtually</h3>
            <p className="text-gray-300 mb-6">Take a 360° tour of our facilities from the comfort of your home</p>
            <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg hover-glow transition-all duration-300">
              Start Virtual Tour
            </button>
          </div>
        </div>
      </div>
      
      {/* Video Gallery */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-purple-400" style={{ fontFamily: 'Orbitron, monospace' }}>Short Reels</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Morning Workout Routine', description: 'Start your day with our energizing morning workout routine' },
            { title: 'HIIT Training Session', description: 'High-intensity interval training for maximum results' },
            { title: 'Strength Training Tips', description: 'Professional tips for effective strength training' }
          ].map((video, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl">
              <div className="bg-gray-900 rounded-lg p-8 text-center mb-4">
                <i className="fas fa-play-circle text-4xl text-purple-400 mb-4"></i>
                <h3 className="font-bold">{video.title}</h3>
              </div>
              <p className="text-gray-300 text-sm">{video.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TrainersPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Our Trainers
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="glass-card p-8 rounded-2xl text-center hover-glow transition-all duration-300">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-400">
              <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              {trainer.name}
            </h3>
            <p className="text-green-400 mb-4">{trainer.specialization}</p>
            <div className="text-sm text-gray-300 mb-4">
              {trainer.certifications.map((cert, index) => (
                <p key={index} className="mb-2">• {cert}</p>
              ))}
            </div>
            <p className="text-gray-300 text-sm mb-6">{trainer.bio}</p>
            <div className="flex justify-center space-x-4">
              <a href={trainer.socialMedia.instagram} className="text-pink-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href={trainer.socialMedia.facebook} className="text-blue-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BlogPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Fitness Blog
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300">
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                {post.title}
              </h3>
              <p className="text-gray-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{post.date}</span>
                <a href="#" className="text-green-400 hover:text-white transition-colors">
                  Read More <i className="fas fa-arrow-right ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Contact Us
      </h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-green-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Get In Touch
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Your message"
              ></textarea>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold hover-glow transition-all duration-300">
              Send Message
            </button>
          </form>
        </div>
        
        {/* Contact Info */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>
            Visit Us
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Downtown Location</h3>
              <p className="text-gray-300">123 Main Street<br />Downtown, NY 10001</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Uptown Location</h3>
              <p className="text-gray-300">456 Broadway Ave<br />Uptown, NY 10002</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Quick Contact</h3>
              <div className="space-y-2">
                <a href="tel:+1234567890" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                  <i className="fas fa-phone mr-3"></i>
                  (123) 456-7890
                </a>
                <a href="mailto:info@finovafitness.com" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                  <i className="fas fa-envelope mr-3"></i>
                  info@finovafitness.com
                </a>
                <a href="#" className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                  <i className="fab fa-whatsapp mr-3"></i>
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StorePage = () => (
  <div className="animate-fade-in">
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 neon-glow text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
        Online Store
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="product-card p-6 rounded-2xl hover-glow transition-all duration-300">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h3 className="text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{product.description}</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xl font-bold">${product.price}</span>
                <div className="text-sm text-green-400">Members save 10%</div>
              </div>
              <span className="text-sm text-gray-400">{product.category}</span>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold hover-glow transition-all duration-300">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
