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

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?Utilisateur $chauffeur = null;

    /**
     * @var Collection<int, vehicule>
     */
    #[ORM\OneToMany(targetEntity: vehicule::class, mappedBy: 'covoiturage')]
    private Collection $vehicule;

    #[ORM\Column(length: 255)]
    private ?string $adress_depart = null;

    #[ORM\Column(length: 255)]
    private ?string $adresse_arrivee = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_depart = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTimeInterface $heure_depart = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTimeInterface $heure_arrivee = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 0)]
    private ?string $prix = null;

    #[ORM\Column]
    private ?bool $is_ecologique = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\ManyToOne(inversedBy: 'covoiturage')]
    private ?Participation $participation = null;

    #[ORM\ManyToOne(inversedBy: 'covoiturage')]
    private ?Avis $avis = null;

    public function __construct()
    {
        $this->vehicule = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getChauffeur(): ?Utilisateur
    {
        return $this->chauffeur;
    }

    public function setChauffeur(?Utilisateur $chauffeur): static
    {
        $this->chauffeur = $chauffeur;

        return $this;
    }

    /**
     * @return Collection<int, vehicule>
     */
    public function getVehicule(): Collection
    {
        return $this->vehicule;
    }

    public function addVehicule(vehicule $vehicule): static
    {
        if (!$this->vehicule->contains($vehicule)) {
            $this->vehicule->add($vehicule);
            $vehicule->setCovoiturage($this);
        }

        return $this;
    }

    public function removeVehicule(vehicule $vehicule): static
    {
        if ($this->vehicule->removeElement($vehicule)) {
            // set the owning side to null (unless already changed)
            if ($vehicule->getCovoiturage() === $this) {
                $vehicule->setCovoiturage(null);
            }
        }

        return $this;
    }

    public function getAdressDepart(): ?string
    {
        return $this->adress_depart;
    }

    public function setAdressDepart(string $adress_depart): static
    {
        $this->adress_depart = $adress_depart;

        return $this;
    }

    public function getAdresseArrivee(): ?string
    {
        return $this->adresse_arrivee;
    }

    public function setAdresseArrivee(string $adresse_arrivee): static
    {
        $this->adresse_arrivee = $adresse_arrivee;

        return $this;
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

    public function getHeureArrivee(): ?\DateTimeInterface
    {
        return $this->heure_arrivee;
    }

    public function setHeureArrivee(\DateTimeInterface $heure_arrivee): static
    {
        $this->heure_arrivee = $heure_arrivee;

        return $this;
    }

    public function getPrix(): ?string
    {
        return $this->prix;
    }

    public function setPrix(string $prix): static
    {
        $this->prix = $prix;

        return $this;
    }

    public function isEcologique(): ?bool
    {
        return $this->is_ecologique;
    }

    public function setIsEcologique(bool $is_ecologique): static
    {
        $this->is_ecologique = $is_ecologique;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getParticipation(): ?Participation
    {
        return $this->participation;
    }

    public function setParticipation(?Participation $participation): static
    {
        $this->participation = $participation;

        return $this;
    }

    public function getAvis(): ?Avis
    {
        return $this->avis;
    }

    public function setAvis(?Avis $avis): static
    {
        $this->avis = $avis;

        return $this;
    }
}
