<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250922215029 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE avis_utilisateur DROP FOREIGN KEY FK_42F52E1C197E709F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis_utilisateur DROP FOREIGN KEY FK_42F52E1CFB88E14F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE avis_utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis ADD auteur_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF060BB6FE6 FOREIGN KEY (auteur_id) REFERENCES utilisateur (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8F91ABF060BB6FE6 ON avis (auteur_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE avis_utilisateur (avis_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_42F52E1C197E709F (avis_id), INDEX IDX_42F52E1CFB88E14F (utilisateur_id), PRIMARY KEY(avis_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis_utilisateur ADD CONSTRAINT FK_42F52E1C197E709F FOREIGN KEY (avis_id) REFERENCES avis (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis_utilisateur ADD CONSTRAINT FK_42F52E1CFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF060BB6FE6
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_8F91ABF060BB6FE6 ON avis
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE avis DROP auteur_id
        SQL);
    }
}
