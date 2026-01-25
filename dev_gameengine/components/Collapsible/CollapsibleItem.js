import React from 'react';
import { Flex, Icon } from '@chakra-ui/react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { __, sprintf } from '@wordpress/i18n';

const CollapsibleItem = ({ label, children, open, onClick, dynamicClasses }) => {
    const classes = [
        "gameengine-collapsible",
        dynamicClasses && dynamicClasses
    ].filter(Boolean).join(" ");

    return (
        <Flex
            padding="24px"
            border="1px solid var(--gameengine-border-color)"
            borderRadius="4px"
            direction="column"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            m="24px 0"
            className={classes}
        >
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                onClick={onClick}
                cursor="pointer"
            >
                <GFLabel
                    type="plainHeading"
                    margin={0}
                    padding={0}
                    // translators: %s: label
                    label={sprintf(
                        __('%s', 'gemboards'),
                        label,
                    )}
                />

                <Icon as={open ? LuChevronUp : LuChevronDown} boxSize={5} />
            </Flex>

            {children}
        </Flex>
    );
};

export default CollapsibleItem;
