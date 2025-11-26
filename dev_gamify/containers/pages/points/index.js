import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Spinner } from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { FiEdit, FiTrash2 } from "react-icons/fi";
import apiFetch from '@wordpress/api-fetch';

// আপনার আগের কম্পোনেন্টগুলো
import TopBar from "@Components/TopBar";
import GFLabel from '@Components/Labels/GFLabel';
import ListTable from '@Components/ListTable'; // আপনার আগের টেবিল কম্পোনেন্ট
import OptionMenu from '@Components/OptionMenu'; // আপনার আগের মেনু কম্পোনেন্ট
import { primaryBtn } from '../../../../assets/scss/chakra/recipe';

const Points = () => {
    const navigate = useNavigate();

    // ১. ডাইনামিক ডেটা রাখার জন্য স্টেট
    const [dynamicData, setDynamicData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ২. API থেকে ডেটা আনা
    useEffect(() => {
        apiFetch({ path: '/gamify/v1/point-types' })
            .then((res) => {
                if (Array.isArray(res)) {
                    // ডেটা ফরম্যাট করা যাতে আপনার ListTable বুঝতে পারে
                    const formattedData = res.map(item => ({
                        id: item.id,
                        name: item.name,
                        pluralName: item.plural_name,
                        date: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })
                    }));
                    setDynamicData(formattedData);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            apiFetch({
                path: `/gamify/v1/point-types/${id}`,
                method: 'DELETE',
            }).then(() => {
                setDynamicData(dynamicData.filter(item => item.id !== id));
            });
        }
    };

    const columns = [
        {
            name: __('Name', 'gamify'),
            cell: (row) => (
                <Flex align="center" gap="10px">
                    <span>{row.name}</span>
                </Flex>
            ),
        },
        {
            name: __('Plural Name', 'gamify'),
            cell: (row) => row.pluralName,
        },
        {
            name: __('Date', 'gamify'),
            cell: (row) => row.date,
        },
        {
            name: __('Action', 'gamify'),
            cell: (row) => (
                <OptionMenu
                    options={[
                        {
                            type: 'button',
                            label: __('Edit', 'gamify'),
                            icon: <Icon as={FiEdit} />,
                            onClick: () => navigate(`/point-type?id=${row.id}`)
                        },
                        {
                            type: 'button',
                            suffix: 'trash',
                            label: __('Delete', 'gamify'),
                            icon: <Icon as={FiTrash2} />,
                            onClick: () => handleDelete(row.id)
                        },
                    ]}
                />
            ),
        },
    ];

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
                        onClick={() => navigate("/point-type")}
                    >
                        {__('+ Add new point types', 'gamify')}
                        <span className="gamify-icon gamify-icon--plus has-gamify-blue-bg" />
                    </Button>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" align="center" height="200px">
                        <Spinner />
                    </Flex>
                ) : (

                    <ListTable
                        columns={columns}
                        data={dynamicData}
                        showSubHeader={false}
                        showColumnFilter={false}
                        isRowSelectable={false}
                        showPagination={true}
                        noDataText="No data found"
                    />
                )}
            </Box>
        </>
    );
};

export default Points;