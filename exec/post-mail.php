<?php
$name = isset($_POST['name']) ? $_POST['name'] : '';
$mail = isset($_POST['mail']) ? $_POST['mail'] : '';
$subj = isset($_POST['subj']) ? $_POST['subj'] : '';
$mesg = isset($_POST['mesg']) ? $_POST['mesg'] : '';

if ($name && $mail && $subj && $mesg) {
    $to      = ''; #your email to receive mail
    $subject = $subj;
    $message = $mesg;
    $headers  = 'From: 履歷回信 <noreply@lusw.dev>' . "\r\n";
    $headers .= 'Reply-To: '. $name . " <" . $mail . '>' . "\r\n";
    $headers .= "Organization: LuSkywalker\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=utf-8\r\n";
    $headers .= "X-Priority: 3\r\n";
    $headers .= "Return-Path: noreply@lusw.dev\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    $res = mail($to, $subject, $message, $headers);

    echo $res? "good" : print_r(error_get_last());
} else {
    echo "請正確填寫表單!";
}
?>