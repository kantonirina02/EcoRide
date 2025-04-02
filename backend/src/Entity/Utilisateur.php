<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
// --- Modification Import Validator ---
// Importe directement l'alias Assert
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank] // Utilisation directe via l'alias
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank] // Utilisation directe via l'alias
    private ?string $prenom = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank] // Utilisation directe via l'alias
    #[Assert\Email]    // Utilisation directe via l'alias
    private ?string $email = null;

    /**
     * @var string The hashed password
     */
    #[ORM\Column(length: 255)]
    #[Groups(['user:write'])]
    private ?string $password = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $telephone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $adresse = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?\DateTimeInterface $dateNaissance = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read', 'user:write'])]
    private ?string $photo = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank] // Utilisation directe via l'alias
    private ?string $pseudo = null;

    /**
     * @var Collection<int, Role>
     */
    // Vérifie le 'inversedBy' dans ton entité Role si la relation est bidirectionnelle
    #[ORM\ManyToMany(targetEntity: Role::class /*, inversedBy: 'utilisateurs' */)]
    #[Groups(['user:read', 'user:write'])]
    private Collection $roles; // Nom en minuscule

    /**
     * @var Collection<int, Voiture>
     */
    // J'utilise 'proprietaire' ici, adapte si c'est 'utilisateur' dans Voiture.php
    #[ORM\OneToMany(targetEntity: Voiture::class, mappedBy: 'proprietaire', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $voitures;

    /**
     * @var Collection<int, Covoiturage>
     */
    // Vérifie 'passagers' dans Covoiturage.php
    #[ORM\ManyToMany(targetEntity: Covoiturage::class, mappedBy: 'passagers')]
    #[Groups(['user:read'])]
    private Collection $participations;

    /**
     * @var Collection<int, Avis>
     */
    // Vérifie 'auteur' dans Avis.php
    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'auteur', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $avisDonnes;

    public function __construct()
    {
        $this->roles = new ArrayCollection();
        $this->voitures = new ArrayCollection();
        $this->participations = new ArrayCollection();
        $this->avisDonnes = new ArrayCollection();
    }

    // --- Getters et Setters (inchangés pour les propriétés simples) ---

    public function getId(): ?int { return $this->id; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getPrenom(): ?string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = $prenom; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): static { $this->email = $email; return $this; }
    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }
    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $telephone): static { $this->telephone = $telephone; return $this; }
    public function getAdresse(): ?string { return $this->adresse; }
    public function setAdresse(?string $adresse): static { $this->adresse = $adresse; return $this; }
    public function getDateNaissance(): ?\DateTimeInterface { return $this->dateNaissance; }
    public function setDateNaissance(?\DateTimeInterface $dateNaissance): static { $this->dateNaissance = $dateNaissance; return $this; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): static { $this->photo = $photo; return $this; }
    public function getPseudo(): ?string { return $this->pseudo; }
    public function setPseudo(?string $pseudo): static { $this->pseudo = $pseudo; return $this; }


    // --- Méthodes UserInterface ---

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        // --- Correction ici ---
        // Hypothèse : La méthode dans Role s'appelle getLibelle()
        // VÉRIFIE LE VRAI NOM DANS Role.php !
        $rolesStrings = $this->roles->map(fn(Role $role) => $role->getLibelle())->toArray();
        $rolesStrings[] = 'ROLE_USER';
        return array_unique($rolesStrings);
    }

    public function eraseCredentials(): void { /* $this->plainPassword = null; */ }

    // --- Gestion Collections ---

    /** @return Collection<int, Role> */
    public function getRolesCollection(): Collection { return $this->roles; }
    public function addRole(Role $role): static { if (!$this->roles->contains($role)) { $this->roles->add($role); } return $this; }
    public function removeRole(Role $role): static { $this->roles->removeElement($role); return $this; }

    /** @return Collection<int, Voiture> */
    public function getVoitures(): Collection { return $this->voitures; }

    public function addVoiture(Voiture $voiture): static
    {
        if (!$this->voitures->contains($voiture)) {
            $this->voitures->add($voiture);
            // --- Correction ici ---
            // Hypothèse : La méthode dans Voiture s'appelle setProprietaire()
            // VÉRIFIE LE VRAI NOM DANS Voiture.php ! (Probablement setUtilisateur ?)
            $voiture->setProprietaire($this);
        }
        return $this;
    }

    public function removeVoiture(Voiture $voiture): static
    {
        // --- Correction ici ---
        // Hypothèse : La méthode dans Voiture s'appelle getProprietaire() et setProprietaire()
        // VÉRIFIE LES VRAIS NOMS DANS Voiture.php ! (Probablement getUtilisateur/setUtilisateur ?)
        if ($this->voitures->removeElement($voiture)) {
            if ($voiture->getProprietaire() === $this) {
                $voiture->setProprietaire(null);
            }
        }
        return $this;
    }

    /** @return Collection<int, Covoiturage> */
    public function getParticipations(): Collection { return $this->participations; }

    public function addParticipation(Covoiturage $participation): static
    {
        if (!$this->participations->contains($participation)) {
            $this->participations->add($participation);
             // --- Correction ici ---
            // Hypothèse : La méthode dans Covoiturage s'appelle addPassager()
            // VÉRIFIE LE VRAI NOM DANS Covoiturage.php !
            $participation->addPassager($this);
        }
        return $this;
    }

    public function removeParticipation(Covoiturage $participation): static
    {
         // --- Correction ici ---
        // Hypothèse : La méthode dans Covoiturage s'appelle removePassager()
        // VÉRIFIE LE VRAI NOM DANS Covoiturage.php !
        if ($this->participations->removeElement($participation)) {
            $participation->removePassager($this);
        }
        return $this;
    }

    /** @return Collection<int, Avis> */
    public function getAvisDonnes(): Collection { return $this->avisDonnes; }

    public function addAvisDonne(Avis $avisDonne): static
    {
        if (!$this->avisDonnes->contains($avisDonne)) {
            $this->avisDonnes->add($avisDonne);
             // --- Correction ici ---
            // Hypothèse : La méthode dans Avis s'appelle setAuteur()
            // VÉRIFIE LE VRAI NOM DANS Avis.php !
            $avisDonne->setAuteur($this);
        }
        return $this;
    }

    public function removeAvisDonne(Avis $avisDonne): static
    {
         // --- Correction ici ---
        // Hypothèse : La méthode dans Avis s'appelle getAuteur() et setAuteur()
        // VÉRIFIE LES VRAIS NOMS DANS Avis.php !
        if ($this->avisDonnes->removeElement($avisDonne)) {
            if ($avisDonne->getAuteur() === $this) {
                $avisDonne->setAuteur(null);
            }
        }
        return $this;
    }
}
