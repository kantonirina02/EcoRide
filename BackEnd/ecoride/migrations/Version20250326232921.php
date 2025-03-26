<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250326232921 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE possede (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE possede_utilisateur (possede_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_BD921348C835AB29 (possede_id), INDEX IDX_BD921348FB88E14F (utilisateur_id), PRIMARY KEY(possede_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE possede_role (possede_id INT NOT NULL, role_id INT NOT NULL, INDEX IDX_3B46B142C835AB29 (possede_id), INDEX IDX_3B46B142D60322AC (role_id), PRIMARY KEY(possede_id, role_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_utilisateur ADD CONSTRAINT FK_BD921348C835AB29 FOREIGN KEY (possede_id) REFERENCES possede (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_utilisateur ADD CONSTRAINT FK_BD921348FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_role ADD CONSTRAINT FK_3B46B142C835AB29 FOREIGN KEY (possede_id) REFERENCES possede (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_role ADD CONSTRAINT FK_3B46B142D60322AC FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_utilisateur DROP FOREIGN KEY FK_BD921348C835AB29
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_utilisateur DROP FOREIGN KEY FK_BD921348FB88E14F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_role DROP FOREIGN KEY FK_3B46B142C835AB29
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE possede_role DROP FOREIGN KEY FK_3B46B142D60322AC
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE possede
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE possede_utilisateur
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE possede_role
        SQL);
    }
}
