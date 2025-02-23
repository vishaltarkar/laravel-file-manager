<?php

use GemaDigital\FileManager\app\Http\Controllers\API\MediaAPIController;

// Framework
Route::group(
    [
        'namespace' => 'GemaDigital\FileManager\app\Http\Controllers',
        'middleware' => 'web',
    ],
    function () {
        // Admin
        Route::group(
            [
                'prefix' => config('backpack.base.route_prefix'),
                'middleware' => ['admin', 'web'],
                'namespace' => 'Admin',
            ],
            function () {
                Route::get('file-manager', 'FileManagerController@render');
                Route::crud('media-tag', 'MediaTagCrudController');
                Route::crud('media-type', 'MediaTypeCrudController');
                Route::crud('media-version', 'MediaVersionCrudController');
                Route::crud('media', 'MediaCrudController');
            }
        );
    }
);

Route::group(
    [
        'namespace' => 'API',
        'middleware' => ['api'],
        'prefix' => 'api',
    ],
    function () {
        Route::group(['prefix' => 'media'], function () {
            Route::get('/parent', [MediaAPIController::class, 'getParents']);
            Route::post('/tag', [MediaAPIController::class, 'addTags']);
            Route::post('/tag/unsign', [MediaAPIController::class, 'removeTags']);
            Route::post('/upload', [MediaAPIController::class, 'uploadMedia']);
            Route::post('/{id}/edit', [MediaAPIController::class, 'editMedia']);
            Route::post('/cloud', [MediaAPIController::class, 'mediaCloud'])->name('mediaCloud');
            Route::post('/cloud/webhook', [MediaAPIController::class, 'mediaCloudWebhook']);
        });
    });

// Webhooks
Route::group(
    [
        'namespace' => 'GemaDigital\FileManager\app\Http\Controllers',
    ],
    function () {
        // TODO
    }
);
