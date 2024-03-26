// CameraOverlay.js

import React from 'react';

const CameraOverlay = () => {
  return (
    <div style={overlayStyles}>
      {/* Add your silhouette image here */}
      <img src={process.env.PUBLIC_URL + '/sil.png'} alt="Silhouette" style={imageStyles} />
    </div>
  );
};

const overlayStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none', // Make the overlay non-interactable
  opacity: 1, // Set the opacity (adjust as needed)
};

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export default CameraOverlay;
