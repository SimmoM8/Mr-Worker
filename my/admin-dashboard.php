<?php

session_start();

// If user is not logged in, return error response
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User is not logged in']);
    exit();
}

require '../db.php'; // Include the PDO connection

$stmt = $pdo->prepare("SELECT count(*) FROM `users`");
$stmt->execute();
$userCount = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT * FROM `user_reports`");
$stmt->execute();
$response = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>

<section class="dashboard container-fluid">
    <div class="background-icon"><i class="fa-solid fa-user-tie"></i></div>
    <div class="container">
        <h1>Admin Dashboard</h1>
        <div class="row">
            <div class="col-6">
                <div class="card card-body card-colored">
                    <h4>Users</h4>
                    <div id="users_counter"><?php echo $userCount; ?></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="card card-body card-colored">
                    <h4>User reports and suggestions</h4>
                    <table id="user_reports_table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Report message</th>
                                <th scope="col">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            foreach ($response as $row) {
                                echo '<tr><th scope="row">' . $row[''] . '</th><td>' . $row['report_message'] . '</td><td>' . $row['report_date'] . '</td></tr>';
                            }
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>