<?php
require_once __DIR__ . '/../db_queries.php';

function handleRequest($action, $table, $request, $user_id)
{
    $actions = [
        'fetch' => 'getRecords',
        'insert' => 'insertRecord',
        'update' => 'updateRecord',
        'delete' => 'deleteRecord'
    ];

    if (!isset($actions[$action])) {
        return ['success' => false, 'message' => 'Invalid action.'];
    }

    $data = $request['data'] ?? [];
    $user_scope = $request['user_scope'] ?? true;
    $user_dependant = $request['user_dependant'] ?? true;
    if ($user_scope !== false && $user_dependant !== false) {
        enforceUserScope($request, $user_id, true);
    }
    $conditions = $request['conditions'] ?? [];
    $fetchMode = $action === 'fetch' ? 'fetchAll' : 'execute';

    $userRequiredTables = ['work_experience', 'education', 'hard_skills', 'soft_skills', 'languages', 'licenses', 'resumes', 'user_reports', 'user_translations'];

    if ($action === 'insert' && $user_id) {
        $user_scope = $request['user_scope'] ?? true;
        $user_dependant = $request['user_dependant'] ?? true;
        if ($user_scope !== false && $user_dependant !== false && !isset($data['user_id'])) {
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
            if (in_array($table, ['employers', 'courses'])) {
                $linkedTable = $table === 'employers' ? 'work_experience' : 'education';
                $foreignKey = $table === 'employers' ? 'employerId' : 'courseId';
                $experienceIds = array_column($response['data'], 'id');
                $skillPoints = getRecords($linkedTable, ['user_id' => $user_id])['data'] ?? [];

                foreach ($response['data'] as &$record) {
                    $record['skills'] = array_values(array_map('nestTranslationFields', array_filter($skillPoints, function ($point) use ($record, $foreignKey) {
                        return $point[$foreignKey] == $record['id'];
                    })));
                }
                unset($record);
            }

            $response['data'] = array_map(function ($item) {
                $item = nestTranslationFields($item);
                if (isset($item['skills']) && is_array($item['skills'])) {
                    $item['skills'] = array_map('nestTranslationFields', $item['skills']);
                }
                return $item;
            }, $response['data']);

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
            return ['success' => false, 'message' => 'Invalid or missing conditions for update.'];
        }
        $response = updateRecord($table, $data, $conditions);
    } elseif ($action === 'delete') {
        if (empty($conditions)) {
            return ['success' => false, 'message' => 'Invalid or missing conditions for delete.'];
        }
        $response = deleteRecord($table, $conditions);
    }
    return $response;
}

function enforceUserScope(&$request, $user_id, $enforce = true)
{
    if (!$enforce) return;

    if (!isset($request['conditions']['user_id']) && $user_id) {
        if (!isset($request['user_dependant']) || $request['user_dependant']) {
            $request['conditions']['user_id'] = $user_id;
        }
    }
}

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

function prepareColumns($columns)
{
    $columnParts = [];
    foreach ($columns as $key => $alias) {
        if ($key === $alias || is_numeric($key)) {
            $columnParts[] = $alias;
        } else {
            $columnParts[] = "$key AS $alias";
        }
    }
    return !empty($columnParts) ? $columnParts : ['*'];
}
