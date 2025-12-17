import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VStack, Spinner, Center } from "@chakra-ui/react";
import { __ } from '@wordpress/i18n';
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';

// Components
import TopUsers from "./TopUsers";
import Distribution from "./Distribution";
import Overview from "./Overview";
import { fetchDashboardData } from '@GFRedux/Slices/dashboardSlice/dashboardSlice';
import { FaChevronRight } from 'react-icons/fa6';

// Action


const Dashboard = () => {
    const dispatch = useDispatch();
    const { overview, chart, topUsers, status } = useSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    if (status === 'loading') {
        return <Center h="100vh"><Spinner size="xl" /></Center>;
    }

    return (
        <>
            <TopBar
                leftContent={() => (
                    <>
                        <span className="gamify-topbar-logo gamify-icon gamify-icon--gamify">
                             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <rect opacity="0.8" width="36" height="36" rx="9.6" fill="#006BFF" />
                                <path d="M18.3393 12.0783L13.4437 27H9.5L16.1882 9H18.6978L18.3393 12.0783ZM22.4066 27L17.4986 12.0783L17.103 9H19.6374L24.6306 24L22.4066 27ZM22.1841 20.2995V23.2047H12.6772V20.2995H22.1841Z" fill="white" />
                            </svg>
                            </span>
                        <span className="gamify-icon gamify-icon--angle-right">
                            <FaChevronRight />
                            </span>
                        <GFLabel
                          as="h2"
                            color="var(--gamify-font-color)"
                            type="subtitle"
                            fontWeight="400" 
                            fontSize='12px'
                            label={__(`Game Engine`, 'gamify')}
                        />
                    </>
                )}
            />
            <VStack gap='24px' w='1320px' margin="0 auto" pb='136px'>
                <Overview data={overview} />
                <Distribution chartData={chart} />
                <TopUsers users={topUsers} />
            </VStack>
        </>
    );
};

export default Dashboard;