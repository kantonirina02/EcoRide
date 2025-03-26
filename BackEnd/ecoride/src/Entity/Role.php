<?php

namespace App\Entity;

use App\Repository\RoleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RoleRepository::class)]
class Role
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $libelle = null;

    /**
     * @var Collection<int, Possede>
     */
    #[ORM\ManyToMany(targetEntity: Possede::class, mappedBy: 'role')]
    private Collection $possedes;

    public function __construct()
    {
        $this->possedes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    /**
     * @return Collection<int, Possede>
     */
    public function getPossedes(): Collection
    {
        return $this->possedes;
    }

    public function addPossede(Possede $possede): static
    {
        if (!$this->possedes->contains($possede)) {
            $this->possedes->add($possede);
            $possede->addRole($this);
        }

        return $this;
    }

    public function removePossede(Possede $possede): static
    {
        if ($this->possedes->removeElement($possede)) {
            $possede->removeRole($this);
        }

        return $this;
    }
}
