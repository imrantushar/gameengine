<?php

namespace GameEngine;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Inline SVG icons for member-facing markup.
 *
 * Every icon is drawn on a 24px grid with a 2px round stroke in currentColor,
 * so it takes the colour and size of the text around it. The stylesheet sizes
 * `.gameengine-icon` to 1em; the width and height attributes only matter when
 * the stylesheet is missing.
 */
class Icons
{
    /**
     * Icon bodies, keyed by name.
     *
     * @var array
     */
    private static $paths = array(
        'alert'        => '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
        'arrow-right'  => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'calendar'     => '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
        'check'        => '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
        'check-circle' => '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.8"/>',
        'chevron-down' => '<path d="M6 9l6 6 6-6"/>',
        'clock'        => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
        'coin'         => '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z"/>',
        'copy'         => '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
        'flag'         => '<path d="M5 21V4M5 4h11.5l-2.2 4 2.2 4H5"/>',
        'flame'        => '<path d="M12 3c.6 3.2-1.4 4.8-2.9 6.6C7.6 11.4 6 13.3 6 15.5a6 6 0 0 0 12 0c0-2.6-1.4-4.6-2.6-5.8-.1 1.6-.9 2.9-2.1 3.3.8-3.2-.2-6.6-1.3-10z"/>',
        'gift'         => '<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8v13M12 8S10.6 3.5 8.1 3.5a2.25 2.25 0 0 0 0 4.5M12 8s1.4-4.5 3.9-4.5a2.25 2.25 0 0 1 0 4.5"/>',
        'info'         => '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>',
        'lock'         => '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
        'mail'         => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
        'map'          => '<path d="M9 4L3.5 6.2v13.6L9 17.6l6 2.4 5.5-2.2V4.2L15 6.4z"/><path d="M9 4v13.6M15 6.4V20"/>',
        'medal'        => '<path d="M7.5 3l3.2 6.6M16.5 3l-3.2 6.6"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12.8v4.4"/>',
        'share'        => '<path d="M12 15V3.5M7.5 8L12 3.5 16.5 8"/><path d="M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5"/>',
        'star'         => '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
        'ticket'       => '<path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1z"/><path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2"/>',
        'trending-up'  => '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
        'trophy'       => '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11M12 14v3.5M8 20.5h8M9.5 17.5h5"/>',
        'users'        => '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2a6.5 6.5 0 0 1 3 5.8"/>',
        'wallet'       => '<path d="M18.5 8.5V6.5A1.5 1.5 0 0 0 17 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9.5a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2"/><path d="M16 14h.01"/>',
        'x'            => '<path d="M6 6l12 12M18 6L6 18"/>',
    );

    /**
     * Sanitized markup, cached per name and class.
     *
     * @var array
     */
    private static $cache = array();

    /**
     * Get an icon's markup.
     *
     * @param string $name  Icon name.
     * @param string $class Extra class names.
     * @return string Sanitized SVG markup, or an empty string for an unknown name.
     */
    public static function get($name, $class = '')
    {
        if (! isset(self::$paths[$name])) {
            return '';
        }

        $key = $name . '|' . $class;

        if (! isset(self::$cache[$key])) {
            $classes = trim('gameengine-icon ' . $class);
            $svg     = '<svg class="' . esc_attr($classes) . '" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . self::$paths[$name] . '</svg>';

            self::$cache[$key] = wp_kses($svg, self::allowed_html());
        }

        return self::$cache[$key];
    }

    /**
     * Print an icon.
     *
     * @param string $name  Icon name.
     * @param string $class Extra class names.
     */
    public static function render($name, $class = '')
    {
        echo self::get($name, $class); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized by wp_kses() in get().
    }

    /**
     * The SVG elements and attributes an icon may use.
     *
     * @return array
     */
    public static function allowed_html()
    {
        $shape = array(
            'd'            => true,
            'cx'           => true,
            'cy'           => true,
            'r'            => true,
            'rx'           => true,
            'ry'           => true,
            'x'            => true,
            'y'            => true,
            'width'        => true,
            'height'       => true,
            'points'       => true,
            'fill'         => true,
            'stroke'       => true,
            'stroke-width' => true,
        );

        return array(
            'svg'      => array(
                'class'           => true,
                'width'           => true,
                'height'          => true,
                'viewbox'         => true,
                'fill'            => true,
                'stroke'          => true,
                'stroke-width'    => true,
                'stroke-linecap'  => true,
                'stroke-linejoin' => true,
                'aria-hidden'     => true,
                'focusable'       => true,
            ),
            'path'     => $shape,
            'circle'   => $shape,
            'rect'     => $shape,
            'ellipse'  => $shape,
            'polyline' => $shape,
        );
    }
}
