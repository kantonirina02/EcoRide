<?php

namespace App\Form;

use App\Entity\Avis;
use App\Entity\Covoiturage;
use App\Entity\Utilisateur;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\GreaterThanOrEqual;
use Symfony\Component\Validator\Constraints\LessThanOrEqual;
use Symfony\Component\Validator\Constraints\NotBlank;

class AvisType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('note', IntegerType::class, [
                'label' => 'Note (1-5)',
                'constraints' => [
                    new NotBlank(['message' => 'La note est obligatoire.']),
                    new GreaterThanOrEqual(['value' => 1, 'message' => 'La note doit être au minimum 1.']),
                    new LessThanOrEqual(['value' => 5, 'message' => 'La note doit être au maximum 5.']),
                ],
            ])
            ->add('commentaire', TextareaType::class, [
                'label' => 'Commentaire',
                'required' => false,
                'attr' => [
                    'rows' => 4,
                    'placeholder' => 'Partagez votre expérience...',
                ],
            ])
            ->add('statut', ChoiceType::class, [
                'label' => 'Statut',
                'choices' => [
                    'En attente' => 'en_attente',
                    'Approuvé' => 'approuve',
                    'Rejeté' => 'rejete',
                ],
                'constraints' => [
                    new NotBlank(['message' => 'Le statut est obligatoire.']),
                ],
            ])
            ->add('auteur', EntityType::class, [
                'class' => Utilisateur::class,
                'choice_label' => 'pseudo',
                'label' => 'Auteur',
                'constraints' => [
                    new NotBlank(['message' => 'L\'auteur est obligatoire.']),
                ],
            ])
            ->add('covoiturage', EntityType::class, [
                'class' => Covoiturage::class,
                'choice_label' => function(Covoiturage $covoiturage) {
                    return $covoiturage->getLieuDepart() . ' → ' . $covoiturage->getLieuArrivee();
                },
                'label' => 'Covoiturage',
                'constraints' => [
                    new NotBlank(['message' => 'Le covoiturage est obligatoire.']),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Avis::class,
        ]);
    }
}
