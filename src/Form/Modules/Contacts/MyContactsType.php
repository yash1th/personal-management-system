<?php

namespace App\Form\Modules\Contacts;

use App\Controller\Utils\Application;
use App\Entity\Modules\Contacts\MyContacts;
use App\Entity\Modules\Contacts\MyContactsGroups;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MyContactsType extends AbstractType {

    /**
     * @var Application
     */
    private static $app;

    public function __construct(Application $app) {
        static::$app = $app;
    }

    public function buildForm(FormBuilderInterface $builder, array $options) {

        $label = '';

        switch ($options['type']) {
            case 'phone':
                $label = 'Phone Number';
                break;
            case 'email':
                $label = 'Email';
                break;
            case 'other':
                $label = 'Contact';
                break;
            case 'archived':
                $label = 'Contact';
                break;
            default:
                throw new \Exception('Incorrect type was provided');
        }


        $builder
            ->add('contact', TextType::class, [
                'label' => $label
            ])
            ->add('type', HiddenType::class, [
                'data' => $options['type']
            ])
            ->add('description',TextType::class)
            ->add('group', EntityType::class, [
                'class' => MyContactsGroups::class,
                'choices' => static::$app->repositories->myContactsGroupsRepository->findBy(['deleted' => 0]),
                'choice_label' => function (MyContactsGroups $contact_group) {
                    return $contact_group->getName();
                }
            ])
            ->add('submit', SubmitType::class);
    }

    public function configureOptions(OptionsResolver $resolver) {
        $resolver->setDefaults([
            'data_class' => MyContacts::class,
        ]);
        $resolver->setRequired('type');
    }
}
