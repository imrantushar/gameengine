import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@GFComponents/UI';
import { __ } from '@wordpress/i18n';
import { FaWordpressSimple, FaGraduationCap, FaGamepad } from 'react-icons/fa6';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { SiWoocommerce } from "react-icons/si";
import { useFormikContext } from 'formik';
import GameEngineInput from '@GFComponents/GameEngineInput';
import { commonInput } from '../../../../../../assets/scss/chakra/recipe';
import RequirementsLoader from '@GFComponents/GameEngineLoader/RequirementsLoader';
import Requirements from '@GFComponents/Requirements';
import { DraggableItem } from '@GFComponents/Requirements/helper';
import { arrowForward } from '@GFUtils/icons';
import { getAddonActiveStatus } from '@GFUtils/helper';
const FormInner = ({
  hooksLoading
}) => {
  const {
    values,
    setFieldValue
  } = useFormikContext();
  const [pointAwards, setPointAwards] = useState(true);
  const [pointDeductions, setPointDeductions] = useState(false);
  const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
  const [openedDeductHooks, setOpenedDeductHooks] = useState('all');
  const [selectedFilterHookType, setSelectedFilterHookType] = useState('all');
  const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);
  const addons = useSelector(state => state.addons);
  const isWoocommerceActive = getAddonActiveStatus(addons, 'woocommerce');
  const isAcademyActive = getAddonActiveStatus(addons, 'academylms');
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
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }));
  const {
    allHooks,
    hookSettings
  } = useSelector(state => state.pointType);
  const selectedAwardHookIds = useMemo(() => {
    if (values?.requirements?.length > 0) {
      return values?.requirements.map(item => item?.action_type === 'award' && item?.trigger_key);
    }
  }, [values?.requirements]);
  const selectedDeductHookIds = useMemo(() => {
    if (values?.requirements?.length > 0) {
      return values?.requirements.map(item => item?.action_type === 'deduct' && item?.trigger_key);
    }
  }, [values?.requirements]);
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
  const getParamsFromSchema = (hook, type) => {
    const settings = hookSettings[`${type}_${hook.id}`] || {};
    const params = {};
    (hook.schema || []).forEach(f => {
      params[f.key] = settings[f.key] ?? f.default;
    });
    return params;
  };
  const handleDragEnd = ({
    active,
    over
  }) => {
    if (!over) return;
    const draggedId = active.id;
    const requirements = values?.requirements;

    // AWARD
    if (draggedId.startsWith("award_")) {
      const pureId = draggedId.replace("award_", "");
      const exists = requirements.some(r => r.trigger_key === pureId && r.action_type === "award");
      if (over.id === "awards-sidebar") {
        if (exists) return;
        const hook = allHooks.find(h => h.id === pureId);
        if (!hook) return;
        const newHook = {
          trigger_key: hook.id,
          action_type: "award",
          parameters: getParamsFromSchema(hook, "award")
        };
        setFieldValue("requirements", [...requirements, newHook]);
        setOpenedAwardHooks([pureId]);
        return;
      }
      if (over.id === "awards-available") {
        if (!exists) return;
        setFieldValue("requirements", requirements.filter(r => !(r.trigger_key === pureId && r.action_type === "award")));
        return;
      }
    }

    // DEDUCT
    if (draggedId.startsWith("deduct_")) {
      const pureId = draggedId.replace("deduct_", "");
      const exists = requirements.some(r => r.trigger_key === pureId && r.action_type === "deduct");
      if (over.id === "deducts-sidebar") {
        if (exists) return;
        const hook = allHooks.find(h => h.id === pureId);
        if (!hook) return;
        const newHook = {
          trigger_key: hook.id,
          action_type: "deduct",
          parameters: getParamsFromSchema(hook, "deduct")
        };
        setFieldValue("requirements", [...requirements, newHook]);
        return;
      }
      if (over.id === "deducts-available") {
        if (!exists) return;
        setFieldValue("requirements", requirements.filter(r => !(r.trigger_key === pureId && r.action_type === "deduct")));
        return;
      }
    }
  };
  const renderHookCard = (item, type) => {
    const slug = item?.integrationSlug || item?.category || 'wordpress';
    const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;
    return <DraggableItem key={`${type}_${item?.id}`} id={`${type}_${item?.id}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center rounded [border:1px_solid_var(--gameengine-border-color)]" style={{
          "padding": "10px 16px"
        }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full w-6 h-6 text-white" style={{
              "background": config.bg
            }}>
              <Icon as={config.icon} boxSize={3} color={'#fff'} />
            </div>
            <GFLabel type="title" fontWeight="400" label={item?.label} />
          </div>

          <div className="items-center justify-center rounded-full w-6 h-6 flex text-white" style={{
            "background": type === 'award' ? "#0CDC01" : "#FF3E2F"
          }}>
            <Icon as={arrowForward} />
          </div>
        </div>

        <GFLabel type="subtitle" color="#A2ADB9" label={item?.description} />
      </div>
    </DraggableItem>;
  };
  const hookTypeOptions = Object.keys(hookCategoryIconMap).map(slug => ({
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
    value: slug
  }));
  return <>
    <div className="flex gap-3">
      <GameEngineInput label={__("Point Name", "gameengine")}>
        <input className='gameengine-input' placeholder={__("Enter point name", "gameengine")} value={values?.name} onChange={e => {
          const value = e.target.value;
          setFieldValue('name', value);
        }} {...commonInput} />
      </GameEngineInput>
    </div>

    {hooksLoading ? <RequirementsLoader /> : <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Requirements label={__("Automatic Point Awards", "gameengine")} onClick={e => {
        e.stopPropagation();
        setPointAwards(!pointAwards);
      }} open={pointAwards} parent="gameengine-points-automatic-point-awards" child="gameengine-points-automatic-point-awards-wrap" childLeft="gameengine-points-automatic-point-awards-available-hooks" childRight="gameengine-points-automatic-point-awards-active-hooks" hookTypeOptions={hookTypeOptions} filterHookType={checkedItem => {
        setSelectedFilterHookType(checkedItem);
      }} renderHookCard={renderHookCard} allHooks={allHooks} hookSettings={hookSettings} openHookType={openedAwardHooks} setOpenHookType={setOpenedAwardHooks} selectedHookIds={selectedAwardHookIds} actionName="award" selectedFilterType={selectedFilterHookType} scope="point_type" />

      <Requirements label={__("Automatic Point Deductions", "gameengine")} onClick={e => {
        e.stopPropagation();
        setPointDeductions(!pointDeductions);
      }} open={pointDeductions} parent="gameengine-points-automatic-point-deductions" child="gameengine-points-automatic-point-deductions-wrap" childLeft="gameengine-points-automatic-point-deductions-available-hooks" childRight="gameengine-points-automatic-point-deductions-active-hooks" hookTypeOptions={hookTypeOptions} filterHookType={checkedItem => {
        setSelectedDeductFilterType(checkedItem);
      }} renderHookCard={renderHookCard} allHooks={allHooks} hookSettings={hookSettings} openHookType={openedDeductHooks} setOpenHookType={setOpenedDeductHooks} selectedHookIds={selectedDeductHookIds} actionName="deduct" selectedFilterType={selectedDeductFilterType} scope="point_type" />
    </DndContext>}
  </>;
};
export default FormInner;