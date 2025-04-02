<?php

namespace App\Form;

use App\Entity\Covoiturage;
use App\Entity\Role;
use App\Entity\Utilisateur;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UtilisateurType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom')
            ->add('prenom')
            ->add('email')
            ->add('password')
            ->add('telephone')
            ->add('adresse')
            ->add('dateNaissance', null, [
                'widget' => 'single_text',
            ])
            ->add('photo')
            ->add('pseudo')
            ->add('roles', EntityType::class, [
                'class' => Role::class,
                'choice_label' => 'id',
                'multiple' => true,
            ])
            ->add('participations', EntityType::class, [
                'class' => Covoiturage::class,
                'choice_label' => 'id',
                'multiple' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Utilisateur::class,
        ]);
    }
}
