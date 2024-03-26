import React from 'react';
import { Box, Flex, Button, Heading, Center, ChakraProvider, ScaleFade } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiCamera, FiInfo } from 'react-icons/fi';
import Header from './Header';

const App = () => {
  const buttonStyle = {
    position: "relative",
    width: "16rem",
    height: "18rem",
    borderRadius: "lg",
    overflow: "hidden",
    transition: "transform 0.3s",
  };

  return (
    <ChakraProvider>
      <Header />
      <Center height="1vh" flexDirection="column"></Center>
      <style>
        {`
         body {
            background: url("${process.env.PUBLIC_URL}/bluer.jpg") center/cover no-repeat fixed;
            margin: 0;
        }
      `}
      </style>
      <Flex justify="space-between" align="flex-start">
        <Heading ml={100} mt={79} style={{ color: 'white' }}>
          Periksa <br />
          Pernapasan <br />
          Anda<br />
          Dimana Saja<br />
          Kapan Saja<br />
        </Heading>
        <Flex justify="right">
          {/* Camera Button */}
          <ScaleFade in>
            <Button
              as={RouterLink}
              to="/camera"
              backgroundColor="#2D4756" 
              variant="solid"
              _hover={{ transform: 'translateY(-5px)' }}
              style={{...buttonStyle, marginRight: '10px', marginTop: '60px', opacity: 0.7}}
              borderColor="white"
            >
              <Flex alignItems="center" justifyContent="center" flexDirection="column">
                <Box boxSize="50px" mb={2}>
                  <FiCamera size={50} style={{ color: 'white' }}/>
                </Box>
                <Box fontSize="15px" mt={2} style={{ color: 'white' }}>Cek Respirasi</Box>
              </Flex>
            </Button>
          </ScaleFade>

          {/* About Button */}
          <ScaleFade in>
            <Button
              as={RouterLink}
              to="/about"
              backgroundColor="#B0BCCF" 
              variant="solid"
              _hover={{ transform: 'translateY(-5px)' }}
              ml={4}
              style={{...buttonStyle, marginRight: '40px', marginTop: '60px', opacity: 0.8}}
              borderColor="white"
            >
              <Flex alignItems="center" justifyContent="center" flexDirection="column">
                <Box boxSize="50px" mb={2}>
                  <FiInfo size={50}/>
                </Box>
                <Box fontSize="15px" mt={2}>Mengenai Aplikasi</Box>
              </Flex>
            </Button>
          </ScaleFade>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default App;
