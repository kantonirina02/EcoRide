<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250402122557 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE avis ADD statut VARCHAR(50) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE utilisateur CHANGE email email VARCHAR(255) NOT NULL, CHANGE pseudo pseudo VARCHAR(50) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_1D1C63B3E7927C74 ON utilisateur (email)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_1D1C63B386CC499D ON utilisateur (pseudo)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE avis DROP statut
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_1D1C63B3E7927C74 ON utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_1D1C63B386CC499D ON utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE utilisateur CHANGE email email VARCHAR(255) DEFAULT NULL, CHANGE pseudo pseudo VARCHAR(50) DEFAULT NULL
        SQL);
    }
}
