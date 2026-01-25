<?php

namespace GameEngine\Addons\RestrictContent;

if (! defined('ABSPATH')) {
    exit;
}

class Meta_Box
{

    public static function init()
    {
        add_action('add_meta_boxes', array(__CLASS__, 'add_restriction_metabox'));
        add_action('save_post', array(__CLASS__, 'save_restriction_data'));
    }

    public static function add_restriction_metabox()
    {
        add_meta_box('gameengine_content_restrict', __('GameEngine Content Restriction', 'gameengine'), array(__CLASS__, 'render_metabox'), array('post', 'page'), 'side');
    }

    public static function render_metabox($post)
    {
        global $wpdb;
        wp_nonce_field('gameengine_restriction_save', 'gameengine_restriction_nonce');

        $type       = get_post_meta($post->ID, '_gameengine_restrict_type', true);
        $saved_val  = get_post_meta($post->ID, '_gameengine_restrict_value', true);
        $msg        = get_post_meta($post->ID, '_gameengine_restrict_message', true);
        $lock_media = get_post_meta($post->ID, '_gameengine_lock_media', true);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $all_achievements = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_achievements ORDER BY title ASC");
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
        $all_levels       = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}gameengine_levels ORDER BY priority ASC");
?>

        <div class="gf-metabox-wrapper">
            <p>
                <label><strong><?php esc_html_e('Restriction Type:', 'gameengine'); ?></strong></label>
                <select name="gameengine_restrict_type" id="gf_restrict_type" class="widefat" style="margin-top:5px;">
                    <option value="none" <?php selected($type, 'none'); ?>><?php esc_html_e('None', 'gameengine'); ?></option>
                    <option value="points" <?php selected($type, 'points'); ?>><?php esc_html_e('Points Required', 'gameengine'); ?></option>
                    <option value="achievement" <?php selected($type, 'achievement'); ?>><?php esc_html_e('Achievement Required', 'gameengine'); ?></option>
                    <option value="level" <?php selected($type, 'level'); ?>><?php esc_html_e('Min Level Required', 'gameengine'); ?></option>
                </select>
            </p>

            <div id="gf_value_container" style="margin-top:15px; padding: 10px; background: #f0f0f1; border-radius: 4px;">

                <!-- Points Input -->
                <div class="gf-input-group" id="group_points" style="display:none;">
                    <label><?php esc_html_e('Enter Points Amount:', 'gameengine'); ?></label>
                    <input type="number" name="gf_val_points" value="<?php echo ('points' === $type) ? esc_attr($saved_val) : ''; ?>" class="widefat" />
                </div>

                <!-- Achievement Dropdown -->
                <div class="gf-input-group" id="group_achievement" style="display:none;">
                    <label><?php esc_html_e('Select Achievement:', 'gameengine'); ?></label>
                    <select name="gf_val_achievement" class="widefat">
                        <option value=""><?php esc_html_e('-- Select --', 'gameengine'); ?></option>
                        <?php foreach ($all_achievements as $ach) : ?>
                            <option value="<?php echo esc_attr($ach->id); ?>" <?php selected($saved_val, $ach->id); ?>><?php echo esc_html($ach->title); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <!-- Level Dropdown -->
                <div class="gf-input-group" id="group_level" style="display:none;">
                    <label><?php esc_html_e('Select Minimum Level:', 'gameengine'); ?></label>
                    <select name="gf_val_level" class="widefat">
                        <option value=""><?php esc_html_e('-- Select --', 'gameengine'); ?></option>
                        <?php foreach ($all_levels as $lvl) : ?>
                            <option value="<?php echo esc_attr($lvl->id); ?>" <?php selected($saved_val, $lvl->id); ?>><?php echo esc_html($lvl->title); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <p style="margin-top:15px;">
                <label>
                    <input type="checkbox" name="gameengine_lock_media" value="1" <?php checked($lock_media, '1'); ?> />
                    <?php esc_html_e('Lock Images & Links Only?', 'gameengine'); ?>
                </label>
            </p>

            <p>
                <label><strong><?php esc_html_e('Lock Message:', 'gameengine'); ?></strong></label>
                <textarea name="gameengine_restrict_message" class="widefat" rows="3" style="margin-top:5px;"><?php echo esc_textarea($msg); ?></textarea>
            </p>
        </div>

        <script type="text/javascript">
            (function($) {
                function toggleFields() {
                    var selectedType = $('#gf_restrict_type').val();
                    $('.gf-input-group').hide();
                    $('#gf_value_container').hide();

                    if (selectedType !== 'none') {
                        $('#gf_value_container').show();
                        $('#group_' + selectedType).show();
                    }
                }
                $(document).ready(toggleFields);
                $('#gf_restrict_type').on('change', toggleFields);
            })(jQuery);
        </script>
<?php
    }

    public static function save_restriction_data($post_id)
    {
        if (! isset($_POST['gameengine_restriction_nonce']) || ! wp_verify_nonce(sanitize_key($_POST['gameengine_restriction_nonce']), 'gameengine_restriction_save')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (! current_user_can('edit_post', $post_id)) {
            return;
        }

        $type = isset($_POST['gameengine_restrict_type']) ? sanitize_text_field(wp_unslash($_POST['gameengine_restrict_type'])) : 'none';
        update_post_meta($post_id, '_gameengine_restrict_type', $type);

        $final_value = '';
        if ('points' === $type) {
            $final_value = isset($_POST['gf_val_points']) ? absint($_POST['gf_val_points']) : '';
        } elseif ('achievement' === $type) {
            $final_value = isset($_POST['gf_val_achievement']) ? absint($_POST['gf_val_achievement']) : '';
        } elseif ('level' === $type) {
            $final_value = isset($_POST['gf_val_level']) ? absint($_POST['gf_val_level']) : '';
        }

        update_post_meta($post_id, '_gameengine_restrict_value', $final_value);
        update_post_meta($post_id, '_gameengine_restrict_message', isset($_POST['gameengine_restrict_message']) ? sanitize_textarea_field(wp_unslash($_POST['gameengine_restrict_message'])) : '');
        update_post_meta($post_id, '_gameengine_lock_media', isset($_POST['gameengine_lock_media']) ? '1' : '0');
    }
}
