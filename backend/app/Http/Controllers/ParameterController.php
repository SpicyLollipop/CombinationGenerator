<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\ParameterModel;

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

    /**
     * Get all parameters with their values
     */
    public function getAllParameters()
    {
        $parameters = ParameterModel::with('values')->get();
        return response()->json([
            'status' => 'success',
            'data' => $parameters
        ]);
    }

    /**
     * Get a specific parameter with its values
     */
    public function getParameter($id)
    {
        $parameter = ParameterModel::with('values')->find($id);
        
        if (!$parameter) {
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $parameter
        ]);
    }
} 