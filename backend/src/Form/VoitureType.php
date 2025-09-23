<?php

namespace App\Form;

use App\Entity\Marque;
use App\Entity\Utilisateur;
use App\Entity\Voiture;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Positive;
use Symfony\Component\Validator\Constraints\Regex;

class VoitureType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('modele', TextType::class, [
                'label' => 'Modèle',
                'constraints' => [
                    new NotBlank(['message' => 'Le modèle est obligatoire.']),
                ],
            ])
            ->add('couleur', ColorType::class, [
                'label' => 'Couleur',
                'constraints' => [
                    new NotBlank(['message' => 'La couleur est obligatoire.']),
                ],
            ])
            ->add('energie', ChoiceType::class, [
                'label' => 'Énergie',
                'choices' => [
                    'Essence' => 'essence',
                    'Diesel' => 'diesel',
                    'Électrique' => 'electrique',
                    'Hybride' => 'hybride',
                    'GPL' => 'gpl',
                ],
                'required' => false,
            ])
            ->add('immatriculation', TextType::class, [
                'label' => 'Immatriculation',
                'constraints' => [
                    new NotBlank(['message' => 'L\'immatriculation est obligatoire.']),
                    new Regex([
                        'pattern' => '/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/',
                        'message' => 'Le format d\'immatriculation doit être AA-123-AA.',
                    ]),
                ],
            ])
            ->add('nbPlace', NumberType::class, [
                'label' => 'Nombre de places',
                'constraints' => [
                    new NotBlank(['message' => 'Le nombre de places est obligatoire.']),
                    new Positive(['message' => 'Le nombre de places doit être positif.']),
                ],
            ])
            ->add('marque', EntityType::class, [
                'class' => Marque::class,
                'choice_label' => 'libelle',
                'label' => 'Marque',
                'constraints' => [
                    new NotBlank(['message' => 'La marque est obligatoire.']),
                ],
            ])
            ->add('utilisateur', EntityType::class, [
                'class' => Utilisateur::class,
                'choice_label' => 'pseudo',
                'label' => 'Propriétaire',
                'constraints' => [
                    new NotBlank(['message' => 'Le propriétaire est obligatoire.']),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Voiture::class,
        ]);
    }
}
