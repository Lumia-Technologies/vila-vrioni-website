<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$to = 'contact@vrioni.al';
$inquiry_type = filter_input(INPUT_POST, 'inquiry_type', FILTER_SANITIZE_SPECIAL_CHARS) ?: 'General';
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS) ?: 'Not provided';
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$organisation = filter_input(INPUT_POST, 'organisation', FILTER_SANITIZE_SPECIAL_CHARS) ?: '';
$checkin = filter_input(INPUT_POST, 'checkin', FILTER_SANITIZE_SPECIAL_CHARS) ?: '';
$checkout = filter_input(INPUT_POST, 'checkout', FILTER_SANITIZE_SPECIAL_CHARS) ?: '';
$guests = filter_input(INPUT_POST, 'guests', FILTER_SANITIZE_SPECIAL_CHARS) ?: '';
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS) ?: '';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email required']);
    exit;
}

$subject = "Vila Vrioni Enquiry: $inquiry_type — $name";

$body = "New enquiry from vrioni.al\n";
$body .= "================================\n\n";
$body .= "Type: $inquiry_type\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
if ($organisation) $body .= "Organisation: $organisation\n";
if ($checkin) $body .= "Check-in: $checkin\n";
if ($checkout) $body .= "Check-out: $checkout\n";
if ($guests) $body .= "Guests: $guests\n";
$body .= "\nMessage:\n$message\n";

$headers = "From: noreply@vrioni.al\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send']);
}
