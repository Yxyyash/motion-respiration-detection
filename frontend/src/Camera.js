import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Select, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import CameraOverlay from './CameraOverlay';

const Camera = () => {
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(20);
  const [initialConstraints, setInitialConstraints] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const getCameraStream = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16 / 9,
          frameRate: { ideal: 30, max: 30 }
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setMediaStream(stream);
      setInitialConstraints(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      setSelectedDevice(videoDevices[0]?.deviceId || '');
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  useEffect(() => {
    getCameraStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const switchCamera = async (deviceId) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId }, ...initialConstraints.video },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setMediaStream(stream);

      if (videoRef.current) {
        // Stop the current stream
        const currentStream = videoRef.current.srcObject;
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }

        // Set the new stream
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const startRecording = () => {
    try {
      if (!mediaStream) {
        getCameraStream();
      }
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16 / 9,
          frameRate: { ideal: 30, max: 30 }
        }
      }

      mediaRecorderRef.current = new MediaRecorder(mediaStream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });

        // Create a FormData object to send the blob to the server
        const formData = new FormData();
        formData.append('video', blob, 'recorded_video.mp4');
        toast({
          title: 'Recording Complete',
          description: 'Recording saved successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        try {
          // Send the video to the server using the fetch API
          const response = await fetch('http://localhost:4000/uploads', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            console.log('Video uploaded successfully.');
          } else {
            console.error('Failed to upload video.');
          }
        } catch (error) {
          console.error('Error uploading video:', error);
        }

        // Set timeout for 1 second after recording stops
        setTimeout(() => {
          navigate('/video-preview');
        }, 1000);
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      // Set up a timer to update the countdown every second
      const countdownInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            // Stop recording when the timer reaches 0
            stopRecording();
            clearInterval(countdownInterval);
            return 0;
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
        setTimer(20); // Reset the timer after stopping recording
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <VStack spacing={4} align="center">
        <p style={{ fontWeight: 'bold' }}>Harap posisikan badan anda pada siluet selama perekaman</p>
      <Box position="relative">
        <video ref={videoRef} autoPlay playsInline style={{ transform: 'scaleX(-1)' }} />
        <CameraOverlay />
      </Box>
      <Box>
        {recording ? (
          <>
            <Button colorScheme="red" onClick={stopRecording}>
              Stop Recording
            </Button>
            <p>{`Recording Time: ${timer}s`}</p>
          </>
        ) : (
          <Button colorScheme="green" onClick={startRecording}>
            Start Recording
          </Button>
        )}
      </Box>
      <Box>
        <Select
          placeholder="Select Camera"
          value={selectedDevice}
          onChange={(e) => {
            setSelectedDevice(e.target.value);
            switchCamera(e.target.value);
          }}
        >
          {availableDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${availableDevices.indexOf(device) + 1}`}
            </option>
          ))}
        </Select>
      </Box>
    </VStack>
  );
};

export default Camera;
