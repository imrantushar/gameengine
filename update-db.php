<?php
require_once dirname(__FILE__) . '/../../../wp-load.php';
\GameEngine\Pro\Pro_Manager::run_installer();
echo "Database updated!";
