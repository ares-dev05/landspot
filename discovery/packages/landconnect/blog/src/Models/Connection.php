<?php

namespace Landconnect\Blog\Models;
use Landconnect\Blog\Blog;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class Connection
 */
class Connection
{
    /** @var Connection */
    protected static $i;

    /** @var string connection */
    protected $connection;

    /** @var string domain */
    protected $domain;


    function __construct()
    {
        $blogConnections = config('database.BLOG_DATABASES');
        $host = $_SERVER['HTTP_X_INSIGHTS_URL'] ?? request()->getHost();
        if ($blogConnections) {
            $blogConnections = explode(';', $blogConnections);

            foreach ($blogConnections as $connection) {
                list($id, $domain) = explode(',', $connection);

                if ($domain == $host) {
                    $this->connection = Blog::DB_PREFIX . $id;
                    $this->domain     = $domain;
                    break;
                }
            }
        }
        if (!$this->connection) {
            throw new NotFoundHttpException('Connection not found');
        }
    }

    /**
     * @return Connection
     */
    static function i()
    {
        if (!static::$i) {
            static::$i = new static();
        }

        return static::$i;
    }

    /**
     * @return string connection
     */
    function getConnection()
    {
        return $this->connection;
    }

    /**
     * @return string domain
     */
    function getDomain()
    {
        return $this->domain;
    }
}
