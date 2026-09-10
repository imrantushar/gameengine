import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { __ } from '@wordpress/i18n';
import { FaWordpressSimple, FaGraduationCap, FaGamepad } from 'react-icons/fa6';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { SiWoocommerce } from "react-icons/si";
import { useFormikContext } from 'formik';
import GameEngineInput from '@GFComponents/GameEngineInput';
import RequirementsLoader from '@GFComponents/GameEngineLoader/RequirementsLoader';
import Requirements from '@GFComponents/Requirements';
import { DraggableItem } from '@GFComponents/Requirements/helper';
import DragPreview from '@GFComponents/Requirements/DragPreview';
import { hookCollisionDetection, insertAt } from '@GFComponents/Requirements/helper';
import { arrowForward } from '@GFUtils/icons';
import { integrationLabel } from '@GFUtils/helper';
import { getAddonActiveStatus } from '@GFUtils/helper';

const FormInner = ({ hooksLoading }) => {
  const { values, setFieldValue } = useFormikContext();
  const [pointAwards, setPointAwards] = useState(true);
  const [pointDeductions, setPointDeductions] = useState(false);
  const [openedAwardHooks, setOpenedAwardHooks] = useState([]);
  const [openedDeductHooks, setOpenedDeductHooks] = useState('all');
  const [selectedFilterHookType, setSelectedFilterHookType] = useState('all');
  const [selectedDeductFilterType, setSelectedDeductFilterType] = useState([]);
  const addons = useSelector(state => state.addons);
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

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  }));

  const { allHooks, hookSettings } = useSelector(state => state.pointType);

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
    ...tutorIcon,
    gameengine: {
      icon: FaGamepad,
      bg: "#006BFF"
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

  /**
   * An expanded hook is several hundred pixels tall, which turns the column
   * into a scroll during a drag and hides the slot the card is aimed at.
   * Collapse everything while the drag is in flight.
   */
  const handleDragStart = () => {
    setOpenedAwardHooks([]);
    setOpenedDeductHooks([]);
  };

  /**
   * Position in `requirements` for a card released over `overId`.
   *
   * Released over another card in the column, it takes that card's slot and
   * pushes it down. Released over the column itself — the empty space below
   * the last card — it goes on the end.
   */
  const dropPositionFor = (overId, type, list) => {
    const prefix = `${type}_`;
    if (typeof overId === "string" && overId.startsWith(prefix)) {
      const key = overId.slice(prefix.length);
      const index = list.findIndex(r => r.trigger_key === key && r.action_type === type);
      if (index !== -1) return index;
    }
    return list.length;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const draggedId = active.id;
    const requirements = values?.requirements || [];

    const type = draggedId.startsWith("award_") ? "award"
      : draggedId.startsWith("deduct_") ? "deduct"
        : null;
    if (!type) return;

    const pureId = draggedId.replace(`${type}_`, "");
    const from = requirements.findIndex(r => r.trigger_key === pureId && r.action_type === type);
    const exists = from !== -1;

    // Dragged back to the Available column: deactivate it.
    if (over.id === `${type}s-available`) {
      if (!exists) return;
      setFieldValue("requirements", requirements.filter((_, i) => i !== from));
      if (type === "award") {
        setOpenedAwardHooks(prev => prev.filter(id => id !== pureId));
      }
      return;
    }

    if (over.id !== `${type}s-sidebar` && !String(over.id).startsWith(`${type}_`)) {
      return;
    }

    // Insert and reorder are the same move: take the card out (a no-op for a
    // card that was not in the list yet) and put it back at the drop index,
    // measured against the list without it so the maths cannot be off by one.
    const without = exists ? requirements.filter((_, i) => i !== from) : requirements;

    let entry;
    if (exists) {
      entry = requirements[from];
    } else {
      const hook = allHooks.find(h => h.id === pureId);
      if (!hook) return;
      entry = {
        trigger_key: hook.id,
        action_type: type,
        parameters: getParamsFromSchema(hook, type)
      };
    }

    const to = dropPositionFor(over.id, type, without);
    if (exists && to === from) return;

    setFieldValue("requirements", insertAt(without, entry, to));
    if (!exists && type === "award") {
      setOpenedAwardHooks([pureId]);
    }
  };

  const renderHookCard = (item, type) => {
    const slug = item?.integrationSlug || item?.category || 'wordpress';
    const config = hookCategoryIconMap[slug] || hookCategoryIconMap.wordpress;

    return (
      <DraggableItem key={`${type}_${item?.id}`} id={`${type}_${item?.id}`}>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center rounded [border:1px_solid_var(--gameengine-border-color)]" style={{
            "padding": "10px 16px"
          }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full w-6 h-6 text-white" style={{ "background": config?.bg }}>
                {config?.icon()}
              </div>
              <GFLabel type="title" fontWeight="400" label={item?.label} />
            </div>

            <div className="items-center justify-center rounded-full w-6 h-6 flex text-white" style={{
              "background": type === 'award' ? "#0CDC01" : "#FF3E2F"
            }}>
              {arrowForward()}
            </div>
          </div>

          <div className="gameengine-hook-desc">
            <GFLabel type="subtitle" color="var(--gameengine-warn-muted)" label={item?.description} />
          </div>
        </div>
      </DraggableItem>
    );
  };

  // Built from the integrations that actually registered hooks, not from the
  // icon map: anything missing from that map — ZenCommunity, for one — had
  // hooks on this screen and no tab to filter them by, while an integration in
  // the map with nothing to show got a tab leading nowhere.
  const hookTypeOptions = [...new Set((allHooks || []).map(h => h?.integrationSlug).filter(Boolean))]
    .map(slug => ({
      label: integrationLabel(slug, allHooks),
      value: slug
    }));

  return (
    <>
      <div className="flex gap-3">
        <GameEngineInput label={__("Point Name", "gameengine")}>
          <input
            className='gameengine-input'
            placeholder={__("Enter point name", "gameengine")}
            value={values?.name}
            onChange={e => {
              const value = e.target.value;
              setFieldValue('name', value);
            }}
          />
        </GameEngineInput>
      </div>

      {hooksLoading ? (
        <RequirementsLoader />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={hookCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <DragPreview />

          <Requirements
            label={__("Automatic Point Awards", "gameengine")}
            onClick={e => {
              e.stopPropagation();
              setPointAwards(!pointAwards);
            }}
            open={pointAwards}
            parent="gameengine-points-automatic-point-awards"
            child="gameengine-points-automatic-point-awards-wrap"
            childLeft="gameengine-points-automatic-point-awards-available-hooks"
            childRight="gameengine-points-automatic-point-awards-active-hooks"
            hookTypeOptions={hookTypeOptions}
            filterHookType={checkedItem => {
              setSelectedFilterHookType(checkedItem);
            }}
            renderHookCard={renderHookCard}
            allHooks={allHooks}
            hookSettings={hookSettings}
            openHookType={openedAwardHooks}
            setOpenHookType={setOpenedAwardHooks}
            selectedHookIds={selectedAwardHookIds}
            actionName="award"
            selectedFilterType={selectedFilterHookType}
            scope="point_type"
            externalClasses="mt-6 mb-6"
          />

          <Requirements
            label={__("Automatic Point Deductions", "gameengine")}
            onClick={e => {
              e.stopPropagation();
              setPointDeductions(!pointDeductions);
            }}
            open={pointDeductions}
            parent="gameengine-points-automatic-point-deductions"
            child="gameengine-points-automatic-point-deductions-wrap"
            childLeft="gameengine-points-automatic-point-deductions-available-hooks"
            childRight="gameengine-points-automatic-point-deductions-active-hooks"
            hookTypeOptions={hookTypeOptions}
            filterHookType={checkedItem => {
              setSelectedDeductFilterType(checkedItem);
            }}
            renderHookCard={renderHookCard}
            allHooks={allHooks}
            hookSettings={hookSettings}
            openHookType={openedDeductHooks}
            setOpenHookType={setOpenedDeductHooks}
            selectedHookIds={selectedDeductHookIds}
            actionName="deduct"
            selectedFilterType={selectedDeductFilterType}
            scope="point_type"
          />
        </DndContext>
      )}
    </>
  );
};

export default FormInner;
