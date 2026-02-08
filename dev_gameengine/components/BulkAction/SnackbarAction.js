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
  itemsLength,
  isActionSelected = {},
  confirmHandler,
  resetHandler,
}) => {
  const snackbarRef = useRef(null);
  const targetElement = document.querySelector('#gameengine-admin-app');

  useEffect(() => {
		if (itemsLength && targetElement) {
			snackbarRef.current.style.position = 'fixed';
			snackbarRef.current.style.left = `40%`; // Adjust left position as needed
			snackbarRef.current.style.bottom = `50px`; // Place it at the bottom
			document.body.appendChild(snackbarRef.current);
		} else if (
			snackbarRef.current &&
			snackbarRef.current.parentNode === document.body
		) {
			document.body.removeChild(snackbarRef.current);
		}

		return () => {
			if (
				snackbarRef.current &&
				snackbarRef.current.parentNode === document.body
			) {
				document.body.removeChild(snackbarRef.current);
			}
		};
	}, [itemsLength]);

  if (!itemsLength) return null;

  const handleSnackbarClick = (e) => {
    e.stopPropagation();
  };

  return createPortal(
    <div className="gameengine-snackbar-action" ref={snackbarRef} onClick={handleSnackbarClick}>
      <Button
        size="sm"
        variant="plain"
        onClick={resetHandler}
        className="gameengine-btn gameengine-snackbar-close"
      >
        X
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
                onClick={(e) => {
                  e.stopPropagation();
                  actionButton.onClick();
                }}
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
