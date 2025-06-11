<?php
require_once 'db_queries.php';

header('Content-Type: application/json'); // Ensure JSON response
session_start(); // Start session for user authentication

$request = json_decode(file_get_contents("php://input"), true) ?? [];

$table = $request['table'] ?? null;
$action = $request['action'] ?? null;

$user_id = $_SESSION['user_id'] ?? null;
$selected_language = $_SESSION['selected_language'] ?? 'lang_1';
$reference_language = $_SESSION['reference_language'] ?? 'lang_1';

error_log("Action: $action | Table: $table | Data: " . print_r($request, true));

if (!$table || !$action) {
    sendResponse(false, "Missing table or action.");
}

// Ensure the table name is valid
$allowedTables = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses', 'users', 'resumes', 'courses', 'employers', 'user_reports', 'password_resets', 'translation_languages', 'user_translations'];
if (!in_array($table, $allowedTables)) {
    sendResponse(false, "Invalid table name.");
}

// Enforce user scope unless explicitly overridden
enforceUserScope($request, $user_id);

// Handle API request dynamically
handleRequest($action, $table, $request);

/** =========================  
 *  Function Definitions
 * ========================= **/
//
// Enforce user-based selection unless explicitly overridden
function enforceUserScope(&$request, $user_id)
{
    if (!isset($request['conditions']['user_id']) && $user_id) {
        if (!isset($request['user_dependant']) || $request['user_dependant']) {
            $request['conditions']['user_id'] = $user_id;
        }
    }
}

// Nest translation fields dynamically
function nestTranslationFields(array $row): array
{
    $grouped = [];
    foreach ($row as $key => $value) {
        if (preg_match('/^(.+)_lang_(\d)$/', $key, $matches)) {
            $base = $matches[1];
            $lang = "lang_" . $matches[2];
            $grouped[$base][$lang] = $value;
        } elseif (preg_match('/^ref_(.+)$/', $key, $matches)) {
            $base = $matches[1];
            $grouped[$base]['ref'] = $value;
        } else {
            $grouped[$key] = $value;
        }
    }
    return $grouped;
}

// Dynamically handle API requests (Fetch, Insert, Update, Delete)
function handleRequest($action, $table, $request)
{
    $actions = [
        'fetch' => 'getRecords',
        'insert' => 'insertRecord',
        'update' => 'updateRecord',
        'delete' => 'deleteRecord'
    ];

    // Ensure the action is valid
    if (!isset($actions[$action])) {
        sendResponse(false, "Invalid action.");
    }

    $data = $request['data'] ?? [];
    $conditions = $request['conditions'] ?? [];
    $fetchMode = $action === 'fetch' ? 'fetchAll' : 'execute';

    // Tables that require user_id
    $userRequiredTables = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses', 'resumes', 'user_reports', 'user_translations'];

    // Automatically assign `user_id` for `INSERT` if missing
    if ($action === 'insert' && in_array($table, $userRequiredTables)) {
        global $user_id;
        if ($user_id && !isset($data['user_id'])) {
            $data['user_id'] = $user_id;
        }
    }

    if ($action === 'fetch') {
        $columns = prepareColumns($request['columns'] ?? ['*']);
        $limit = $request['limit'] ?? null;
        $offset = $request['offset'] ?? null;
        $orderBy = $request['orderBy'] ?? null;
        $response = getRecords($table, $conditions, $fetchMode, $columns, $orderBy, $limit, $offset);

        if ($response['success'] && is_array($response['data'])) {
            // ---- NEST SKILL POINTS FOR EMPLOYERS/COURSES ----
            if (in_array($table, ['employers', 'courses'])) {
                $linkedTable = $table === 'employers' ? 'work_experience' : 'education';
                $foreignKey = $table === 'employers' ? 'employerId' : 'courseId';
                $experienceIds = array_column($response['data'], 'id');
                $skillPoints = getRecords($linkedTable, ['user_id' => $GLOBALS['user_id']])['data'] ?? [];

                foreach ($response['data'] as &$record) {
                    $record['skills'] = array_values(array_map('nestTranslationFields', array_filter($skillPoints, function ($point) use ($record, $foreignKey) {
                        return $point[$foreignKey] == $record['id'];
                    })));
                }
                unset($record);
            }
            // ---- END NESTING ----

            // Apply translation nesting after skill points have been attached
            $response['data'] = array_map(function ($item) {
                $item = nestTranslationFields($item);
                if (isset($item['skills']) && is_array($item['skills'])) {
                    $item['skills'] = array_map('nestTranslationFields', $item['skills']);
                }
                return $item;
            }, $response['data']);

            // Apply field mapping for consistent naming like 'title' and 'organisation'
            $fieldMap = [
                'employers' => ['job_position' => 'title', 'employer' => 'organisation'],
                'courses'   => ['course' => 'title',       'school'   => 'organisation']
            ];
            if (isset($fieldMap[$table])) {
                foreach ($response['data'] as &$record) {
                    foreach ($fieldMap[$table] as $original => $alias) {
                        if (isset($record[$original])) {
                            $record[$alias] = $record[$original];
                            unset($record[$original]);
                        }
                    }
                }
                unset($record);
            }
        }
    } elseif ($action === 'insert') {
        $response = insertRecord($table, $data);
    } elseif ($action === 'update') {
        if (empty($conditions)) {
            sendResponse(false, "Invalid or missing conditions for update.");
        }
        $response = updateRecord($table, $data, $conditions);
    } elseif ($action === 'delete') {
        if (empty($conditions)) {
            sendResponse(false, "Invalid or missing conditions for delete.");
        }
        $response = deleteRecord($table, $conditions);
    }
    sendResponse($response['success'], $response['message'], $response['data'] ?? []);
}

// Prepare columns for SELECT query
function prepareColumns($columns)
{
    foreach ($columns as $key => $alias) {
        // If the key and alias are the same, or if there's no alias, keep the column name unchanged
        if ($key === $alias || is_numeric($key)) {
            $columnParts[] = $alias;
        } else {
            $columnParts[] = "$key AS $alias";
        }
    }
    return !empty($columnParts) ? $columnParts : ['*'];
}

// Return a JSON response to the front-end
function sendResponse($success, $message = "", $data = [])
{
    global $reference_language;
    global $selected_language;
    $nullMessage = "- Enter translate mode to type translation -";

    echo json_encode([
        'success' => $success,
        'message' => is_string($message) ? $message : "No message provided.",
        'data' => $data,
        'ref_language' => $reference_language,
        'sel_language' => $selected_language,
        'null_message' => $nullMessage
    ]);
    exit;
}
