<?php
require_once 'db_handler.php'; // Include executeQuery function

// -------------------- SELECT QUERIES --------------------

/**
 * Retrieve records from a table.
 * 
 * @param string $table The table name.
 * @param array $conditions Optional WHERE conditions as key-value pairs.
 * @param string $fetchMode 'fetchAll' (default) or 'fetch' for a single row.
 * @param array $columns Columns to select (default ['*']).
 * @param string|null $orderBy Optional ORDER BY clause (e.g., 'name ASC').
 * @return array Query result or error response.
 */
function getRecords($table, $conditions = [], $fetchMode = 'fetchAll', $columns = ['*'], $orderBy = null, $limit = null, $offset = null)
{
    $columnsString = !empty($columns) ? implode(", ", $columns) : '*';
    $whereClause = '';
    $params = [];

    if (!empty($conditions)) {
        $whereParts = [];
        foreach ($conditions as $column => $value) {
            $whereParts[] = "$column = :where_$column";
            $params[":where_$column"] = $value;
        }
        $whereClause = "WHERE " . implode(" AND ", $whereParts);
    }

    // Add ORDER BY if specified
    $orderClause = $orderBy ? "ORDER BY `$orderBy`" : "";

    // Add LIMIT and OFFSET if specified
    $limitClause = ($limit !== null) ? "LIMIT " . (int)$limit : "";
    $offsetClause = ($offset !== null) ? "OFFSET " . (int)$offset : "";

    return executeQuery('SELECT', "SELECT $columnsString FROM $table $whereClause $orderClause $limitClause $offsetClause", $params, $fetchMode);
}

// -------------------- INSERT QUERIES --------------------

/**
 * Insert a record into a table.
 * 
 * @param string $table The table name.
 * @param array $data Associative array of column-value pairs.
 * @return array Result of the insert operation.
 */
function insertRecord($table, $data)
{
    $columns = implode(", ", array_keys($data));
    $placeholders = ":" . implode(", :", array_keys($data));
    $params = [];

    foreach ($data as $key => $value) {
        $params[":$key"] = $value;
    }

    $result = executeQuery('INSERT', "INSERT INTO $table ($columns) VALUES ($placeholders)", $params, 'execute');

    if ($result['success']) {
        $result['data'] = ['id' => $GLOBALS['pdo']->lastInsertId()];
        $result['message'] = "Insert successful.";
    }

    return $result;
}


// -------------------- UPDATE QUERIES --------------------

/**
 * Update records in a table.
 * 
 * @param string $table The table name.
 * @param array $data Columns to update (column => value).
 * @param array $conditions WHERE conditions (column => value).
 * @return array Result of the update operation.
 */
function updateRecord($table, $data, $conditions)
{
    if (empty($conditions)) {
        throw new Exception("Update operation requires at least one condition.");
    }

    // Build SET clause
    $setParts = [];
    $params = [];
    foreach ($data as $column => $value) {
        $setParts[] = "$column = :set_$column";
        $params[":set_$column"] = $value;
    }
    $setClause = implode(", ", $setParts);

    // Build WHERE clause
    $whereParts = [];
    foreach ($conditions as $column => $value) {
        $whereParts[] = "$column = :where_$column";
        $params[":where_$column"] = $value;
    }
    $whereClause = implode(" AND ", $whereParts);

    return executeQuery('UPDATE', "UPDATE $table SET $setClause WHERE $whereClause", $params, 'execute');
}

// -------------------- DELETE QUERIES --------------------

/**
 * Delete records from a table.
 * 
 * @param string $table The table name.
 * @param array $conditions WHERE conditions (column => value).
 * @return array Result of the delete operation.
 */
function deleteRecord($table, $conditions)
{
    if (empty($conditions)) {
        throw new Exception("Delete operation requires at least one condition.");
    }

    // Build WHERE clause
    $whereParts = [];
    $params = [];
    foreach ($conditions as $column => $value) {
        $whereParts[] = "$column = :where_$column";
        $params[":where_$column"] = $value;
    }
    $whereClause = implode(" AND ", $whereParts);

    return executeQuery('DELETE', "DELETE FROM $table WHERE $whereClause", $params, 'execute');
}
