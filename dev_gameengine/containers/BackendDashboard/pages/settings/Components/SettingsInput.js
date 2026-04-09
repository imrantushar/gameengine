import { Flex, Text, Icon } from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa6';
import { __ } from '@wordpress/i18n';

/**
 * A settings row component that displays a label and an input control side by side.
 *
 * @component
 * @param {Object}          props
 * @param {string}          props.label              - The label text displayed on the left side.
 * @param {string}          [props.desc]             - Optional description (reserved for future use).
 * @param {React.ReactNode} props.children           - The input control rendered on the right side.
 * @param {string}          [props.width="100%"]     - Width of the container. Defaults to "100%".
 * @param {boolean}         [props.isPro=false]      - If true, displays a PRO badge next to the label.
 * @param {React.ReactNode} [props.subtitle=null]    - Optional subtitle rendered below the label.
 *
 * @example
 * <SettingsInput label="Log Display" isPro>
 *   <Select options={options} />
 * </SettingsInput>
 *
 * @example
 * <SettingsInput label="Auto Cleanup" subtitle={<Text>Cleans up after 24h</Text>}>
 *   <Switch />
 * </SettingsInput>
 */
const SettingsInput = ({
    label,
    desc,
    children,
    width = "100%",
    isPro = false,
    subtitle = null,
    ...props
}) => {
    const ProBadge = isPro && (
        <Flex align="center" gap={1.5} ml={2}>
            <Text
                background="#FFA943"
                margin={0}
                color="#fff"
                borderRadius="2px"
                padding="3px 6px"
                fontSize="10px"
                lineHeight="1"
                textTransform="uppercase"
                display="inline-flex"
                alignItems="center"
            >
                {__("PRO", 'gameengine')}
            </Text>
            <Icon as={FaLock} color="orange.400" boxSize={3} />
        </Flex>
    );

    const Label = (
        <Flex align="center">
            <Text
                fontSize="0.875rem"
                fontWeight="500"
                lineHeight="20px"
                color="var(--gameengine-font-color)"
                m="0"
            >
                {label}
            </Text>
            {ProBadge}
        </Flex>
    );

    return (
        <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap="6px"
            width={width}
            {...props}
        >
            {subtitle ? (
                <Flex direction="column" gap={1} width="calc(100% - 42%)">
                    {Label}
                    {subtitle}
                </Flex>
            ) : Label}
            {children}
        </Flex>
    );
};

export default SettingsInput;