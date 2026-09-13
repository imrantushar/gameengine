<?php

namespace GameEngine\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class Shortcodes
 * Handles partial content restriction via [gameengine_restrict].
 */
class Shortcodes
{
    /**
     * Block-level HTML, which a <span> cannot hold.
     */
    const BLOCK_TAGS = '#<(?:address|article|aside|blockquote|details|dialog|div|dl|fieldset|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|ul)\b#i';

    public function __construct()
    {
        add_shortcode('gameengine_restrict', array($this, 'render_restricted_content'));
        add_filter('render_block_core/paragraph', array(__CLASS__, 'unwrap_paragraph'));
    }

    /**
     * [gameengine_restrict type="points" value="100" message="Custom Lock Message"]...[/gameengine_restrict]
     */
    public function render_restricted_content($atts, $content = null)
    {
        $args = shortcode_atts(
            array(
                'type'    => 'points',
                'value'   => 0,
                'message' => '',
            ),
            $atts
        );

        $type  = sanitize_text_field($args['type']);
        $value = sanitize_text_field($args['value']);

        if (Restriction_Helper::can_access($type, $value)) {
            return self::format_content($content);
        }

        // Without a custom message, the box names what unlocks it.
        return Restriction_Helper::get_locked_ui(sanitize_textarea_field($args['message']), $type, $value);
    }

    /**
     * The unlocked content, in an element.
     *
     * WordPress strips the paragraph around a shortcode that stands alone, so
     * plain text used to come back as a bare text node, which a block theme
     * leaves at the page's edge instead of in the content column. A snippet
     * without paragraphs is wrapped in a <span>, which the stylesheet shows as
     * a block when it stands alone and inline inside a sentence. Paragraphs
     * and other blocks get a <div>. WordPress's paragraph pass can also leave
     * a stray </p>, <p> or <br> at the edges of the enclosed content; those
     * are dropped first.
     *
     * @param string|null $content Content between the shortcode tags.
     * @return string
     */
    private static function format_content($content)
    {
        $content = preg_replace('#^(?:\s|</p>|<br\s*/?>)+|(?:\s|<p>|<br\s*/?>)+$#i', '', (string) $content);

        if ('' === $content) {
            return '';
        }

        \GameEngine\Assets::enqueue_frontend();

        if (preg_match('#\n\s*\n#', $content) || preg_match(self::BLOCK_TAGS, $content)) {
            return '<div class="gameengine-restricted-content">' . do_shortcode(shortcode_unautop(wpautop($content))) . '</div>';
        }

        $html = do_shortcode($content);
        $tag  = preg_match(self::BLOCK_TAGS, $html) ? 'div' : 'span';

        return '<' . $tag . ' class="gameengine-restricted-content">' . $html . '</' . $tag . '>';
    }

    /**
     * Unwrap a paragraph block that holds nothing but a locked shortcode.
     *
     * WordPress removes the <p> around a shortcode that stands alone, but not
     * a <p> with attributes, which is what the paragraph block renders. A
     * browser splits a <p> around the block-level lock box into empty
     * paragraphs that add stray gaps. Unlocked content stays in its
     * paragraph, which keeps the paragraph's own styles.
     *
     * @param string $block_content Rendered paragraph block.
     * @return string
     */
    public static function unwrap_paragraph($block_content)
    {
        if (false === strpos($block_content, '[gameengine_restrict')) {
            return $block_content;
        }

        if (! preg_match('#^\s*<p(?:\s[^>]*)?>\s*(\[gameengine_restrict(\s[^\]]*)?\](?:(?!\[/gameengine_restrict\]).)*\[/gameengine_restrict\])\s*</p>\s*$#s', $block_content, $match)) {
            return $block_content;
        }

        $atts = shortcode_atts(array('type' => 'points', 'value' => 0), (array) shortcode_parse_atts(trim($match[2] ?? '')));

        if (Restriction_Helper::can_access(sanitize_text_field($atts['type']), sanitize_text_field($atts['value']))) {
            return $block_content;
        }

        return $match[1];
    }
}

new Shortcodes();
