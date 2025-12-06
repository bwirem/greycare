<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    
    'nhif' => [
        'username'      => env('NHIF_USERNAME'),
        'password'      => env('NHIF_PASSWORD'),
        'facility_code' => env('NHIF_FACILITY_CODE'),
        'token_url'     => env('NHIF_TOKEN_URL', 'https://nhif.or.ke/nhifapi/api/Token'),
        'service_url'   => env('NHIF_SERVICE_URL', 'https://nhif.or.ke/nhifapi/api/'),
    ],

    'nhif_breeze' => [
        'username'     => env('NHIF_BREEZE_USERNAME'),
        'password'     => env('NHIF_BREEZE_PASSWORD'),
        'token_url'    => env('NHIF_BREEZE_TOKEN_URL'),
        'service_url'  => env('NHIF_BREEZE_SERVICE_URL'),
    ],


];
