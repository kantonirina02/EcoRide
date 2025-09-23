<?php

namespace App\DataFixtures;

use App\Entity\Role;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class RoleFixtures extends Fixture
{
    public const ROLE_USER_REFERENCE = 'role-user';
    public const ROLE_ADMIN_REFERENCE = 'role-admin';

    public function load(ObjectManager $manager): void
    {
        // Création du rôle utilisateur
        $userRole = new Role();
        $userRole->setLibelle('ROLE_USER');
        $manager->persist($userRole);
        $this->addReference(self::ROLE_USER_REFERENCE, $userRole);

        // Création du rôle administrateur
        $adminRole = new Role();
        $adminRole->setLibelle('ROLE_ADMIN');
        $manager->persist($adminRole);
        $this->addReference(self::ROLE_ADMIN_REFERENCE, $adminRole);

        $manager->flush();
    }
}
