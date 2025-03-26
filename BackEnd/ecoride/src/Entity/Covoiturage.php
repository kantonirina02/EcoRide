<?php

namespace App\Entity;

use App\Repository\CovoiturageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CovoiturageRepository::class)]
class Covoiturage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_depart = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $heure_depart = null;

    #[ORM\Column(length: 50)]
    private ?string $lieu_depart = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_arrivee = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $heure_arrivee = null;

    #[ORM\Column(length: 50)]
    private ?string $lieu_arrivee = null;

    #[ORM\Column(length: 50)]
    private ?string $satut = null;

    #[ORM\Column]
    private ?int $nb_place = null;

    #[ORM\Column]
    private ?float $prix_personne = null;

    #[ORM\ManyToOne(inversedBy: 'covoiturages')]
    private ?Voiture $voiture = null;

    /**
     * @var Collection<int, Participe>
     */
    #[ORM\ManyToMany(targetEntity: Participe::class, mappedBy: 'covoiturage')]
    private Collection $participes;

    public function __construct()
    {
        $this->participes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateDepart(): ?\DateTimeInterface
    {
        return $this->date_depart;
    }

    public function setDateDepart(\DateTimeInterface $date_depart): static
    {
        $this->date_depart = $date_depart;

        return $this;
    }

    public function getHeureDepart(): ?\DateTimeInterface
    {
        return $this->heure_depart;
    }

    public function setHeureDepart(\DateTimeInterface $heure_depart): static
    {
        $this->heure_depart = $heure_depart;

        return $this;
    }

    public function getLieuDepart(): ?string
    {
        return $this->lieu_depart;
    }

    public function setLieuDepart(string $lieu_depart): static
    {
        $this->lieu_depart = $lieu_depart;

        return $this;
    }

    public function getDateArrivee(): ?\DateTimeInterface
    {
        return $this->date_arrivee;
    }

    public function setDateArrivee(\DateTimeInterface $date_arrivee): static
    {
        $this->date_arrivee = $date_arrivee;

        return $this;
    }

    public function getHeureArrivee(): ?\DateTimeInterface
    {
        return $this->heure_arrivee;
    }

    public function setHeureArrivee(\DateTimeInterface $heure_arrivee): static
    {
        $this->heure_arrivee = $heure_arrivee;

        return $this;
    }

    public function getLieuArrivee(): ?string
    {
        return $this->lieu_arrivee;
    }

    public function setLieuArrivee(string $lieu_arrivee): static
    {
        $this->lieu_arrivee = $lieu_arrivee;

        return $this;
    }

    public function getSatut(): ?string
    {
        return $this->satut;
    }

    public function setSatut(string $satut): static
    {
        $this->satut = $satut;

        return $this;
    }

    public function getNbPlace(): ?int
    {
        return $this->nb_place;
    }

    public function setNbPlace(int $nb_place): static
    {
        $this->nb_place = $nb_place;

        return $this;
    }

    public function getPrixPersonne(): ?float
    {
        return $this->prix_personne;
    }

    public function setPrixPersonne(float $prix_personne): static
    {
        $this->prix_personne = $prix_personne;

        return $this;
    }

    public function getVoiture(): ?Voiture
    {
        return $this->voiture;
    }

    public function setVoiture(?Voiture $voiture): static
    {
        $this->voiture = $voiture;

        return $this;
    }

    /**
     * @return Collection<int, Participe>
     */
    public function getParticipes(): Collection
    {
        return $this->participes;
    }

    public function addParticipe(Participe $participe): static
    {
        if (!$this->participes->contains($participe)) {
            $this->participes->add($participe);
            $participe->addCovoiturage($this);
        }

        return $this;
    }

    public function removeParticipe(Participe $participe): static
    {
        if ($this->participes->removeElement($participe)) {
            $participe->removeCovoiturage($this);
        }

        return $this;
    }
}
