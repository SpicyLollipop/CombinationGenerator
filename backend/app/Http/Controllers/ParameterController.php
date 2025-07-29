<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ParameterController extends Controller
{
    public function save(Request $request)
    {
        $data = $request->only(['parameters', 'values']);
        $cookie = cookie('user_parameters', json_encode($data), 60); // 60 minutes
        return response()->json(['message' => 'Parameters saved'])->cookie($cookie);
    }

    public function get(Request $request)
    {
        $cookie = $request->cookie('user_parameters');
        $data = $cookie ? json_decode($cookie, true) : null;
        return response()->json(['data' => $data]);
    }
} 