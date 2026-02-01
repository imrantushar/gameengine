import { Box } from '@chakra-ui/react';
import React from 'react';
import Welcome from './Steps/Welcome';
import Congratulation from './Steps/Congratulation';
import { Route, Routes } from 'react-router-dom';
import TopBar from '@GFComponents/TopBar';

const Setup = () => {
  console.log('called')
  return (
    <Box
      width={'100vw'}
      height={'calc(100vh - 171px)'}
      background={'#FFF'}
    >
      <TopBar
        path={'GameEngine'}
        topPosition="0"
      />
      <Routes>
        <Route exact path="/" element={<Welcome />} />
        <Route
          path="/congratulation"
          element={<Congratulation />}
        />
      </Routes>
    </Box>
  );
};

export default Setup;