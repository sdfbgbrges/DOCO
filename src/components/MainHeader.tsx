import React from 'react';
import { FileSearch, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

const MainHeader: React.FC = () => {
  const { currentUser, login, logout } = useApp();

  // Mock login function for demo purposes
  const handleLogin = () => {
    if (!currentUser) {
      login({
        id: 'user-1',
        name: 'Demo User',
      });
    } else {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shadow-sm z-10">
      <div className="flex items-center">
        <Logo className="h-8 w-auto mr-2" />
        <h1 className="text-xl font-bold text-primary-600">DOCO</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 text-sm"
          />
          <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <button
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full p-1.5"
          onClick={handleLogin}
        >
          {currentUser ? (
            <div className="flex items-center">
              <span className="ml-2 mr-2 text-sm font-medium">{currentUser.name}</span>
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-600" />
              <span className="ml-2 mr-2 text-sm font-medium">Sign In</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default MainHeader;