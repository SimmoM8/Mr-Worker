<?php
require_once 'db_queries.php';
$result = deleteRecord('users', ['id' => 5]);
print_r($result);
