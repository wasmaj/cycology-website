<?php
/* =========================================================
   api/forms.php — the site's mailing forms, in one place
   ---------------------------------------------------------
   Shared by api/send-form.php (which emails + stores a
   submission) and api/submissions.php (which lists and
   exports them), so the two can never disagree about the
   fields a form has.

   To add a form:
     1. Add an entry here.
     2. Give the <form> a matching data-mail-form="<key>".
   To change where a form's mail goes, edit its 'to'.

   'labels' is the source of truth for field order — it drives
   the order of the email body AND the columns in the CSV /
   Excel export, so keep it in the same order as the form.
   ========================================================= */

return array(

    'contact' => array(
        'to'       => 'info@cycology.com.ng',
        'title'    => 'Contact messages',
        'subject'  => 'Website contact form',
        'required' => array('name', 'email', 'message'),
        'labels'   => array(
            'name'    => 'Name',
            'email'   => 'Email',
            'phone'   => 'Phone',
            'topic'   => 'Reason for contacting',
            'message' => 'Message',
        ),
    ),

    'membership' => array(
        'to'       => 'membership@cycology.com.ng',
        'title'    => 'Membership applications',
        'subject'  => 'New membership application',
        'required' => array('firstName', 'lastName', 'email', 'phone', 'profession', 'experience'),
        'labels'   => array(
            'firstName'  => 'First name',
            'lastName'   => 'Last name',
            'email'      => 'Email',
            'phone'      => 'Phone',
            'dob'        => 'Date of birth',
            'gender'     => 'Gender',
            'profession' => 'Profession / Occupation',
            'company'    => 'Company / Organisation',
            'experience' => 'Cycling experience',
            'bikeType'   => 'Bike type',
            'referrer'   => 'Referred by',
            'why'        => 'Why they want to join',
            'agreement'  => 'Accepted Code of Conduct & Safety Rules',
        ),
    ),

);
