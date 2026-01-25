<?php

namespace GameEngine\API\Controllers;

use GameEngine\API\BaseController;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Class TaxonomyController
 * Handles CRUD operations for achievement and level taxonomies.
 */
class TaxonomyController extends BaseController
{

    /**
     * REST route base.
     *
     * @var string
     */
    protected $rest_base = 'taxonomies';

    /**
     * Register REST API routes.
     */
    public function register_routes()
    {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<tax>[a-zA-Z0-9_\-]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_terms'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                    'args'                => $this->get_collection_params(),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_term'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<tax>[a-zA-Z0-9_\-]+)/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_term'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'delete_term'),
                    'permission_callback' => array($this, 'admin_permission_check'),
                ),
            )
        );
    }

    /**
     * Retrieve terms for a given taxonomy.
     */
    public function get_terms($request)
    {
        $tax      = sanitize_text_field($request['tax']);
        $search   = $request->get_param('search');
        $per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 20;
        $page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset   = ($page - 1) * $per_page;

        if (! taxonomy_exists($tax)) {
            return new \WP_Error('invalid_taxonomy', 'Taxonomy not found', array('status' => 404));
        }

        // Base arguments for both fetching and counting
        $base_args = array(
            'taxonomy'   => $tax,
            'hide_empty' => false,
        );

        if (! empty($search)) {
            $base_args['search'] = sanitize_text_field($search);
        }

        // Fetch actual terms
        $args = array_merge($base_args, array(
            'number' => $per_page,
            'offset' => $offset,
        ));
        $terms = get_terms($args);

        // Use get_terms with fields => count instead of deprecated wp_count_terms second param
        $count_args = array_merge($base_args, array(
            'fields' => 'count',
        ));
        $total_terms = get_terms($count_args);

        $response = array();
        if (! is_wp_error($terms) && is_array($terms)) {
            foreach ($terms as $term) {
                $response[] = array(
                    'id'          => $term->term_id,
                    'name'        => $term->name,
                    'slug'        => $term->slug,
                    'description' => $term->description,
                    'parent'      => $term->parent,
                );
            }
        }

        $total_pages = (int) ceil((int) $total_terms / $per_page);
        $res         = new \WP_REST_Response($response, 200);

        $res->header('X-WP-Total', (int) $total_terms);
        $res->header('X-WP-TotalPages', $total_pages);

        return $res;
    }

    /**
     * Create a new taxonomy term.
     */
    public function create_term($request)
    {
        $params = $request->get_json_params();
        $tax    = sanitize_text_field($request['tax']);

        if (! taxonomy_exists($tax)) {
            return new \WP_Error('invalid_taxonomy', __('Invalid taxonomy.', 'gameengine'), array('status' => 400));
        }

        $term_name = isset($params['name']) ? sanitize_text_field($params['name']) : '';

        if (empty($term_name)) {
            return new \WP_Error('missing_data', __('Name is required.', 'gameengine'), array('status' => 400));
        }

        $term = wp_insert_term(
            $term_name,
            $tax,
            array(
                'description' => isset($params['description']) ? sanitize_textarea_field($params['description']) : '',
                'slug'        => isset($params['slug']) ? sanitize_title($params['slug']) : '',
                'parent'      => isset($params['parent']) ? absint($params['parent']) : 0,
            )
        );

        if (is_wp_error($term)) {
            return new \WP_Error('create_error', $term->get_error_message(), array('status' => 400));
        }

        return new \WP_REST_Response($term, 200);
    }

    /**
     * Update an existing term.
     */
    public function update_term($request)
    {
        $id     = absint($request['id']);
        $tax    = sanitize_text_field($request['tax']);
        $params = $request->get_json_params();

        $updated = wp_update_term(
            $id,
            $tax,
            array(
                'name'        => isset($params['name']) ? sanitize_text_field($params['name']) : '',
                'description' => isset($params['description']) ? sanitize_textarea_field($params['description']) : '',
                'parent'      => isset($params['parent']) ? absint($params['parent']) : 0,
            )
        );

        if (is_wp_error($updated)) {
            return new \WP_Error('update_error', $updated->get_error_message(), array('status' => 400));
        }

        return new \WP_REST_Response($updated, 200);
    }

    /**
     * Delete a term.
     */
    public function delete_term($request)
    {
        $id  = absint($request['id']);
        $tax = sanitize_text_field($request['tax']);

        $deleted = wp_delete_term($id, $tax);

        if (is_wp_error($deleted)) {
            return new \WP_Error('delete_error', $deleted->get_error_message(), array('status' => 400));
        }

        return new \WP_REST_Response(array('success' => true), 200);
    }

    /**
     * Pagination and search params.
     */
    public function get_collection_params()
    {
        return array(
            'page'     => array('default' => 1, 'sanitize_callback' => 'absint'),
            'per_page' => array('default' => 20, 'sanitize_callback' => 'absint'),
            'search'   => array('default' => '', 'sanitize_callback' => 'sanitize_text_field'),
        );
    }
}
