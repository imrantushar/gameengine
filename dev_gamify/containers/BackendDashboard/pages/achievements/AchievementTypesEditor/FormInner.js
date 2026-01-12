
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Icon, Text, Switch, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import CustomCollapsible from "@GFComponents/Collapsible";
import TopBar from "@GFComponents/TopBar";
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple, FaLock, FaChevronRight } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import LabeledInput from "@GFComponents/LabeledInput";
import GamifyEditor from "@GFComponents/editor";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import { GoPlus } from "react-icons/go";
import {
    fetchAchievementById, saveAchievement, updateAchievement, resetForm, fetchTriggers,
    fetchDynamicOptions, fetchPointTypes, fetchAchievements, setField, addHook, removeHook,
    updateHookSettings, addCategoryToList
} from "@GFRedux/Slices/achivementSlice/achievementsSlice";
import { commonInput, primaryBtn } from "../../../../../../assets/scss/chakra/recipe";
import { route_path } from "@GFUtils/helper";
import GamifyBox from "@GFComponents/GamifyBox";
import GamifyInput from "@GFComponents/GamifyInput";


// --- Updated Helper Component for Dynamic Fields ---
const DynamicAchievementField = ({ fieldKey, config, value, onChange, integrationSlug }) => {
    const dispatch = useDispatch();
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const isProActive = false;
    const isDisabled = config.is_pro && !isProActive;

    useEffect(() => {
        if (config.dynamic && !isDisabled) {
            setLoading(true);
            dispatch(fetchDynamicOptions({
                integration: config.dynamic.integration || integrationSlug,
                query: config.dynamic.query
            })).unwrap().then(res => setDynamicOptions(res)).finally(() => setLoading(false));
        }
    }, [config.dynamic, isDisabled, dispatch, integrationSlug]);

    const labelElement = (
        <Flex align="center" gap={2} mb="8px">
            <Text fontSize="14px" fontWeight="500" m="0" color="var(--gamify-font-color)">
                {config.label} {config.required && <span style={{ color: "red" }}>*</span>}
            </Text>
            {config.is_pro && <Icon as={FaLock} color="orange.400" boxSize={3} />}
        </Flex>
    );

    if (config.type === 'select') {
        const optionsSource = config.options
            ? (Array.isArray(config.options) ? config.options : Object.entries(config.options).map(([val, label]) => ({ value: val, label: label })))
            : dynamicOptions;

        return (
            <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
                {labelElement}
                <Select
                    isDisabled={isDisabled} isLoading={loading}
                    options={optionsSource}
                    value={optionsSource.find(opt => opt.value == value) || null}
                    onChange={(selected) => onChange(selected ? selected.value : '')}
                    className="gamify-select"
                    classNamePrefix="gamify-select"
                />
            </Box>
        );
    }

    return (
        <Box width="100%" opacity={isDisabled ? 0.7 : 1}>
            <LabeledInput label={config.label} type={config.type === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} required={config.required} disabled={isDisabled} />
        </Box>
    );
};

const DynamicHookForm = ({ hookId, hookInfo, settings, onChange, isOpen, setIsOpen }) => {
    const schema = hookInfo.schema || [];
    return (
        <>
            <CustomCollapsible label={hookInfo?.label || hookId} desc={hookInfo?.subTitle} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} singleIcon={true}>
                <Flex direction="column" gap="16px">
                    {schema.map(config => {
                        if (config.scope && !config.scope.includes('achievement')) return null;
                        return (
                            <DynamicAchievementField key={config.key} fieldKey={config.key} config={config} value={settings[config.key] ?? config.default ?? ''} integrationSlug={hookInfo.integrationSlug} onChange={(newValue) => onChange(config.key, newValue)} />
                        );
                    })}
                </Flex>
                <Flex borderTop="1px solid var(--gamify-border-color)" mt="24px" pt="16px" justifyContent='flex-end'>
                    <Button {...primaryBtn} size="sm" width='auto' onClick={() => setIsOpen(false)}>{__('Done', 'gamify')}</Button>
                </Flex>
            </CustomCollapsible>
        </>
    );
};

const FormInner = () => {
  const [openedHooks, setOpenedHooks] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [showInput, setShowInput] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [selectedFilterHookType, setSelectedFilterHookType] = useState([]);

  const hookCategoryIconMap = {
      wordpress: { icon: FaWordpressSimple, bg: "#21759b" },
      woocommerce: { icon: SiWoocommerce, bg: "#96588a" },
      gamify: { icon: FaGamepad, bg: "#006BFF" },
      interaction: { icon: AiFillInteraction, bg: "#ff5722" },
  };

  const renderHookCard = (item) => {
      const slug = item.integrationSlug || 'wordpress';
      const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
      return (
          <DraggableItem key={item.id} id={item.id}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Flex justify="space-between" align="center" padding="10px 16px" borderRadius="4px" border="1px solid var(--gamify-border-color)">
                      <Flex align="center" gap='8px'>
                          <Center bg={config.bg} borderRadius="full" width="24px" height="24px" color="white">
                              <Icon as={config.icon} boxSize={3} />
                          </Center>
                          <GFLabel type="title" fontWeight="400" label={item?.label} />
                      </Flex>

                      <Box bg="green.500" borderRadius="full" width="24px" height="24px" display="flex" alignItems="center" justifyContent="center" color="white">
                          <Icon as={FaArrowRotateRight} boxSize={3} />
                      </Box>
                  </Flex>

                  <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
              </div>
          </DraggableItem>
      );
  };

  const availableHooks = allHooks.filter(hook => !selectedHookIds.includes(hook.id) && (selectedFilterHookType.length === 0 || selectedFilterHookType.includes(hook.integrationSlug)));
  const activeHooks = selectedHookIds.map(id => allHooks.find(h => h.id === id)).filter(Boolean);

  const handleDragEnd = ({ active, over }) => {
      if (!over) return;
      if (availableHooks.some(i => i.id === active.id) && over.id === "awards-sidebar") {
          dispatch(addHook(active.id)); setOpenedHooks([active.id]);
      }
      if (selectedHookIds.includes(active.id) && over.id === "awards-available") {
          dispatch(removeHook(active.id));
      }
  };
  const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({ label: slug.charAt(0).toUpperCase() + slug.slice(1), value: slug }));
  
  return (
    <Flex direction="column" gap={6}>
      <Flex gap="12px">
          <GamifyInput
              label={__("Point Name", "gamify")}
              width="calc(50% - 6px)"
          >
            <Input
                placeholder={__("Enter point name", "gamify")}
                value={title}
                onChange={e => {
                    const value = e.target.value
                    dispatch(setField({ field: 'title', value: value }))
                    dispatch(setField({ field: 'description', value: value ? `${value}s` : "" }))
                }}
                {...commonInput}
            />
          </GamifyInput>

          <GamifyInput
              label={__("Plural Name", "gamify")}
              width="calc(50% - 6px)"
          >
              <Input
                  placeholder={__("Enter point name", "gamify")}
                  value={description}
                  {...commonInput}
              />
          </GamifyInput>
      </Flex>

      <GamifyInput
          label={__("Plural Name", "gamify")}
          desc={__("Number of times a user can earn this badge (0 = unlimited).", "gamify")}
      >
          <Input
              placeholder={__("Maximum Earnings Per User:", "gamify")}
              type="number"
              value={maxEarnings}
              onChange={e => dispatch(setField({ field: 'maxEarnings', value: e.target.value }))}
              {...commonInput}
          />
      </GamifyInput>

      <Box className="gamify-add-achievement-type">
          <GFLabel type="title" label={__("Achievement Type", "gamify")} />

          {availableCategories.length > 0 ? (
              <RadioGroup.Root
                  value={category}
                  onValueChange={(details) =>
                      dispatch(
                          setField({
                              field: "category",
                              value: details.value,
                          })
                      )
                  }
                  size="sm"
              >
                  <Flex
                      mt="4px"
                      gap="24px"
                      p="12px"
                      border="1px solid var(--gamify-border-color)"
                      borderRadius="4px"
                      flexWrap="wrap"
                  >
                      {availableCategories.map((cat, index) => (
                          <RadioGroup.Item key={index} value={cat}>
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator
                                  style={{
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "9999px",
                                      border: category === cat
                                          ? "1px solid #007AFF"
                                          : "1px solid #ccc",
                                      backgroundColor: category === cat
                                          ? "#007AFF"
                                          : "transparent",
                                  }}
                              />
                              <RadioGroup.ItemText>
                                  {/* translators: %s: cat */}
                                  {sprintf(
                                      __('%s', 'gemboards'),
                                      cat,
                                  )}
                              </RadioGroup.ItemText>
                          </RadioGroup.Item>
                      ))}
                  </Flex>
              </RadioGroup.Root>
          ) : null}

          {showInput ? (
              <Flex mt="6px" gap={2}>
                  <Input {...commonInput} size="sm" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder={__("Enter type name", "gamify")} />

                  <Button
                      size="xs"
                      bg="var(--gamify-border-color)"
                      fontSize="12px"
                      fontWeight="500"
                      lineHeight="16px"
                      p="6px 8px"
                      height="auto"
                      variant="ghost"
                      onClick={() => setShowInput(false)}
                  >
                      {__("Cancel", "gamify")}
                  </Button>

                  <Button
                      size="xs"
                      bg="var(--gamify-primary)"
                      color="#fff"
                      fontSize="12px"
                      fontWeight="500"
                      lineHeight="16px"
                      p="6px 8px"
                      height="auto"
                      variant="ghost"
                      onClick={() => {
                          dispatch(addCategoryToList(newCat));
                          dispatch(setField({ field: 'category', value: newCat }));
                          setNewCat("");
                          setShowInput(false);
                      }}
                  >
                      {__("Add", "gamify")}
                  </Button>
              </Flex>
          ) : (
              <Button
                  color="var(--gamify-primary)"
                  fontSize="12px"
                  fontWeight="500"
                  lineHeight="16px"
                  p="6px 8px"
                  height="auto"
                  variant="ghost"
                  mt="12px"
                  onClick={() => setShowInput(true)}
              >
                  <Icon as={GoPlus} boxSize="16px" />{__("Add Achievement Type", "gamify")}
              </Button>
          )}
      </Box>

      {/* CONGRATS MESSAGE EDITOR - RESTORED */}
      <Box>
          <GFLabel margin="0 0 12px 0" type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
          <GamifyEditor defaultValue={message} saveValueHandler={setMessage} />
      </Box>

      <Switch.Root
          checked={allowUnlockWithPoints}
          onCheckedChange={e => dispatch(setField({ field: 'allowUnlockWithPoints', value: e.checked }))}
          colorPalette="blue"
      >
          <Switch.HiddenInput />
          <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gamify")}</Switch.Label>
          <Switch.Control />
      </Switch.Root>

      {allowUnlockWithPoints ? (
          <Flex gap="12px" className="gamify-allow-unlock-point">
              <GamifyInput label={__("Points", "gamify")} width="calc(50% - 6px)">
                  <Input
                      placeholder={__("Enter point", "gamify")}
                      type="number"
                      value={pointsAmount}
                      onChange={e => dispatch(setField({ field: 'pointsAmount', value: e.target.value }))}
                      {...commonInput}
                  />
              </GamifyInput>

              <GamifyInput label={__("Choose the Points Type", "gamify")} width="calc(50% - 6px)">
                  <Select
                      className="gamify-select"
                      classNamePrefix="gamify-select"
                      options={availablePointTypes}
                      value={availablePointTypes.find(opt => opt.value == selectedPointTypeId)}
                      onChange={s => dispatch(setField({ field: 'selectedPointTypeId', value: s ? s.value : null }))}
                      menuPlacement="top"
                  />
              </GamifyInput>
          </Flex>
      ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <Box p="24px" border="1px solid var(--gamify-border-color)" borderRadius="4px" className="gamify-achievement-requirements">
                  <GFLabel type="plainHeading" label={__("Achievement Requirements", "gamify")} />

                  <Flex gap="24px">
                      <Flex width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px" className="gamify-achievement-requirements">
                          <Flex direction="column" gap="12px">
                              <GFLabel type="plainHeading" label={__("Available Hooks", "gamify")} />
                              <GFLabel
                                  type="subtitle"
                                  color="var(--gamify-font-color)"
                                  label={__("To active a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.", "gamify")}
                              />
                          </Flex>

                          <Box p="12px" border="1px solid var(--gamify-border-color)" borderRadius="4px">
                              <GamifyInput label={__("Filter Hooks Type", "gamify")}>
                                  <Select
                                      className="gamify-select"
                                      classNamePrefix="gamify-select"
                                      isMulti
                                      options={hookTypeOptions}
                                      onChange={v => setSelectedFilterHookType(v.map(o => o.value))}
                                  />
                              </GamifyInput>
                          </Box>

                          <DroppableArea id="awards-available">{availableHooks.map(h => renderHookCard(h))}</DroppableArea>
                      </Flex>

                      <Box width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" className="gamify-achievement-requirements">
                          <Flex direction="column" gap="12px">
                              <GFLabel type="plainHeading" label={__("Active Hooks", "gamify")} />
                              <GFLabel
                                  type="subtitle"
                                  color="var(--gamify-font-color)"
                                  label={__("The following hooks are used for all users", "gamify")}
                              />
                          </Flex>

                          <DroppableArea id="awards-sidebar">
                              {activeHooks.map(h => (
                                  <DraggableItem key={h.id} id={h.id}>
                                      <DynamicHookForm key={h.id} hookId={h.id} hookInfo={h} settings={hookSettings[h.id] || {}} onChange={(k, v) => dispatch(updateHookSettings({ hookId: h.id, settings: { [k]: v } }))} isOpen={openedHooks.includes(h.id)} setIsOpen={v => setOpenedHooks(v ? [...openedHooks, h.id] : openedHooks.filter(i => i !== h.id))} />
                                  </DraggableItem>
                              ))}
                          </DroppableArea>
                      </Box>
                  </Flex>
              </Box>
          </DndContext>
      )}
  </Flex>
  );
};

export default FormInner;