<?php
// Start output buffering to prevent any accidental output from breaking PDF generation
ob_start();

define('K_TCPDF_EXTERNAL_CONFIG', true);
define('K_TCPDF_DEBUG', true);

// If user is not logged in, redirect to sign-in page
if (!isset($_SESSION['user_id'])) {
    header("Location: ../sign-in.html");
    exit();
}

require_once '../db.php'; // Include db.php for the PDO connection

$card_id = $_POST['card_id'];
$user_id = $_SESSION['user_id'];

// RESUME DATA
$data = $resumePackage ?? null;
if (!$data) {
    throw new Exception("Resume data not found.");
}

$selected_language = $data['selected_language'] ?? 'lang_1'; // Default to 'lang_1' if not set
$selectedLangCode = $data['selected_lang_code'] ?? 'en';

$headings = include(__DIR__ . '/translations/headings.php');
$translatedHeadings = $headings[$selectedLangCode] ?? $headings['en'];

$title = $data['resume']['title'][$selected_language];
$language = 'en';
$color1 = hexToRgb($data['resume']['grad_color_1']);
$color2 = hexToRgb($data['resume']['grad_color_2']);
$bg_color = hexToRgb($data['resume']['background_color']);
$bubble_color = hexToRgb($data['resume']['bubble_color']);

$first_name = $data['user']['first_name'];
$last_name = $data['user']['last_name'];
$name = $first_name . " " . $last_name;
$mobile = "(+" . $data['user']['country_code'] . ") " . $data['user']['mobile'];
$address = $data['user']['street'] . "\n" . $data['user']['town'] . " " . $data['user']['post_code'];
$email = $data['user']['email'];
$about_me = $data['user']['about_me'];
$img_scale = $data['user']['img_scale'];
$img_pos_x = $data['user']['img_pos_x'];
$img_pos_y = $data['user']['img_pos_y'];

$originalColor = array('r' => 230, 'g' => 30, 'b' => 37);
$targetColor = array('r' => 253, 'g' => 233, 'b' => 233);

function hexToRgb($hexColor)
{
    // Remove the # symbol if present
    $hexColor = ltrim($hexColor, '#');

    // Ensure the hex color is valid
    if (!preg_match('/^[a-fA-F0-9]{6}$/', $hexColor)) {
        return false;
    }

    // Extract the color components using sscanf
    list($red, $green, $blue) = sscanf($hexColor, "%02x%02x%02x");

    // Return the RGB array
    return array('r' => $red, 'g' => $green, 'b' => $blue);
}


// PROFILE DATA
$default_pic_path = 'uploads/profile_default.jpeg';
$user_pic_path = 'uploads/profile_picture_user_' . $_SESSION['user_id'] . '.jpeg';
$profile_pic_path = file_exists($user_pic_path) ? $user_pic_path : $default_pic_path;
$profile_info = array(
    'first_name' => $first_name,
    'last_name' => $last_name,
    'title' => $title
);

//include library
require_once('../tcpdf/tcpdf.php');

$border = 0;


// Extend the TCPDF class to create custom Header and Footer
class MYPDF extends TCPDF
{

    // Page header
    public function Header()
    {
        // Empty method body - remove header
    }

    // Page footer
    public function Footer()
    {
        // Empty method body - remove footer
    }
}

// create new PDF document
$pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);


// set margins (L, T, R)
$pdf->SetMargins(0, 10, 0);
$pdf->SetHeaderMargin(0);
$pdf->SetFooterMargin(0);

// set auto page breaks
$pdf->SetAutoPageBreak(false, 10);

// Disable default header/footer
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// set document information
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Benjamin Simmons');
$pdf->SetTitle('MyResume');
$pdf->SetSubject('');
$pdf->SetKeywords('TCPDF, PDF, resume, myjobai');

// set default monospaced font
$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);


// set image scale factor
//$pdf->setImageScale( PDF_IMAGE_SCALE_RATIO );

// set some language-dependent strings (optional)
if (@file_exists(dirname(__FILE__) . '/lang/eng.php')) {
    require_once(dirname(__FILE__) . '/lang/eng.php');
    $pdf->setLanguageArray($l);
}

// ---------------------------------------------------------

// add a page
$pdf->AddPage();

// Set the style for the resume
$style = array(
    'font' => 'arial',
    'header_font' => 'dinalternateb',
    'subtitle_color' => array('r' => 89, 'g' => 90, 'b' => 92),
    'color1' => $color1,
    'color2' => $color2,
    'bg_color' => $bg_color,
    'bubble_color' => $bubble_color,
    'border' => $border,
    'divider' => array(
        'margin' => array(2.2, 0, 6, 0), // (T, R, B, L)
        'thickness' => 1.4
    ),
    'skill' => array(
        'color' => $bubble_color,
        'gap' => 1.7,
        'padding' => 2
    ),
    'heading_margin' => array(4.5, 0, 0, 0), // (T, R, B, L)
    'bottom_margin' => 10
);


// Get the page width and height
$pageWidth = $pdf->getPageWidth();
$pageHeight = $pdf->getPageHeight();

//============================================================+
// HEADER
//============================================================+
include_once('parts/gen-header.php');

//============================================================+
// SIDE BAR
//============================================================+

// Set the side bar Y position
$currentY = $title_end;

// Set the properties of the side bar
$side_bar = array(
    'x' => 0,
    'width' => 70,
    'm_top' => 4,
    'm_right' => 7,
    'm_bottom' => 0,
    'm_left' => 10,
    'bg' => $bg_color,
    'cell_height' => 10,
    'icon_width' => 7.2,
    'inner_width' => '',
    'contact_info' => '',
    'skills' => '',
    'languages' => '',
    'licenses' => ''
);
$side_bar['inner_width'] = $side_bar['width'] - $side_bar['m_left'] - $side_bar['m_right'];

// Calculate the available height for the side bar
$availableHeight = $pdf->getPageHeight() - $currentY - $pdf->getFooterMargin();

// Set color of the side bar
$pdf->SetFillColor($side_bar['bg']['r'], $side_bar['bg']['g'], $side_bar['bg']['b']);

// Create background of side bar
$pdf->Rect($side_bar['x'], $currentY, $side_bar['width'], $availableHeight, ($border === 1) ? 'D' : 'F');

// --- CONTACT INFO ---

include_once('parts/gen-contact.php');

// --- SKILLS ---

include_once('parts/gen-skills.php');

// --- LANGUAGES ---

include_once('parts/gen-languages.php');

// --- LICENSES ---

include_once('parts/gen-licenses.php');

//============================================================+
// CONTENT
//============================================================+

// Set the content position
$pdf->SetXY($side_bar['width'], $title_end);

$content = array(
    'x' => $side_bar['width'],
    'width' => $pageWidth - $side_bar['width'],
    'margin' => array(4, 7, 0, 7), // (T, R, B, L)
    'inner_width' => ''
);

$content['inner_width'] = $content['width'] - $content['margin'][1] - $content['margin'][3];

// --- ABOUT ME ---

include_once('parts/gen-about.php');

// --- WORK EXPERIENCE ---

include_once('parts/gen-experience.php');

// --- EDUCATION ---

include_once('parts/gen-education.php');

// Create each work experience or education, NOT including their dot points
function genExp($pdf, $x, $y, $width, $title, $corp, $location, $startDate, $endDate, $style)
{
    // Set X coord
    $pdf->SetXY($x, $y);

    // Output title
    $pdf->SetFont($style['font'], 'B', 10);
    $pdf->Cell($width * 0.7, 5, $title, $style['border'], 0, 'L');

    // Set text color to dark grey for the date and info texts
    $pdf->setTextColor($style['subtitle_color']['r'], $style['subtitle_color']['g'], $style['subtitle_color']['b']);

    // Output date
    $dates = $startDate . ' - ' . $endDate;
    $pdf->SetFont($style['font'], '', 8);
    $pdf->Cell($width * 0.3, 5, $dates, $style['border'], 1, 'R');

    // Set X coord
    $pdf->SetX($x);

    // Output info
    $info = $corp . "  \u{25CF}  " . $location;
    $pdf->SetFont($style['font'], '', 8);
    $pdf->setFontSpacing(0.26);
    $pdf->Cell($width, '', $info, $style['border'], 1, 'L');
    $pdf->setFontSpacing(0);
    $pdf->setTextColor(0, 0, 0); // Reset the text color to black.
}

// Create each skill for each work experience or education
function genPoint($pdf, $x, $width, $data, $style)
{
    // Set indentation for bullet list
    $indent = 6.7;

    // Set bullet character
    $bullet = "\u{2022}"; // Bullet character (Unicode)

    // Output bullet point and indent
    $pdf->SetX($x);
    $pdf->SetFont($style['font'], '', 8);
    $pdf->Cell($indent, '', $bullet, $style['border'], 0, 'L');
    $pdf->SetX($x + $indent);

    // Output the multicell
    $pdf->MultiCell($width - $indent, '', $data, $style['border'], 'L', false, 1);
    $pdf->setY($pdf->GetY());
}

function newPage($pdf, $side_bar, $content, $profile_info, $headings, $language, $style, $pic, $img_scale, $img_pos_x, $img_pos_y)
{
    $pageWidth = $pdf->getPageWidth();
    $pageHeight = $pdf->getPageHeight();

    // Output page number before creating new page
    drawPageNumber($pdf, $content, $pageWidth, $pageHeight, $style);

    // Start a new page
    $pdf->AddPage();
    $currentY = $pdf->GetY();
    $new_pageY = $currentY;


    // 
    // Output sidebar for new page
    //

    $pdf->setX($side_bar['x']);
    // Output title cell
    genTitle($pdf, $side_bar['x'], $currentY, $side_bar['width'], $profile_info['title'], true, $style);
    $currentY = $pdf->GetY();

    $nameHeight = 0;
    $pSectionHeight = 34;
    $name_y = $currentY + $pSectionHeight / 2;

    // Output the profile pic
    $profile_pic_width = 18.4;
    drawProfile($pdf, $side_bar['x'] + $side_bar['m_left'] + 0.7, $name_y - $profile_pic_width / 2, $profile_pic_width, 1.41, $pic, $style, $img_scale, $img_pos_x, $img_pos_y);

    // Output the name cell
    $pdf->SetFont('avenir_heavy', '', 12);
    $pdf->SetXY($side_bar['x'] + $side_bar['width'] / 2 + 1.5, $name_y);
    $pdf->Cell($side_bar['width'] / 2 - 1.5, '', $profile_info['first_name'], $style['border'], 1, 'L', false, false, 0, '', 'B');
    $pdf->SetX($side_bar['x'] + $side_bar['width'] / 2 + 1.5);
    $pdf->Cell($side_bar['width'] / 2 - 1.5, '', $profile_info['last_name'], $style['border'], 0, 'L', false, false, 0, '', 'T');


    $currentY = $pdf->GetY() + $pSectionHeight / 2;

    // Calculate the available height for the side bar
    $availableHeight = $pdf->getPageHeight() - $currentY - $pdf->getFooterMargin();
    // Set color of the side bar
    $pdf->SetFillColor($side_bar['bg']['r'], $side_bar['bg']['g'], $side_bar['bg']['b']);
    // Create background of side bar
    $pdf->Rect($side_bar['x'], $currentY, $side_bar['width'], $availableHeight, ($style['border'] === 1) ? 'D' : 'F');

    // Output info
    drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $headings['contact_info'], $side_bar['m_left'], $style);
    $currentY = $pdf->GetY();
    sbInfo($pdf, $currentY, $side_bar, $style);
    $currentY = $pdf->GetY();


    // Output skills
    drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $headings['skills'], $side_bar['m_left'], $style);
    $currentY = $pdf->GetY();
    sbSkills($pdf, $side_bar, $currentY, $side_bar['inner_width'], $style);
    $currentY = $pdf->GetY();


    // Output languages
    drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $headings['languages'], $side_bar['m_left'], $style);
    $currentY = $pdf->GetY();
    sbLanguages($pdf, $currentY, $side_bar, $style);
    $currentY = $pdf->GetY();


    // Output licenses
    drawHeader($pdf, $side_bar['x'] + $side_bar['m_left'], $currentY, $side_bar['inner_width'], $headings['licenses'], $side_bar['m_left'], $style);
    $currentY = $pdf->GetY();
    sblicenses($pdf, $currentY, $side_bar, $style);
    $pdf->SetY($new_pageY);
}

// Create headings with divider bar
function drawHeader($pdf, $x, $y, $width, $text, $left_m, $style)
{
    // Set x and y
    $currentY = $y;
    $pdf->setXY($x, $currentY + $style['heading_margin'][0]);

    // Heading

    $pdf->SetFont($style['header_font'], '', 14); // Set heading font
    $pdf->Cell($width, '', strtoupper($text), $style['border'], 1, 'L');

    // Divider bar
    $currentY = $pdf->GetY();
    $r = $style['divider']['thickness'] / 2;
    $pdf->StartTransform();
    // Draw the rectangle with rounded edges by creating a clipping mask on the linear gradient
    $pdf->RoundedRect($x - $left_m, $currentY + $style['divider']['margin'][0], $width + $left_m, $style['divider']['thickness'], $r, '1111', 'CNZ');
    // Set the gradient fill
    $pdf->LinearGradient($x - $left_m, $currentY + $style['divider']['margin'][0], $width + $left_m, $style['divider']['thickness'], $style['color1'], $style['color2']);
    $pdf->StopTransform();

    // `Set x and y with bottom margin
    $pdf->setY($currentY + $style['divider']['thickness'] + $style['divider']['margin'][2]);

    $pdf->SetFont($style['font'], '', 8); // Reset font
}

function drawPageNumber($pdf, $content, $pageWidth, $pageHeight, $style)
{
    // Output page number in the bottom right corner
    $pdf->setTextColor($style['subtitle_color']['r'], $style['subtitle_color']['g'], $style['subtitle_color']['b']); // Set text color to dark grey for the date and info texts
    $pageNumber = "Page " . $pdf->getAliasNumPage(); // Get the current page number
    $totalPages = $pdf->getAliasNbPages(); // Get the total number of pages
    //$pdf->SetFont( $font, '', 8 ); // Set the font properties for the page number
    $page_number_width = $pdf->GetStringWidth($pageNumber, $style['font'], '', 8) - 7.5;
    $pdf->SetXY($pageWidth - $content['margin'][1] - $page_number_width, $pageHeight - $style['bottom_margin'] - 0.5); // Set the position for the page number
    $pdf->Cell($page_number_width, '', $pageNumber, 0, 0, 'L', false, false, 0, '', 'A', 'T');
}

// ---------------------------------------------------------

drawPageNumber($pdf, $content, $pageWidth, $pageHeight, $style);

// Set the zoom of the pdf view in the browser
$pdf->SetDisplayMode('fullpage');


//Close and output PDF document
$docTitle = "Resume - " . $title . ".pdf";
$pdf->Output($docTitle, 'I');


//============================================================+
// END OF FILE
//============================================================+
