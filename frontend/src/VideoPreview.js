import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Center } from '@chakra-ui/react';
import Header from './Header';  // Import the Header component

const VideoPreview = () => {
  const [latestVideo, setLatestVideo] = useState(null);

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const response = await fetch('http://localhost:4000/uploads');
        if (!response.ok) {
          throw new Error('Failed to fetch video files.');
        }

        const files = await response.json();
        if (files.length > 0) {
          // Assuming the server returns an array of filenames
          const latestVideoFile = files[files.length - 1]; // Assuming files are sorted
          setLatestVideo(latestVideoFile);
        } else {
          console.log('No recorded videos available.');
        }
      } catch (error) {
        console.error('Error fetching video files:', error);
      }
    };

    fetchLatestVideo();
  }, []);

  return (
    <>
      <Header /> {/* Add the Header component here */}
      <Center height="80vh" flexDirection="column">
        <style>
          {`
           body {
              background: url("${process.env.PUBLIC_URL}/clay.jpg") center/cover no-repeat fixed;
              margin: 0;
          }
        `}
      </style>
        <p style={{ fontWeight: 'bold', marginBottom: '2px', color: 'white'}}>Yakin sudah berada dalam siluet selama perekaman?</p>
        <Box>
          {latestVideo ? (
            <Box>
              <video controls width="640" height="360">
                <source src={`http://localhost:4000/uploads/${latestVideo}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          ) : (
            <p>No recorded videos available.</p>
          )}
        </Box>
        <Box mt="2">
          <RouterLink to="/signalis">
            <Button colorScheme="green">
              Yakin dan Lanjut
            </Button>
          </RouterLink>
        </Box>
        <Box mt="2">
          <RouterLink to="/camera">
            <Button colorScheme="red">
              Tidak Yakin
            </Button>
          </RouterLink>
        </Box>
      </Center>
    </>
  );
};

export default VideoPreview;
