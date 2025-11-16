<?php

namespace Gamify\API;

if (! defined('ABSPATH')) exit;

abstract class BaseController
{
    /**
     * The namespace for our API.
     * @var string
     */
    protected $namespace = 'gamify/v1';

    /**
     * The base of this controller's route.
     * @var string
     */
    protected $rest_base = '';

    // __construct মেথডটি এখান থেকে সরিয়ে দেওয়া হয়েছে।

    /**
     * Register the routes for this controller.
     */
    abstract public function register_routes();

    /**
     * Permission check for admin-level capabilities.
     * @param \WP_REST_Request $request
     * @return bool|\WP_Error
     */
    public function admin_permission_check(\WP_REST_Request $request)
    {
        if (! current_user_can('manage_options')) {
            return new \WP_Error(
                'rest_forbidden',
                esc_html__('You do not have permission to access this endpoint.', 'gamify'),
                ['status' => is_user_logged_in() ? 403 : 401]
            );
        }
        return true;
    }
}
