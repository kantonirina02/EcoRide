<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250220021032 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE avis (id INT AUTO_INCREMENT NOT NULL, utilisateur_id INT DEFAULT NULL, note VARCHAR(20) NOT NULL, commentaire LONGTEXT NOT NULL, valide TINYINT(1) NOT NULL, date_creation DATE NOT NULL, UNIQUE INDEX UNIQ_8F91ABF0FB88E14F (utilisateur_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE covoiturage (id INT AUTO_INCREMENT NOT NULL, chauffeur_id INT DEFAULT NULL, participation_id INT DEFAULT NULL, avis_id INT DEFAULT NULL, adress_depart VARCHAR(255) NOT NULL, adresse_arrivee VARCHAR(255) NOT NULL, date_depart DATE NOT NULL, heure_depart TIME NOT NULL, heure_arrivee TIME NOT NULL, prix NUMERIC(10, 0) NOT NULL, is_ecologique TINYINT(1) NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_28C79E8985C0B3BE (chauffeur_id), INDEX IDX_28C79E896ACE3B73 (participation_id), INDEX IDX_28C79E89197E709F (avis_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE participation (id INT AUTO_INCREMENT NOT NULL, utilisateur_id INT DEFAULT NULL, confirmation TINYINT(1) NOT NULL, date_confirmation DATE NOT NULL, UNIQUE INDEX UNIQ_AB55E24FFB88E14F (utilisateur_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE preferences (id INT AUTO_INCREMENT NOT NULL, utilisateur_id INT DEFAULT NULL, fumeur TINYINT(1) NOT NULL, animal TINYINT(1) NOT NULL, autres LONGTEXT NOT NULL, UNIQUE INDEX UNIQ_E931A6F5FB88E14F (utilisateur_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE vehicule (id INT AUTO_INCREMENT NOT NULL, covoiturage_id INT DEFAULT NULL, immatriculation VARCHAR(20) NOT NULL, date_premiere_immatriculation DATE NOT NULL, marque VARCHAR(50) NOT NULL, modele VARCHAR(50) NOT NULL, couleur VARCHAR(30) NOT NULL, nb_places VARCHAR(20) NOT NULL, energie VARCHAR(255) NOT NULL, INDEX IDX_292FFF1D62671590 (covoiturage_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE avis ADD CONSTRAINT FK_8F91ABF0FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE covoiturage ADD CONSTRAINT FK_28C79E8985C0B3BE FOREIGN KEY (chauffeur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE covoiturage ADD CONSTRAINT FK_28C79E896ACE3B73 FOREIGN KEY (participation_id) REFERENCES participation (id)');
        $this->addSql('ALTER TABLE covoiturage ADD CONSTRAINT FK_28C79E89197E709F FOREIGN KEY (avis_id) REFERENCES avis (id)');
        $this->addSql('ALTER TABLE participation ADD CONSTRAINT FK_AB55E24FFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE preferences ADD CONSTRAINT FK_E931A6F5FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE vehicule ADD CONSTRAINT FK_292FFF1D62671590 FOREIGN KEY (covoiturage_id) REFERENCES covoiturage (id)');
        $this->addSql('ALTER TABLE utilisateur ADD vehicule_id INT NOT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD CONSTRAINT FK_1D1C63B34A4A3511 FOREIGN KEY (vehicule_id) REFERENCES vehicule (id)');
        $this->addSql('CREATE INDEX IDX_1D1C63B34A4A3511 ON utilisateur (vehicule_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE utilisateur DROP FOREIGN KEY FK_1D1C63B34A4A3511');
        $this->addSql('ALTER TABLE avis DROP FOREIGN KEY FK_8F91ABF0FB88E14F');
        $this->addSql('ALTER TABLE covoiturage DROP FOREIGN KEY FK_28C79E8985C0B3BE');
        $this->addSql('ALTER TABLE covoiturage DROP FOREIGN KEY FK_28C79E896ACE3B73');
        $this->addSql('ALTER TABLE covoiturage DROP FOREIGN KEY FK_28C79E89197E709F');
        $this->addSql('ALTER TABLE participation DROP FOREIGN KEY FK_AB55E24FFB88E14F');
        $this->addSql('ALTER TABLE preferences DROP FOREIGN KEY FK_E931A6F5FB88E14F');
        $this->addSql('ALTER TABLE vehicule DROP FOREIGN KEY FK_292FFF1D62671590');
        $this->addSql('DROP TABLE avis');
        $this->addSql('DROP TABLE covoiturage');
        $this->addSql('DROP TABLE participation');
        $this->addSql('DROP TABLE preferences');
        $this->addSql('DROP TABLE vehicule');
        $this->addSql('DROP INDEX IDX_1D1C63B34A4A3511 ON utilisateur');
        $this->addSql('ALTER TABLE utilisateur DROP vehicule_id');
    }
}
