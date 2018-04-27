<?php

namespace App\Entity;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

class User implements UserInterface {

    private $id;

    /**
     * @Assert\Length(min=4)
     * @Assert\Length(max=24)
     */
    private $username;

    /**
     * @Assert\Email(
     *     message = "Please enter a valid email",
     *     checkMX = true
     * )
     */
    private $email;
    private $password;
    private $date_registered;

    // Not mapped
    /**
     * @Assert\Length(min=6)
     */
    private $plain_password;

    public function getRoles() {
        return ['ROLE_USER'];
    }

    public function getSalt() {
        return null;
    }

    public function eraseCredentials() {
        $this->plain_password = null;
        return $this;
    }

    public function getId() {
        return $this->id;
    }

    public function getUsername() {
        return $this->username;
    }

    public function setUsername($username) {
        $this->username = $username;
        return $this;
    }

    public function getEmail() {
        return $this->email;
    }

    public function setEmail($email) {
        $this->email = $email;
        return $this;
    }

    public function getPassword() {
        return $this->password;
    }

    public function setPassword($password) {
        $this->password = $password;
        return $this;
    }

    public function getDateRegistered() {
        return $this->date_registered;
    }

    public function setDateRegistered($date_registered) {
        $this->date_registered = $date_registered;
        return $this;
    }

    public function setDateRegisteredToNow() {
        return $this->setDateRegistered(new \DateTime);
    }

    public function getPlainPassword() {
        return $this->plain_password;
    }

    public function setPlainPassword($plain_password) {
        $this->plain_password = $plain_password;
        return $this;
    }
}