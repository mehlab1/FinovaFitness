import { portals } from '../data/mockData';

interface PortalSelectionProps {
  onSelectPortal: (portalId: string) => void;
}

export const PortalSelection = ({ onSelectPortal }: PortalSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 animate-fade-in">
      <div className="max-w-6xl w-full px-4">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <i className="fas fa-dumbbell text-6xl text-blue-400 neon-glow mr-4 animate-float"></i>
            <h1 className="text-6xl font-bold text-blue-400 neon-glow" style={{ fontFamily: 'Orbitron, monospace' }}>
              FINOVA FITNESS
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-2">Functional Training for Everyone</p>
          <p className="text-lg text-gray-400">Select your portal to continue</p>
        </div>

        {/* Portal Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className={`portal-card glass-card p-8 rounded-2xl text-center cursor-pointer transition-all duration-300 hover-glow neon-border ${portal.color}`}
              onClick={() => onSelectPortal(portal.id)}
            >
              <i className={`${portal.icon} text-4xl mb-4 neon-glow`}></i>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                {portal.name}
              </h3>
              <p className="text-gray-300 mb-4">{portal.description}</p>
              <div className="text-sm text-gray-400">
                {portal.requiresLogin ? 'Login required' : 'No login required'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
