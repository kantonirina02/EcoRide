<?php

namespace App\Entity;

use App\Repository\AvisRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AvisRepository::class)]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $commentaire = null;

    #[ORM\Column(length: 50)]
    private ?string $note = null;

    #[ORM\Column(length: 255)]
    private ?string $statu = null;

    /**
     * @var Collection<int, Depose>
     */
    #[ORM\ManyToMany(targetEntity: Depose::class, mappedBy: 'aviss')]
    private Collection $deposes;

    public function __construct()
    {
        $this->deposes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(string $note): static
    {
        $this->note = $note;

        return $this;
    }

    public function getStatu(): ?string
    {
        return $this->statu;
    }

    public function setStatu(string $statu): static
    {
        $this->statu = $statu;

        return $this;
    }

    /**
     * @return Collection<int, Depose>
     */
    public function getDeposes(): Collection
    {
        return $this->deposes;
    }

    public function addDepose(Depose $depose): static
    {
        if (!$this->deposes->contains($depose)) {
            $this->deposes->add($depose);
            $depose->addAviss($this);
        }

        return $this;
    }

    public function removeDepose(Depose $depose): static
    {
        if ($this->deposes->removeElement($depose)) {
            $depose->removeAviss($this);
        }

        return $this;
    }
}
