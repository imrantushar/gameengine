/**
 * Shows only the value field that matches the selected restriction type in the
 * GameEngine Content Restriction meta box.
 */
(function () {
	'use strict';

	function init() {
		var typeField = document.getElementById('gameengine_restrict_type');
		var container = document.getElementById('gameengine_restrict_value_container');

		if (!typeField || !container) {
			return;
		}

		function toggleFields() {
			var selected = typeField.value;
			var groups = document.querySelectorAll('.gameengine-restrict-input-group');

			groups.forEach(function (group) {
				group.style.display = 'none';
			});

			if ('none' === selected) {
				container.style.display = 'none';
				return;
			}

			container.style.display = '';

			var active = document.getElementById('gameengine_restrict_group_' + selected);
			if (active) {
				active.style.display = '';
			}
		}

		typeField.addEventListener('change', toggleFields);
		toggleFields();
	}

	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
