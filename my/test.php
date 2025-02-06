<?php

require_once('../tcpdf/tcpdf.php');

$pdf = new TCPDF();
$pdf->AddPage();

// Use Arial to confirm font rendering works
$pdf->SetFont('arial', '', 14);
$pdf->Write(0, 'This is a test using Arial font.');

// Switch to DIN Alternate
$pdf->AddFont('dinalternateb', '', 'dinalternateb.php');
$pdf->SetFont('dinalternateb', '', 14);
$pdf->Write(0, "\nThis is a test using DIN Alternate font.");
$pdf->Output('test_minimal.pdf', 'I');
