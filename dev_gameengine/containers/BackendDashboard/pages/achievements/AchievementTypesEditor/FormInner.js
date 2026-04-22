import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Icon, Switch, RadioGroup } from "@GFUtils/ui";
import { __, sprintf } from "@wordpress/i18n";
import GFLabel from "@GFComponents/Labels/GFLabel";
import Select from "react-select";
import { FaWordpressSimple, FaGraduationCap, FaGamepad } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import GameEngineEditor from "@GFComponents/editor";
import { SiWoocommerce } from "react-icons/si";
import { GoPlus } from "react-icons/go";
import { clearBtn, commonInput } from "../../../../../../assets/scss/chakra/recipe";
import GameEngineInput from "@GFComponents/GameEngineInput";
import { useFormikContext } from "formik";
import { admin_url, API, getAddonActiveStatus, namespace } from "@GFUtils/helper";
import Requirements from "@GFComponents/Requirements";
import { DraggableItem } from "@GFComponents/Requirements/helper";
import { arrowForward } from "@GFUtils/icons";
import { TbExternalLink } from "react-icons/tb";
const FormInner = () => {
  const [achievements, setAchievements] = useState(true);
  const [openedHooks, setOpenedHooks] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }));
  const [showInput, setShowInput] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [selectedFilterHookType, setSelectedFilterHookType] = useState("all");
  const [message, setMessage] = useState("");
  const [achievementTypes, setAchievementTypes] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsData, setAchievementsData] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [levelsData, setLevelsData] = useState([]);
  const addons = useSelector(state => state.addons);
  const {
    availablePointTypes
  } = useSelector(state => state.achievements);
  const isRestrictContentActive = getAddonActiveStatus(addons, 'restrict_unlock');
  const isWoocommerceActive = getAddonActiveStatus(addons, 'woocommerce');
  const isAcademyActive = getAddonActiveStatus(addons, 'academylms');
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const fetchAchievements = async key => {
    try {
      setAchievementsLoading(true);
      let url = namespace + 'achievements';
      if (key) url += "?search=" + key;
      const response = await API.get(url);
      const achievements = response.data?.map(item => {
        return {
          label: item.title,
          value: item.id
        };
      });
      setAchievementsData(achievements);
    } catch (error) {
      console.warn({
        error
      });
    } finally {
      setAchievementsLoading(false);
    }
  };
  const fetchAcheivementTypes = async (searchKey = "") => {
    if (searchKey) searchKey = "&search=" + searchKey;
    try {
      const url = namespace + 'taxonomies/achievement_type?page=1&per_page=100' + searchKey;
      const response = await API.get(url);
      const selectData = response.data.map(item => {
        return {
          label: item.name,
          value: `${item.id}`
        };
      });
      setAchievementTypes(selectData);
    } catch (error) {
      console.warn(error);
    }
  };
  const fetchLevels = async key => {
    try {
      setLevelsLoading(true);
      let url = namespace + 'levels';
      if (key) url += "?search=" + key;
      const response = await API.get(url);
      const levels = response.data.map(item => {
        return {
          label: item.title,
          value: item.id
        };
      });
      setLevelsData(levels);
    } catch (error) {
      console.warn({
        error
      });
    } finally {
      setLevelsLoading(false);
    }
  };
  useEffect(() => {
    if (isRestrictContentActive) {
      if (achievementsData.length === 0) {
        fetchAchievements();
      }
      if (levelsData.length === 0) {
        fetchLevels();
      }
    }
    fetchAcheivementTypes();
  }, [isRestrictContentActive]);
  const {
    allHooks,
    hookSettings,
    congratulationsMessage
  } = useSelector(state => state.achievements);
  const wooIcon = isWoocommerceActive ? {
    woocommerce: {
      icon: SiWoocommerce,
      bg: "#96588a"
    }
  } : {};
  const academy = isAcademyActive ? {
    academylms: {
      icon: SiWoocommerce,
      bg: "#7b68ee"
    }
  } : {};
  const hookCategoryIconMap = {
    wordpress: {
      icon: FaWordpressSimple,
      bg: "#21759b"
    },
    ...wooIcon,
    ...academy,
    gameengine: {
      icon: FaGamepad,
      bg: "#006BFF"
    },
    tutorlms: {
      icon: FaGraduationCap,
      bg: "#10b981"
    }
  };
  const renderHookCard = (item, type) => {
    const slug = item.integrationSlug || 'wordpress';
    const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
    return <DraggableItem key={`${type}_${item.id}`} id={`${type}_${item.id}`}>
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center rounded [border:1px_solid_var(--gameengine-border-color)]" style={{
          "padding": "10px 16px"
        }}>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-full w-6 h-6 text-white" style={{
              "background": config.bg
            }}>
                                <Icon as={config.icon} boxSize={3} />
                            </div>
                            <GFLabel type="title" fontWeight="400" label={item?.label} />
                        </div>

                        <div className="items-center justify-center rounded-full w-6 h-6 flex text-white" style={{
            "background": "#0CDC01"
          }}>
                            <Icon as={arrowForward} />
                        </div>
                    </div>

                    <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
                </div>
            </DraggableItem>;
  };
  useEffect(() => {
    if (congratulationsMessage) setMessage(congratulationsMessage);
  }, [congratulationsMessage]);
  const activeHooks = useMemo(() => {
    if (values?.requirements?.length > 0) {
      return values?.requirements.filter(item => item?.action_type === "award")?.map(item => allHooks.find(h => h.id === item.trigger_key)).filter(Boolean);
    }
    return [];
  }, [values?.requirements, allHooks]);
  const handleDragEnd = ({
    active,
    over
  }) => {
    if (!over) return;
    const draggedId = active.id;
    const requirements = values.requirements || [];
    if (draggedId.startsWith("award_")) {
      const pureId = draggedId.replace("award_", "");
      const exists = requirements.some(r => r.trigger_key === pureId && r.action_type === "award");
      if (over.id === "awards-sidebar" && !exists) {
        const hook = allHooks.find(h => h.id === pureId);
        if (!hook) return;
        const newRequirement = {
          trigger_key: pureId,
          action_type: "award",
          parameters: Object.fromEntries((hook.schema || []).map(f => [f.key, hookSettings[`award_${pureId}`]?.[f.key] ?? f.default]))
        };
        setFieldValue("requirements", [...requirements, newRequirement]);
        setOpenedHooks([pureId]);
        return;
      }
      if (over.id === "awards-available" && exists) {
        setFieldValue("requirements", requirements.filter(r => !(r.trigger_key === pureId && r.action_type === "award")));
        setOpenedHooks(prev => prev.filter(id => id !== pureId));
        return;
      }
    }
  };
  const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    value: slug
  }));
  const requireLabel = `${__("Enable Require Unlock", "gameengine")}${!isRestrictContentActive ? " " + __('(Restrict Unlock Addon Required)', 'gameengine') : ""}`;
  return <div className="flex flex-col gap-6">
            <div className="flex gap-3">
                <GameEngineInput label={__("Achievement Name", "gameengine")}>
                    <input placeholder={__("Enter point name", "gameengine")} value={values.title} onChange={e => {
          const value = e.target.value;
          setFieldValue('title', value);
          setFieldValue('plural_name', `${value}s`);
        }} {...commonInput} />
                </GameEngineInput>
            </div>

            <div className="gameengine-add-achievement-type flex gap-3">
                <GameEngineInput label={__("Maximum earnings per user", "gameengine")} desc={__("Number of times a user can earn this badge (0 = unlimited).", "gameengine")} width="calc(50% - 6px)">
                    <input placeholder={__("Maximum Earnings Per User:", "gameengine")} type="number" value={values.max_earnings_per_user} onChange={e => {
          setFieldValue('max_earnings_per_user', e.target.value);
        }} {...commonInput} />
                </GameEngineInput>
                <GameEngineInput label={__("Achivement Type", "gameengine")} width="calc(50% - 6px)" desc={__("Select your created types for achivement.", "gameengine")}>
                    <Select className="gameengine-select gameengine-select--width-full" classNamePrefix="gameengine-select" options={achievementTypes} onInputChange={inputValue => {
          fetchAcheivementTypes(inputValue);
          return inputValue;
        }} value={achievementTypes?.find(opt => Number(opt.value) === Number(values?.category_id)) || null} onMenuOpen={fetchAcheivementTypes} onChange={option => {
          setFieldValue('category_id', option.value);
        }} menuPlacement="bottom" />
                </GameEngineInput>
            </div>

            <GameEngineInput label={__("Congratulations Message", "gameengine")}>
                <GameEngineEditor name={'congratulations_message'} defaultValue={values.congratulations_message} saveValueHandler={setFieldValue} suffix={'acivements-message'} />
            </GameEngineInput>

            <GameEngineInput label={requireLabel} width="100%" direction='row' gap={isRestrictContentActive ? "16px" : "4px"} alignItems='center'>
                {isRestrictContentActive ? <Switch.Root checked={values.is_restricted} onCheckedChange={e => {
        setFieldValue('is_restricted', e.checked);
      }} colorPalette="blue" disabled={!isRestrictContentActive}>
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root> : <div className="flex items-center gap-4">
                        <button className="h-auto p-0 bg-transparent" style={{
          "minWidth": "auto"
        }} as={'a'} href={admin_url + 'admin.php?page=gameengine-achievements&action=new'} target='_blank' type="link">
                            <Icon as={TbExternalLink} width={'20px'} />
                        </button>

                        <Switch.Root checked={values.is_restricted} onCheckedChange={e => {
          setFieldValue('is_restricted', e.checked);
        }} colorPalette="blue" disabled={!isRestrictContentActive}>
                            <Switch.HiddenInput />
                            <Switch.Control />
                        </Switch.Root>
                    </div>}
            </GameEngineInput>

            {values?.is_restricted && isRestrictContentActive && <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <GameEngineInput label={__("Required Achievements", "gameengine")} width="calc(50% - 6px)">
                            <Select className="gameengine-select" classNamePrefix="gameengine-select" options={achievementsData} onInputChange={inputValue => {
            fetchAchievements(inputValue);
            return inputValue;
          }} value={achievementsData?.find(opt => Number(opt.value) === Number(values?.required_achievement_id)) || null} isLoading={achievementsLoading} onChange={option => {
            setFieldValue('required_achievement_id', option?.value || null);
          }} menuPlacement="bottom" />
                        </GameEngineInput>
                        <GameEngineInput label={__("Required Levels", "gameengine")} width="calc(50% - 6px)">
                            <Select className="gameengine-select" classNamePrefix="gameengine-select" options={levelsData} onInputChange={inputValue => {
            fetchLevels(inputValue);
            return inputValue;
          }} value={levelsData?.find(opt => Number(opt.value) === Number(values?.required_level_id)) || null} isLoading={levelsLoading} onChange={option => {
            setFieldValue('required_level_id', option.value);
          }} menuPlacement="bottom" />
                        </GameEngineInput>
                    </div>
                    <GameEngineInput label={__("Restriction Message", "gameengine")}>
                        <input placeholder={__("Restriction message", "gameengine")} type="textarea" value={values.restriction_message} onChange={e => {
          setFieldValue('restriction_message', e.target.value);
        }} {...commonInput} />
                    </GameEngineInput>
                </div>}

            <Switch.Root checked={values.unlock_with_points_enabled} onCheckedChange={e => {
      setFieldValue('unlock_with_points_enabled', e.checked);
    }} colorPalette="blue">
                <Switch.HiddenInput />
                <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gameengine")}</Switch.Label>
                <Switch.Control />
            </Switch.Root>

            {values?.unlock_with_points_enabled ? <div className="gameengine-allow-unlock-point flex gap-3">
                    <GameEngineInput label={__("Points", "gameengine")} width="calc(50% - 6px)">
                        <input placeholder={__("Enter point", "gameengine")} type="number" value={values.required_points_amount} onChange={e => {
          setFieldValue('required_points_amount', e.target.value);
        }} {...commonInput} />
                    </GameEngineInput>

                    <GameEngineInput label={__("Choose the Points Type", "gameengine")} width="calc(50% - 6px)">
                        <Select className="gameengine-select" classNamePrefix="gameengine-select" options={availablePointTypes} value={availablePointTypes.length > 0 && availablePointTypes.find(opt => Number(opt.value) === Number(values?.required_point_type_id))} onChange={option => {
          setFieldValue('required_point_type_id', option.value);
        }} menuPlacement="top" />
                    </GameEngineInput>
                </div> : <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <Requirements label={__("Achievement Requirements", "gameengine")} onClick={e => {
        e.stopPropagation();
        setAchievements(!achievements);
      }} open={achievements} parent="gameengine-achievement-requirements" child="gameengine-achievement-requirements-wrap" childLeft="gameengine-achievement-requirements-available-hooks" childRight="gameengine-achievement-requirements-active-hooks" hookTypeOptions={hookTypeOptions} filterHookType={v => setSelectedFilterHookType(v)} renderHookCard={renderHookCard} selectedHookIds={activeHooks?.map(h => h?.id)} openHookType={openedHooks} setOpenHookType={setOpenedHooks} allHooks={allHooks} hookSettings={hookSettings} actionName="award" selectedFilterType={selectedFilterHookType} scope="achievement" />
                </DndContext>}
        </div>;
};
export default FormInner;