<?php

namespace App\Form;

use App\Entity\Covoiturage;
use App\Entity\Voiture;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\GreaterThan;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Positive;

class CovoiturageType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('lieuDepart', TextType::class, [
                'label' => 'Lieu de départ',
                'constraints' => [
                    new NotBlank(['message' => 'Le lieu de départ est obligatoire.']),
                ],
            ])
            ->add('lieuArrivee', TextType::class, [
                'label' => 'Lieu d\'arrivée',
                'constraints' => [
                    new NotBlank(['message' => 'Le lieu d\'arrivée est obligatoire.']),
                ],
            ])
            ->add('dateDepart', DateType::class, [
                'label' => 'Date de départ',
                'widget' => 'single_text',
                'constraints' => [
                    new NotBlank(['message' => 'La date de départ est obligatoire.']),
                    new GreaterThan(['value' => 'today', 'message' => 'La date de départ doit être dans le futur.']),
                ],
            ])
            ->add('heureDepart', TimeType::class, [
                'label' => 'Heure de départ',
                'constraints' => [
                    new NotBlank(['message' => 'L\'heure de départ est obligatoire.']),
                ],
            ])
            ->add('dateArrivee', DateType::class, [
                'label' => 'Date d\'arrivée',
                'widget' => 'single_text',
                'constraints' => [
                    new NotBlank(['message' => 'La date d\'arrivée est obligatoire.']),
                ],
            ])
            ->add('heureArrivee', TimeType::class, [
                'label' => 'Heure d\'arrivée',
                'constraints' => [
                    new NotBlank(['message' => 'L\'heure d\'arrivée est obligatoire.']),
                ],
            ])
            ->add('nbPlace', NumberType::class, [
                'label' => 'Nombre de places',
                'constraints' => [
                    new NotBlank(['message' => 'Le nombre de places est obligatoire.']),
                    new Positive(['message' => 'Le nombre de places doit être positif.']),
                ],
            ])
            ->add('prixPersonne', NumberType::class, [
                'label' => 'Prix par personne (€)',
                'scale' => 2,
                'constraints' => [
                    new NotBlank(['message' => 'Le prix par personne est obligatoire.']),
                    new Positive(['message' => 'Le prix doit être positif.']),
                ],
            ])
            ->add('status', ChoiceType::class, [
                'label' => 'Statut',
                'choices' => [
                    'Disponible' => 'disponible',
                    'Complet' => 'complet',
                    'Annulé' => 'annule',
                ],
                'constraints' => [
                    new NotBlank(['message' => 'Le statut est obligatoire.']),
                ],
            ])
            ->add('voiture', EntityType::class, [
                'class' => Voiture::class,
                'choice_label' => function(Voiture $voiture) {
                    return $voiture->getMarque()->getLibelle() . ' ' . $voiture->getModele() . ' (' . $voiture->getImmatriculation() . ')';
                },
                'label' => 'Véhicule',
                'constraints' => [
                    new NotBlank(['message' => 'Le véhicule est obligatoire.']),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Covoiturage::class,
        ]);
    }
}
