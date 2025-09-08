<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\ParameterModel;

class ParameterController extends Controller
{
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