// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';

import App from './App';
import VideoPreview from './VideoPreview';
import CameraPage from './CameraPage'; 
import Signalis from './Signalis';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <CSSReset />
    <Router>
      <Routes>
        <Route path="/signalis" element={<Signalis />} />
        <Route path="/video-preview" element={<VideoPreview />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  </ChakraProvider>,
  document.getElementById('root')
);

reportWebVitals();
