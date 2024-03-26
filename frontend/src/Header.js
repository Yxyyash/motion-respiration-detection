// Header.js
import React from 'react';
import { Box, Heading, Link, Icon, Spacer, Image } from '@chakra-ui/react';
// import { MdHome } from 'react-icons/md';

const Header = () => {
  return (
    <header style={headerStyles}>
      <Box display="flex" alignItems="center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width="100px" height="40px" /> {/* Adjust the width and height as needed */}
        </Link>
      </Box>
    </header>
  );
};

const headerStyles = {
  backgroundColor: 'rgba(90, 90, 90, 0.2)', // Adjust the opacity value as needed
  color: 'white',
  padding: '10px',
  textAlign: 'left',
};

export default Header;
