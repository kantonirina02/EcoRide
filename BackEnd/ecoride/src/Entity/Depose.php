<?php

namespace App\Entity;

use App\Repository\DeposeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DeposeRepository::class)]
class Depose
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * @var Collection<int, Utilisateur>
     */
    #[ORM\ManyToMany(targetEntity: Utilisateur::class, inversedBy: 'deposes')]
    private Collection $utilisateur;

    #[ORM\Column(length: 255)]
    private ?string $avis = null;

    /**
     * @var Collection<int, avis>
     */
    #[ORM\ManyToMany(targetEntity: avis::class, inversedBy: 'deposes')]
    private Collection $aviss;

    public function __construct()
    {
        $this->utilisateur = new ArrayCollection();
        $this->aviss = new ArrayCollection();
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

    public function getAvis(): ?string
    {
        return $this->avis;
    }

    public function setAvis(string $avis): static
    {
        $this->avis = $avis;

        return $this;
    }

    /**
     * @return Collection<int, avis>
     */
    public function getAviss(): Collection
    {
        return $this->aviss;
    }

    public function addAviss(avis $aviss): static
    {
        if (!$this->aviss->contains($aviss)) {
            $this->aviss->add($aviss);
        }

        return $this;
    }

    public function removeAviss(avis $aviss): static
    {
        $this->aviss->removeElement($aviss);

        return $this;
    }
}
