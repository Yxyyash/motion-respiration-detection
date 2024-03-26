import React, { useState, useEffect } from 'react';
import Header from './Header';
import { ChakraProvider, CSSReset, Box, Container, Text } from '@chakra-ui/react';

const Signalis = () => {
  const [latestPNG, setLatestPNG] = useState('');
  const [latestTXTContent, setLatestTXTContent] = useState('');
  const [error, setError] = useState('');
  const [fontColor, setFontColor] = useState(''); // Default color

  useEffect(() => {
    const fetchLatestFiles = async () => {
      try {
        const response = await fetch('http://localhost:4000/plot');
        if (!response.ok) {
          throw new Error('Failed to fetch files.');
        }

        const plotFiles = await response.json();
        if (plotFiles && plotFiles.length > 0) {
          // Filter out only PNG files
          const pngFiles = plotFiles.filter(file => file.endsWith('.png'));
          if (pngFiles.length > 0) {
            // Assuming the last file is the latest one
            const latestPNGFile = pngFiles[pngFiles.length - 1];
            setLatestPNG(latestPNGFile);
            
            // Fetch content of the corresponding TXT file
            const txtResponse = await fetch(`http://localhost:4000/plot/${latestPNGFile.replace('.png', '.txt')}?${Date.now()}`);
            if (!txtResponse.ok) {
              throw new Error('Failed to fetch TXT file content.');
            }
            const txtContent = await txtResponse.text();
            setLatestTXTContent(txtContent);
            
            // Check if content is greater than 18 or less than 12
            if (parseInt(txtContent) > 18 || parseInt(txtContent) < 12) {
              setFontColor('red'); // Set font color to red
            } else {
              setFontColor('green'); // Set font color to green
            }
          } else {
            setError('No PNG files available.');
          }
        } else {
          setError('No files available.');
        }
      } catch (error) {
        setError(`Error fetching files: ${error}`);
      }
    };
  
    fetchLatestFiles();
  }, []);

  return (
    <ChakraProvider>
      <CSSReset />
      <Header />
      <style>
        {`
          body {
            background: url("/clay.jpg") center/cover no-repeat fixed;
            margin: 0;
          }
          .container {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column; /* Added to stack elements vertically */
          }
          .row-container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .image-container {
            margin-right: 20px; /* Adjust margin as needed */
            transform: translate(-150px, -50px); /* Adjust translation values to move the image to the left and up */
            max-width: 700px; /* Adjust maximum width as needed */
            max-height: 700px; /* Adjust maximum height as needed */
          }
          .result-text {
            font-size: 30px; /* Adjust font size as needed */
            color: #FFFFFF; /* Adjust color as needed */
            transform: translate(-10px, -80px); /* Adjust translation values to move the image to the left and up */
          }
          .additional-text {
            font-size: 50px; /* Adjust font size as needed */
            color: ${fontColor}; /* Set font color based on the condition */
            transform: translate(-10px, -70px); /* Adjust translation values to move the image to the left and up */
            text-align: center; /* Center text vertically */
          }
        `}
      </style>
      <Container maxW="container.lg" mt={20} className="container">
        {error ? (
          <Text color="red">{error}</Text>
        ) : (
          <>
            {latestPNG ? (
              <div className="container">
                <div className="row-container">
                  <div className="image-container">
                    <img src={`http://localhost:4000/plot/${latestPNG}`} alt={"Latest PNG"} />
                  </div>
                  <div>
                    <Text className="result-text">Hasil Anda: </Text>
                    <Text className="additional-text">{latestTXTContent} bpm</Text>
                  </div>
                </div>
              </div>
            ) : (
              <Text>Loading...</Text>
            )}
          </>
        )}
      </Container>
    </ChakraProvider>
  );
}

export default Signalis;
