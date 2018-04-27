<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;

class DefaultController extends AbstractController {
    /**
     * @Route("/", name="homepage")
     */
    public function index() {
        return $this->render('index.html.twig', []);
    }
}
