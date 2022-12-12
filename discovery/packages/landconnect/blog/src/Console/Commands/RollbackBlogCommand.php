<?php

namespace Landconnect\Blog\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Landconnect\Blog\Blog;
use Symfony\Component\Console\Input\InputOption;

class RollbackBlogCommand extends Command
{
    use ConfirmableTrait;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:rollback-blog {--database= : The database connection to use.}
                {--force : Force the operation to run when in production.}
                {--path= : The path of migrations files to be executed.}
                {--pretend : Dump the SQL queries that would be run.}
                {--step=STEP : Force the migrations to be run so they can be rolled back individually.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rollback the last blog database migration';

    /**
     * The migrator instance.
     *
     * @var \Illuminate\Database\Migrations\Migrator
     */
    protected $migrator;

    /**
     * Create a new migration rollback command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

        /** @var \Illuminate\Database\Migrations\Migrator $migrator */
        $migrator = app()->make('migrator');
        $this->migrator = $migrator;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     * @throws \Exception
     */
    public function handle()
    {
        if (! $this->confirmToProceed()) {
            return;
        }

        $blogConnections = config('database.BLOG_DATABASES');

        if ($blogConnections) {
            $blogConnections = explode(';', $blogConnections);

            foreach ($blogConnections as $connection) {
                list($id, $domain) = explode(',', $connection);

                $connection = Blog::DB_PREFIX . $id;
                $this->info('Running migration for "' . $connection . '"');

                $this->migrator->setConnection($connection);

                $this->migrator->rollback(
                    __DIR__ . '/../../../database/migrations/', [
                        'pretend' => $this->option('pretend'),
                        'step' => (int) $this->option('step'),
                    ]
                );

                // Once the migrator has run we will grab the note output and send it out to
                // the console screen, since the migrator itself functions without having
                // any instances of the OutputInterface contract passed into the class.
                foreach ($this->migrator->setOutput($this->output) as $note) {
                    $this->output->writeln($note);
                }
            }
        }
    }

    /**
     * Get the console command options.
     *
     * @return array
     */
    protected function getOptions()
    {
        return [
            ['database', null, InputOption::VALUE_OPTIONAL, 'The database connection to use.'],

            ['force', null, InputOption::VALUE_NONE, 'Force the operation to run when in production.'],

            ['path', null, InputOption::VALUE_OPTIONAL, 'The path of migrations files to be executed.'],

            ['pretend', null, InputOption::VALUE_NONE, 'Dump the SQL queries that would be run.'],

            ['step', null, InputOption::VALUE_OPTIONAL, 'The number of migrations to be reverted.'],
        ];
    }
}
