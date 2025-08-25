<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
{
    $user = $request->user();

    if (!$user || !in_array($user->role, $roles)) {
        return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
    }

    return $next($request);
}
}