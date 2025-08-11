<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParameterValueModel extends Model
{
    protected $table = 'parameter_values';
    
    protected $fillable = ['parameter_id', 'value'];

    public function parameter()
    {
        return $this->belongsTo(ParameterModel::class, 'parameter_id');
    }
}
