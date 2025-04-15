import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <img src="./biyaan.gif" alt="Not Found" className="w-1/2 max-w-md" />
      <h1 className="text-3xl font-bold text-gray-800 mt-4">Oops! Page Not Found</h1>
      <p className="text-gray-600 mt-2">The page you are looking for might have been removed or doesn't exist. <Link to="/loginForm">RE LOGIN</Link></p>
      <Link 
        to="/LoginForm" 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Click here to go back
      </Link>
    </div>
  );   
};

export default NotFoundPage;
