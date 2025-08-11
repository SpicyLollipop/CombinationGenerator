<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ParameterValueModel;

class ParameterModel extends Model
{
    protected $table = 'parameters';
    
    protected $fillable = ['name', 'description'];

    public function values()
    {
        return $this->hasMany(ParameterValueModel::class, 'parameter_id');
    }
}
