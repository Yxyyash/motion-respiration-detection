import React from 'react';
import { ChakraProvider, CSSReset, Box, Container, Heading, Link } from '@chakra-ui/react';
import Camera from './Camera';
import Header from './Header';

const CameraPage = () => {
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
        `}
      </style>
      <Container p={4} centerContent>
        <Box
          textAlign="center"
          color="white"
          p={4}
          borderRadius="lg"
          boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
          position="relative"
          zIndex="1"
          style={{
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(5, 56, 107, 0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Camera />
          <Link href="/video-preview">Preview Recorded Video</Link>
        </Box>
      </Container>
    </ChakraProvider>
  );
};

export default CameraPage;
