<?php

namespace App\Service\Chat;

use App\Server\SocketApi;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Chat\Message;
use App\Entity\Match\Match;

class ChatService {

    public function __construct(SocketApi $socket_api, EntityManagerInterface $em) {
        $this->socket_api = $socket_api;
        $this->em = $em;
    }
    
    public function chatSent($message, $user) {
        // Persist the message in db
        $chat_message = new Message();
        $chat_message
            ->setUser($user)
            ->setMatch($this->em->getReference(Match::class, $message->match_id))
            ->setMessage($message->message)
        ;

        $this->em->persist($chat_message);
        $this->em->flush($chat_message);

        // Send the message to the other players
        $output = $chat_message->jsonSerialize();
        $output['action'] = 'chat-receive';
        $this->socket_api->broadcastToMatch($message->match_id, $output);
    }
}