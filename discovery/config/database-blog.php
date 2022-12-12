<?php
$blogConnections = env('BLOG_DATABASES');

$connections = [];
if ($blogConnections) {
    $blogConnections = explode(';', $blogConnections);

    foreach ($blogConnections as $connection) {
        list($id, $domain) = explode(',', $connection);
        $database = \Landconnect\Blog\Blog::DB_PREFIX . $id;
        $connection = [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => $database,
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ];
        $connections[$database] = $connection;

    }
}

return $connections;