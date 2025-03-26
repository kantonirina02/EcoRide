<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250326233713 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE participe (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE participe_utilisateur (participe_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_1A41E59CA71D81B9 (participe_id), INDEX IDX_1A41E59CFB88E14F (utilisateur_id), PRIMARY KEY(participe_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE participe_covoiturage (participe_id INT NOT NULL, covoiturage_id INT NOT NULL, INDEX IDX_2F9A18A6A71D81B9 (participe_id), INDEX IDX_2F9A18A662671590 (covoiturage_id), PRIMARY KEY(participe_id, covoiturage_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_utilisateur ADD CONSTRAINT FK_1A41E59CA71D81B9 FOREIGN KEY (participe_id) REFERENCES participe (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_utilisateur ADD CONSTRAINT FK_1A41E59CFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_covoiturage ADD CONSTRAINT FK_2F9A18A6A71D81B9 FOREIGN KEY (participe_id) REFERENCES participe (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_covoiturage ADD CONSTRAINT FK_2F9A18A662671590 FOREIGN KEY (covoiturage_id) REFERENCES covoiturage (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_utilisateur DROP FOREIGN KEY FK_1A41E59CA71D81B9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_utilisateur DROP FOREIGN KEY FK_1A41E59CFB88E14F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_covoiturage DROP FOREIGN KEY FK_2F9A18A6A71D81B9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE participe_covoiturage DROP FOREIGN KEY FK_2F9A18A662671590
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE participe
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE participe_utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE participe_covoiturage
        SQL);
    }
}
