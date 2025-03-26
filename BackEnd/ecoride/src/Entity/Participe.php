<?php

namespace App\Entity;

use App\Repository\ParticipeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ParticipeRepository::class)]
class Participe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * @var Collection<int, Utilisateur>
     */
    #[ORM\ManyToMany(targetEntity: Utilisateur::class, inversedBy: 'participes')]
    private Collection $utilisateur;

    /**
     * @var Collection<int, covoiturage>
     */
    #[ORM\ManyToMany(targetEntity: covoiturage::class, inversedBy: 'participes')]
    private Collection $covoiturage;

    public function __construct()
    {
        $this->utilisateur = new ArrayCollection();
        $this->covoiturage = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection<int, Utilisateur>
     */
    public function getUtilisateur(): Collection
    {
        return $this->utilisateur;
    }

    public function addUtilisateur(Utilisateur $utilisateur): static
    {
        if (!$this->utilisateur->contains($utilisateur)) {
            $this->utilisateur->add($utilisateur);
        }

        return $this;
    }

    public function removeUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur->removeElement($utilisateur);

        return $this;
    }

    /**
     * @return Collection<int, covoiturage>
     */
    public function getCovoiturage(): Collection
    {
        return $this->covoiturage;
    }

    public function addCovoiturage(covoiturage $covoiturage): static
    {
        if (!$this->covoiturage->contains($covoiturage)) {
            $this->covoiturage->add($covoiturage);
        }

        return $this;
    }

    public function removeCovoiturage(covoiturage $covoiturage): static
    {
        $this->covoiturage->removeElement($covoiturage);

        return $this;
    }
}
