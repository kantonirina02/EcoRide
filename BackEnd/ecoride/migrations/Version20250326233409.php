<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250326233409 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE depose (id INT AUTO_INCREMENT NOT NULL, avis VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE depose_utilisateur (depose_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_7845B60F41CD8671 (depose_id), INDEX IDX_7845B60FFB88E14F (utilisateur_id), PRIMARY KEY(depose_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE depose_avis (depose_id INT NOT NULL, avis_id INT NOT NULL, INDEX IDX_D403920941CD8671 (depose_id), INDEX IDX_D4039209197E709F (avis_id), PRIMARY KEY(depose_id, avis_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_utilisateur ADD CONSTRAINT FK_7845B60F41CD8671 FOREIGN KEY (depose_id) REFERENCES depose (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_utilisateur ADD CONSTRAINT FK_7845B60FFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_avis ADD CONSTRAINT FK_D403920941CD8671 FOREIGN KEY (depose_id) REFERENCES depose (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_avis ADD CONSTRAINT FK_D4039209197E709F FOREIGN KEY (avis_id) REFERENCES avis (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_utilisateur DROP FOREIGN KEY FK_7845B60F41CD8671
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_utilisateur DROP FOREIGN KEY FK_7845B60FFB88E14F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_avis DROP FOREIGN KEY FK_D403920941CD8671
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE depose_avis DROP FOREIGN KEY FK_D4039209197E709F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE depose
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE depose_utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE depose_avis
        SQL);
    }
}
