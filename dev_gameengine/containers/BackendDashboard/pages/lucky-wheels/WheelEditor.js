import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Box,
    Button,
    Flex,
    Input,
    Text,
    Grid,
} from '@chakra-ui/react';
import { __ } from '@wordpress/i18n';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { route_path } from '@GFUtils/helper';
import { Formik, FieldArray } from 'formik';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { showNotification } from '@GFRedux/Slices/notificationSlice/notificationSlice';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { commonInput, primaryBtn } from '../../../../../assets/scss/chakra/recipe';

const DEFAULT_SLICES = [
    { label: '10 Points', type: 'points', amount: 10, prob: 50, color: '#3498db' },
    { label: 'Try Again', type: 'empty', amount: 0, prob: 50, color: '#e74c3c' },
];

const DEFAULT_VALUES = {
    name: '',
    spin_cost: 0,
    daily_limit: 0,
    cooldown_timer: 0,
    settings: {
        who_can_play: 'all',
        allowed_roles: '',
        ip_limit: 0,
        jackpot_limit: 0,
        collect_email: false,
    },
    slices: DEFAULT_SLICES,
};

export default function WheelEditor({ action }) {
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const [searchParams] = useSearchParams();

    // Read editId directly from URL (same as PointTypeEditor)
    const editId = searchParams.get('id');

    const [values, setValues]   = useState(DEFAULT_VALUES);
    const [loading, setLoading] = useState(!!editId);

    // Fetch wheel when editId is present
    useEffect(() => {
        if (!editId) return;

        setLoading(true);
        fetch(window.GameEngineGlobal.rest_url + 'gameengine/v1/lucky-wheels', {
            headers: { 'X-WP-Nonce': window.GameEngineGlobal.nonce },
        })
            .then(r => r.json())
            .then(wheels => {
                if (!Array.isArray(wheels)) return;
                const wheel = wheels.find(w => String(w.id) === String(editId));
                if (!wheel) return;

                let slices = wheel.slices;
                if (typeof slices === 'string') {
                    try { slices = JSON.parse(slices); } catch (_) { slices = []; }
                }
                if (!Array.isArray(slices)) slices = [];

                const def = (v, fallback) => (v !== null && v !== undefined && v !== '') ? Number(v) : fallback;
                setValues({
                    name:           wheel.name          || '',
                    spin_cost:      def(wheel.spin_cost, 0),
                    daily_limit:    def(wheel.daily_limit, 0),
                    cooldown_timer: def(wheel.cooldown_timer, 0),
                    settings:       {
                        who_can_play: wheel.settings?.who_can_play || 'all',
                        allowed_roles: Array.isArray(wheel.settings?.allowed_roles) ? wheel.settings.allowed_roles.join(', ') : '',
                        ip_limit: def(wheel.settings?.ip_limit, 0),
                        jackpot_limit: def(wheel.settings?.jackpot_limit, 0),
                        collect_email: !!wheel.settings?.collect_email,
                    },
                    slices,
                });
            })
            .catch(err => console.error('Wheel fetch error:', err))
            .finally(() => setLoading(false));
    }, [editId]);

    // ────────── save ──────────
    const handleSubmit = async (formValues, { setSubmitting }) => {
        try {
            let parsedSettings = { ...formValues.settings };
            if (typeof parsedSettings.allowed_roles === 'string') {
                parsedSettings.allowed_roles = parsedSettings.allowed_roles.split(',').map(s => s.trim()).filter(s => s);
            }

            const payload = {
                ...formValues,
                settings: parsedSettings,
                id: editId ? parseInt(editId, 10) : 0,
            };

            const res = await fetch(
                window.GameEngineGlobal.rest_url + 'gameengine/v1/lucky-wheels',
                {
                    method:  'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce':   window.GameEngineGlobal.nonce,
                    },
                    body: JSON.stringify(payload),
                }
            );
            const result = await res.json();

            if (result && result.id) {
                dispatch(showNotification({
                    message: __('Lucky Wheel saved successfully.', 'gameengine'),
                    isShow:  true,
                    type:    'success',
                }));
                navigate(`${route_path}admin.php?page=gameengine-lucky-wheels`);
            } else {
                throw new Error(result.message || 'Unknown error');
            }
        } catch (err) {
            console.error('Save error:', err);
            dispatch(showNotification({
                message: __('Failed to save wheel. Check console for details.', 'gameengine'),
                isShow:  true,
                type:    'error',
            }));
        } finally {
            setSubmitting(false);
        }
    };

    // ────────── loading state ──────────
    if (loading) {
        return (
            <Flex h="300px" align="center" justify="center">
                <Text>{__('Loading…', 'gameengine')}</Text>
            </Flex>
        );
    }

    // ────────── render ──────────
    return (
        <Formik
            initialValues={values}
            onSubmit={handleSubmit}
            enableReinitialize   /* safe here – values state changes only once after fetch */
        >
            {({ values: fv, handleChange, setFieldValue, handleSubmit: fSubmit, isSubmitting }) => (
                <>
                    {/* ── Top bar ── */}
                    <TopBar
                        path={editId
                            ? __('Edit Lucky Wheel', 'gameengine')
                            : __('Add New Lucky Wheel', 'gameengine')}
                        rightContent={
                            <Flex gap={3}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`${route_path}admin.php?page=gameengine-lucky-wheels`)}
                                >
                                    {__('Cancel', 'gameengine')}
                                </Button>
                                <Button
                                    {...primaryBtn}
                                    onClick={fSubmit}
                                    isLoading={isSubmitting}
                                >
                                    {editId
                                        ? __('Update Wheel', 'gameengine')
                                        : __('Save Wheel', 'gameengine')}
                                </Button>
                            </Flex>
                        }
                    />

                    {/* ── Page body ── */}
                    <div className="gameengine-page-content">
                        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mt={6}>

                            {/* ── General Settings ── */}
                            <Box flex="1">
                                <GameEngineBox heading={__('General Settings', 'gameengine')}>
                                    <Flex direction="column" gap={4}>

                                        <GameEngineInput label={__('Wheel Name', 'gameengine')}>
                                            <Input
                                                name="name"
                                                value={fv.name}
                                                onChange={handleChange}
                                                placeholder={__('e.g. Daily Spin', 'gameengine')}
                                                {...commonInput}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Spin Cost (Points)', 'gameengine')}>
                                            <Input
                                                type="number"
                                                name="spin_cost"
                                                value={fv.spin_cost}
                                                onChange={handleChange}
                                                {...commonInput}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Daily Limit (0 = unlimited)', 'gameengine')}>
                                            <Input
                                                type="number"
                                                name="daily_limit"
                                                value={fv.daily_limit}
                                                onChange={handleChange}
                                                {...commonInput}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Cooldown (seconds)', 'gameengine')}>
                                            <Input
                                                type="number"
                                                name="cooldown_timer"
                                                value={fv.cooldown_timer}
                                                onChange={handleChange}
                                                {...commonInput}
                                            />
                                        </GameEngineInput>

                                    </Flex>
                                </GameEngineBox>

                                <GameEngineBox heading={__('Rules & Security', 'gameengine')} mt={6}>
                                    <Flex direction="column" gap={4}>
                                        <GameEngineInput label={__('Who Can Play', 'gameengine')}>
                                            <select
                                                name="settings.who_can_play"
                                                value={fv.settings?.who_can_play}
                                                onChange={handleChange}
                                                style={{
                                                    width:           '100%',
                                                    height:          '40px',
                                                    padding:         '0 10px',
                                                    borderRadius:    '4px',
                                                    border:          '1px solid #e2e8f0',
                                                    backgroundColor: 'white',
                                                    fontSize:        '14px',
                                                }}
                                            >
                                                <option value="all">{__('Everyone (Guests & Logged In)', 'gameengine')}</option>
                                                <option value="logged_in">{__('Logged In Users Only', 'gameengine')}</option>
                                                <option value="specific_roles">{__('Specific Roles Only', 'gameengine')}</option>
                                            </select>
                                        </GameEngineInput>

                                        {fv.settings?.who_can_play === 'specific_roles' && (
                                            <GameEngineInput label={__('Allowed Roles (comma separated)', 'gameengine')}>
                                                <Input
                                                    name="settings.allowed_roles"
                                                    value={fv.settings?.allowed_roles || ''}
                                                    onChange={handleChange}
                                                    placeholder={__('e.g. subscriber, customer', 'gameengine')}
                                                    {...commonInput}
                                                />
                                            </GameEngineInput>
                                        )}

                                        <GameEngineInput label={__('IP Daily Limit (0 = unlimited)', 'gameengine')}>
                                            <Input
                                                type="number"
                                                name="settings.ip_limit"
                                                value={fv.settings?.ip_limit}
                                                onChange={handleChange}
                                                {...commonInput}
                                            />
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Jackpot Minimum Spins', 'gameengine')}>
                                            <Input
                                                type="number"
                                                name="settings.jackpot_limit"
                                                value={fv.settings?.jackpot_limit}
                                                onChange={handleChange}
                                                {...commonInput}
                                            />
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {__('Require this many total spins before a jackpot (is_jackpot=true) can be won.', 'gameengine')}
                                            </Text>
                                        </GameEngineInput>

                                        <GameEngineInput label={__('Collect Guest Email?', 'gameengine')}>
                                            <div style={{ marginTop: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    name="settings.collect_email"
                                                    checked={!!fv.settings?.collect_email}
                                                    onChange={handleChange}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                                <Text as="span" ml={2} fontSize="sm" verticalAlign="top">
                                                    {__('Ask guest users for their email before spinning.', 'gameengine')}
                                                </Text>
                                            </div>
                                        </GameEngineInput>
                                    </Flex>
                                </GameEngineBox>
                            </Box>

                            {/* ── Wheel Slices ── */}
                            <Box flex="2">
                                <FieldArray name="slices">
                                    {({ remove, push }) => (
                                        <GameEngineBox>
                                            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                                                <Text fontWeight="600" fontSize="md">
                                                    {__('Wheel Slices', 'gameengine')}
                                                </Text>
                                                <Button
                                                    {...primaryBtn}
                                                    onClick={() => push({
                                                        label:  'New Prize',
                                                        type:   'points',
                                                        amount: 10,
                                                        prob:   0,
                                                        color:  '#3498db',
                                                        is_jackpot: false,
                                                    })}
                                                >
                                                    {__('+ Add Slice', 'gameengine')}
                                                </Button>
                                            </Flex>

                                            <Flex direction="column" gap={4}>
                                                {fv.slices && fv.slices.map((slice, index) => (
                                                    <Box
                                                        key={index}
                                                        p={4}
                                                        border="1px solid"
                                                        borderColor="gray.200"
                                                        borderRadius="md"
                                                        bg="gray.50"
                                                        position="relative"
                                                    >
                                                        <Button
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            position="absolute"
                                                            top={2}
                                                            right={2}
                                                            onClick={() => remove(index)}
                                                        >
                                                            {__('Delete', 'gameengine')}
                                                        </Button>

                                                        <Grid 
                                                            templateColumns={{ base: "1fr", md: "2fr 1.5fr 1fr 1fr 0.6fr 0.8fr" }} 
                                                            gap={4} 
                                                            alignItems="flex-start"
                                                            pr="40px"
                                                        >
                                                            {/* Label */}
                                                            <Box>
                                                                <GameEngineInput label={__('Label', 'gameengine')}>
                                                                    <Input
                                                                        size="sm"
                                                                        name={`slices.${index}.label`}
                                                                        value={slice.label}
                                                                        onChange={handleChange}
                                                                        bg="white"
                                                                        borderRadius="md"
                                                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #4299E1" }}
                                                                    />
                                                                </GameEngineInput>
                                                            </Box>

                                                            {/* Type */}
                                                            <Box>
                                                                <GameEngineInput label={__('Type', 'gameengine')}>
                                                                    <select
                                                                        name={`slices.${index}.type`}
                                                                        value={slice.type}
                                                                        onChange={handleChange}
                                                                        style={{
                                                                            width:           '100%',
                                                                            height:          '32px',
                                                                            padding:         '0 8px',
                                                                            borderRadius:    '6px',
                                                                            border:          '1px solid #E2E8F0',
                                                                            backgroundColor: 'white',
                                                                            fontSize:        '13px',
                                                                            outline:         'none'
                                                                        }}
                                                                    >
                                                                        <option value="points">{__('Add Points', 'gameengine')}</option>
                                                                        <option value="deduct">{__('Deduct Points', 'gameengine')}</option>
                                                                        <option value="empty">{__('Try Again', 'gameengine')}</option>
                                                                        <option value="coupon">{__('Coupon', 'gameengine')}</option>
                                                                    </select>
                                                                </GameEngineInput>
                                                            </Box>

                                                            {/* Amount / Coupon Code */}
                                                            <Box>
                                                                <GameEngineInput label={slice.type === 'coupon' ? __('Code', 'gameengine') : __('Amount', 'gameengine')}>
                                                                    <Input
                                                                        type={slice.type === 'coupon' ? 'text' : 'number'}
                                                                        size="sm"
                                                                        name={`slices.${index}.amount`}
                                                                        value={slice.amount}
                                                                        onChange={handleChange}
                                                                        bg="white"
                                                                        borderRadius="md"
                                                                        placeholder={slice.type === 'coupon' ? 'CODE' : '0'}
                                                                    />
                                                                </GameEngineInput>
                                                            </Box>

                                                            {/* Probability */}
                                                            <Box>
                                                                <GameEngineInput label={__('Prob (%)', 'gameengine')}>
                                                                    <Input
                                                                        type="number"
                                                                        size="sm"
                                                                        name={`slices.${index}.prob`}
                                                                        value={slice.prob}
                                                                        onChange={handleChange}
                                                                        bg="white"
                                                                        borderRadius="md"
                                                                    />
                                                                </GameEngineInput>
                                                            </Box>

                                                            {/* Color */}
                                                            <Box>
                                                                <GameEngineInput label={__('Color', 'gameengine')}>
                                                                    <Box 
                                                                        position="relative" 
                                                                        height="32px" 
                                                                        width="100%" 
                                                                        borderRadius="md" 
                                                                        overflow="hidden"
                                                                        border="1px solid #E2E8F0"
                                                                    >
                                                                        <Input
                                                                            type="color"
                                                                            name={`slices.${index}.color`}
                                                                            value={slice.color}
                                                                            onChange={handleChange}
                                                                            position="absolute"
                                                                            top="-5px"
                                                                            left="-5px"
                                                                            width="calc(100% + 10px)"
                                                                            height="calc(100% + 10px)"
                                                                            padding="0"
                                                                            cursor="pointer"
                                                                            border="none"
                                                                        />
                                                                    </Box>
                                                                </GameEngineInput>
                                                            </Box>

                                                            {/* Is Jackpot */}
                                                            <Box textAlign="center">
                                                                <GameEngineInput label={__('Jackpot?', 'gameengine')}>
                                                                    <Flex justify="center" align="center" h="32px">
                                                                        <input
                                                                            type="checkbox"
                                                                            name={`slices.${index}.is_jackpot`}
                                                                            checked={!!slice.is_jackpot}
                                                                            onChange={(e) => setFieldValue(`slices.${index}.is_jackpot`, e.target.checked)}
                                                                            style={{ 
                                                                                width: '18px', 
                                                                                height: '18px', 
                                                                                cursor: 'pointer',
                                                                                accentColor: '#3182ce'
                                                                            }}
                                                                        />
                                                                    </Flex>
                                                                </GameEngineInput>
                                                            </Box>
                                                        </Grid>
                                                    </Box>
                                                ))}

                                                {/* Total probability indicator */}
                                                <Box mt={1}>
                                                    <Text
                                                        fontSize="xs"
                                                        color={
                                                            fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0) === 100
                                                                ? 'green.500'
                                                                : 'orange.500'
                                                        }
                                                        fontWeight="500"
                                                    >
                                                        {__('Total Probability:', 'gameengine')}{' '}
                                                        {fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0)}%
                                                        {fv.slices.reduce((a, s) => a + (parseInt(s.prob) || 0), 0) !== 100
                                                            ? __(' (must equal 100%)', 'gameengine')
                                                            : ' ✓'}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        </GameEngineBox>
                                    )}
                                </FieldArray>
                            </Box>

                        </Flex>
                    </div>
                </>
            )}
        </Formik>
    );
}
