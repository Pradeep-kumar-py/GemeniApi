import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FaCalendarAlt, FaMapMarkerAlt, FaLaptop, FaIdCard, FaUsers, FaBook } from 'react-icons/fa';

const Completed = () => {
  const { user } = useUser();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Company information (would typically come from an API)
  const companyInfo = {
    name: "Blue Bricks",
    startDate: "July 1, 2023",
    orientation: "June 28, 2023 at 9:00 AM",
    location: "123 Main Street, Suite 400, San Francisco, CA 94105",
    workMode: "Hybrid (3 days in office)",
    manager: {
      name: "Sarah Johnson",
      title: "Engineering Manager",
      email: "sarah.johnson@bluebricks.com",
      phone: "(555) 123-4567",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    buddyName: "Michael Chen",
    teamMeeting: "Thursdays at 10:00 AM",
    importantLinks: [
      { title: "Employee Handbook", url: "#" },
      { title: "Benefits Portal", url: "#" },
      { title: "Internal Tools", url: "#" },
      { title: "IT Support", url: "#" }
    ],
    todo: [
      { text: "Complete remaining HR forms", deadline: "Within 3 days" },
      { text: "Set up your workstation", deadline: "Before your start date" },
      { text: "Review company policies", deadline: "Within first week" },
      { text: "Schedule 1-on-1 with your manager", deadline: "First day" }
    ]
  };

  // Simple confetti effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Generate random confetti particles
  const renderConfetti = () => {
    const confetti = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100;
      const animationDuration = 3 + Math.random() * 2;
      const delay = Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.push(
        <div 
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${left}%`,
            top: '-10px',
            backgroundColor: color,
            animation: `fall ${animationDuration}s ease-in ${delay}s forwards`
          }}
        />
      );
    }
    
    return confetti;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {renderConfetti()}
        </div>
      )}
      
      {/* Style for confetti animation */}
      <style jsx="true">{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-blue-100 rounded-full mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to the team, {user?.fullName || "New Team Member"}!
          </h1>
          <p className="text-xl text-gray-600">
            We're thrilled to have you join {companyInfo.name}. Your onboarding is now complete!
          </p>
        </div>
        
        {/* Main content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          {/* Important dates section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Important Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">First Day</h3>
                  <p className="text-gray-600">{companyInfo.startDate}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Orientation</h3>
                  <p className="text-gray-600">{companyInfo.orientation}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Office Location</h3>
                  <p className="text-gray-600">{companyInfo.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                  <FaLaptop className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Work Arrangement</h3>
                  <p className="text-gray-600">{companyInfo.workMode}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Team</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <img 
                    src={companyInfo.manager.avatar} 
                    alt="Manager" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{companyInfo.manager.name}</h3>
                    <p className="text-blue-600">{companyInfo.manager.title}</p>
                    <p className="text-gray-600 text-sm">{companyInfo.manager.email}</p>
                    <p className="text-gray-600 text-sm">{companyInfo.manager.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                    <FaUsers className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Team Meeting</h3>
                    <p className="text-gray-600">{companyInfo.teamMeeting}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                    <FaIdCard className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Your Buddy</h3>
                    <p className="text-gray-600">{companyInfo.buddyName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next steps */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Next Steps</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <ul className="divide-y divide-gray-200">
                {companyInfo.todo.map((item, index) => (
                  <li key={index} className="py-3 flex justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-500">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{item.deadline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Resources section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <FaBook className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Company Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companyInfo.importantLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">{index + 1}</span>
                  </span>
                  <span className="text-gray-700 font-medium">{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Support and feedback */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
            <p className="mb-4">Our HR team is here to support you during your onboarding journey</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">
              Contact HR Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completed;
