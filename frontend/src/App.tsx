// src/App.tsx

import React from 'react';
import RoutesConfig from './routes';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <RoutesConfig />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ErrorBoundary>
    </div>
  );
};

export default App;
