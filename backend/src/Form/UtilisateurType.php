<?php

namespace App\Form;

use App\Entity\Role;
use App\Entity\Utilisateur;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class UtilisateurType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom',
                'constraints' => [
                    new NotBlank(['message' => 'Le nom est obligatoire.']),
                    new Length(['min' => 2, 'max' => 50, 'minMessage' => 'Le nom doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('prenom', TextType::class, [
                'label' => 'Prénom',
                'constraints' => [
                    new NotBlank(['message' => 'Le prénom est obligatoire.']),
                    new Length(['min' => 2, 'max' => 50, 'minMessage' => 'Le prénom doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email',
                'constraints' => [
                    new NotBlank(['message' => 'L\'email est obligatoire.']),
                ],
            ])
            ->add('pseudo', TextType::class, [
                'label' => 'Pseudo',
                'constraints' => [
                    new NotBlank(['message' => 'Le pseudo est obligatoire.']),
                    new Length(['min' => 3, 'max' => 50, 'minMessage' => 'Le pseudo doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('telephone', TextType::class, [
                'label' => 'Téléphone',
                'required' => false,
            ])
            ->add('adresse', TextType::class, [
                'label' => 'Adresse',
                'required' => false,
            ])
            ->add('dateNaissance', DateType::class, [
                'label' => 'Date de naissance',
                'widget' => 'single_text',
                'required' => false,
            ])
            ->add('photo', TextType::class, [
                'label' => 'Photo (URL)',
                'required' => false,
            ])
            ->add('roles', EntityType::class, [
                'class' => Role::class,
                'choice_label' => 'libelle',
                'multiple' => true,
                'expanded' => true,
                'label' => 'Rôles',
            ])
        ;

        // Ajouter le champ mot de passe seulement si c'est une création ou si explicitement demandé
        if ($options['include_password']) {
            $builder->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'first_options' => [
                    'label' => 'Mot de passe',
                    'constraints' => [
                        new NotBlank(['message' => 'Le mot de passe est obligatoire.']),
                        new Length(['min' => 6, 'minMessage' => 'Le mot de passe doit contenir au moins {{ limit }} caractères.']),
                    ],
                ],
                'second_options' => ['label' => 'Confirmer le mot de passe'],
                'invalid_message' => 'Les mots de passe ne correspondent pas.',
                'mapped' => false,
            ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Utilisateur::class,
            'include_password' => true,
        ]);
    }
}
