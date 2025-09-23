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
    #[Assert\NotBlank]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank]
    private ?string $prenom = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['user:read', 'user:write'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $email = null;

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
    #[Assert\NotBlank]
    private ?string $pseudo = null;

    #[ORM\ManyToMany(targetEntity: Role::class, inversedBy: 'utilisateurs')]
    #[Groups(['user:read', 'user:write'])]
    private Collection $roles;

    #[ORM\OneToMany(targetEntity: Voiture::class, mappedBy: 'utilisateur', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $voitures;

    #[ORM\ManyToMany(targetEntity: Covoiturage::class, mappedBy: 'passengers')]
    #[Groups(['user:read'])]
    private Collection $participations;

    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'auteur', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $avisDonnes;

    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'destinataire', orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $notificationsRecues;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Groups(['user:read'])]
    #[Assert\PositiveOrZero]
    private ?int $credits = 0;

    public function __construct()
    {
        $this->roles = new ArrayCollection();
        $this->voitures = new ArrayCollection();
        $this->participations = new ArrayCollection();
        $this->avisDonnes = new ArrayCollection();
        $this->notificationsRecues = new ArrayCollection();
        $this->credits = 20;
    }

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
    public function getCredits(): ?int { return $this->credits; }
    public function setCredits(int $credits): static { $this->credits = $credits; return $this; }

    public function addCredits(int $amount): static
    {
        if ($amount > 0) {
            $this->credits += $amount;
        }
        return $this;
    }

    public function removeCredits(int $amount): bool
    {
        if ($amount > 0 && $this->credits >= $amount) {
            $this->credits -= $amount;
            return true;
        }
        return false;
    }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        $rolesStrings = $this->roles->map(fn(Role $role) => $role->getLibelle())->toArray();
        $rolesStrings[] = 'ROLE_USER';
        return array_unique($rolesStrings);
    }

    public function eraseCredentials(): void {}

    public function getRolesCollection(): Collection { return $this->roles; }
    public function addRole(Role $role): static
    {
        if (!$this->roles->contains($role)) {
            $this->roles->add($role);
        }
        return $this;
    }
    public function removeRole(Role $role): static
    {
        $this->roles->removeElement($role);
        return $this;
    }

    public function getVoitures(): Collection { return $this->voitures; }

    public function addVoiture(Voiture $voiture): static
    {
        if (!$this->voitures->contains($voiture)) {
            $this->voitures->add($voiture);
            $voiture->setUtilisateur($this);
        }
        return $this;
    }

    public function removeVoiture(Voiture $voiture): static
    {
        if ($this->voitures->removeElement($voiture)) {
            if ($voiture->getUtilisateur() === $this) {
                $voiture->setUtilisateur(null);
            }
        }
        return $this;
    }

    public function getParticipations(): Collection { return $this->participations; }

    public function addParticipation(Covoiturage $participation): static
    {
        if (!$this->participations->contains($participation)) {
            $this->participations->add($participation);
            $participation->addPassenger($this);
        }
        return $this;
    }

    public function removeParticipation(Covoiturage $participation): static
    {
        if ($this->participations->removeElement($participation)) {
            $participation->removePassenger($this);
        }
        return $this;
    }

    public function getAvisDonnes(): Collection { return $this->avisDonnes; }

    public function addAvisDonne(Avis $avisDonne): static
    {
        if (!$this->avisDonnes->contains($avisDonne)) {
            $this->avisDonnes->add($avisDonne);
            $avisDonne->setAuteur($this);
        }
        return $this;
    }

    public function removeAvisDonne(Avis $avisDonne): static
    {
        if ($this->avisDonnes->removeElement($avisDonne)) {
            if ($avisDonne->getAuteur() === $this) {
                $avisDonne->setAuteur(null);
            }
        }
        return $this;
    }

    public function getNotificationsRecues(): Collection
    {
        return $this->notificationsRecues;
    }

    public function addNotificationRecue(Notification $notification): static
    {
        if (!$this->notificationsRecues->contains($notification)) {
            $this->notificationsRecues->add($notification);
            $notification->setDestinataire($this);
        }
        return $this;
    }

    public function removeNotificationRecue(Notification $notification): static
    {
        if ($this->notificationsRecues->removeElement($notification)) {
            if ($notification->getDestinataire() === $this) {
                $notification->setDestinataire(null);
            }
        }
        return $this;
    }
}
