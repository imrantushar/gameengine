import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Icon, Switch, } from "@GFComponents/UI";
import { __, } from "@wordpress/i18n";
import Select from "react-select";
import { FaWordpressSimple, FaGraduationCap, FaGamepad } from "react-icons/fa6";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import GFLabel from "@GFComponents/Labels/GFLabel";
import GameEngineEditor from "@GFComponents/editor";
import { clearBtn, commonInput } from "../../../../../../assets/scss/chakra/recipe";
import { SiWoocommerce } from "react-icons/si";
import GameEngineInput from "@GFComponents/GameEngineInput";
import BoxView from "@GFComponents/BoxView/BoxView";
import { useFormikContext } from "formik";
import { admin_url, API, getAddonActiveStatus, namespace } from "@GFUtils/helper";
import Requirements from "@GFComponents/Requirements";
import { DraggableItem } from "@GFComponents/Requirements/helper";
import { arrowForward } from "@GFUtils/icons";
import { LuExternalLink } from "react-icons/lu";
import { Link } from "react-router-dom";

const FormInner = () => {
  const [message, setMessage] = useState("");
  const [levels, setLevels] = useState(true);
  const [openedHooks, setOpenedHooks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }));
  const [showInput, setShowInput] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [levelTypesLoading, setLevelTypesLoading] = useState(false);
  const [levelTypesData, setLevelTypesData] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [levelsData, setLevelsData] = useState([]);
  const [selectedFilterHookType, setSelectedFilterHookType] = useState('all');
  const [types, setTypes] = useState([]);
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const addons = useSelector(state => state.addons);
  const isRestrictContentActive = getAddonActiveStatus(addons, 'restrict_unlock');
  const isWoocommerceActive = getAddonActiveStatus(addons, 'woocommerce');
  const isAcademyActive = getAddonActiveStatus(addons, 'academylms');
  const isTutorLmsActive = getAddonActiveStatus(addons, 'tutorlms');

  const wooIcon = isWoocommerceActive ? {
    woocommerce: {
      icon: SiWoocommerce,
      bg: "#96588a"
    }
  } : {};

  const academy = isAcademyActive ? {
    academylms: {
      icon: FaGraduationCap,
      bg: "#7b68ee"
    }
  } : {};

  const tutorIcon = isTutorLmsActive ? {
    tutorlms: {
      icon: FaGraduationCap,
      bg: "#10b981"
    }
  } : {};

  const fetchAchievements = async key => {
    try {
      setLevelTypesLoading(true);
      let url = namespace + 'achievements';
      if (key) url += "?search=" + key;
      const response = await API.get(url);
      const achievements = response.data?.map(item => {
        return {
          label: item.title,
          value: item.id
        };
      });
      setLevelTypesData(achievements);
    } catch (error) {
      console.warn({
        error
      });
    } finally {
      setLevelTypesLoading(false);
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

  const fetchTypes = async (searchKey = "") => {
    if (searchKey) searchKey = "&search=" + searchKey;
    try {
      const url = namespace + 'taxonomies/level_type?page=1&per_page=100' + searchKey;
      const response = await API.get(url);
      const selectData = response.data.map(item => {
        return {
          label: item.name,
          value: `${item.id}`
        };
      });
      setTypes(selectData);
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    if (isRestrictContentActive) {
      if (levelTypesData.length === 0) {
        fetchAchievements();
      }
      if (levelsData.length === 0) {
        fetchLevels();
      }
    }
    fetchTypes();
  }, [isRestrictContentActive]);

  const { hookSettings, allHooks, availablePointTypes } = useSelector(state => state.levels);

  const handleImageUpload = () => {
    if (typeof wp !== 'undefined' && wp.media) {
      const frame = wp.media({
        title: 'Select Level Icon',
        button: {
          text: 'Use this Icon'
        },
        multiple: false
      });
      frame.on('select', () => {
        setFieldValue('icon', frame.state().get('selection').first().toJSON().url);
      });
      frame.open();
    }
  };

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

  const renderHookCard = item => {
    const slug = item.integrationSlug || 'wordpress';
    const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;

    return (
      <DraggableItem key={item.id} id={item.id}>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center rounded [border:1px_solid_var(--gameengine-border-color)]" style={{
            "padding": "10px 16px"
          }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full w-6 h-6 text-white" style={{
                "background": config.bg
              }}>
                {config?.icon}
              </div>
              <GFLabel type="title" fontWeight="400" label={item?.label} />
            </div>

            <div className="items-center justify-center rounded-full w-6 h-6 flex text-white" style={{
              "background": "#0CDC01"
            }}>
              {arrowForward()}
            </div>
          </div>

          <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
        </div>
      </DraggableItem>
    );
  };

  const activeHooks = useMemo(() => {
    if (values.requirements?.length > 0) {
      return values.requirements?.map(item => allHooks.find(h => h.id === item.trigger_key)).filter(Boolean);
    }
  }, [values?.requirements]);

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const draggedId = active.id;
    const requirements = values.requirements || [];
    const exists = requirements.some(r => r.trigger_key === draggedId);

    if (over.id === "awards-sidebar" && !exists) {
      const hook = allHooks.find(h => h.id === draggedId);
      if (!hook) return;
      const newRequirement = {
        trigger_key: draggedId,
        parameters: Object.fromEntries((hook.schema || []).map(f => [f.key, hookSettings[draggedId]?.[f.key] ?? f.default]))
      };
      setFieldValue("requirements", [...requirements, newRequirement]);
      setOpenedHooks([draggedId]);
      return;
    }

    if (over.id === "awards-available" && exists) {
      setFieldValue("requirements", requirements.filter(r => r.trigger_key !== draggedId));
      setOpenedHooks(prev => prev.filter(id => id !== draggedId));
      return;
    }
  };

  const reqLabel = `${__("Enable Require Unlock", "gameengine")}${!isRestrictContentActive ? " " + __('(Restrict Unlock Addon Required)', 'gameengine') : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="gameengine-add-level-type flex gap-3">
        <GameEngineInput label={__("Level Name", "gameengine")} width="calc(50% - 6px)">
          <input
            className="gameengine-input"
            placeholder={__("Enter level name", "gameengine")}
            value={values?.title}
            onChange={e => {
              setFieldValue('title', e.target.value);
            }}
          />
        </GameEngineInput>

        <GameEngineInput label={__("Level Type", "gameengine")} width="calc(50% - 6px)" desc={__("Select your created types for Level.", "gameengine")}>
          <Select
            className="gameengine-select gameengine-select--width-full"
            classNamePrefix="gameengine-select" options={types}
            onInputChange={inputValue => {
              fetchTypes(inputValue);
              return inputValue;
            }}
            value={types?.find(opt => Number(opt.value) === Number(values?.category_id)) || null}
            onMenuOpen={fetchTypes}
            onChange={option => {
              setFieldValue('category_id', option.value);
            }}
            menuPlacement="bottom"
          />
        </GameEngineInput>
      </div>

      <GameEngineInput label={__("Benefits Description", "gameengine")} width="100%">
        <GameEngineEditor name={'description'} defaultValue={values.description} saveValueHandler={setFieldValue} suffix={'levels-benefits'} />
      </GameEngineInput>

      <GameEngineInput label={__("Congratulations Message", "gameengine")} width="100%">
        <GameEngineEditor name={'congratulations_message'} defaultValue={values.congratulations_message} saveValueHandler={setFieldValue} suffix={'levels-message'} />
      </GameEngineInput>

      <GFLabel type="heading" margin="0" label={__(`Level Requirements`, "gameengine")} />

      <GameEngineInput label={reqLabel} width="100%" direction='row' gap="10px" alignItems='center'>
        <div className="flex items-center gap-2">
          <Switch.Root
            checked={values.is_restricted}
            onCheckedChange={e => {
              setFieldValue('is_restricted', e.checked);
            }}
            colorPalette="blue"
            disabled={!isRestrictContentActive}
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>

          {!isRestrictContentActive && (
            <Link to={admin_url + 'admin.php?page=gameengine-addons'} target='_blank'>
              <LuExternalLink size="20px" />
            </Link>
          )}
        </div>
      </GameEngineInput>

      {values?.is_restricted && isRestrictContentActive && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <GameEngineInput label={__("Required Achievements", "gameengine")} width="calc(50% - 6px)">
              <Select
                className="gameengine-select"
                classNamePrefix="gameengine-select"
                options={levelTypesData}
                onInputChange={inputValue => {
                  fetchAchievements(inputValue);
                  return inputValue;
                }}
                value={levelTypesData?.find(opt => Number(opt.value) === Number(values?.required_achievement_id)) || null}
                isLoading={levelTypesLoading}
                onChange={option => {
                  setFieldValue('required_achievement_id', option?.value || null);
                }}
                menuPlacement="bottom"
              />
            </GameEngineInput>

            <GameEngineInput label={__("Required Levels", "gameengine")} width="calc(50% - 6px)">
              <Select
                className="gameengine-select"
                classNamePrefix="gameengine-select"
                options={levelsData}
                onInputChange={inputValue => {
                  fetchLevels(inputValue);
                  return inputValue;
                }}
                value={levelsData?.find(opt => Number(opt.value) === Number(values?.required_level_id)) || null}
                isLoading={levelsLoading}
                onChange={option => {
                  setFieldValue('required_level_id', option.value);
                }}
                menuPlacement="bottom"
              />
            </GameEngineInput>
          </div>

          <GameEngineInput label={__("Restriction Message", "gameengine")}>
            <input
              className="gameengine-input"
              placeholder={__("Restriction message", "gameengine")}
              type="textarea"
              value={values.restriction_message}
              onChange={e => {
                setFieldValue('restriction_message', e.target.value);
              }}
              isLoading={levelTypesLoading}
              menuPlacement="bottom"
            />
          </GameEngineInput>
        </div>
      )}

      <BoxView title={__(`Levels Logo`, "gameengine")} width="100%">
        {values?.icon ? (
          <div className="flex items-center justify-between">
            <img style={{
              "width": "100px"
            }} src={values?.icon} objectFit="cover" />
            <button className="text-white text-xs font-medium leading-4 h-auto bg-[var(--gameengine-primary)]" style={{
              "padding": "6px 8px"
            }} onClick={handleImageUpload}>
              {__("Change Level Logo", "gameengine")}
            </button>
          </div>
        ) : (
          <button className="text-white text-xs font-medium leading-4 h-auto bg-[var(--gameengine-primary)]" style={{
            "padding": "6px 8px"
          }} onClick={handleImageUpload}>
            {__("Set Level Logo", "gameengine")}
          </button>
        )}
      </BoxView>

      <Switch.Root checked={values.unlock_with_points_enabled} onCheckedChange={e => {
        setFieldValue('unlock_with_points_enabled', e.checked);
      }} colorPalette="blue">
        <Switch.HiddenInput />
        <Switch.Label fontSize="14px" fontWeight="500" lineHeight="20px">{__("Allow unlock with points", "gameengine")}</Switch.Label>
        <Switch.Control />
      </Switch.Root>

      {values?.unlock_with_points_enabled ? (
        <div className="flex gap-3">
          <GameEngineInput label={__("Minimum Balance", "gameengine")} width="calc((100% / 3) - 6px)">
            <input className="gameengine-input" placeholder={__("Enter minimum balance", "gameengine")} value={values.min_points} type="number" onChange={e => setFieldValue('min_points', e.target.value)} />
          </GameEngineInput>

          <GameEngineInput label={__("Maximum Balance", "gameengine")} width="calc((100% / 3) - 6px)">
            <input className="gameengine-input" placeholder={__("Enter maximum balance", "gameengine")} value={values.max_points} type="number" onChange={e => setFieldValue('max_points', e.target.value)} />
          </GameEngineInput>

          <GameEngineInput label={__("Choose the Points Type", "gameengine")} width="calc((100% / 3) - 6px)">
            <Select className="gameengine-select" classNamePrefix="gameengine-select" placeholder="Choose one" options={availablePointTypes} value={availablePointTypes?.find(opt => opt.value == values.point_type_id)} onChange={sel => setFieldValue('point_type_id', sel.value)} menuPlacement="top" />
          </GameEngineInput>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <Requirements
            label={__("Level Requirements", "gameengine")}
            onClick={e => {
              e.stopPropagation();
              setLevels(!levels);
            }}
            open={levels}
            parent="gameengine-level-requirements"
            child="gameengine-level-requirements-wrap"
            childLeft="gameengine-level-requirements-available-hooks"
            childRight="gameengine-level-requirements-active-hooks"
            hookTypeOptions={Object.keys(hookCategoryIconMap).map(k => ({
              label: k,
              value: k
            }))}
            filterHookType={v => setSelectedFilterHookType(v)}
            renderHookCard={renderHookCard}
            selectedHookIds={activeHooks?.map(h => h?.id)}
            openHookType={openedHooks}
            setOpenHookType={setOpenedHooks}
            allHooks={allHooks}
            hookSettings={hookSettings}
            actionName="award"
            selectedFilterType={selectedFilterHookType}
            scope="level"
          />
        </DndContext>
      )}
    </div>
  );
};

export default FormInner;
