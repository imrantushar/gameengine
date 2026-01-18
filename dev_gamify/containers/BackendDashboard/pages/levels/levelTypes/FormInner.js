import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, Flex, Icon, Switch, Image, Input, Center, RadioGroup } from "@chakra-ui/react";
import { __, sprintf } from "@wordpress/i18n";
import Select from "react-select";
import { FaArrowRotateRight, FaGamepad, FaWordpressSimple } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from "@dnd-kit/core";
import GFLabel from "@GFComponents/Labels/GFLabel";
import GamifyEditor from "@GFComponents/editor";
import { commonInput } from "../../../../../../assets/scss/chakra/recipe";
import { AiFillInteraction } from "react-icons/ai";
import { SiWoocommerce } from "react-icons/si";
import { updateHookSettings } from "@GFRedux/Slices/levelsSlice/levelsSlice.js";
import GamifyInput from "@GFComponents/GamifyInput";
import BoxView from "@GFComponents/BoxView/BoxView";
import { GoPlus } from "react-icons/go";
import { useFormikContext } from "formik";
import DynamicHookForm from "./Components/DynamicHookForm";

// --- Helpers ---
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? 0.85 : 1, cursor: "grab", marginBottom: "24px" };
    return <Box ref={setNodeRef} {...listeners} {...attributes} style={style}>{children}</Box>;
};

const DroppableArea = ({ id, children }) => {
    const { setNodeRef } = useDroppable({ id });
    return <Box ref={setNodeRef} minH="150px" height='100%' mt="12px">{children}</Box>;
};

const FormInner = () => {
  const [message, setMessage] = useState("");
  const [openedHooks, setOpenedHooks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [showInput, setShowInput] = useState(false);
  const [newCat, setNewCat] = useState("");

  const { values, setFieldValue } = useFormikContext();

  const { hookSettings, allHooks, availablePointTypes } = useSelector(state => state.levels);

  const handleImageUpload = () => {
    if (typeof wp !== 'undefined' && wp.media) {
        const frame = wp.media({ title: 'Select Level Icon', button: { text: 'Use this Icon' }, multiple: false });
        frame.on('select', () => { setFieldValue('icon', frame.state().get('selection').first().toJSON().url); });
        frame.open();
    }
  };

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
  
  const availableHooks = useMemo(() => {
      const usedHookIds = new Set(
          values.requirements?.map(r => r.trigger_key)
      );

      return allHooks.filter(hook =>
          !usedHookIds.has(hook.id) &&
          (
              selectedFilter.length === 0 ||
              selectedFilter.includes(hook.integrationSlug)
          )
      );
  }, [allHooks, values.requirements, selectedFilter]);


  const activeHooks = useMemo(() => {
      if(values.requirements?.length > 0) {
          return values.requirements?.map(item => allHooks.find(h => h.id === item.trigger_key)).filter(Boolean)
      }
  }, [values?.requirements]);
    
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const draggedId = active.id;
    const requirements = values.requirements || [];

    const exists = requirements.some(
        r => r.trigger_key === draggedId
    );

    if (over.id === "awards-sidebar" && !exists) {
        const hook = allHooks.find(h => h.id === draggedId);
        if (!hook) return;

        const newRequirement = {
            trigger_key: draggedId,
            parameters: Object.fromEntries(
                (hook.schema || []).map(f => [
                    f.key,
                    (hookSettings[draggedId]?.[f.key]) ?? f.default
                ])
            ),
        };

        setFieldValue("requirements", [
            ...requirements,
            newRequirement,
        ]);

        setOpenedHooks([draggedId]);
        return;
    }

    if (over.id === "awards-available" && exists) {
        setFieldValue(
            "requirements",
            requirements.filter(r => r.trigger_key !== draggedId)
        );

        setOpenedHooks(prev => prev.filter(id => id !== draggedId));
        return;
    }
  };

  return (
    <Flex direction="column" gap={6}>
      <Flex gap="12px">
          <GamifyInput label={__("Level Name", "gamify")} width="100%">
              <Input
                  placeholder={__("Enter level name", "gamify")}
                  value={values?.title}
                  onChange={e => {
                      setFieldValue('title',e.target.value);
                  }}
                  {...commonInput}
              />
          </GamifyInput>
      </Flex>

      <Box className="gamify-add-level-type">
          <GFLabel type="title" label={__("Level Type", "gamify")} />
          {console.log({values})}

          {values?.category?.length > 0 && (
              <RadioGroup.Root
                  value={values.category.find(c => c.is_selected)?.value}
                  onValueChange={(item) => {
                  setFieldValue(
                      'category',
                      values.category.map(cat =>
                      cat.value === item.value
                          ? { ...cat, is_selected: true }
                          : { ...cat, is_selected: false }
                      )
                  );
                  }}
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
                  {values.category.map((cat, index) => (
                      <RadioGroup.Item key={index} value={cat.value}>
                      <RadioGroup.ItemHiddenInput />

                      <RadioGroup.ItemIndicator
                          style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "9999px",
                          border: cat.is_selected
                              ? "1px solid #007AFF"
                              : "1px solid #ccc",
                          backgroundColor: cat.is_selected
                              ? "#007AFF"
                              : "transparent",
                          }}
                      />

                      <RadioGroup.ItemText>
                          {sprintf(__('%s', 'gemboards'), cat.label)}
                      </RadioGroup.ItemText>
                      </RadioGroup.Item>
                  ))}
                  </Flex>
              </RadioGroup.Root>
            )}

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
                        setFieldValue('category', [...values.category, {label: newCat, value: newCat, is_selected: false}])
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

      <Box>
          <GFLabel margin='0 0 12px 0' type="inputLabel" label={__(`Congratulations Message:`, "gamify")} />
          <GamifyEditor 
                name={'congratulations_message'} 
                defaultValue={values.congratulations_message} 
                saveValueHandler={setFieldValue}
                suffix={'levels-message'}
            />
      </Box>

      <GFLabel type="heading" margin="0" label={__(`Level Requirements`, "gamify")} />

      <Switch.Root
          checked={values.unlock_with_points_enabled}
          onCheckedChange={e => {
              setFieldValue('unlock_with_points_enabled', e.checked)
          }}
          colorPalette="blue"
      >
        <Switch.HiddenInput />
        <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gamify")}</Switch.Label>
        <Switch.Control />
      </Switch.Root>

      {values?.unlock_with_points_enabled ? (
          <Flex gap="12px">
              <GamifyInput label={__("Minimum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                  <Input
                      placeholder={__("Enter minimum balance", "gamify")}
                      value={values.min_points}
                      type="number"
                      onChange={e => setFieldValue('min_oints', e.target.value)}
                      {...commonInput}
                  />
              </GamifyInput>

              <GamifyInput label={__("Maximum Balance", "gamify")} width="calc((100% / 3) - 6px)">
                  <Input
                      placeholder={__("Enter maximum balance", "gamify")}
                      value={values.min_points}
                      type="number"
                      onChange={e => setFieldValue('min_oints', e.target.value)}
                      {...commonInput}
                  />
              </GamifyInput>

              <GamifyInput label={__("Choose the Points Type", "gamify")} width="calc((100% / 3) - 6px)">
                  <Select
                      className="gamify-select"
                      classNamePrefix="gamify-select"
                      placeholder="Choose one"
                      options={availablePointTypes} 
                      value={availablePointTypes?.find(opt => opt.value == values.point_type_id)} 
                      onChange={sel => setFieldValue('point_type_id', sel.value)}
                  />
              </GamifyInput>
          </Flex>
      ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <Box p="24px" border="1px solid var(--gamify-border-color)" borderRadius="4px" className="gamify-level-requirements">
                  <GFLabel type="plainHeading" label={__("Level Requirements", "gamify")} />

                  <Flex gap="24px">
                      <Flex width="50%" p="24px 24px 0 24px" borderRadius="4px" boxShadow="var(--gamify-shadow)" direction="column" gap="24px" className="gamify-level-requirements">
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
                                      isMulti
                                      placeholder={__("Filter...", "gamify")}
                                      options={Object.keys(hookCategoryIconMap).map(k => ({ label: k, value: k }))}
                                      onChange={v => setSelectedFilter(v.map(o => o.value))}
                                      className="gamify-select"
                                      classNamePrefix="gamify-select"
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
                              {activeHooks?.map(h => (
                                  <DynamicHookForm
                                    key={h.id} 
                                    hookId={h.id} 
                                    hookInfo={h} 
                                    settings={hookSettings[h.id] || {}} 
                                    onChange={(k, v) => dispatch(updateHookSettings({ hookId: h.id, settings: { [k]: v } }))} 
                                  />
                              ))}
                          </DroppableArea>
                      </Box>
                  </Flex>
              </Box>
          </DndContext>
      )}

      <BoxView title={__(`Levels Logo`, "gamify")} width="100%">
          {values?.icon ? (
              <Flex alignItems="center" justifyContent="space-between">
                  <Image src={values?.icon} width="100px" objectFit="cover" />
                  <Button
                      bg="var(--gamify-primary)"
                      color="#fff"
                      fontSize="12px"
                      fontWeight="500"
                      lineHeight="16px"
                      p="6px 8px"
                      height="auto"
                      variant="ghost"
                      onClick={handleImageUpload}
                  >
                      {__("Change Level Logo", "gamify")}
                  </Button>
              </Flex>
          ) : (
              <Button
                  bg="var(--gamify-primary)"
                  color="#fff"
                  fontSize="12px"
                  fontWeight="500"
                  lineHeight="16px"
                  p="6px 8px"
                  height="auto"
                  variant="ghost"
                  onClick={handleImageUpload}
              >
                  {__("Set Level Logo", "gamify")}
              </Button>
          )}
      </BoxView>
    </Flex>
  );
};

export default FormInner;