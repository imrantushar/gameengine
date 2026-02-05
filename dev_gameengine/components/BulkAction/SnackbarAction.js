import React, { useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Button } from '@chakra-ui/react';
import './styles.scss';

const propTypes = {
  actionButtons: PropTypes.array,
  itemsLength: PropTypes.number,
  isActionSelected: PropTypes.object,
  confirmHandler: PropTypes.func,
  resetHandler: PropTypes.func,
};

const SnackbarAction = ({
  actionButtons = [],
  itemsLength = 0,
  isActionSelected = {},
  confirmHandler,
  resetHandler,
}) => {
  const snackbarRef = useRef(null);

  useEffect(() => {
    return () => {};
  }, [itemsLength]);

  if (!itemsLength) return null;

  return createPortal(
    <div className="gameengine-snackbar-action" ref={snackbarRef}>
     
      <Button
        size="sm"
        variant="ghost"
        onClick={resetHandler}
        style={{ position: 'absolute', right: '10px', top: '10px' }}
      >
        ×
      </Button>

      {isActionSelected?.value ? (
        <div className="gameengine-snackbar-action__after">
          <div className="gameengine-snackbar-action__left">
            <strong>{isActionSelected?.message}</strong>
          </div>
          <div className="gameengine-snackbar-action__right">
            <Button variant="outline" onClick={resetHandler}>
              {__('Cancel', 'gameengine')}
            </Button>
            <Button colorScheme="red" onClick={() => confirmHandler(true)}>
              {__('Confirm', 'gameengine')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="gameengine-snackbar-action__before">
          <div className="gameengine-snackbar-action__left">
            <div className="gameengine-snackbar-action__items-length">
              <span>{itemsLength}</span>
              <p>{__('Items selected', 'gameengine')}</p>
            </div>
          </div>
          <div className="gameengine-snackbar-action__right">
            {actionButtons.map((actionButton, index) => (
              <Button
                key={index}
                {...actionButton}
                onClick={() => actionButton.onClick()}
              >
                {actionButton.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

SnackbarAction.propTypes = propTypes;
export default SnackbarAction;
