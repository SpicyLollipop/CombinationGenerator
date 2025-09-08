<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ParameterController;

Route::post('/save-parameters', [ParameterController::class, 'save']);
Route::get('/get-parameters', [ParameterController::class, 'get']); 

// Endpoints for fetching parameters from database
Route::get('/parameters', [ParameterController::class, 'getAllParameters']);
Route::get('/parameters/{id}', [ParameterController::class, 'getParameter']);