import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';

// Components
import TopBar from "@GFComponents/TopBar";
import GFLabel from '@GFComponents/Labels/GFLabel';
import { primaryBtn } from '../../../../../assets/scss/chakra/recipe';
import { route_path } from '@GFUtils/helper';
import { FaChevronRight } from 'react-icons/fa6';
import PointTypesTable from './PointTypesTable';

const Points = () => {
    const navigate = useNavigate();
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
            <Box width="1174px" margin="0 auto" height="100vh">
                <Flex justifyContent='space-between' alignItems='center' p='24px 0'>
                    <GFLabel
                        type="title"
                        fontWeight="500"
                        fontSize="xl"
                        label={__(`Point Types`, 'gamify')}
                    />
                    <Button
                        {...primaryBtn}
                        onClick={() => navigate(`${ route_path }admin.php?page=gamify-points&path=points-types`)}
                    >
                        {__('+ Add new point types', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>

                <PointTypesTable />
            </Box>
        </>
    );
};

export default Points;