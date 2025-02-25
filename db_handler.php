<?php

require_once 'db.php'; // Include the database connection
function executeQuery($queryType, $query, $params = [], $fetchMode = 'fetchAll')
{
    global $pdo;

    // Execute the query
    try {
        $stmt = $pdo->prepare($query); // Prepare the query
        $stmt->execute($params); // Execute the query with the supplied parameters

        // Determine the query type
        if ($queryType === 'SELECT') {
            $data = ($fetchMode === 'fetch') ? $stmt->fetch() : $stmt->fetchAll();
        } elseif ($queryType === 'INSERT') {
            $data = $pdo->lastInsertId(); // Return last inserted ID
        } elseif ($queryType === 'UPDATE' || $queryType === 'DELETE') {
            $data = $stmt->rowCount(); // Return number of affected rows
        } else {
            throw new Exception('Invalid query type specified.');
        }

        // Return the data
        return [
            'success' => true,
            'data' => $data,
            'message' => 'Query executed successfully.'
        ];
    } catch (PDOException $e) {
        $debugging = true; // ** Set to true ONLY when debugging **

        return [
            'success' => false,
            'message' => $debugging ? 'Database error: ' . $e->getMessage() : 'Database error: Could not complete the operation.'
        ];
    }
}
