<?php

namespace App\Entity;

use App\Repository\PreferencesRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PreferencesRepository::class)]
class Preferences
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column]
    private ?bool $fumeur = null;

    #[ORM\Column]
    private ?bool $animal = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $autres = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    public function isFumeur(): ?bool
    {
        return $this->fumeur;
    }

    public function setFumeur(bool $fumeur): static
    {
        $this->fumeur = $fumeur;

        return $this;
    }

    public function isAnimal(): ?bool
    {
        return $this->animal;
    }

    public function setAnimal(bool $animal): static
    {
        $this->animal = $animal;

        return $this;
    }

    public function getAutres(): ?string
    {
        return $this->autres;
    }

    public function setAutres(string $autres): static
    {
        $this->autres = $autres;

        return $this;
    }
}
