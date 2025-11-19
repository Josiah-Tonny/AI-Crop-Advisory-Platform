import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorFallbackProps {
  message?: string;
  title?: string;
  retry?: () => void;
  isNetworkError?: boolean;
}

/**
 * ErrorFallback component - Use when API calls fail and need to show a nice error state
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  message = 'There was a problem connecting to the server. Please try again.',
  title = 'Connection Error',
  retry,
  isNetworkError = true,
}) => {
  return (
    <div className="bg-white border border-red-100 rounded-lg p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        {isNetworkError ? (
          <WifiOff className="h-6 w-6 text-red-600" />
        ) : (
          <AlertCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
      
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      
      {retry && (
        <div className="mt-6">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorFallback;
