import {
    Box, Flex, Icon,
    Text,
    VStack,
} from "@chakra-ui/react";

import { __ } from '@wordpress/i18n';
import React from 'react';
import TopUsers from "./TopUsers";
import Distribution from "./Distribution";
import GFLabel from '@Components/Labels/GFLabel';
import TopBar from "@Components/TopBar";
import Overview from "./Overview";



const users = [
    { rank: "#1", name: "Christopher Hayes", points: "10,000", achievements: 5, level: "Diamond" },
    { rank: "#2", name: "Nicholas Grant", points: "9,400", achievements: 4, level: "Platinum" },
    { rank: "#3", name: "Alexander Pierce", points: "9,200", achievements: 4, level: "Platinum" },
    { rank: "#4", name: "Nathaniel Brooks", points: "8,000", achievements: 2, level: "Gold" },
    { rank: "#5", name: "Frederick Adams", points: "6,000", achievements: 1, level: "Silver" },
];
const Dashboard = () => {


    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify" />
                        <span className="gamify-icon gamify-icon--angle-right" />
                        <GFLabel
                            as="h2"
                            color="#4F46E5"
                            type="subtitle"
                            fontWeight="medium"
                            label={__(`Dashboard`, 'gamify')}
                            
                        />
                    </>
                )}

            />
            <VStack gap='24px' w='1320px' margin="0 auto" pb='136px' >
                <Overview/>
                <Distribution />
                <TopUsers users={users} />
            </VStack>
        </>

    );
};

export default Dashboard;
