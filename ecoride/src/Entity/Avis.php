<?php

namespace App\Entity;

use App\Repository\AvisRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AvisRepository::class)]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * @var Collection<int, covoiturage>
     */
    #[ORM\OneToMany(targetEntity: covoiturage::class, mappedBy: 'avis')]
    private Collection $covoiturage;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column(length: 20)]
    private ?string $note = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $commentaire = null;

    #[ORM\Column]
    private ?bool $valide = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_creation = null;

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
            $covoiturage->setAvis($this);
        }

        return $this;
    }

    public function removeCovoiturage(covoiturage $covoiturage): static
    {
        if ($this->covoiturage->removeElement($covoiturage)) {
            // set the owning side to null (unless already changed)
            if ($covoiturage->getAvis() === $this) {
                $covoiturage->setAvis(null);
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

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(string $note): static
    {
        $this->note = $note;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(string $commentaire): static
    {
        $this->commentaire = $commentaire;

        return $this;
    }

    public function isValide(): ?bool
    {
        return $this->valide;
    }

    public function setValide(bool $valide): static
    {
        $this->valide = $valide;

        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->date_creation;
    }

    public function setDateCreation(\DateTimeInterface $date_creation): static
    {
        $this->date_creation = $date_creation;

        return $this;
    }
}
