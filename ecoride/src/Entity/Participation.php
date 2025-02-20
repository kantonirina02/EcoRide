<?php

namespace App\Entity;

use App\Repository\ParticipationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
class Participation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * @var Collection<int, covoiturage>
     */
    #[ORM\OneToMany(targetEntity: covoiturage::class, mappedBy: 'participation')]
    private Collection $covoiturage;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column]
    private ?bool $confirmation = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_confirmation = null;

    public function __construct()
    {
        $this->covoiturage = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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
            $covoiturage->setParticipation($this);
        }

        return $this;
    }

    public function removeCovoiturage(covoiturage $covoiturage): static
    {
        if ($this->covoiturage->removeElement($covoiturage)) {
            // set the owning side to null (unless already changed)
            if ($covoiturage->getParticipation() === $this) {
                $covoiturage->setParticipation(null);
            }
        }

        return $this;
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

    public function isConfirmation(): ?bool
    {
        return $this->confirmation;
    }

    public function setConfirmation(bool $confirmation): static
    {
        $this->confirmation = $confirmation;

        return $this;
    }

    public function getDateConfirmation(): ?\DateTimeInterface
    {
        return $this->date_confirmation;
    }

    public function setDateConfirmation(\DateTimeInterface $date_confirmation): static
    {
        $this->date_confirmation = $date_confirmation;

        return $this;
    }
}
