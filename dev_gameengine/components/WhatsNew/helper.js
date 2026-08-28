import { __ } from '@wordpress/i18n';

export const CHANGELOG_TYPES = {
    added: {
        label: __('Added', 'gameengine'),
        textColor: 'text-green-700',
        bgColor: 'bg-green-100',
    },
    improved: {
        label: __('Improved', 'gameengine'),
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-100',
    },
    fixed: {
        label: __('Fixed', 'gameengine'),
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-100',
    },
};

export const CHANGELOGS = [
    {
        version: '1.3.1',
        changes: [
            {
                type: 'fixed',
                text: 'Data now loads on sites using plain permalinks. Requests that carried a query string were producing a second "?" and coming back as "no route was found".',
            },
            {
                type: 'fixed',
                text: 'The Achievement Types and Level Types screens asked for the old taxonomy names and came back empty.',
            },
            {
                type: 'fixed',
                text: 'The "import some defaults?" prompt no longer flashes on screen before the list has finished loading.',
            },
        ],
    },

    {
        version: '1.3.0',
        changes: [
            {
                type: 'added',
                text: 'Extension points so add-on plugins can register their own settings tabs, add-on cards, menu entries and trigger fields.',
            },
            {
                type: 'improved',
                text: 'The Add-ons and Settings screens now list only the features this plugin ships, with no placeholder or disabled controls.',
            },
            {
                type: 'improved',
                text: 'Achievement and level type taxonomies are now prefixed. Existing types are moved over automatically.',
            },
        ],
    },

    {
        version: '1.2.0',
        changes: [
            {
                type: 'improved',
                text: 'Updated all the UI in admin dashboard(Addons, breadcrumbs, no data text, icons and more) and setup wizard.',
            },
            {
                type: 'fixed',
                text: 'All buttons dirty and disable issue fixed',
            },
        ],
    },

    {
        version: '1.1.1',
        changes: [
            {
                type: 'improved',
                text: 'Chakra UI removed and migrated to tailwind',
            },
            {
                type: 'improved',
                text: 'Complete UI updated.',
            },
        ],
    },

    {
        version: '1.1.1',
        changes: [
            {
                type: 'added',
                text: 'StoreEngine SDK integration ( License Management ).',
            },
        ],
    },
];
