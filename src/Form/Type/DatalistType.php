<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class DatalistType extends AbstractType {

    public function getParent() {
        return ChoiceType::class;
    }

    public function buildView(FormView $view, FormInterface $form, array $options) {
        $view->vars['choices'] = $options['choices'];
    }

}